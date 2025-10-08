"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

const supabase = createClient();

interface Job {
  job_id: string;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  form_link: string | null;
  Applied_Candidates: any[] | number | null;
}

const IntegrationCard = ({
  title,
  description,
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

      <CardFooter className="flex justify-between items-center">
        <Link
  href={link}
  target="_blank"
  className="group relative inline-flex items-center gap-1 text-sm font-medium text-primary transition-all duration-300 ease-out px-4 py-2 rounded-md hover:bg-primary hover:text-white hover:shadow-md"
>
  <span className="transition-all duration-300 ease-out">
    View Response
  </span>
  <ChevronRight className="size-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
</Link>
        <span className="text-sm text-muted-foreground">Last updated: Today</span>
      </CardFooter>
    </Card>

  );
};

export default function AppliedJobsGrid() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [visible, setVisible] = useState(9);

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    // 1. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 2. Fetch all jobs
    const { data, error } = await supabase
      .from("jobs")
      .select(
        "job_id, Job_Name, Job_Description, JD_pdf, form_link, Applied_Candidates"
      )
      .order("job_id", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error.message);
      return;
    }

    // 3. Filter jobs where Applied_Candidates contains this user
    const userEmail = user.id;
    const appliedJobs =
      (data || []).filter((job) => {
        if (Array.isArray(job.Applied_Candidates)) {
          return job.Applied_Candidates.includes(userEmail);
        }
        return false;
      }) || [];

    setJobs(appliedJobs);
  };

  return (
    <div className="px-6 space-y-6" suppressHydrationWarning>
      <h1 className="text-2xl text-primary">
        Jobs You Have Applied For
      </h1>

      {/* Grid Layout */}
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
        <p className="text-center text-gray-500">
          You haven’t applied to any jobs yet.
        </p>
      )}
    </div>
  );
}
