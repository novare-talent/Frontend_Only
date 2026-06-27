import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import PDFDocument from 'pdfkit'

const resend = new Resend(process.env.RESEND_API_KEY)

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function formatDate(d: Date) {
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

// ─── Colour palette (monochrome #7f00e2) ────────────────────────────────────
const C = {
  brand:       '#7f00e2',   // primary purple
  brandDark:   '#5900a3',   // darker shade for text
  brandLight:  '#ede5fd',   // very light tint for card bg
  brandBorder: '#c0a0f0',   // subtle border
  white:       '#ffffff',
  dark:        '#1c1022',   // near-black body text
  mid:         '#5a4a6a',   // secondary text
  light:       '#9b8aaa',   // tertiary / muted text
  rule:        '#dfd0f5',   // divider lines
  barBg:       '#e8ddf5',   // score bar track
  score_hi:    '#7f00e2',   // score bar fill
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const ML = 48          // margin left
const MR = 48          // margin right
const CONTENT_W = PAGE_W - ML - MR   // 499.28
const FOOTER_H = 36

// ─── Draw a labelled score bar ───────────────────────────────────────────────
function scoreBar(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  value: number | undefined,
  x: number,
  y: number,
  barWidth: number,
) {
  const BAR_H = 5
  const LABEL_W = 105
  const NUM_W = 28
  const trackW = barWidth - LABEL_W - NUM_W - 8
  const score = value ?? 0

  doc.fillColor(C.mid).fontSize(8).font('Helvetica').text(label, x, y + 0.5, { width: LABEL_W })

  // track
  doc.roundedRect(x + LABEL_W, y + 1, trackW, BAR_H, 2.5).fillColor(C.barBg).fill()
  // fill
  if (score > 0) {
    doc.roundedRect(x + LABEL_W, y + 1, Math.max(4, (score / 100) * trackW), BAR_H, 2.5)
       .fillColor(C.score_hi).fill()
  }

  // number
  doc.fillColor(C.brandDark).font('Helvetica-Bold').fontSize(8)
     .text(String(score), x + LABEL_W + trackW + 6, y + 0.5, { width: NUM_W, align: 'right' })
}

// ─── Generate PDF ────────────────────────────────────────────────────────────
async function generatePDF(jobTitle: string, candidates: any[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: true,
      bufferPages: true,   // critical — lets us patch footers after all pages are written
    })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end',  () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const generatedAt = formatDate(new Date())
    const avgScore = candidates.length
      ? Math.round(candidates.reduce((s, c) => s + (c.final_score ?? 0), 0) / candidates.length)
      : 0

    // ── helper: draw page header band ────────────────────────────────────────
    function drawPageHeader(isFirst: boolean) {
      const H = isFirst ? 120 : 52

      // full-bleed band
      doc.rect(0, 0, PAGE_W, H).fillColor(C.brand).fill()

      if (isFirst) {
        // Wordmark
        doc.fillColor(C.white).font('Helvetica-Bold').fontSize(28)
           .text('ZENHYRE', ML, 28, { width: CONTENT_W })

        // Subtitle
        doc.fillColor('#e8b0f8').font('Helvetica').fontSize(11)
           .text('Candidate Evaluation Report', ML, 64)

        // Meta row
        doc.fillColor('#d49eee').fontSize(9)
           .text(generatedAt, ML, 82)
           .text(`${candidates.length} candidates evaluated`, ML, 82, { align: 'right', width: CONTENT_W })
      } else {
        // Compact continuation header
        doc.fillColor(C.white).font('Helvetica-Bold').fontSize(13)
           .text('ZENHYRE', ML, 17)
        doc.fillColor('#d49eee').font('Helvetica').fontSize(9)
           .text('Candidate Evaluation Report  ·  ' + jobTitle, ML, 35)
      }

      doc.y = H + 16
    }

    // ── Page 1 header ─────────────────────────────────────────────────────────
    drawPageHeader(true)

    // ── Job title block ───────────────────────────────────────────────────────
    doc.fillColor(C.dark).font('Helvetica-Bold').fontSize(15)
       .text(jobTitle, ML, doc.y, { width: CONTENT_W })
    doc.moveDown(0.35)

    // Summary strip
    const stripY = doc.y
    const stripH = 44
    doc.roundedRect(ML, stripY, CONTENT_W, stripH, 6).fillColor(C.brandLight).fill()

    const colW = CONTENT_W / 3
    const metrics = [
      { label: 'Candidates',  value: String(candidates.length) },
      { label: 'Top Score',   value: candidates[0] ? `${candidates[0].final_score ?? '—'}/100` : '—' },
      { label: 'Avg. Score',  value: `${avgScore}/100` },
    ]
    metrics.forEach(({ label, value }, i) => {
      const cx = ML + i * colW
      const center = { width: colW, align: 'center' as const }
      doc.fillColor(C.brand).font('Helvetica-Bold').fontSize(16).text(value, cx, stripY + 7, center)
      doc.fillColor(C.mid).font('Helvetica').fontSize(8).text(label, cx, stripY + 28, center)
    })

    doc.y = stripY + stripH + 22

    // Divider
    doc.moveTo(ML, doc.y).lineTo(ML + CONTENT_W, doc.y)
       .strokeColor(C.rule).lineWidth(0.75).stroke()
    doc.moveDown(0.9)

    // ── Candidate cards ───────────────────────────────────────────────────────
    candidates.forEach((c, i) => {
      // Estimate card height to decide if we need a new page
      const assessmentLines = c.justification
        ? Math.ceil(c.justification.length / 90) + 1
        : 0
      const estimatedH = 22 + 14 + (c.resume_url ? 14 : 0) + 14 + 14 * 3 + 14 + assessmentLines * 11 + 28

      const available = PAGE_H - FOOTER_H - doc.y
      if (available < Math.min(estimatedH, 160)) {
        doc.addPage()
        drawPageHeader(false)
        // thin rule under compact header
        doc.moveTo(ML, doc.y - 6).lineTo(ML + CONTENT_W, doc.y - 6)
           .strokeColor(C.rule).lineWidth(0.5).stroke()
        doc.y += 4
      }

      const cardX = ML
      const cardY = doc.y
      const cardW = CONTENT_W

      // ── Rank badge + name row ─────────────────────────────────────────────
      // Left accent bar
      doc.rect(cardX, cardY, 3, 16).fillColor(C.brand).fill()

      // Rank pill
      const rankStr = `#${i + 1}`
      doc.fillColor(C.brand).font('Helvetica-Bold').fontSize(10)
         .text(rankStr, cardX + 10, cardY + 2, { width: 28 })

      // Name
      doc.fillColor(C.dark).font('Helvetica-Bold').fontSize(12)
         .text(c.full_name || 'Unknown Candidate', cardX + 38, cardY + 1, {
           width: cardW - 38 - 80,
           ellipsis: true,
         })

      // Final score badge — top right
      const scoreStr = `${c.final_score ?? '—'} / 100`
      doc.fillColor(C.brandDark).font('Helvetica-Bold').fontSize(12)
         .text(scoreStr, cardX, cardY + 1, { width: cardW, align: 'right' })

      doc.y = cardY + 20

      // ── Contact line ───────────────────────────────────────────────────────
      const contactParts: string[] = []
      if (c.email) contactParts.push(c.email)
      if (c.phone) contactParts.push(c.phone)
      if (contactParts.length) {
        doc.fillColor(C.mid).font('Helvetica').fontSize(8.5)
           .text(contactParts.join('   ·   '), cardX + 10, doc.y, { width: cardW - 10 })
        doc.moveDown(0.45)
      }

      // ── Resume link ────────────────────────────────────────────────────────
      if (c.resume_url) {
        doc.fillColor(C.brand).font('Helvetica').fontSize(8.5)
           .text('Download Resume', cardX + 10, doc.y, {
             link: c.resume_url,
             underline: true,
             width: 110,
           })
        doc.moveDown(0.55)
      }

      // ── Status tags ────────────────────────────────────────────────────────
      const tags: { text: string; color: string }[] = []
      if (c.needs_review)    tags.push({ text: 'Needs Review',   color: '#9a6000' })
      if (c.rejection_sent)  tags.push({ text: 'Rejection Sent', color: C.brandDark })
      if (tags.length) {
        let tx = cardX + 10
        tags.forEach(({ text, color }) => {
          doc.fillColor(color).font('Helvetica').fontSize(7.5)
             .text(`[${text}]`, tx, doc.y, { continued: true })
          tx += text.length * 4.5 + 14
        })
        doc.text('')   // end continued
        doc.moveDown(0.35)
      }

      // ── Score bars ─────────────────────────────────────────────────────────
      doc.moveDown(0.2)
      const barsX = cardX + 10
      const barsW = cardW - 10
      const barStartY = doc.y
      const BAR_ROW = 14

      scoreBar(doc, 'Skills Match',     c.skills_match,           barsX, barStartY,              barsW)
      scoreBar(doc, 'Experience',       c.experience_relevance,   barsX, barStartY + BAR_ROW,    barsW)
      scoreBar(doc, 'Communication',    c.communication_clarity,  barsX, barStartY + BAR_ROW * 2, barsW)

      doc.y = barStartY + BAR_ROW * 3 + 6

      // ── Assessment ─────────────────────────────────────────────────────────
      if (c.justification) {
        doc.fillColor(C.brandDark).font('Helvetica-Bold').fontSize(8)
           .text('Assessment', cardX + 10, doc.y)
        doc.moveDown(0.25)
        doc.fillColor(C.mid).font('Helvetica').fontSize(8.5)
           .text(c.justification, cardX + 10, doc.y, {
             width: cardW - 10,
             lineGap: 1.5,
           })
        doc.moveDown(0.35)
      }

      // ── Bottom rule ────────────────────────────────────────────────────────
      doc.moveDown(0.6)
      doc.moveTo(ML, doc.y).lineTo(ML + CONTENT_W, doc.y)
         .strokeColor(C.rule).lineWidth(0.5).stroke()
      doc.moveDown(0.75)
    })

    // ── Stamp footers on every buffered page ──────────────────────────────────
    const { count } = doc.bufferedPageRange()
    for (let p = 0; p < count; p++) {
      doc.switchToPage(p)

      // thin accent strip at very bottom
      doc.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H).fillColor(C.brandLight).fill()
      doc.moveTo(0, PAGE_H - FOOTER_H).lineTo(PAGE_W, PAGE_H - FOOTER_H)
         .strokeColor(C.brandBorder).lineWidth(0.5).stroke()

      doc.fillColor(C.brandDark).font('Helvetica-Bold').fontSize(7.5)
         .text('ZENHYRE', ML, PAGE_H - FOOTER_H + 11, { continued: true })
      doc.fillColor(C.light).font('Helvetica').fontSize(7.5)
         .text(`  ·  Novare Talent  ·  ${jobTitle}`, { continued: true })
      doc.fillColor(C.brand).font('Helvetica-Bold').fontSize(7.5)
         .text(`  ·  Page ${p + 1} of ${count}`, {
           width: CONTENT_W,
           align: 'right',
         })
    }

    doc.end()
  })
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Auth
    const token = req.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Input
    const { job_id, to_email } = await req.json()
    if (!job_id || !to_email) {
      return NextResponse.json({ error: 'job_id and to_email are required' }, { status: 400 })
    }

    // Fetch evaluation + job in parallel
    const [{ data: evalRow }, { data: job }] = await Promise.all([
      supabaseAdmin.from('evaluations').select('results').eq('job_id', job_id).maybeSingle(),
      supabaseAdmin.from('jobs').select('Job_Name, Job_Description').eq('job_id', job_id).maybeSingle(),
    ])

    if (!evalRow) {
      return NextResponse.json({ error: 'No evaluation found for this job' }, { status: 404 })
    }

    // ── Rate limit: max 2 sends per profile per job ───────────────────────────
    const sendLog: Record<string, number> = evalRow.results?.report_send_log ?? {}
    const sendCount = sendLog[user.id] ?? 0
    if (sendCount >= 2) {
      return NextResponse.json(
        { error: 'You have already sent this report twice. The limit is 2 sends per job.', limitReached: true },
        { status: 429 }
      )
    }

    const jobTitle: string = job?.Job_Name || job?.Job_Description || 'Untitled Job'

    // Enrich candidates
    const baseCandidates: any[] = evalRow.results?.candidates ?? []
    const profileIds = baseCandidates.filter(c => c.profile_id).map(c => c.profile_id as string)
    const { data: profileRows } = profileIds.length > 0
      ? await supabaseAdmin.from('profiles').select('id, email, phone').in('id', profileIds)
      : { data: [] }

    const profileMap = Object.fromEntries((profileRows ?? []).map((p: any) => [p.id, p]))
    const candidates = baseCandidates
      .map(c => ({
        ...c,
        email: c.email || profileMap[c.profile_id]?.email,
        phone: c.phone || profileMap[c.profile_id]?.phone,
      }))
      .sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0))

    // Generate PDF
    const pdfBuffer = await generatePDF(jobTitle, candidates)

    // Send email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
    const dateStr = formatDate(new Date())
    const top = candidates[0]
    const avgScore = candidates.length
      ? Math.round(candidates.reduce((s, c) => s + (c.final_score ?? 0), 0) / candidates.length)
      : 0

    const htmlBody = `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;color:#1c1022;background:#ffffff;">
  <!-- Header -->
  <div style="background:#7f00e2;padding:32px 36px 28px;border-radius:10px 10px 0 0;">
    <div style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">ZENHYRE</div>
    <div style="font-size:12px;color:#d0a8f8;margin-top:5px;font-weight:400;">Candidate Evaluation Report</div>
  </div>

  <!-- Body -->
  <div style="background:#fdfaff;padding:30px 36px;border:1px solid #e8ddf5;border-top:none;border-radius:0 0 10px 10px;">
    <p style="margin:0 0 18px;font-size:15px;color:#1c1022;">Dear Hiring Team,</p>

    <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#5a4a6a;">
      Attached is the candidate evaluation report for <strong style="color:#1c1022;">${jobTitle}</strong>,
      generated on ${dateStr}. Please find the full ranked list and AI-assessed summaries in the PDF.
    </p>

    <!-- Stat cards -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;border-collapse:separate;border-spacing:8px;">
      <tr>
        <td style="background:#ede5fd;border:1px solid #c0a0f0;border-radius:8px;padding:14px 16px;text-align:center;width:33%;">
          <div style="font-size:22px;font-weight:700;color:#7f00e2;">${candidates.length}</div>
          <div style="font-size:11px;color:#5900a3;margin-top:3px;">Candidates</div>
        </td>
        <td style="background:#ede5fd;border:1px solid #c0a0f0;border-radius:8px;padding:14px 16px;text-align:center;width:33%;">
          <div style="font-size:22px;font-weight:700;color:#7f00e2;">${top?.final_score ?? '—'}<span style="font-size:13px;color:#5900a3;">/100</span></div>
          <div style="font-size:11px;color:#5900a3;margin-top:3px;">Top Score</div>
        </td>
        <td style="background:#ede5fd;border:1px solid #c0a0f0;border-radius:8px;padding:14px 16px;text-align:center;width:33%;">
          <div style="font-size:22px;font-weight:700;color:#7f00e2;">${avgScore}<span style="font-size:13px;color:#5900a3;">/100</span></div>
          <div style="font-size:11px;color:#5900a3;margin-top:3px;">Avg. Score</div>
        </td>
      </tr>
    </table>

    ${top ? `<p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#5a4a6a;">
      Top ranked candidate: <strong style="color:#7f00e2;">${top.full_name || 'Unknown'}</strong>
      with a final score of <strong style="color:#1c1022;">${top.final_score ?? '—'}/100</strong>.
    </p>` : ''}

    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#5a4a6a;">
      The attached PDF includes individual score breakdowns (skills, experience, communication),
      AI-generated assessment notes, and direct hyperlinks to each candidate's resume for quick review.
    </p>

    <div style="border-top:1px solid #e8ddf5;padding-top:22px;margin-top:6px;">
      <p style="margin:0;font-size:14px;color:#1c1022;">Warm regards,</p>
      <p style="margin:6px 0 0;font-size:14px;font-weight:700;color:#7f00e2;">The Zenhyre Team</p>
      <p style="margin:2px 0 0;font-size:12px;color:#9b8aaa;">Novare Talent</p>
    </div>
  </div>

  <p style="text-align:center;font-size:11px;color:#9b8aaa;margin:14px 0 0;">
    This report was prepared by Zenhyre's AI evaluation engine.
  </p>
</div>`

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: to_email,
      subject: `Evaluation Report — ${jobTitle}`,
      html: htmlBody,
      attachments: [
        {
          filename: `evaluation-report-${jobTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`,
          content: pdfBuffer,
        },
      ],
    })

    if (sendError) {
      console.error('Resend error:', sendError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // ── Persist incremented send count ────────────────────────────────────────
    const updatedResults = {
      ...evalRow.results,
      report_send_log: { ...sendLog, [user.id]: sendCount + 1 },
    }
    await supabaseAdmin
      .from('evaluations')
      .update({ results: updatedResults })
      .eq('job_id', job_id)

    return NextResponse.json({ success: true, sendsRemaining: 2 - (sendCount + 1) })
  } catch (err: any) {
    console.error('send-evaluation-report error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
