import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import PDFParser from "pdf2json"
import { validateStorageUrl } from "@/utils/validateStorageUrl"

const m = new Map<string,{c:number,t:number}>()
const R = 5
const W = 60000

function rl(k:string){
  const n=Date.now()
  const e=m.get(k)
  if(!e||n-e.t>W){m.set(k,{c:1,t:n});return true}
  if(e.c>=R)return false
  e.c++;return true
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const runtime = "nodejs"

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "local"
  if(!rl(ip)) return NextResponse.json({error:"Rate limit exceeded"},{status:429})

  try {
    /* ----------------------- 1️⃣ Authenticate ----------------------- */
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    /* ----------------------- 2️⃣ Verify Role ----------------------- */
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !profile)
      return NextResponse.json({ error: "Profile not found" }, { status: 403 })

    if (!["admin", "client"].includes(profile.role))
      return NextResponse.json(
        {
          error:
            "Insufficient permissions — only admins and clients can evaluate jobs.",
        },
        { status: 403 }
      )

    /* ----------------------- 3️⃣ Parse Body ----------------------- */
    const body = await request.json()
    const { job_id } = body
    if (!job_id)
      return NextResponse.json({ error: "job_id is required" }, { status: 400 })

    /* ----------------------- 4️⃣ Fetch Job ----------------------- */
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("job_id, Job_Name, JD_pdf, closingTime")
      .eq("job_id", job_id)
      .single()
    if (jobError || !job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 })

    if (!job.JD_pdf)
      return NextResponse.json({ error: "No JD PDF found for this job." }, { status: 400 })

    /* ----------------------- 5️⃣ Extract JD Text ----------------------- */
    validateStorageUrl(job.JD_pdf)
    console.log("Downloading JD PDF from:", job.JD_pdf)
    const pdfResponse = await fetch(job.JD_pdf)
    if (!pdfResponse.ok) throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`)

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
    const jobDescription = await extractTextFromPDFBuffer(pdfBuffer)
    console.log(`Extracted ${jobDescription.length} characters from JD`)

    /* ----------------------- 6️⃣ Fetch Form ----------------------- */
    const { data: form, error: formError } = await supabase
      .from("forms")
      .select("form_id")
      .eq("job_id", job_id)
      .single()
    if (formError || !form)
      return NextResponse.json({ error: "Form not found for this job" }, { status: 404 })

    /* ----------------------- 7️⃣ Fetch Responses ----------------------- */
    const { data: responses, error: responseError } = await supabase
      .from("responses")
      .select("id, profile_id, form_id, answers, resume_url, created_at")
      .eq("form_id", form.form_id)
    if (responseError || !responses || responses.length === 0)
      return NextResponse.json(
        { error: "No responses found for this form" },
        { status: 404 }
      )

    /* ----------------------- 7b️⃣ Cap candidates (#14) ----------------------- */
    const MAX_CANDIDATES = 500
    if (responses.length > MAX_CANDIDATES) {
      return NextResponse.json(
        { error: `Too many candidates (${responses.length}). Evaluation is capped at ${MAX_CANDIDATES} per run.` },
        { status: 400 }
      )
    }

    /* ----------------------- 7c️⃣ Fetch Assignments (#18) ----------------------- */
    const { data: assignmentRows } = await supabase
      .from("assignments")
      .select("candidate_id, submission_file_url")
      .eq("job_id", job_id)
      .neq("candidate_id", "00000000-0000-0000-0000-000000000000")

    const assignmentMap: Record<string, string> = {}
    for (const a of assignmentRows ?? []) {
      if (a.submission_file_url) assignmentMap[a.candidate_id] = a.submission_file_url
    }

    /* ----------------------- 8️⃣ Fetch Profiles with resume_url ----------------------- */
    const profileIds = responses.map((r) => r.profile_id).filter(Boolean)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone, resume_url")
      .in("id", profileIds)

    if (profilesError || !profiles || profiles.length === 0)
      return NextResponse.json(
        { error: "No profiles found for candidates" },
        { status: 404 }
      )

    /* ----------------------- 9️⃣ Combine Candidates ----------------------- */
    const candidates = profiles.map((p) => {
      const response = responses.find((r) => r.profile_id === p.id)
      
      // Parse resume_url to get the first resume if it's an array
      let resumeUrl = null
      if (p.resume_url) {
        try {
          const parsed = typeof p.resume_url === 'string' 
            ? JSON.parse(p.resume_url) 
            : p.resume_url
          resumeUrl = Array.isArray(parsed) ? parsed[0] : parsed
        } catch {
          resumeUrl = p.resume_url
        }
      }
      
      return {
        ...p,
        ...response,
        name: `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unnamed",
        email: p.email || "Not provided",
        phone: p.phone || "Not provided",
        resume_url: resumeUrl,
        assignment_url: assignmentMap[p.id] ?? null,
      }
    })

    /* ----------------------- 🔟 Evaluate Candidates with Concurrent Batching ----------------------- */
    console.log(`Starting evaluation of ${candidates.length} candidates...`)
    const evaluated: any[] = []
    const BATCH_SIZE = 3

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
      const batch = candidates.slice(i, i + BATCH_SIZE)
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}: candidates ${i + 1}–${Math.min(i + BATCH_SIZE, candidates.length)}`)

      const batchResults = await Promise.allSettled(
        batch.map(async (candidate) => {
          let resumeText: string | null = null
          if (candidate.resume_url) {
            try {
              resumeText = await extractResumeText(candidate.resume_url)
            } catch (resumeErr) {
              console.warn(`  Failed to extract resume for ${candidate.name}:`, resumeErr)
            }
          }
          let assignmentText: string | null = null
          if (candidate.assignment_url) {
            try {
              assignmentText = await extractAssignmentText(candidate.assignment_url)
            } catch (err) {
              console.warn(`  Failed to extract assignment for ${candidate.name}:`, err)
            }
          }
          const evalResult = await evaluateCandidateWithRetry(candidate, jobDescription, resumeText, assignmentText)
          return { candidate, evalResult, resumeText, assignmentText }
        })
      )

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value.evalResult) {
          const { candidate, evalResult, resumeText, assignmentText } = result.value
          const e = evalResult
          evaluated.push({
            profile_id: candidate.id,
            full_name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            resume_url: candidate.resume_url,
            has_resume: !!resumeText,
            has_assignment: !!assignmentText,
            // Numeric scores (flat, for sorting and display)
            skills_match: e.skills_score ?? 0,
            experience_relevance: e.experience_score ?? 0,
            communication_clarity: e.communication_score ?? 0,
            overall_fit: e.fit_score ?? 0,
            final_score: e.final_score ?? 0,
            // Text assessments from AI
            skills_assessment: e.skills_match ?? "",
            experience_assessment: e.experience_relevance ?? "",
            communication_assessment: e.communication_clarity ?? "",
            fit_assessment: e.overall_fit ?? "",
            justification: e.justification ?? "",
            needs_review: e.needs_review ?? false,
            review_reason: e.review_reason ?? null,
            rejection_sent: false,
          })
          console.log(`  ✓ Successfully evaluated ${candidate.name}`)
        } else if (result.status === "rejected") {
          console.error(`  Error in batch:`, result.reason)
        }
      }

      // Delay between batches to respect rate limits
      if (i + BATCH_SIZE < candidates.length) {
        console.log(`  Waiting 2s before next batch...`)
        await delay(2000)
      }
    }

    if (evaluated.length === 0) {
      return NextResponse.json(
        { 
          error: "No successful evaluations. This may be due to API rate limits. Please try again in a few minutes.",
          candidates_attempted: candidates.length 
        },
        { status: 429 }
      )
    }

    /* ----------------------- 1️⃣1️⃣ Save or Update Evaluation ----------------------- */
    const { data: existingEval } = await supabase
      .from("evaluations")
      .select("evaluation_id")
      .eq("job_id", job_id)
      .maybeSingle()

    const record = { job_id, results: { candidates: evaluated } }

    if (existingEval) {
      console.log(`Updating existing evaluation for job_id: ${job_id}`)
      const { error: updateError } = await supabase
        .from("evaluations")
        .update(record)
        .eq("job_id", job_id)

      if (updateError) throw updateError
    } else {
      console.log(`Inserting new evaluation for job_id: ${job_id}`)
      const { error: insertError } = await supabase
        .from("evaluations")
        .insert(record)

      if (insertError) throw insertError
    }

    return NextResponse.json({
      success: true,
      job_id,
      results: { candidates: evaluated },
      message: existingEval
        ? "Evaluation updated successfully"
        : "Evaluation completed successfully",
      stats: {
        total: candidates.length,
        evaluated: evaluated.length,
        failed: candidates.length - evaluated.length,
        with_resume: evaluated.filter(e => e.has_resume).length,
        without_resume: evaluated.filter(e => !e.has_resume).length,
        with_assignment: evaluated.filter(e => e.has_assignment).length,
      }
    })
  } catch (error: any) {
    console.error("Evaluation Error:", error)
    return NextResponse.json(
      { error: error.message || "Evaluation failed" },
      { status: 400 }
    )
  }
}

/* ----------------------- Helper: Extract PDF Text ----------------------- */
async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new (PDFParser as any)(null, 1)
      let text = ""

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        console.error("PDF Parse Error:", errData.parserError)
        reject(new Error("Failed to parse PDF"))
      })

      pdfParser.on("pdfParser_dataReady", () => {
        text = (pdfParser as any).getRawTextContent()
        resolve(text)
      })

      pdfParser.parseBuffer(buffer)
    } catch (error) {
      reject(error)
    }
  })
}

/* ----------------------- Helper: Extract Resume Text ----------------------- */
async function extractResumeText(resumeUrl: string): Promise<string | null> {
  try {
    if (!resumeUrl || typeof resumeUrl !== 'string') {
      return null
    }

    validateStorageUrl(resumeUrl)
    const response = await fetch(resumeUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch resume: ${response.statusText}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const text = await extractTextFromPDFBuffer(buffer)
    return text
  } catch (error) {
    console.error("Resume extraction error:", error)
    return null
  }
}

/* ----------------------- Helper: Extract Assignment Text (#18) ----------------------- */
async function extractAssignmentText(url: string): Promise<string | null> {
  try {
    validateStorageUrl(url)
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!response.ok) return null
    const contentType = response.headers.get("content-type") ?? ""
    if (contentType.includes("text") || /\.(py|js|ts|txt|java|cpp|c|go|rb|rs|php|swift|kt|cs|r)$/i.test(url)) {
      const text = await response.text()
      return text.substring(0, 3000)
    }
    return null
  } catch {
    return null
  }
}

/* ----------------------- Helper: Evaluate with Retry ----------------------- */
async function evaluateCandidateWithRetry(
  candidate: any,
  jobDescription: string,
  resumeText: string | null,
  assignmentText: string | null = null,
  maxRetries: number = 3
) {
  let lastError: any = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`    Attempt ${attempt}/${maxRetries}`)
      const result = await evaluateCandidate(candidate, jobDescription, resumeText, assignmentText)
      return result
    } catch (error: any) {
      lastError = error
      
      // Check if it's a rate limit error
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        console.warn(`    Rate limit hit on attempt ${attempt}`)
        
        if (attempt < maxRetries) {
          // Exponential backoff: 5s, 10s, 20s
          const waitTime = 5000 * Math.pow(2, attempt - 1)
          console.log(`    Waiting ${waitTime / 1000}s before retry...`)
          await delay(waitTime)
          continue
        }
      } else {
        // For non-rate-limit errors, don't retry
        console.error(`    Non-rate-limit error:`, error.message)
        break
      }
    }
  }
  
  console.error(`    Failed after ${maxRetries} attempts:`, lastError?.message)
  return null
}

/* ----------------------- Helper: Clamp number to range ----------------------- */
function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/* ----------------------- Helper: Validate evaluation schema ----------------------- */
function validateEvaluation(obj: any): { valid: boolean; errors: string[] } {
  const stringFields = ["skills_match", "experience_relevance", "communication_clarity", "overall_fit", "justification"]
  const scoreFields = ["skills_score", "experience_score", "communication_score", "fit_score"]
  const errors: string[] = []

  for (const f of stringFields) {
    if (!obj[f] || typeof obj[f] !== "string") errors.push(`Missing or invalid field: ${f}`)
  }
  for (const f of scoreFields) {
    const v = Number(obj[f])
    if (isNaN(v) || v < 0 || v > 100) errors.push(`Score out of range [0-100]: ${f} = ${obj[f]}`)
  }
  return { valid: errors.length === 0, errors }
}

/* ----------------------- Helper: Compute final_score from sub-scores in code ----------------------- */
function computeFinalScore(obj: any): number {
  const skills = clamp(Number(obj.skills_score), 0, 100)
  const experience = clamp(Number(obj.experience_score), 0, 100)
  const communication = clamp(Number(obj.communication_score), 0, 100)
  const fit = clamp(Number(obj.fit_score), 0, 100)
  // Weighted formula: skills 35% | experience 30% | communication 15% | fit 20%
  return Math.round(skills * 0.35 + experience * 0.30 + communication * 0.15 + fit * 0.20)
}

/* ----------------------- Helper: Evaluate Candidate ----------------------- */
async function evaluateCandidate(
  candidate: any,
  jobDescription: string,
  resumeText: string | null,
  assignmentText: string | null = null
) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    const candidateInfo = {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      responses: candidate.response || {},
    }

    const prompt = `
