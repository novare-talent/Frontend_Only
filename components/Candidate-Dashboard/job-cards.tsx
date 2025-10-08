"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, Users, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";

const supabase = createClient();

interface Job {
  job_id: string;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  Applied_Candidates: any[] | number | null;
}

interface JobWithFormStatus extends Job {
  alreadySubmitted: boolean;
}

const IntegrationCard = ({
  title,
  description,
  link,
  jdPdf,
  appliedCount = 0,
  alreadySubmitted = false,
}: {
  title: string;
  description: string;
  link: string;
  jdPdf?: string | null;
  appliedCount?: number;
  alreadySubmitted?: boolean;
}) => {
  return (
    <Card className="@container/card data-[slot=card]:bg-gradient-to-t data-[slot=card]:from-primary/10 data-[slot=card]:to-card dark:data-[slot=card]:bg-card shadow-xs transition-all duration-300 
        hover:shadow-xl hover:-translate-y-1 cursor-pointer gap-4">
      <CardHeader>
        <CardDescription className="text-xl">{title}</CardDescription>
        <CardTitle className="text-md font-light line-clamp-3 min-h-16">
          {description}
        </CardTitle>
        <CardAction className="flex gap-1">
          {jdPdf && (
            <Link href={jdPdf} target="_blank" title="View JD PDF">
              <FileText className="size-6 text-purple-500 hover:text-purple-700 transition-colors" />
            </Link>
          )}
        </CardAction>
      </CardHeader>

      <CardFooter className="flex justify-between items-center pt-2">
        {alreadySubmitted ? (
          <div className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 px-4 py-2 rounded-md">
            Already Applied
          </div>
        ) : (
          <Link
            href={`/Jobs/${link}`}
            className="group relative inline-flex items-center gap-1 text-sm font-medium text-primary transition-all duration-300 ease-out px-4 py-2 rounded-md hover:bg-primary hover:text-white hover:shadow-md"
          >
            <span className="transition-all duration-300 ease-out">
              Apply Now
            </span>
            <ChevronRight className="size-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
          </Link>
        )}
        
        <div className="flex items-center gap-1 text-sm text-green-500">
          <Users className="size-4 opacity-70" />
          {appliedCount} applied
        </div>
      </CardFooter>
    </Card>
  );
};

export default function JobsGrid() {
  const [jobs, setJobs] = useState<JobWithFormStatus[]>([]);
  const [visible, setVisible] = useState(9);

  useEffect(() => {
    fetchJobsWithFormStatus();
  }, []);

  const fetchJobsWithFormStatus = async () => {
    // First, fetch all jobs
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select("job_id, Job_Name, Job_Description, JD_pdf, Applied_Candidates")
      .order("job_id", { ascending: false });

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError.message);
      return;
    }

    if (!jobsData) {
      setJobs([]);
      return;
    }

    // Get current user's profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // If no user, set all jobs as not submitted
      setJobs(jobsData.map(job => ({ ...job, alreadySubmitted: false })));
      return;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profileRow) {
      setJobs(jobsData.map(job => ({ ...job, alreadySubmitted: false })));
      return;
    }

    // Fetch form_ids for all jobs
    const jobIds = jobsData.map(job => job.job_id);
    const { data: formsData } = await supabase
      .from("forms")
      .select("form_id, job_id")
      .in("job_id", jobIds);

    // Create a map of job_id to form_id
    const jobToFormMap = new Map();
    formsData?.forEach(form => {
      jobToFormMap.set(form.job_id, form.form_id);
    });

    // For jobs that have forms, check if user has already submitted
    const jobsWithStatus = await Promise.all(
      jobsData.map(async (job) => {
        const formId = jobToFormMap.get(job.job_id);
        
        if (!formId) {
          return { ...job, alreadySubmitted: false };
        }

        // Check if user has already submitted this form
        const { data: existing } = await supabase
          .from("responses")
          .select("id")
          .eq("form_id", formId)
          .eq("profile_id", profileRow.id)
          .maybeSingle();

        return { ...job, alreadySubmitted: !!existing };
      })
    );

    setJobs(jobsWithStatus);
  };
  
  return (
    <div className="p-6 space-y-6" suppressHydrationWarning>
      <h1 className="text-2xl text-primary">Available Jobs</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.slice(0, visible).map((job) => {
          const appliedCount = Array.isArray(job.Applied_Candidates)
            ? job.Applied_Candidates.length
            : typeof job.Applied_Candidates === "number"
            ? job.Applied_Candidates
            : 0;

          return (
            <IntegrationCard
              key={job.job_id}
              title={job.Job_Name}
              description={job.Job_Description}
              link={job.job_id}
              jdPdf={job.JD_pdf || null}
              appliedCount={appliedCount}
              alreadySubmitted={job.alreadySubmitted}
            />
          );
        })}
      </div>

      {visible < jobs.length && (
        <div className="flex justify-center">
          <Button onClick={() => setVisible((prev) => prev + 9)}>
            View More
          </Button>
        </div>
      )}

      {jobs.length === 0 && (
        <p className="text-center text-gray-500">No jobs available.</p>
      )}
    </div>
  );
}