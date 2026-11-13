import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyRateLimit, limiters } from "@/utils/rateLimit";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
const REFERRAL_CODE = (process.env.REFERRAL_CODE ?? "ZENHYRE2026").trim().toUpperCase();

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

    const rateLimited = await applyRateLimit(limiters.applyReferral, `apply-referral:${userId}`);
    if (rateLimited) return rateLimited;

    const body = await req.json();
    const code: string = typeof body?.code === "string" ? body.code : "";
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

    // Atomically claim the referral FIRST: only one concurrent request can flip
    // referral_applied false -> true. Everyone else gets zero rows back.
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("profiles")
      // @ts-expect-error - supabase types not regenerated yet; referral_applied column exists at runtime
      .update({ referral_applied: true })
      .eq("id", userId)
      .or("referral_applied.is.null,referral_applied.eq.false")
      .select("id");

    if (claimError) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
    if (!claimed || claimed.length === 0) {
      return NextResponse.json(
        { error: "Referral code has already been applied to your account" },
        { status: 400 }
      );
    }

    // From here on, a failure must release the claim so the user can retry.
    const releaseClaim = async () => {
      await supabaseAdmin
        .from("profiles")
        // @ts-expect-error - supabase types not regenerated yet
        .update({ referral_applied: false })
        .eq("id", userId);
    };

    // Check if a subscription row already exists for this profile
    const { data: existingSub, error: subFetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("id, jobs_remaining")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle() as { data: { id: string; jobs_remaining: number | null } | null; error: unknown };

    if (subFetchError) {
      await releaseClaim();
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
        await releaseClaim();
        return NextResponse.json({ error: "Failed to update credits" }, { status: 500 });
      }
    } else {
      newJobsRemaining = 1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertPayload: any = {
        id: crypto.randomUUID(),
        profile_id: userId,
        jobs_remaining: 1,
        evaluations_remaining: 0,
        status: "paid",
      };
      const { error: insertError } = await supabaseAdmin
        .from("subscriptions")
        .insert(insertPayload);

      if (insertError) {
        await releaseClaim();
        return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, jobs_remaining: newJobsRemaining }, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/apply-referral] Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