You are an AI recruiter. Evaluate this candidate for the given job description.
${resumeText ? 'A resume has been provided.' : 'NOTE: No resume available - evaluate based on form responses only.'}
${assignmentText ? 'A coding/assignment submission has been provided.' : ''}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text).
All score fields must be integers between 0 and 100.

{
  "skills_match": "brief assessment (max 400 chars)",
  "skills_score": 75,
  "experience_relevance": "brief assessment (max 400 chars)",
  "experience_score": 70,
  "communication_clarity": "brief assessment (max 400 chars)",
  "communication_score": 80,
  "overall_fit": "brief assessment (max 400 chars)",
  "fit_score": 72,
  "justification": "brief justification (max 400 chars)"
}

Job Description:
${jobDescription.substring(0, 2000)}

Candidate Profile:
${JSON.stringify(candidateInfo, null, 2)}

${resumeText ? `\nResume Content:\n${resumeText.substring(0, 3000)}` : '\nNo resume provided - base evaluation on form responses and profile information.'}
${assignmentText ? `\nAssignment Submission:\n${assignmentText.substring(0, 2000)}` : ''}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("Invalid Gemini response:", text)
      throw new Error("Invalid Gemini response format")
    }

    const evaluation = JSON.parse(jsonMatch[0])

    // Validate schema — on failure mark for human review rather than silently dropping
    const { valid, errors } = validateEvaluation(evaluation)
    if (!valid) {
      console.warn("Evaluation schema validation failed:", errors, "Raw:", evaluation)
      evaluation.needs_review = true
      evaluation.review_reason = `Schema errors: ${errors.join("; ")}`
    }

    // Always compute final_score in code from numeric sub-scores — never trust the model's arithmetic
    evaluation.final_score = computeFinalScore(evaluation)

    if (!resumeText) {
      evaluation.note = "Evaluated without resume"
    }

    return evaluation
  } catch (err: any) {
    console.error("Gemini Evaluation Error:", err.message || err)
    throw err
  }
}