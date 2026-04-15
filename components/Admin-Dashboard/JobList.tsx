"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Eye, FileText } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface Job {
  job_id: string;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  Shortlisted_Candidates: string[] | null;
  stipend: string | null;
  duration: string | null;
  employer_id: string | null;
  client_first_name?: string;
  status: "draft" | "active" | "sighyre" | "mailed";
}

export default function JobList() {
  const [draftJobs, setDraftJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [evaluatingJob, setEvaluatingJob] = useState<string | null>(null);
  const [activatingJob, setActivatingJob] = useState<string | null>(null);
  const [hasEvaluation, setHasEvaluation] = useState<Record<string, boolean>>({});
  const [hasResponses, setHasResponses] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  const router = useRouter();

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setNotification({ type, title, message });
    setNotificationOpen(true);
    setTimeout(() => setNotificationOpen(false), 5000);
  };

  const getNotificationIcon = () => {
    if (!notification) return null;
    switch (notification.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("job_id, Job_Name, Job_Description, JD_pdf, Shortlisted_Candidates, stipend, duration, employer_id, status")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error.message);
    } else {
      const jobs = data || [];
      const employerIds = Array.from(
        new Set(jobs.map((job) => job.employer_id).filter((id): id is string => Boolean(id)))
      );

      const clientFirstNameMap: Record<string, string> = {};
      if (employerIds.length > 0) {
        try {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, first_name")
            .in("id", employerIds);

          if (profilesError) {
            throw profilesError;
          }

          (profiles || []).forEach((profile: { id: string; first_name: string | null }) => {
            if (profile?.id) {
              clientFirstNameMap[profile.id] = profile.first_name || "Unknown";
            }
          });
        } catch (profileError) {
          console.error("Error fetching client first names:", profileError);
        }
      }

      const jobsWithClientFirstNames: Job[] = jobs.map((job) => ({
        ...job,
        client_first_name: job.employer_id ? clientFirstNameMap[job.employer_id] || "Unknown" : "Unknown",
      }));

      setDraftJobs(jobsWithClientFirstNames.filter((j) => j.status === "draft"));
      setActiveJobs(jobsWithClientFirstNames.filter((j) => j.status === "active" || j.status === "sighyre" || j.status === "mailed"));
      
      // Check evaluation and response status for all jobs
      jobsWithClientFirstNames.forEach(job => {
        checkEvaluationStatus(job.job_id);
        checkResponsesStatus(job.job_id);
      });
    }
  };

  const checkEvaluationStatus = async (jobId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("evaluations")
      .select("job_id")
      .eq("job_id", jobId)
      .limit(1)
      .maybeSingle();

    setHasEvaluation(prev => ({
      ...prev,
      [jobId]: !!data
    }));
  };

  const checkResponsesStatus = async (jobId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("responses")
      .select("id")
      .eq("job_id", jobId)
      .limit(1)
      .maybeSingle();

    setHasResponses(prev => ({
      ...prev,
      [jobId]: !!data
    }));
  };

  const handleActivateJob = async (jobId: string) => {
    try {
      setActivatingJob(jobId);
      const supabase = createClient();
      const { error } = await supabase
        .from("jobs")
        .update({ status: "active" })
        .eq("job_id", jobId);

      if (error) throw error;

      showNotification("success", "Job Activated", "Job activated successfully!");
      await fetchJobs();
    } catch (err: any) {
      showNotification("error", "Activation Failed", "Failed to activate job.");
      console.error("Activation error:", err);
    } finally {
      setActivatingJob(null);
    }
  };

  const handleEvaluate = async (jobId: string) => {
    try {
      setEvaluatingJob(jobId);
      showNotification("info", "Starting evaluation", "Fetching form details…");

      // Get access token for consuming evaluation
      const supabase = createClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        showNotification(
          "error",
          "Authentication Error",
          "Unable to authenticate. Please log in again."
        );
        return;
      }

      // Consume one evaluation credit
      const consumeResponse = await fetch('/api/consume-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!consumeResponse.ok) {
        const consumeError = await consumeResponse.json();
        showNotification(
          "error",
          "Insufficient Evaluations",
          consumeError.error || "Failed to consume evaluation credit"
        );
        return;
      }

      // Fetch the job's form_id
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("form_id")
        .eq("job_id", jobId)
        .single();

      if (jobError || !job?.form_id) {
        showNotification(
          "error",
          "Evaluation failed",
          "Form ID not found for this job."
        );
        return;
      }

      // Start progress animation
      let progressValue = 10;
      setProgress(prev => ({ ...prev, [jobId]: progressValue }));

      const progressInterval = setInterval(() => {
        progressValue = Math.min(progressValue + Math.random() * 15, 95);
        setProgress(prev => ({ ...prev, [jobId]: progressValue }));
      }, 500);

      // Call the evaluate-proxy endpoint (same as client)
      const formId = job.form_id;
      const url = `/api/evaluate-proxy/evaluate/${jobId}/${formId}`;
      const res = await fetch(url, { method: "POST" });
      const body = await res.text();

      clearInterval(progressInterval);
      setProgress(prev => ({ ...prev, [jobId]: 100 }));

      if (!res.ok) {
        throw new Error(body || "Evaluation failed");
      }

      showNotification("success", "Evaluation Completed", "Redirecting to results…");

      // Check evaluation status
      await checkEvaluationStatus(jobId);

      // Refresh job list
      await fetchJobs();

      // Redirect to evaluation results page
      setTimeout(() => {
        router.push(`/admin/evaluate/${jobId}`);
      }, 1000);
    } catch (err: any) {
      setProgress(prev => ({ ...prev, [jobId]: 0 }));
      showNotification("error", "Evaluation Failed", err.message || "Failed to evaluate candidates.");
      console.error("Evaluation error:", err);
    } finally {
      setEvaluatingJob(null);
    }
  };

  const handleViewEvaluations = (jobId: string) => {
    router.push(`/admin/evaluate/${jobId}`);
  };

  const handleViewResponses = (jobId: string) => {
    router.push(`/admin/responses/${jobId}`);
  };

  const JobCard = ({ job, isDraft = false }: { job: Job; isDraft?: boolean }) => {
    const isEvaluating = evaluatingJob === job.job_id;
    const currentProgress = progress[job.job_id] || 0;
    const jobHasEvaluation = hasEvaluation[job.job_id];
    const jobHasResponses = hasResponses[job.job_id];

    return (
      <div className="border rounded-lg p-4 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{job.Job_Name}</h2>
            {isDraft && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                DRAFT
              </span>
            )}
            {!isDraft && jobHasEvaluation && (
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                ✓ EVALUATED
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{job.Job_Description}</p>
          {isDraft && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-sm font-semibold text-slate-900 bg-amber-100 border border-amber-300 px-2 py-1 rounded-md">
                Client: {job.client_first_name || "Unknown"}
              </span>
              <span className="text-sm font-semibold text-slate-900 bg-blue-100 border border-blue-300 px-2 py-1 rounded-md">
                Job: {job.Job_Name || "Untitled Job"}
              </span>
              <span className="text-sm font-semibold text-slate-900 bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-md">
                Stipend: {job.stipend || "Not specified"}
              </span>
              <span className="text-sm font-semibold text-slate-900 bg-violet-100 border border-violet-300 px-2 py-1 rounded-md">
                Duration: {job.duration || "Not specified"}
              </span>
            </div>
          )}
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
                disabled={isEvaluating}
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  jobHasEvaluation ? "Re-Evaluate" : "Evaluate Candidates"
                )}
              </Button>

              {jobHasResponses && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewResponses(job.job_id)}
                  className="gap-2"
                >
                  <FileText className="size-4" />
                  Form Responses
                </Button>
              )}

              {jobHasEvaluation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewEvaluations(job.job_id)}
                  className="gap-2"
                >
                  <Eye className="size-4" />
                  View Results
                </Button>
              )}

              {!jobHasEvaluation && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewEvaluations(job.job_id)}
                  disabled
                  className="text-xs"
                >
                  No Results Yet
                </Button>
              )}
            </>
          )}
        </div>

        {/* Progress bar when evaluating */}
        {isEvaluating && (
          <div className="absolute left-0 right-0 bottom-0 p-4">
            <div className="flex items-center justify-between text-xs text-primary mb-2">
              <span>Evaluating job…</span>
              <span>{Math.round(currentProgress)}%</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-md">
            <div className="flex gap-3">
              {getNotificationIcon()}
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
                  {notification?.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {notification?.message}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationOpen(false)}
              >
                ×
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="p-6 space-y-8">
        {/* Draft Section */}
        {draftJobs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-amber-600 dark:text-amber-500 mb-4">
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
            <p className="text-gray-600 dark:text-gray-400">No active jobs yet. Create and activate a draft job to get started.</p>
          </div>
        )}

        {draftJobs.length === 0 && activeJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No jobs found.</p>
          </div>
        )}
      </div>
    </>
  );
}
