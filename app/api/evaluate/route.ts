import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import PDFParser from "pdf2json"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const runtime = "nodejs"

// Helper to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
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
      .select("*")
      .eq("job_id", job_id)
      .single()
    if (jobError || !job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 })

    if (!job.JD_pdf)
      return NextResponse.json({ error: "No JD PDF found for this job." }, { status: 400 })

    /* ----------------------- 5️⃣ Extract JD Text ----------------------- */
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
      .select("*")
      .eq("form_id", form.form_id)
    if (responseError || !responses || responses.length === 0)
      return NextResponse.json(
        { error: "No responses found for this form" },
        { status: 404 }
      )

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
      }
    })

    /* ----------------------- 🔟 Evaluate Candidates with Rate Limiting ----------------------- */
    console.log(`Starting evaluation of ${candidates.length} candidates...`)
    const evaluated = []
    
    // Process candidates sequentially with delay to avoid rate limits
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i]
      console.log(`Evaluating candidate ${i + 1}/${candidates.length}: ${candidate.name}`)
      
      try {
        // Extract resume text if available
        let resumeText = null
        if (candidate.resume_url) {
          try {
            console.log(`  Fetching resume for ${candidate.name}`)
            resumeText = await extractResumeText(candidate.resume_url)
            console.log(`  Extracted ${resumeText?.length || 0} characters from resume`)
          } catch (resumeErr) {
            console.warn(`  Failed to extract resume for ${candidate.name}:`, resumeErr)
            // Continue without resume
          }
        }

        const evalResult = await evaluateCandidateWithRetry(candidate, jobDescription, resumeText)
        
        if (evalResult) {
          evaluated.push({
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            phone: candidate.phone,
            resume_url: candidate.resume_url,
            has_resume: !!resumeText,
            results: evalResult,
          })
          console.log(`  ✓ Successfully evaluated ${candidate.name}`)
        } else {
          console.warn(`  ✗ Failed to evaluate ${candidate.name}`)
        }
        
        // Add delay between requests to avoid rate limits (2 seconds)
        if (i < candidates.length - 1) {
          console.log(`  Waiting 2s before next evaluation...`)
          await delay(2000)
        }
      } catch (err) {
        console.error(`  Error evaluating candidate ${candidate.name}:`, err)
        // Continue with next candidate
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

    const record = { job_id, results: evaluated }

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
      results: evaluated,
      message: existingEval
        ? "Evaluation updated successfully"
        : "Evaluation completed successfully",
      stats: {
        total: candidates.length,
        evaluated: evaluated.length,
        failed: candidates.length - evaluated.length,
        with_resume: evaluated.filter(e => e.has_resume).length,
        without_resume: evaluated.filter(e => !e.has_resume).length,
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

/* ----------------------- Helper: Evaluate with Retry ----------------------- */
async function evaluateCandidateWithRetry(
  candidate: any,
  jobDescription: string,
  resumeText: string | null,
  maxRetries: number = 3
) {
  let lastError: any = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`    Attempt ${attempt}/${maxRetries}`)
      const result = await evaluateCandidate(candidate, jobDescription, resumeText)
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

/* ----------------------- Helper: Evaluate Candidate ----------------------- */
async function evaluateCandidate(
  candidate: any, 
  jobDescription: string, 
  resumeText: string | null
) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Using stable model instead of experimental
    })

    // Prepare candidate info without resume content
    const candidateInfo = {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      responses: candidate.response || {},
    }

    const prompt = `
You are an AI recruiter. Evaluate this candidate for the given job description.
${resumeText ? 'A resume has been provided.' : 'NOTE: No resume available - evaluate based on form responses only.'}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):

{
  "skills_match": "brief assessment (max 400 chars)",
  "experience_relevance": "brief assessment (max 400 chars)",
  "communication_clarity": "brief assessment (max 400 chars)",
  "overall_fit": "brief assessment (max 400 chars)",
  "final_score": 75,
  "justification": "brief justification (max 400 chars)"
}

Job Description:
${jobDescription.substring(0, 2000)}

Candidate Profile:
${JSON.stringify(candidateInfo, null, 2)}

${resumeText ? `\nResume Content:\n${resumeText.substring(0, 3000)}` : '\nNo resume provided - base evaluation on form responses and profile information.'}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("Invalid Gemini response:", text)
      throw new Error("Invalid Gemini response format")
    }

    const evaluation = JSON.parse(jsonMatch[0])
    
    // Add note if evaluated without resume
    if (!resumeText) {
      evaluation.note = "Evaluated without resume"
    }

    return evaluation
  } catch (err: any) {
    console.error("Gemini Evaluation Error:", err.message || err)
    throw err
  }
}