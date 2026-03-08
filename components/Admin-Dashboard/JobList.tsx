"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

interface Job {
  job_id: string;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  Shortlisted_Candidates: string[] | null;
  status: "draft" | "active" | "sighyre" | "mailed";
}

export default function JobList() {
  const [draftJobs, setDraftJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [evaluatingJob, setEvaluatingJob] = useState<string | null>(null);
  const [activatingJob, setActivatingJob] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("job_id, Job_Name, Job_Description, JD_pdf, Shortlisted_Candidates, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error.message);
    } else {
      const jobs = data || [];
      setDraftJobs(jobs.filter(j => j.status === "draft"));
      setActiveJobs(jobs.filter(j => j.status === "active" || j.status === "sighyre" || j.status === "mailed"));
    }
  };

  const handleActivateJob = async (jobId: string) => {
    try {
      setActivatingJob(jobId);
      const { error } = await supabase
        .from("jobs")
        .update({ status: "active" })
        .eq("job_id", jobId);

      if (error) throw error;

      toast.success("Success", { description: "Job activated successfully!" });
      await fetchJobs();
    } catch (err: any) {
      toast.error("Error", { description: "Failed to activate job." });
      console.error("Activation error:", err);
    } finally {
      setActivatingJob(null);
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
        router.push(`/admin/evaluate/${jobId}`);
      }
    } catch (err: any) {
      toast.error("Error", { description: "Failed to evaluate candidates. Check console for details." });
    } finally {
      setEvaluatingJob(null);
    }
  };

  const handleViewEvaluations = (jobId: string) => {
    router.push(`/admin/evaluate/${jobId}`);
  };

  const JobCard = ({ job, isDraft = false }: { job: Job; isDraft?: boolean }) => (
    <div
      className="border rounded-lg p-4 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-medium">{job.Job_Name}</h2>
          {isDraft && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
              DRAFT
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">{job.Job_Description}</p>
        {job.JD_pdf && (
          <a
            href={job.JD_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline text-sm hover:no-underline"
          >
            View Job PDF
          </a>
        )}
      </div>

      {/* Right side buttons */}
      <div className="flex flex-col gap-2 ml-4">
        {isDraft ? (
          <>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleActivateJob(job.job_id)}
              disabled={activatingJob === job.job_id}
              className="bg-green-600 hover:bg-green-700"
            >
              {activatingJob === job.job_id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          </>
        ) : (
          <>
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
              onClick={() => handleViewEvaluations(job.job_id)}
            >
              View Evaluations
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Draft Section */}
      {draftJobs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-amber-600 mb-4">
            📋 Draft Jobs ({draftJobs.length})
          </h2>
          <div className="space-y-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4">
            {draftJobs.map((job) => (
              <JobCard key={job.job_id} job={job} isDraft={true} />
            ))}
          </div>
        </div>
      )}

      {/* Active Section */}
      {activeJobs.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">
            ✨ Active Jobs ({activeJobs.length})
          </h2>
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <JobCard key={job.job_id} job={job} isDraft={false} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No active jobs yet. Create and activate a draft job to get started.</p>
        </div>
      )}

      {draftJobs.length === 0 && activeJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found.</p>
        </div>
      )}
    </div>
  );
}
