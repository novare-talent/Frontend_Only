// app/api/consume-job/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
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

    // Find most recent subscription for this profile
    // NOTE: change .eq("profile_id", userId) if your FK uses another column (user_id, owner_id, etc.)
    const { data: subs, error: subsError } = await supabaseAdmin
      .from("subscriptions")
      .select("id, jobs_remaining, status, created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subsError) {
      return NextResponse.json({ error: "Error reading subscriptions", details: subsError }, { status: 500 });
    }

    if (!subs) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    const current = Number(subs.jobs_remaining ?? 0);
    if (current <= 0) {
      return NextResponse.json({ error: "No jobs remaining", jobs_remaining: current }, { status: 400 });
    }

    // Decrement jobs_remaining by 1
    const newValue = current - 1;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({ jobs_remaining: newValue })
      .eq("id", subs.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: "Failed to decrement jobs_remaining", details: updateError }, { status: 500 });
    }

    return NextResponse.json({ ok: true, jobs_remaining: Number(updated.jobs_remaining ?? newValue) }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/consume-job] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error", details: String(err) }, { status: 500 });
  }
}
