// app/api/consume-job/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyRateLimit, limiters } from "@/utils/rateLimit";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdminClient;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Server misconfiguration", details: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 }
      );
    }

    // Expect Authorization: Bearer <access_token>
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    // validate token and retrieve user
    const getUserResp: any = await supabaseAdmin.auth.getUser(token);
    const user = getUserResp?.data?.user ?? null;
    if (getUserResp?.error || !user) {
      return NextResponse.json({ error: "Invalid token or user not found", details: getUserResp?.error ?? null }, { status: 401 });
    }
    const userId = user.id;

    const rateLimited = await applyRateLimit(limiters.consumeCredit, `consume-job:${userId}`);
    if (rateLimited) return rateLimited;

    // Find most recent subscription row id for this profile
    const { data: subs, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("id")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { id: string } | null; error: unknown };

    if (subsError) {
      return NextResponse.json({ error: "Error reading subscriptions", details: subsError }, { status: 500 });
    }

    if (!subs) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    // Atomic conditional decrement — single SQL statement, no race condition.
    // Returns the new jobs_remaining value, or null if jobs_remaining was already 0.
    // Requires the decrement_jobs(sub_id uuid) Postgres function (see db/functions.sql).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newValue, error: rpcError } = await (supabaseAdmin as any)
      .rpc("decrement_jobs", { sub_id: subs.id }) as { data: number | null; error: unknown };

    if (rpcError) {
      return NextResponse.json({ error: "Failed to decrement jobs_remaining", details: rpcError }, { status: 500 });
    }

    if (newValue === null) {
      return NextResponse.json({ error: "No jobs remaining", jobs_remaining: 0 }, { status: 400 });
    }

    return NextResponse.json({ ok: true, jobs_remaining: newValue }, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/consume-job] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error", details: String(err) }, { status: 500 });
  }
}
