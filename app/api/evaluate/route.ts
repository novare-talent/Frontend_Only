import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import PDFParser from "pdf2json"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
export const runtime = "nodejs"

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

    /* ----------------------- 8️⃣ Fetch Profiles ----------------------- */
    const profileIds = responses.map((r) => r.profile_id).filter(Boolean)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", profileIds)

    if (profilesError || !profiles || profiles.length === 0)
      return NextResponse.json(
        { error: "No profiles found for candidates" },
        { status: 404 }
      )

    /* ----------------------- 9️⃣ Combine Candidates ----------------------- */
    const candidates = profiles.map((p) => {
      const response = responses.find((r) => r.profile_id === p.id)
      return {
        ...p,
        ...response,
        name:
          p.full_name ||
          p.name ||
          `${p.first_name || ""} ${p.last_name || ""}`.trim() ||
          "Unnamed",
        email: p.email || p.contact_email || "Not provided",
        phone:
          p.phone ||
          p.contact_number ||
          p.phone_number ||
          p.mobile ||
          "Not provided",
      }
    })

    /* ----------------------- 🔟 Evaluate Candidates ----------------------- */
    const evaluated = await Promise.all(
      candidates.map(async (candidate) => {
        const evalResult = await evaluateCandidate(candidate, jobDescription)
        if (!evalResult) return null
        return {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone,
          results: evalResult,
        }
      })
    )

    const validEvaluations = evaluated.filter((e) => e !== null)
    if (validEvaluations.length === 0)
      throw new Error("No successful evaluations")

    /* ----------------------- 1️⃣1️⃣ Save or Update Evaluation ----------------------- */
    const { data: existingEval } = await supabase
      .from("evaluations")
      .select("evaluation_id")
      .eq("job_id", job_id)
      .maybeSingle()

    const record = { job_id, results: validEvaluations }

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
      results: validEvaluations,
      message: existingEval
        ? "Evaluation updated successfully"
        : "Evaluation completed successfully",
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
        reject(new Error("Failed to parse JD PDF"))
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

/* ----------------------- Helper: Evaluate Candidate ----------------------- */
async function evaluateCandidate(candidate: any, jobDescription: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `
You are an AI recruiter. Evaluate this candidate for the given job description.
Return JSON with the following structure:

{
  "skills_match": "..."(less than 400 chars),
  "experience_relevance": "..."(less than 400 chars),
  "communication_clarity": "..."(less than 400 chars),
  "overall_fit": "..."(less than 400 chars),
  "final_score": 0-100,
  "justification": "...(less than 400 chars)"
}

Job Description:
${jobDescription}

Candidate Profile (with name, email, and phone):
${JSON.stringify(candidate, null, 2)}
`
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Invalid Gemini response format")

    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.error("Gemini Evaluation Error:", err)
    return null
  }
}
