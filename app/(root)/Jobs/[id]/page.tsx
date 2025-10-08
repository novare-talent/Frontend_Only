// app/Jobs/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import JobForm from "./JobForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params object first
  const { id } = await params;
  
  const supabase = createClient();

  // Fetch the form JSON and the form_id
  const { data, error } = await (await supabase)
    .from("forms")
    .select("form, form_id, job_id")
    .eq("job_id", id) // Use the awaited id
    .single();

  if (error) {
    console.error("Error fetching form:", error.message);
  }

  const formData = data?.form ?? undefined;
  const formId = data?.form_id ?? undefined;
  const jobId = data?.job_id ?? undefined;

  return (
    <div className="p-6">
      {/* pass the form JSON + formId + jobId to the client form */}
      <JobForm formData={formData} formId={formId} jobId={jobId} />
    </div>
  );
}