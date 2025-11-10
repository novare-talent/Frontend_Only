// app/api/profiles/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const idsParam = request.nextUrl.searchParams.get("ids")
    if (!idsParam) {
      return NextResponse.json({ error: "Missing profile IDs (ids query param)" }, { status: 400 })
    }
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean)
    if (ids.length === 0) {
      return NextResponse.json({ error: "No profile IDs provided" }, { status: 400 })
    }

    // select many possible name fields to maximize chances of finding the correct one
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, fullname, display_name, displayName, name, first_name, firstName, last_name, lastName, email")
      .in("id", ids)

    if (error) {
      console.error("profiles fetch error:", error)
      return NextResponse.json({ error: error.message || "Failed to fetch profiles" }, { status: 500 })
    }

    const normalized = (data || []).map((row: any) => ({
      id: row.id ?? row.profile_id,
      name: normalizeProfileName(row),
      raw: row,
    }))

    return NextResponse.json(normalized)
  } catch (e: any) {
    console.error("profiles route error:", e)
    return NextResponse.json({ error: e.message ?? "Internal Server Error" }, { status: 500 })
  }
}
