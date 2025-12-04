"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

interface Job {
  job_id: string;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  Shortlisted_Candidates: string[] | null; // uuid[]
}

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [evaluatingJob, setEvaluatingJob] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("job_id, Job_Name, Job_Description, JD_pdf, Shortlisted_Candidates")
      .order("job_id", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error.message);
    } else {
      setJobs(data || []);
    }
  };

  const handleEvaluate = async (jobId: string) => {
  try {
    setEvaluatingJob(jobId);
    console.log("Evaluating candidates for job:", jobId);

    const response = await fetch(`http://127.0.0.1:8000/evaluate/${jobId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("API Response:", result);

    // Refresh job list
    await fetchJobs();

    // Redirect to evaluation results page
    if (result.evaluation_id) {
      router.push(`/admin/${result.evaluation_id}`); // ✅ correct route
    }
  } catch (err: any) {
    toast.error("Error", { description: "Failed to evaluate candidates. Check console for details." });
  } finally {
    setEvaluatingJob(null);
  }
};

const handleViewSelected = async (jobId: string) => {
  const { data, error } = await supabase
    .from("evaluations")
    .select("evaluation_id") // ✅ lowercase
    .eq("job_id", jobId)
    .limit(1)
    .single();

  if (error || !data) {
    toast.error("Error", { description: "No evaluation found for this job." });
    return;
  }

  router.push(`/admin/${data.evaluation_id}`); // ✅ lowercase and correct route
};


  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Jobs</h1>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs found.</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li
              key={job.job_id}
              className="border rounded-lg p-4 shadow-sm flex justify-between items-start"
            >
              <div>
                <h2 className="text-lg font-medium">{job.Job_Name}</h2>
                <p className="text-sm text-gray-600">{job.Job_Description}</p>
                {job.JD_pdf && (
                  <a
                    href={job.JD_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline text-sm"
                  >
                    View Job PDF
                  </a>
                )}
              </div>

              {/* Right side buttons */}
              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleEvaluate(job.job_id)}
                  disabled={evaluatingJob === job.job_id}
                >
                  {evaluatingJob === job.job_id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    "Evaluate Candidates"
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewSelected(job.job_id)}
                >
                  View Selected
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
