"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FileUpload } from "@/components/ui/file-upload";

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

    // 2. Insert job into "jobs" table
    const { data: inserted, error: insertError } = await supabase
      .from("jobs")
      .insert([
        {
          Job_Name: jobName,
          Job_Description: description,
          JD_pdf: pdfUrl,
        },
      ])
      .select("job_id")
      .single();

    if (insertError) throw insertError;

    const jobId = inserted.job_id;

    const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${API_URL}/generate_form/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
    });

    // 3. Call backend API to generate form (this auto-updates Supabase)
    // const response = await fetch(`http://localhost:8000/generate_form/${jobId}`, {
    //   method: "POST",
    // });

    if (!response.ok) {
      throw new Error(`Failed to generate form: ${response.statusText}`);
    }

    alert("Job created successfully with form!");
    setJobName("");
    setDescription("");
    setPdfFile(null);
  } catch (err: any) {
    console.error("Job creation error:", err.message);
    alert("Failed to create job. Check console for details.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-col md:flex-row gap-6 p-8 mx-6 bg-white dark:bg-black shadow-md rounded-lg">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
        <h2 className="text-2xl font-semibold text-primary">Create New Job</h2>

        <div>
          <label className="block text-md font-medium mb-1">Job Title</label>
          <input
            type="text"
            className="w-full border rounded-sm p-2"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            placeholder="Enter job name"
            required
          />
        </div>

        <div>
          <label className="block text-md font-medium mb-1">Job Description</label>
          <textarea
            rows={6}
            className="w-full border rounded-sm p-2"
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
        <h3 className="text-xl font-semibold mb-2 text-primary">
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
