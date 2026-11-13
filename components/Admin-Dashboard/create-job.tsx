"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";

export default function CreateJob() {
  const supabase = createClient();

  const [jobName, setJobName] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    let pdfUrl = ""; // default so JD_pdf is never null

    // 1. Upload PDF if selected
    if (pdfFile) {
      const filePath = `jobs/${Date.now()}-${pdfFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("jd")
        .upload(filePath, pdfFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("jd").getPublicUrl(filePath);
      pdfUrl = data.publicUrl;
    }

    // 2. Insert job into "jobs" table (draft, owned by current user)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("You must be signed in to create a job.");

    const { data: inserted, error: insertError } = await supabase
      .from("jobs")
      .insert([
        {
          Job_Name: jobName,
          Job_Description: description,
          JD_pdf: pdfUrl,
          employer_id: user.id,
          status: "draft",
        },
      ])
      .select("job_id")
      .single();

    if (insertError) throw insertError;

    const jobId = inserted.job_id;

    // 3. Generate the application form via the in-app API (needs a JD PDF)
    if (pdfUrl) {
      const response = await fetch("/api/generate-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdUrl: pdfUrl, jobId }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || `Failed to generate form: ${response.statusText}`);
      }

      const { form_id } = await response.json();

      const { error: linkError } = await supabase
        .from("jobs")
        .update({ form_id, form_link: `/Dashboard/Jobs/${jobId}` })
        .eq("job_id", jobId);
      if (linkError) throw linkError;

      toast.success("Job created with application form.");
    } else {
      toast.success("Job created as a draft. Upload a JD PDF to generate a form.");
    }

    setJobName("");
    setDescription("");
    setPdfFile(null);
  } catch (err: any) {
    console.error("Job creation error:", err?.message);
    toast.error("Failed to create job", { description: err?.message });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-col md:flex-row gap-6 p-8 mx-6 bg-white dark:bg-black shadow-md rounded-lg">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create New Job</h2>

        <div>
          <label className="block text-md font-medium text-gray-900 dark:text-gray-100 mb-1">Job Title</label>
          <input
            type="text"
            className="w-full border rounded-sm p-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder="Enter job name"
            required
          />
        </div>

        <div>
          <label className="block text-md font-medium text-gray-900 dark:text-gray-100 mb-1">Job Description</label>
          <textarea
            rows={6}
            className="w-full border rounded-sm p-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter job description"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-primary text-white py-2 px-4 rounded hover:bg-gray-800 transition"
        >
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>

      {/* Right side: PDF upload */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Upload Job Description PDF
        </h3>
        {/* 👇 Hook FileUpload to setPdfFile */}
        <FileUpload
          onChange={(files: File[]) => {
            if (files && files.length > 0) {
              setPdfFile(files[0]);
            }
          }}
        />
      </div>
    </div>
  );
}
