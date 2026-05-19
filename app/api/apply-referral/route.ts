import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
const REFERRAL_CODE = "ZENHYRE2026";

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

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 });
    }

    const getUserResp = await supabaseAdmin.auth.getUser(token);
    const user = getUserResp?.data?.user ?? null;
    if (getUserResp?.error || !user) {
      return NextResponse.json({ error: "Invalid token or user not found" }, { status: 401 });
    }
    const userId = user.id;

    const body = await req.json();
    const code: string = body?.code ?? "";
    if (!code || code.trim().toUpperCase() !== REFERRAL_CODE) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }

    // Check if referral already applied for this account
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("referral_applied")
      .eq("id", userId)
      .single() as { data: { referral_applied: boolean | null } | null; error: unknown };

    if (profileError || !profile) {
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    if (profile.referral_applied) {
      return NextResponse.json(
        { error: "Referral code has already been applied to your account" },
        { status: 400 }
      );
    }

    // Check if a subscription row already exists for this profile
    const { data: existingSub, error: subFetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("id, jobs_remaining")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { id: string; jobs_remaining: number | null } | null; error: unknown };

    if (subFetchError) {
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 500 });
    }

    let newJobsRemaining: number;

    if (existingSub) {
      newJobsRemaining = Number(existingSub.jobs_remaining ?? 0) + 1;
      const { error: updateError } = await supabaseAdmin
        .from("subscriptions")
        // @ts-expect-error — supabase types not regenerated yet; jobs_remaining column exists at runtime
        .update({ jobs_remaining: newJobsRemaining })
        .eq("id", existingSub.id);

      if (updateError) {
        return NextResponse.json({ error: "Failed to update credits", details: updateError }, { status: 500 });
      }
    } else {
      newJobsRemaining = 1;
      const { error: insertError } = await supabaseAdmin
        .from("subscriptions")
        .insert({
          id: crypto.randomUUID(),
          profile_id: userId,
          jobs_remaining: 1,
          evaluations_remaining: 0,
          status: "paid",
        });

      if (insertError) {
        return NextResponse.json({ error: "Failed to create subscription", details: insertError }, { status: 500 });
      }
    }

    // Mark referral as used on the profile
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      // @ts-expect-error — supabase types not regenerated yet; referral_applied column exists at runtime
      .update({ referral_applied: true })
      .eq("id", userId);

    if (profileUpdateError) {
      return NextResponse.json({ error: "Failed to update profile", details: profileUpdateError }, { status: 500 });
    }

    return NextResponse.json({ ok: true, jobs_remaining: newJobsRemaining }, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/apply-referral] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error", details: String(err) }, { status: 500 });
  }
}
