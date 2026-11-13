import { NextRequest } from "next/server";
import { createClient as createAdminClient, SupabaseClient, User } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/utils/supabase/server";

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

export function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getAdminClient(): SupabaseClient {
  return createAdminClient(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Resolve the caller from a Bearer token, falling back to the cookie session. */
export async function getCallerUser(req: NextRequest): Promise<User | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (token) {
    const { data, error } = await getAdminClient().auth.getUser(token);
    return error ? null : data?.user ?? null;
  }
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.getUser();
    return error ? null : data?.user ?? null;
  } catch {
    return null;
  }
}

export async function getCallerRole(userId: string): Promise<string | null> {
  const { data } = await getAdminClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return (data as any)?.role ?? null;
}

/** True when the caller is an admin or the job's employer. */
export async function canManageJob(userId: string, jobId: string): Promise<boolean> {
  const admin = getAdminClient();
  const [{ data: job }, role] = await Promise.all([
    admin.from("jobs").select("employer_id").eq("job_id", jobId).maybeSingle(),
    getCallerRole(userId),
  ]);
  if (role === "admin") return true;
  return !!job && (job as any).employer_id === userId;
}
