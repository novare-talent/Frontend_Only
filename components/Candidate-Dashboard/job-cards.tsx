"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  FileText,
  Wallet,
  MapPin,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function formatIST(dateString: string | null | undefined) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

interface Job {
  job_id: string;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  Applied_Candidates: any[] | number | null;
  closingTime?: string | null;
  duration?: string | null;
  level?: string | null;
  stipend?: string | null;
  location?: string | null;
  tags?: string[] | string | null;
  created_at?: string | null;
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
  closingTime,
  duration,
  level,
  stipend,
  location,
  tags,
}: {
  title: string;
  description: string;
  link: string;
  jdPdf?: string | null;
  appliedCount?: number;
  alreadySubmitted?: boolean;
  closingTime?: string | null;
  duration?: string | null;
  level?: string | null;
  stipend?: string | null;
  location?: string | null;
  tags?: string[] | string | null;
}) => {
  const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  // -----------------------------
  // ⭐ Description Expand States
  // -----------------------------
  const [expanded, setExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  // Measure description height safely
  useEffect(() => {
    const measure = () => {
      const el = descRef.current;
      if (!el) return;

      // Clone node to measure full-height version
      const clone = el.cloneNode(true) as HTMLElement;
      clone.classList.remove("line-clamp-2");
      clone.style.position = "absolute";
      clone.style.visibility = "hidden";
      clone.style.pointerEvents = "none";
      clone.style.height = "auto";
      clone.style.whiteSpace = "normal";
      clone.style.width = `${el.offsetWidth}px`;
      document.body.appendChild(clone);

      const fullHeight = clone.clientHeight;
      const clampedHeight = el.clientHeight;

      document.body.removeChild(clone);
      setIsTruncatable(fullHeight > clampedHeight + 1);
    };

    measure();

    // Re-measure on resize (debounced)
    let t: NodeJS.Timeout | null = null;
    const onResize = () => {
      if (t) clearTimeout(t);
      t = setTimeout(measure, 120);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (t) clearTimeout(t);
    };
  }, [description]);

  // -----------------------------
  // Deadline calculation
  // -----------------------------
  useEffect(() => {
    if (!closingTime) return;
    const checkDeadline = () => {
      setIsDeadlinePassed(new Date() > new Date(closingTime));
    };
    checkDeadline();
    const interval = setInterval(checkDeadline, 60000);
    return () => clearInterval(interval);
  }, [closingTime]);

  return (
    <Card
      className={cn(
        "group relative rounded-2xl border bg-card/80 shadow-sm transition-all duration-300",
        "hover:border-primary/60 hover:ring-1 hover:ring-primary/70 hover:shadow-xl hover:-translate-y-1 pb-4",
        isDeadlinePassed && "opacity-75"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-semibold leading-tight text-foreground">
            {title}
          </CardTitle>

          {jdPdf && (
            <Link href={jdPdf} target="_blank">
              <Button variant="ghost" size="sm" className="size-8 rounded-full p-0">
                <FileText className="size-6 text-purple-500" />
              </Button>
            </Link>
          )}
        </div>

        <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
          {stipend && (
            <>
              <span className="inline-flex items-center gap-1">
                <Wallet className="size-4 text-accent-foreground" />
                <span className="font-medium text-foreground">{stipend}</span>
              </span>
              <span className="text-muted-foreground">•</span>
            </>
          )}
          {level && <span className="font-medium">{level}</span>}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">

        {/* ------------------------- */}
        {/* ⭐ Expandable Description */}
        {/* ------------------------- */}
        <p
          ref={descRef}
          className={cn(
            "text-muted-foreground leading-relaxed text-pretty transition-all",
            !expanded && "line-clamp-2"
          )}
        >
          {description}
        </p>

        {isTruncatable && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="text-sm text-primary underline w-fit"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}

        {/* ------------------------- */}
        {/* Job Details */}
        {/* ------------------------- */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {closingTime && (
            <div className="flex items-center gap-1.5">
              <Calendar
                className={cn(
                  "size-4 shrink-0",
                  isDeadlinePassed ? "text-destructive" : "text-red-500"
                )}
              />
              <span className="font-semibold text-foreground pr-1">Closing:</span>
              <span
                className={cn(
                  isDeadlinePassed ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {formatIST(closingTime)}
              </span>
            </div>
          )}

          {duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-blue-500 shrink-0" />
              <span className="font-semibold text-foreground pr-1">Duration:</span>
              <span className="text-muted-foreground">{duration}</span>
            </div>
          )}

          <div className="flex flex-row gap-10 col-span-2">
            {location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 text-accent-foreground shrink-0" />
                <span className="font-semibold text-foreground pr-1">Location:</span>
                <span className="text-muted-foreground">{location}</span>
              </div>
            )}

            {/* Tags (2-line max) */}
            {tagsArray.length > 0 && (
              <div className="flex flex-row flex-wrap gap-1.5 overflow-hidden max-h-[48px]">
                {tagsArray.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="rounded-full bg-muted text-muted-foreground text-xs py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        {alreadySubmitted ? (
          <Badge variant="outline" className="text-sm text-muted-foreground">
            Already Applied
          </Badge>
        ) : isDeadlinePassed ? (
          <Button disabled variant="default" size="sm" className="gap-2">
            Deadline Passed <AlertCircle className="size-4" />
          </Button>
        ) : (
          <Link href={`/Dashboard/Jobs/${link}`}>
            <Button variant="default" size="sm" className="gap-2">
              Apply Now <ChevronRight className="size-4" />
            </Button>
          </Link>
        )}

        <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
          <Users className="size-4" /> {appliedCount} applied
        </span>
      </CardFooter>
    </Card>
  );
};


export default function JobsGrid() {
  const [jobs, setJobs] = useState<JobWithFormStatus[]>([]);
  const [internships, setInternships] = useState<JobWithFormStatus[]>([]);
  const [visible, setVisible] = useState(106);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "jobs" | "internships">("all");

  useEffect(() => {
    fetchJobsWithFormStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobsWithFormStatus = async () => {
    const supabase = createClient();
    const { data: jobsData, error: jobsError } = await supabase
      .from("jobs")
      .select(
        "job_id, Job_Name, Job_Description, JD_pdf, Applied_Candidates, closingTime, duration, level, stipend, location, tags, status, created_at"
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (jobsError) {
      console.error("Error fetching jobs:", jobsError.message);
      setLoading(false);
      return;
    }

    if (!jobsData) {
      setJobs([]);
      setInternships([]);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const allJobs = jobsData.map((job) => ({ ...job, alreadySubmitted: false }));
      // Parse and segregate jobs
      const { jobs: parsedJobs, internships: parsedInternships } = parseJobsAndInternships(allJobs);
      setJobs(parsedJobs);
      setInternships(parsedInternships);
      setLoading(false);
      return;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profileRow) {
      const allJobs = jobsData.map((job) => ({ ...job, alreadySubmitted: false }));
      const { jobs: parsedJobs, internships: parsedInternships } = parseJobsAndInternships(allJobs);
      setJobs(parsedJobs);
      setInternships(parsedInternships);
      setLoading(false);
      return;
    }

    const jobIds = jobsData.map((job) => job.job_id);
    const { data: formsData } = await supabase
      .from("forms")
      .select("form_id, job_id")
      .in("job_id", jobIds);

    const jobToFormMap = new Map();
    formsData?.forEach((form) => {
      jobToFormMap.set(form.job_id, form.form_id);
    });

    const jobsWithStatus = await Promise.all(
      jobsData.map(async (job) => {
        const formId = jobToFormMap.get(job.job_id);

        if (!formId) {
          return { ...job, alreadySubmitted: false };
        }

        const { data: existing } = await supabase
          .from("responses")
          .select("id")
          .eq("form_id", formId)
          .eq("profile_id", profileRow.id)
          .maybeSingle();

        return { ...job, alreadySubmitted: !!existing };
      })
    );

    // Parse and segregate jobs
    const { jobs: parsedJobs, internships: parsedInternships } = parseJobsAndInternships(jobsWithStatus);
    setJobs(parsedJobs);
    setInternships(parsedInternships);
    setLoading(false);
  };

  // Helper function to parse level field and segregate jobs and internships
  const parseJobsAndInternships = (allJobs: JobWithFormStatus[]) => {
    const jobs: JobWithFormStatus[] = [];
    const internships: JobWithFormStatus[] = [];

    allJobs.forEach((job) => {
      const level = job.level?.toLowerCase() || "";
      
      // Check if it's an internship
      if (level === "internship" || level.includes("intern")) {
        internships.push(job);
      }
      // Check if it's a job (starts with "job")
      else if (level.startsWith("job")) {
        jobs.push(job);
      }
      // If parsing fails, default to internship as specified
      else {
        internships.push(job);
      }
    });

    jobs.sort(sortByDeadline);
    internships.sort(sortByDeadline);

    return { jobs, internships };
  };

  // Active jobs first (soonest deadline first), expired jobs last (most recently closed first)
  const sortByDeadline = (a: JobWithFormStatus, b: JobWithFormStatus) => {
    const now = Date.now();
    const aExpired = a.closingTime ? new Date(a.closingTime).getTime() < now : false;
    const bExpired = b.closingTime ? new Date(b.closingTime).getTime() < now : false;

    if (aExpired !== bExpired) return aExpired ? 1 : -1;

    if (!aExpired) {
      // Both active: soonest deadline first (no deadline goes last)
      if (!a.closingTime && !b.closingTime) return 0;
      if (!a.closingTime) return 1;
      if (!b.closingTime) return -1;
      return new Date(a.closingTime).getTime() - new Date(b.closingTime).getTime();
    }

    // Both expired: most recently closed first
    return new Date(b.closingTime!).getTime() - new Date(a.closingTime!).getTime();
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "jobs":
        return jobs;
      case "internships":
        return internships;
      default: {
        const combined = [...jobs, ...internships];
        return combined.sort(sortByDeadline);
      }
    }
  };

  const currentData = getCurrentData();

  if (loading) {
    return (
      <div className="min-h-[90vh] w-full flex flex-col items-center justify-center">
        <DotLottieReact
          src="/assets/dashboards.lottie"
          loop
          autoplay
          className="w-64 h-64"
        />
        <p className="mt-4 text-lg">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="p-6 pt-0 space-y-6" suppressHydrationWarning>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl text-primary">Available Opportunities</h1>
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            )}
          >
            All ({jobs.length + internships.length})
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              activeTab === "jobs"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            )}
          >
            Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("internships")}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              activeTab === "internships"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
            )}
          >
            Internships ({internships.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currentData.slice(0, visible).map((job) => {
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
              closingTime={job.closingTime}
              duration={job.duration}
              level={job.level}
              stipend={job.stipend}
              location={job.location}
              tags={job.tags}
            />
          );
        })}
      </div>

      {visible < currentData.length && (
        <div className="flex justify-center">
          <Button
            onClick={() => setVisible((prev) => prev + 6)}
            variant="outline"
            size="lg"
          >
            View More
          </Button>
        </div>
      )}

      {currentData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-gray-500 text-md">
            {activeTab === "jobs" 
              ? "No jobs available at the moment."
              : activeTab === "internships"
              ? "No internships available at the moment."
              : "No opportunities available at the moment."
            }
          </p>
        </div>
      )}
    </div>
  );
}
