"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { JobCreateForm, type JobMeta } from "@/components/Client-Dashboard/job-create-form";
import { QuestionBuilder, type Question } from "@/components/Client-Dashboard/question-builder";
import { JobFormPreview } from "@/components/Client-Dashboard/job-form-preview";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewJobPage() {
  const [meta, setMeta] = useState<JobMeta>({
    title: "Front-End Developer",
    level: "Entry level",
    stipend: "$800/month",
    location: "Remote",
    duration: "6 months",
    closingTime: "",
    tags: ["React", "Next.js", "TypeScript"],
    description:
      "Build a high-performance recipe blog frontend with dashboards, image galleries, personalization, offline saves, and monetization.",
    jdFile: null,
    jdFileName: undefined,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // uploadedJdUrl comes ONLY from Supabase upload result
  const [uploadedJdUrl, setUploadedJdUrl] = useState<string | null>(null);

  const [checkingCredits, setCheckingCredits] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function init() {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!user) {
          if (!mounted) return;
          toast.error("Authentication Required", { description: "Please login to create a job." });
          router.replace("/signin");
          return;
        }
        if (mounted) setUserId(user.id);

        // Check jobs_remaining on mount using server endpoint /api/credits
        const token = (await supabase.auth.getSession())?.data?.session?.access_token ?? null;
        if (!token) {
          toast.error("Authentication Error", { description: "Unable to verify session." });
          router.replace("/signin");
          return;
        }

        setCheckingCredits(true);

        const res = await fetch("/api/credits", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          toast.error("Error", { description: "Unable to verify your credits. Try again later." });
          router.replace("/client");
          return;
        }

        const ct = res.headers.get("content-type") ?? "";
        if (!ct.includes("application/json")) {
          toast.error("Error", { description: "Invalid response from server." });
          router.replace("/client");
          return;
        }

        const json = await res.json().catch(() => ({}));
        const jobs = Number(json?.jobs_remaining ?? 0);

        if (jobs <= 0) {
          toast("No Jobs Remaining", { description: "You will be redirected to billing to purchase more jobs." });
          router.replace("/client/billing");
          return;
        }

        // proceed normally
      } catch (err: any) {
        toast.error("Error", { description: "Unexpected error while checking credits." });
        router.replace("/client");
      } finally {
        if (mounted) setCheckingCredits(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- helper to re-check credits just before creating a job ----------
  async function ensureHasJobsRemaining(): Promise<boolean> {
    const supabase = createClient();
    try {
      const token = (await supabase.auth.getSession())?.data?.session?.access_token ?? null;
      if (!token) {
        toast.error("Authentication Required", { description: "Please login to continue." });
        return false;
      }

      const res = await fetch("/api/credits", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error("Error", { description: "Unable to verify credits. Try again later." });
        return false;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        toast.error("Error", { description: "Invalid response from server." });
        return false;
      }

      const json = await res.json().catch(() => ({}));
      const jobs = Number(json?.jobs_remaining ?? 0);

      if (jobs <= 0) {
        toast("No Jobs Remaining", { description: "Redirecting to billing..." });
        router.replace("/client/billing");
        return false;
      }

      return true;
    } catch (err: any) {
      toast.error("Network Error", { description: "Please check your connection and try again." });
      return false;
    }
  }

  // ---------- helper to call consume endpoint (server-side decrement) ----------
  async function consumeJobCredit(): Promise<{ ok: true; jobs_remaining: number } | { ok: false; message?: string }> {
    try {
      const supabase = createClient();
      const token = (await supabase.auth.getSession())?.data?.session?.access_token ?? null;
      if (!token) return { ok: false, message: "no_token" };

      const res = await fetch("/api/consume-job", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false, message: `status_${res.status} ${text}` };
      }

      const json = await res.json().catch(() => ({}));
      if (json?.ok !== true) {
        return { ok: false, message: json?.error ?? "unknown" };
      }

      return { ok: true, jobs_remaining: Number(json.jobs_remaining ?? 0) };
    } catch (err: any) {
      return { ok: false, message: String(err) };
    }
  }

  // ---------- handle create ----------
  async function handleCreate() {
    if (!userId) {
      toast.error("Authentication Required", { description: "You must be logged in to create a job." });
      return;
    }

    // re-check before create to avoid race condition
    const okBefore = await ensureHasJobsRemaining();
    if (!okBefore) return;

    setIsCreating(true);
    const supabase = createClient();

    let createdJobId: string | null = null;
    let createdFormId: string | null = null;

    try {
      // 1. Use already uploaded JD URL or upload if not done yet
      let jdUrl = uploadedJdUrl;
      if (!jdUrl && meta.jdFile) {
        const fileName = `${Date.now()}-${meta.jdFile.name}`;
        const { data: _uploadData, error: uploadError } = await supabase.storage
          .from("jd")
          .upload(`jobs/${fileName}`, meta.jdFile);

        if (uploadError) {
          toast.error("Upload Error", { description: "Failed to upload JD file." });
          throw uploadError;
        }

        jdUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/jd/jobs/${fileName}`;
        setUploadedJdUrl(jdUrl);
      }

      // 2. Create job and form IDs
      const jobId = crypto.randomUUID();
      const formId = crypto.randomUUID();

      const jobData = {
        job_id: jobId,
        Job_Name: meta.title,
        Job_Description: meta.description,
        JD_pdf: jdUrl,
        level: meta.level,
        stipend: meta.stipend,
        location: meta.location,
        duration: meta.duration,
        closingTime: meta.closingTime,
        tags: meta.tags,
        status: "active",
        employer_id: userId,
        created_at: new Date().toISOString(),
        form_link: questions.length > 0 ? `/Jobs/${formId}` : null,
        form_id: questions.length > 0 ? formId : null,
      };

      const formData =
        questions.length > 0
          ? {
              form_id: formId,
              job_id: jobId,
              form: {
                title: `${meta.title} - Application Form`,
                questions: questions.map((q) => ({
                  type: q.type.toUpperCase(),
                  title: q.title,
                  required: q.required || false,
                  options: q.options || undefined,
                })),
              },
              created_at: new Date().toISOString(),
            }
          : null;

      // Insert job first
      const { data: job, error: jobError } = await supabase.from("jobs").insert(jobData).select().single();

      if (jobError) {
        toast.error("Error", { description: "Failed to create job. Try again." });
        throw jobError;
      }

      createdJobId = jobId;

      // Insert form if present
      if (formData) {
        const { data: form, error: formError } = await supabase.from("forms").insert(formData).select().single();
        if (formError) {
          // rollback job
          await supabase.from("jobs").delete().eq("job_id", jobId);
          toast.error("Error", { description: "Failed to create application form. Job creation rolled back." });
          throw formError;
        }
        createdFormId = formId;
      }

      // === Consume a job credit on the server (service role) ===
      const consumeResult = await consumeJobCredit();
      if (!consumeResult.ok) {
        // rollback job & form if consume failed
        await supabase.from("jobs").delete().eq("job_id", jobId);
        if (createdFormId) await supabase.from("forms").delete().eq("form_id", createdFormId);
        toast.error("Error", { description: `Failed to deduct job credit: ${consumeResult.message ?? "unknown"}. Creation rolled back.` });
        return;
      }

      toast.success("Success", { description: "Job created and credit consumed successfully!" });

      // Reset form state
      setMeta({
        title: "",
        level: "",
        stipend: "",
        location: "",
        duration: "",
        closingTime: "",
        tags: [],
        description: "",
        jdFile: null,
        jdFileName: undefined,
      });
      setQuestions([]);
      setUploadedJdUrl(null);

      // Navigate to client dashboard or job list
      router.push("/client");
    } catch (error: any) {
      toast.error("Error", { description: error?.message ?? "Failed to create job." });
      // If something failed and we created job but didn't rollback above, try to cleanup
      if (createdJobId) {
        try {
          await supabase.from("jobs").delete().eq("job_id", createdJobId);
        } catch {}
      }
      if (createdFormId) {
        try {
          await supabase.from("forms").delete().eq("form_id", createdFormId);
        } catch {}
      }
    } finally {
      setIsCreating(false);
    }
  }

  async function generateFormWithAI() {
    if (!meta.jdFile && !uploadedJdUrl) {
      toast.error("Upload JD", { description: "Please upload a Job Description PDF first before generating the form." });
      return;
    }

    setIsGeneratingForm(true);
    const supabase = createClient();

    try {
      let jdUrl = uploadedJdUrl;
      if (!jdUrl && meta.jdFile) {
        const fileName = `${Date.now()}-${meta.jdFile.name}`;
        const { data: _uploadData, error: uploadError } = await supabase.storage.from("jd").upload(`jobs/${fileName}`, meta.jdFile);
        if (uploadError) {
          toast.error("Upload Error", { description: "Failed to upload JD file." });
          throw uploadError;
        }
        jdUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/jd/jobs/${fileName}`;
        setUploadedJdUrl(jdUrl);
      }

      const requestBody = {
        jdUrl,
        jobTitle: meta.title || undefined,
        jobDescription: meta.description || undefined,
      };

      const response = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate form");
      }

      const { questions: aiQuestions } = await response.json();
      const convertedQuestions: Question[] = aiQuestions.map((q: any) => ({
        id: Math.random().toString(36).slice(2, 9),
        type: q.type as Question["type"],
        title: q.title,
        required: q.required !== false,
        options: q.options || undefined,
      }));

      setQuestions(convertedQuestions);
      toast.success("Form Generated", { description: "AI generated questions ready for review." });
    } catch (error: any) {
      toast.error("Error", { description: error?.message ?? "Failed to generate form with AI." });
    } finally {
      setIsGeneratingForm(false);
    }
  }

  if (checkingCredits) {
    return <div className="p-8 text-center text-muted-foreground">Checking account credits…</div>;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <JobCreateForm value={meta} onChange={setMeta} className="mb-6" />
      <section className="grid gap-6 md:grid-cols-2">
        <QuestionBuilder value={questions} onChange={setQuestions} onGenerateAI={generateFormWithAI} isGenerating={isGeneratingForm} />
        <JobFormPreview questions={questions} />
      </section>
      <div className="mt-6 flex justify-end">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreate} disabled={isCreating || !meta.title || !meta.description}>
          {isCreating ? "Creating..." : "Create Job"}
        </Button>
      </div>
    </main>
  );
}
