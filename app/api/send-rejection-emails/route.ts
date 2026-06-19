import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { Resend } from "resend";
import { validateStorageUrl } from "@/utils/validateStorageUrl";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

async function extractTextFromPdf(url: string): Promise<string> {
  try {
    validateStorageUrl(url);
    const response = await fetch(url);
    if (!response.ok) return "";
    const buffer = Buffer.from(await response.arrayBuffer());
    // pdf-parse v2 is ESM — the module itself is the callable function
    const pdfModule = await import("pdf-parse");
    const data = await (pdfModule as any)(buffer);
    return data.text.slice(0, 8000); // Cap at 8k chars to stay within token limits
  } catch {
    return "";
  }
}

async function generateRejectionEmail(params: {
  candidateName: string;
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  evalJustification: string;
  skillsMatch: number;
  experienceRelevance: number;
  communicationClarity: number;
  finalScore: number;
}): Promise<{ subject: string; body: string }> {
  const {
    candidateName,
    jobTitle,
    jobDescription,
    resumeText,
    evalJustification,
    skillsMatch,
    experienceRelevance,
    communicationClarity,
    finalScore,
  } = params;
  const firstName = candidateName.split(" ")[0] || candidateName;

  const prompt = `You are an HR manager at Novare Talent. Write a personalized rejection email for a job applicant.

STRICT RULES — violating any of these makes the email unusable:
1. NEVER use placeholder text like [Job Title], [specific technologies], [X years], [specific area], etc.
2. Use the EXACT job title provided — do not substitute it with anything.
3. Use ONLY the specific information given below — do not invent or generalize.
4. Every rejection reason must cite a concrete gap found in the evaluation data below.
5. Do NOT include any closing line like "Thank you once again for your interest in our company" or similar phrases.

---
CANDIDATE NAME: ${candidateName}
JOB TITLE: ${jobTitle}

JOB DESCRIPTION (excerpt):
${jobDescription.slice(0, 2500)}

AI EVALUATION SUMMARY (use this as the primary source for rejection reasons):
- Justification: ${evalJustification || "No detailed justification available."}
- Skills Match Score: ${skillsMatch}/100
- Experience Relevance Score: ${experienceRelevance}/100
- Communication Clarity Score: ${communicationClarity}/100
- Overall Final Score: ${finalScore}/100

RESUME CONTENT (supplementary — use if evaluation summary lacks specifics):
${resumeText || "Resume text could not be extracted."}
---

Write an email that:
- Opens with "Dear ${firstName},"
- Thanks them for applying to the "${jobTitle}" role on our platform Zenhyre by Novare Talent (use this exact title)
- Explains 3-4 specific rejection reasons derived directly from the evaluation justification and scores above — name actual technologies, skills, or experience areas mentioned in the JD or evaluation
- Frames each reason constructively as an area for growth
- Ends warmly, wishing them well
- Closes with "Hiring Team - Novare Talent"
- Uses clean HTML with inline styles (paragraphs + <ul> bullet list for reasons)
- Does NOT include <html>, <head>, or <body> tags

Return a JSON object with exactly:
- "subject": the email subject line mentioning the actual job title
- "body": the full HTML email body`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 1400,
  });

  try {
    const result = JSON.parse(
      completion.choices[0].message.content ?? "{}"
    );
    return {
      subject: result.subject || `Your Application for ${jobTitle} — Update`,
      body:
        result.body ||
        `<p>Dear ${firstName},</p><p>Thank you for your interest in the ${jobTitle} position. After careful review, we have decided to move forward with other candidates. We wish you the best in your search.</p><p>Hiring Team - Novare Talent</p>`,
    };
  } catch {
    return {
      subject: `Your Application for ${jobTitle} — Update`,
      body: `<p>Dear ${firstName},</p><p>Thank you for applying for the ${jobTitle} role. After careful consideration, we will not be moving forward with your application at this time. We appreciate your interest and wish you well.</p><p>Hiring Team - Novare Talent</p>`,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { jobId, candidateIds } = await req.json();

    if (!jobId || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: "Missing jobId or candidateIds" },
        { status: 400 }
      );
    }

    // Auth check
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: userData, error: authError } =
      await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch job — include rejection_emails_sent for job-level idempotency (#13)
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("Job_Name, Job_Description, rejection_emails_sent")
      .eq("job_id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Job-level idempotency: all emails already sent for this job (#13)
    if ((job as any).rejection_emails_sent) {
      return NextResponse.json(
        { error: "Rejection emails already sent for this job", alreadySent: true },
        { status: 409 }
      );
    }

    // Fetch evaluation data to get resume URLs and per-candidate sent status
    const { data: evalRow } = await supabase
      .from("evaluations")
      .select("results")
      .eq("job_id", jobId)
      .maybeSingle();

    const evalCandidates: any[] = evalRow?.results?.candidates ?? [];
    // Key by profile_id; fall back to id for older evaluation records
    const evalMap: Record<string, any> = Object.fromEntries(
      evalCandidates.map((c: any) => [c.profile_id ?? c.id, c])
    );

    // Per-candidate idempotency: skip candidates who already received a rejection (#13)
    const alreadySentIds = new Set(
      evalCandidates
        .filter((c: any) => c.rejection_sent)
        .map((c: any) => c.profile_id ?? c.id)
    );

    // Fetch candidate profiles (only columns guaranteed to exist)
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", candidateIds);

    if (profileError) {
      console.error("[send-rejection-emails] profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profiles", details: profileError.message },
        { status: 500 }
      );
    }

    // Only process candidates who haven't received an email yet
    const profilesToProcess = (profiles ?? []).filter(p => !alreadySentIds.has(p.id));

    if (profilesToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All selected candidates have already received rejection emails",
        results: [],
      });
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // Parallel: fetch PDFs and generate emails for all candidates simultaneously
    const generationResults = await Promise.allSettled(
      profilesToProcess.map(async (profile) => {
        const candidateName =
          `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
          "Candidate";
        const evalData = evalMap[profile.id] ?? {};
        const resumeUrl = evalData.resume_url ?? "";
        const resumeText = resumeUrl ? await extractTextFromPdf(resumeUrl) : "";
        const { subject, body } = await generateRejectionEmail({
          candidateName,
          jobTitle: job.Job_Name || "the position",
          jobDescription: job.Job_Description || "",
          resumeText,
          evalJustification: evalData.justification ?? "",
          skillsMatch: evalData.skills_match ?? 0,
          experienceRelevance: evalData.experience_relevance ?? 0,
          communicationClarity: evalData.communication_clarity ?? 0,
          finalScore: evalData.final_score ?? 0,
        });
        return { profile, candidateName, subject, body };
      })
    );

    // Split into successful generations and failures
    type EmailPayload = { profile: (typeof profilesToProcess)[0]; candidateName: string; subject: string; body: string };
    const emailPayloads: EmailPayload[] = [];
    const results: { email: string; name: string; success: boolean; error?: string }[] = [];
    const sentIds: string[] = [];

    for (let i = 0; i < generationResults.length; i++) {
      const res = generationResults[i];
      const profile = profilesToProcess[i];
      const candidateName =
        `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
        "Candidate";
      if (res.status === "fulfilled") {
        emailPayloads.push(res.value);
      } else {
        results.push({
          email: profile.email,
          name: candidateName,
          success: false,
          error: (res.reason as any)?.message ?? "Email generation failed",
        });
      }
    }

    // Batch send all generated emails in one Resend API call
    if (emailPayloads.length > 0) {
      const batchPayload = emailPayloads.map(({ profile, subject, body }) => ({
        from: fromEmail,
        to: profile.email,
        subject,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#222;">${body}</div>`,
      }));

      const { data: batchData, error: batchError } = await resend.batch.send(batchPayload);

      if (batchError) {
        for (const { profile, candidateName } of emailPayloads) {
          results.push({ email: profile.email, name: candidateName, success: false, error: (batchError as any).message });
        }
      } else {
        const batchItems: { id: string }[] = (batchData as any)?.data ?? [];
        for (let i = 0; i < emailPayloads.length; i++) {
          const { profile, candidateName } = emailPayloads[i];
          if (batchItems[i]?.id) {
            results.push({ email: profile.email, name: candidateName, success: true });
            sentIds.push(profile.id);
          } else {
            results.push({ email: profile.email, name: candidateName, success: false, error: "Send failed" });
          }
        }
      }
    }

    // Mark per-candidate rejection_sent in the evaluations JSONB (#13)
    if (sentIds.length > 0 && evalCandidates.length > 0) {
      const sentSet = new Set(sentIds);
      const updatedCandidates = evalCandidates.map((c: any) => ({
        ...c,
        rejection_sent: sentSet.has(c.profile_id ?? c.id) ? true : (c.rejection_sent ?? false),
      }));
      await supabase
        .from("evaluations")
        .update({ results: { candidates: updatedCandidates } })
        .eq("job_id", jobId);
    }

    // Mark job as rejection emails sent (column added via migration 003)
    if (sentIds.length > 0) {
      await (supabase.from("jobs") as any)
        .update({ rejection_emails_sent: true })
        .eq("job_id", jobId);
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `${successCount}/${results.length} rejection emails sent`,
      results,
    });
  } catch (err: any) {
    console.error("[send-rejection-emails]", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
