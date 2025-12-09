import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function POST(req: Request) {
  try {
    const { submissionId, onboardingId } = await req.json();
    if (!submissionId) {
      return NextResponse.json(
        { error: "missing submissionId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch submission
    const { data: submission, error: subErr } = await supabase
      .from("client_submission")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (subErr) {
      return NextResponse.json({ error: subErr.message }, { status: 500 });
    }

    // Fetch onboarding
    const lookupOnboardingId =
      onboardingId || submission.onboarding_id;

    const { data: onboarding, error: onbErr } = await supabase
      .from("onboarding")
      .select("*")
      .eq("id", lookupOnboardingId)
      .single();

    if (onbErr) {
      return NextResponse.json({ error: onbErr.message }, { status: 500 });
    }

    // Load template.docx
    const templatePath = path.join(
      process.cwd(),
      "public",
      "template.docx"
    );

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: "template.docx missing in public/" },
        { status: 500 }
      );
    }

    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const parseArray = (value: any) => {
      if (!value) return [];
      try {
        const arr = JSON.parse(value);
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    };

    const responsibilities = parseArray(
      submission.job_responsibilities
    ).join("; ");

    const skills = parseArray(submission.job_skills).join(", ");

    doc.render({
      company_name: onboarding.company_name,
      internship_fee_pct: onboarding.internship_fee_pct,
      ppo_fee_pct: onboarding.ppo_fee_pct,
      minimum_fee: onboarding.minimum_fee,
      interest_pct: onboarding.interest_pct,
      client_cin: submission.client_cin,
      client_address: submission.client_address,
      job_title: submission.job_title || "",
      job_summary: submission.job_summary || "",
      job_responsibilities: responsibilities,
      job_skills: skills,
      duration: submission.duration || "",
      location: submission.location || "",
      stipend: submission.stipend || "",
      signer_name: submission.signer_name || "",
      signer_title: submission.signer_title || "",
      signed_date: submission.signed_at
        ? new Date(submission.signed_at).toLocaleDateString()
        : "",
    });

    const buffer = doc.getZip().generate({
      type: "nodebuffer",
    });

    // Prepare file response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="agreement-${submissionId}.docx"`,
      },
    });
  } catch (err: any) {
    console.error("Fill template error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
