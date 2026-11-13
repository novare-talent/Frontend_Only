// app/api/profiles/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCallerUser, UUID_RE } from "@/utils/apiAuth"
import { applyRateLimit, limiters } from "@/utils/rateLimit"

export const dynamic = 'force-dynamic';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalizeProfileName(row: any) {
  // priority: full_name, display_name, name, first_name+last_name, email local-part, fallback to id
  if (!row) return null
  const tryVal = (v: any) => (v && String(v).trim().length ? String(v).trim() : null)

  const full = tryVal(row.full_name) || tryVal(row.fullname) || tryVal(row.display_name) || tryVal(row.displayName) || tryVal(row.name)
  if (full) return full

  const first = tryVal(row.first_name) || tryVal(row.firstName)
  const last = tryVal(row.last_name) || tryVal(row.lastName)
  if (first || last) return [first, last].filter(Boolean).join(" ")

  const email = tryVal(row.email)
  if (email) return email.split("@")[0]

  return row.id || "Unknown"
}

export async function GET(request: NextRequest) {
  try {
    const caller = await getCallerUser(request)
    if (!caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabase()
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .maybeSingle()
    if (!me || !["admin", "client"].includes((me as any).role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const limited = await applyRateLimit(limiters.profilesLookup, `profiles:${caller.id}`)
    if (limited) return limited

    const idsParam = request.nextUrl.searchParams.get("ids")
    if (!idsParam) {
      return NextResponse.json({ error: "Missing profile IDs (ids query param)" }, { status: 400 })
    }
    const ids = Array.from(new Set(idsParam.split(",").map((s) => s.trim()).filter(Boolean)))
    if (ids.length === 0) {
      return NextResponse.json({ error: "No profile IDs provided" }, { status: 400 })
    }
    if (ids.length > 200) {
      return NextResponse.json({ error: "Too many ids (max 200)" }, { status: 400 })
    }
    if (!ids.every((id) => UUID_RE.test(id))) {
      return NextResponse.json({ error: "Invalid profile id" }, { status: 400 })
    }

    // Only columns that actually exist on `profiles` — selecting speculative
    // name columns made every request fail with "column does not exist".
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", ids)

    if (error) {
      console.error("profiles fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    const normalized = (data || []).map((row: any) => ({
      id: row.id ?? row.profile_id,
      name: normalizeProfileName(row),
      raw: row,
    }))

    return NextResponse.json(normalized, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (e: any) {
    console.error("profiles route error:", e)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
