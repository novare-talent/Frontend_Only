"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { parseAppliedCandidates, appliedCandidatesCount } from "@/lib/applied-candidates";

interface Job {
  job_id: string;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  form_link: string | null;
  Applied_Candidates: any[] | string | number | null;
}

const IntegrationCard = ({
  title,
  description,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  link = "#",
  jdPdf,
}: {
  title: string;
  description: string;
  link?: string;
  jdPdf?: string | null;
  appliedCount?: number;
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

    </Card>

  );
};

export default function AppliedJobsGrid() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [visible, setVisible] = useState(9);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    const supabase = createClient();
    // 1. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 2. Fetch all jobs
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "job_id, Job_Name, Job_Description, JD_pdf, form_link, Applied_Candidates, status"
      ).eq("status", "active")
      .order("job_id", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error.message);
      setLoading(false);
      return;
    }

    // 3. Filter jobs where Applied_Candidates contains this user
    const appliedJobs = (data || []).filter((job) =>
      parseAppliedCandidates(job.Applied_Candidates).includes(user.id)
    );

    setJobs(appliedJobs);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] w-full flex flex-col items-center justify-center">
        <DotLottieReact
          src="/assets/dashboards.lottie"
          loop
          autoplay
          className="w-64 h-64"
        />
        <p className="mt-4 text-lg">Loading your applied jobs...</p>
      </div>
    );
  }

  return (
    <div className="px-6 space-y-6" suppressHydrationWarning>
      <h1 className="text-2xl text-primary">
        Jobs You Have Applied For
      </h1>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-16 items-center">
        {jobs.slice(0, visible).map((job) => {
          const appliedCount = appliedCandidatesCount(job.Applied_Candidates);

          return (
            <IntegrationCard
              key={job.job_id}
              title={job.Job_Name}
              description={job.Job_Description}
              link={job.form_link || "#"}
              jdPdf={job.JD_pdf || null}
              appliedCount={appliedCount}
            />
          );
        })}
      </div>

      {/* View More */}
      {visible < jobs.length && (
        <div className="flex justify-center">
          <Button onClick={() => setVisible((prev) => prev + 9)}>
            View More
          </Button>
        </div>
      )}

      {/* No Jobs */}
      {jobs.length === 0 && (
        <p className="text-center text-muted-foreground mb-4 mt-24 pt-20">
          You haven’t applied to any jobs yet.
        </p>
      )}
      {/* View All Jobs Button - Bottom Right */}
      <div className="flex justify-end pt-72 pr-2">
        <Link href="/Dashboard/Jobs" className="text-primary flex items-center gap-1">
          View All Jobs
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
