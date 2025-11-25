// app/api/credits/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

// do not throw at import time; return JSON errors instead
function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

function safeNum(v: any) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

async function getJobsRemainingFromSubscriptions(supabaseAdmin: any, userId: string) {
  // Query latest subscriptions for this profile_id and read jobs_remaining only
  // NOTE: If your FK is named something else (e.g. user_id or owner_id), change "profile_id" accordingly.
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("jobs_remaining, id, profile_id, status, created_at")
    .eq("profile_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return { jobs_remaining: null, rows: null, error };
  }

  const rows = data ?? [];
  // Prefer the most recent non-null numeric jobs_remaining
  for (const r of rows) {
    const n = safeNum((r as any).jobs_remaining);
    if (n !== null) return { jobs_remaining: n, rows };
  }

  // none found
  return { jobs_remaining: null, rows };
}

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      // Config issue — return JSON 500 (not HTML)
      console.error("[/api/credits] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY on server env.");
      return NextResponse.json(
        { error: "Server misconfiguration", details: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    // Expect Authorization: Bearer <access_token>
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      console.warn("[/api/credits] Missing access token on request.");
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // Validate token and get user with admin client
    const getUserResp: any = await supabaseAdmin.auth.getUser(token);
    if (getUserResp?.error) {
      console.error("[/api/credits] supabaseAdmin.auth.getUser error:", getUserResp.error);
      return NextResponse.json({ error: "Invalid token", details: getUserResp.error }, { status: 401 });
    }
    const user = getUserResp?.data?.user ?? null;
    if (!user) {
      console.error("[/api/credits] no user found for token.");
      return NextResponse.json({ error: "User not found for token" }, { status: 401 });
    }

    const userId = user.id;

    // Only check subscriptions.jobs_remaining (per your request)
    const subsResult = await getJobsRemainingFromSubscriptions(supabaseAdmin, userId);
    if (subsResult.error) {
      console.error("[/api/credits] error querying subscriptions:", subsResult.error);
      return NextResponse.json({ error: "Error querying subscriptions", details: subsResult.error }, { status: 500 });
    }

    if (subsResult.jobs_remaining !== null) {
      // Success: return jobs_remaining as a numeric value
      const value = Number(subsResult.jobs_remaining);
      console.log(`[/api/credits] Returning jobs_remaining=${value} for user=${userId}`);
      return NextResponse.json({ jobs_remaining: value }, { status: 200 });
    }

    // Not found -> treat as 0 (explicit)
    console.log(`[/api/credits] No jobs_remaining found for user=${userId}, returning 0`);
    return NextResponse.json({ jobs_remaining: 0 }, { status: 200 });
  } catch (err: any) {
    // Always return JSON and log full error for debugging
    console.error("[/api/credits] Unexpected server error:", err);
    return NextResponse.json({ error: "Unexpected server error", details: String(err) }, { status: 500 });
  }
}
