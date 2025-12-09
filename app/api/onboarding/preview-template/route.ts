// app/api/onboarding/preview-template/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function escapeHtml(str?: string) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { submissionId?: string; onboardingId?: string };
    const { submissionId, onboardingId } = body ?? {};

    if (!submissionId) {
      return NextResponse.json({ error: "missing submissionId" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: submission, error: subErr } = await supabase
      .from("client_submission")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (subErr) {
      console.error("Error fetching submission for preview:", subErr);
      const msg = subErr.message ?? String(subErr);
      if (msg.toLowerCase().includes("invalid api key") || msg.toLowerCase().includes("invalid token")) {
        return NextResponse.json(
          { error: "Invalid Supabase API key on server. Set a valid SUPABASE_SERVICE_ROLE_KEY in your environment or allow anon read access via RLS." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const lookupOnboardingId = onboardingId || (submission as any).onboarding_id;
    const { data: onboarding, error: onbErr } = await supabase
      .from("onboarding")
      .select("*")
      .eq("id", lookupOnboardingId)
      .single();

    if (onbErr) {
      console.error("Error fetching onboarding for preview:", onbErr);
      const msg = onbErr.message ?? String(onbErr);
      if (msg.toLowerCase().includes("invalid api key") || msg.toLowerCase().includes("invalid token")) {
        return NextResponse.json(
          { error: "Invalid Supabase API key on server. Set a valid SUPABASE_SERVICE_ROLE_KEY in your environment or allow anon read access via RLS." },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const responsibilities = (submission as any).job_responsibilities
      ? JSON.parse((submission as any).job_responsibilities).map((s: string) => `<li>${escapeHtml(s)}</li>`).join("")
      : "";
    const skills = (submission as any).job_skills
      ? JSON.parse((submission as any).job_skills).map((s: string) => `<li>${escapeHtml(s)}</li>`).join("")
      : "";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111; padding:16;">
        <h2>Agreement Preview</h2>
        <h3>${escapeHtml(onboarding?.company_name || "")}</h3>
        <p><strong>Client CIN:</strong> ${escapeHtml((submission as any).client_cin || "")}</p>
        <p><strong>Address:</strong> ${escapeHtml((submission as any).client_address || "")}</p>
        <h4>Job Title</h4>
        <p>${escapeHtml((submission as any).job_title || "")}</p>
        <h4>Job Summary</h4>
        <p>${escapeHtml((submission as any).job_summary || "")}</p>
        <h4>Responsibilities</h4>
        <ul>${responsibilities}</ul>
        <h4>Required Skills</h4>
        <ul>${skills}</ul>
        <h4>Duration & Stipend</h4>
        <p>${escapeHtml((submission as any).duration || "")} months — ${escapeHtml((submission as any).stipend || "")}</p>
        <hr />
        <p style="font-size:12px;color:#666">This is a preview generated from the filled template. The final DOCX/PDF will contain official formatting.</p>
      </div>
    `;

    return NextResponse.json({ html }, { status: 200 });
  } catch (err: any) {
    console.error("preview-template error:", err);
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
