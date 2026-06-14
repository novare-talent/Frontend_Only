import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Simple in-process rate limiter: max 3 submissions per IP per 60 s
const ipMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = ipMap.get(ip)
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again shortly." }, { status: 429 })
  }

  try {
    const supabase = await createClient()

    // Candidates must be authenticated to submit a response
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { form_id, job_id, answers, resume_url } = body

    if (!form_id || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "form_id and answers are required" }, { status: 400 })
    }

    // Server-side dedup check — prevents double submission even if client bypasses the UI guard
    const { data: existing } = await supabase
      .from("responses")
      .select("id")
      .eq("form_id", form_id)
      .eq("profile_id", user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You have already submitted this application." }, { status: 409 })
    }

    const { error: insertError } = await supabase.from("responses").insert([
      {
        form_id,
        profile_id: user.id,
        job_id: job_id ?? null,
        answers,
        resume_url: resume_url ?? null,
      },
    ])

    if (insertError) {
      // Unique constraint violation → race-condition double submit
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "You have already submitted this application." }, { status: 409 })
      }
      console.error("Response insert error:", insertError)
      return NextResponse.json({ error: "Failed to submit application." }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    console.error("Response submit error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
