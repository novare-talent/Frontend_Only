// app/api/onboarding/notify/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

type AnyRow = Record<string, any>;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      submissionId?: string;
      onboardingId?: string;
      action?: string;
      signerName?: string;
      clientCin?: string;
    };

    const { submissionId, onboardingId, action, signerName, clientCin } = body;

    if (!submissionId || !onboardingId || !action) {
      return NextResponse.json(
        { error: "submissionId, onboardingId and action are required" },
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
      console.error("Error fetching submission:", subErr);
      return NextResponse.json({ error: subErr.message ?? String(subErr) }, { status: 500 });
    }

    // Fetch onboarding
    const { data: onboarding, error: onbErr } = await supabase
      .from("onboarding")
      .select("*")
      .eq("id", onboardingId)
      .single();

    if (onbErr) {
      console.error("Error fetching onboarding:", onbErr);
      return NextResponse.json({ error: onbErr.message ?? String(onbErr) }, { status: 500 });
    }

    if (!submission || !onboarding) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    let emailSubject = "";
    let emailBody = "";
    const toEmail: string = (submission as AnyRow).client_email ?? "hr@example.com";

    switch (action) {
      case "created":
        emailSubject = `Onboarding Started - ${onboarding.company_name}`;
        emailBody = `
Dear Hiring Manager,

Your onboarding process has been initiated for ${onboarding.company_name}.

Please click the link below to continue:
${process.env.NEXT_PUBLIC_APP_URL}/onboard/${onboardingId}

Company Details:
- Internship Fee: ${onboarding.internship_fee_pct}%
- PPO Fee: ${onboarding.ppo_fee_pct}%
- Minimum Fee: ₹${onboarding.minimum_fee}

Please enter your CIN, upload the Job Description, and proceed through the onboarding flow.

Best regards,
Novare Talent Team
`;
        break;

      case "details_parsed":
        emailSubject = `Job Details Parsed - ${onboarding.company_name}`;
        emailBody = `
Dear Hiring Manager,

Your Job Description has been successfully parsed and uploaded.

Please review and edit the job details as needed at:
${process.env.NEXT_PUBLIC_APP_URL}/onboard/${onboardingId}/review?submissionId=${submissionId}

Best regards,
Novare Talent Team
`;
        break;

      case "signed":
        emailSubject = `Document Signed - ${onboarding.company_name}`;
        emailBody = `
Dear ${signerName ?? "Hiring Manager"},

Thank you for signing the onboarding document for ${onboarding.company_name}.

Your signature has been recorded. The process is almost complete. Please click below to finalize:
${process.env.NEXT_PUBLIC_APP_URL}/onboard/${onboardingId}/complete?submissionId=${submissionId}

Best regards,
Novare Talent Team
`;
        break;

      case "completed":
        emailSubject = `Onboarding Completed - ${onboarding.company_name}`;
        emailBody = `
Dear Hiring Manager,

Congratulations! The onboarding process for ${onboarding.company_name} has been completed successfully.

Client CIN: ${clientCin ?? (submission as AnyRow).client_cin ?? "N/A"}
Job Title: ${(submission as AnyRow).job_title ?? "N/A"}
Signer: ${(submission as AnyRow).signer_name ?? "N/A"}

The contract document is ready for download.

Best regards,
Novare Talent Team
`;
        break;

      default:
        emailSubject = `Notification - ${onboarding.company_name}`;
        emailBody = `A notification (${action}) has been triggered for ${onboarding.company_name}.`;
    }

    console.log("Notification:", { toEmail, emailSubject, action });

    // Optionally send email via a real service:
    // await sendEmail(toEmail, emailSubject, emailBody);

    // Log notification (do not fail request if logging fails)
    const { error: logErr } = await supabase.from("notifications").insert([
      {
        submission_id: submissionId,
        onboarding_id: onboardingId,
        action,
        email_subject: emailSubject,
        email_body: emailBody,
        sent_at: new Date().toISOString(),
      },
    ]);

    if (logErr) {
      console.error("Notification logging error:", logErr);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("Notify error:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}

// Email sending function (implement with your email service)
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // Implement with SendGrid / AWS SES / Nodemailer etc.
  console.log("Would send email to:", to, subject);
  return true;
}
