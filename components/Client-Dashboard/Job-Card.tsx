"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Users,
  Wallet,
  MapPin,
  Eye,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ShineBorder } from "@/components/ui/shine-border";

export type JobCardProps = {
  jobId?: string;
  title: string | null;
  href?: string;
  meta: {
    rate: string | null;
    level: string | null;
  };
  description: string | null;
  tags?: string[] | null;
  location?: string | null;
  proposals?: string;
  className?: string;
  onDelete?: (jobId: string) => void;
  duration?: string | null;
  closingTime?: string | null;
};

function formatIST(dateString: string | null | undefined) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function JobCard({
  jobId,
  title,
  href,
  meta,
  description,
  tags = [],
  location = "United States",
  proposals = "Less than 5",
  className,
  onDelete,
  duration,
  closingTime,
}: JobCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [hasEvaluation, setHasEvaluation] = useState(false);
  const [hasResponses, setHasResponses] = useState(false);
  const supabase = createClient();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setNotification({ type, title, message });
    setNotificationOpen(true);
    setTimeout(() => setNotificationOpen(false), 5000);
  };
  const [candidates, setCandidates] = useState<
    { name: string; email: string }[]
  >([]);
  const [dd, setDd] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!jobId) return;
      const { data: job } = await supabase
        .from("jobs")
        .select("Applied_Candidates")
        .eq("job_id", jobId)
        .single();
      const ids = job?.Applied_Candidates || [];
      if (ids.length === 0) {
        setCandidates([]);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("first_name,last_name,email")
        .in("id", ids);
      setCandidates(
        p?.map((x) => ({ name: x.first_name, email: x.email })) || []
      );
    };
    init();
  }, [jobId]);
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

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!evalLoading) {
      setProgress(0);
      return;
    }

    let value = 10;
    setProgress(value);

    const interval = setInterval(() => {
      value = Math.min(value + Math.random() * 15, 95);
      setProgress(value);
    }, 500);

    return () => clearInterval(interval);
  }, [evalLoading]);

  useEffect(() => {
    const checkEvaluation = async () => {
      if (!jobId) return;
      const { data } = await supabase
        .from("evaluations")
        .select("job_id")
        .eq("job_id", jobId)
        .limit(1)
        .maybeSingle();

      setHasEvaluation(!!data);
    };

    checkEvaluation();
  }, [jobId, supabase]);

  useEffect(() => {
    const checkResponses = async () => {
      if (!jobId) return;
      const { data } = await supabase
        .from("responses")
        .select("id")
        .eq("job_id", jobId)
        .limit(1)
        .maybeSingle();

      setHasResponses(!!data);
    };

    checkResponses();
  }, [jobId, supabase]);

  const handleEdit = () => {
    if (jobId) router.push(`/client/edit/${jobId}`);
  };

  const handleDelete = async () => {
    if (!jobId) return;
    const result = await Swal.fire({
      title: "Delete Job?",
      text: "This will permanently delete the job, its form, and all evaluations.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });
    if (!result.isConfirmed) return;
    setLoading(true);
    await supabase.from("evaluations").delete().eq("job_id", jobId);
    await supabase.from("forms").delete().eq("job_id", jobId);
    await supabase.from("jobs").delete().eq("job_id", jobId);
    onDelete?.(jobId);
    window.location.reload();
  };

  const handleEvaluate = async () => {
    if (!jobId) return;

    try {
      setEvalLoading(true);
      showNotification("info", "Starting evaluation", "Fetching form details…");

      // Get access token for consuming evaluation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        showNotification(
          "error",
          "Authentication Error",
          "Unable to authenticate. Please log in again."
        );
        return;
      }

      // Consume one evaluation
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

      const { data: job, error } = await supabase
        .from("jobs")
        .select("form_id")
        .eq("job_id", jobId)
        .single();

      if (error || !job?.form_id) {
        showNotification(
          "error",
          "Evaluation failed",
          "Form ID not found for this job."
        );
        return;
      }

      const formId = job.form_id;
      const url = `/api/evaluate-proxy/evaluate/${jobId}/${formId}`;
      const res = await fetch(url, { method: "POST" });
      const body = await res.text();

      if (!res.ok) {
        showNotification(
          "error",
          "Evaluation failed",
          body || "Request failed"
        );
        return;
      }

      showNotification("success", "Evaluation Completed", "Redirecting…");
      router.push(`/client/evaluate/${jobId}`);
    } catch (err: any) {
      showNotification(
        "error",
        "Evaluation failed",
        err?.message || "Unknown error"
      );
    } finally {
      setEvalLoading(false);
      setProgress(100);
      setTimeout(() => setProgress(0), 400);
    }
  };

  const handleViewResults = () => {
    if (jobId) router.push(`/client/evaluate/${jobId}`);
  };

  const handleViewResponses = () => {
    if (jobId) router.push(`/client/responses/${jobId}`);
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
        <p className="mt-4 text-lg">Loading jobs...</p>
      </div>
    );
  }

  return (
    <>
      <Dialog open={evalLoading}>
        <DialogContent
          className=" flex flex-col items-center gap-4 py-10 px-8 max-w-sm rounded-2xl [&>button]:hidden overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Evaluating Candidates</DialogTitle>
          <ShineBorder
            borderWidth={2}
            duration={10}
            shineColor={["#a855f7", "#3b82f6", "#10b981"]}
          />
          <DotLottieReact
            src="/assets/evaluation.lottie"
            loop
            autoplay
            style={{ width: 180, height: 180 }}
          />
          <div className="w-full space-y-2 text-center">
            <p className="text-sm font-medium text-foreground">Evaluating candidates…</p>
            {/* <Progress value={progress} className="h-2" /> */}
            <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed top-4 right-4 z-50">
        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent
            className={`w-full max-w-md ${notification?.type && getNotificationIcon()}`}
          >
            <div className="flex gap-3">
              {getNotificationIcon()}
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1 text-foreground">
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

      <Card
        className={cn(
          "group relative rounded-2xl border bg-card/80 shadow-sm transition-colors",
          "hover:border-brand/60 hover:ring-1 hover:ring-primary/70",
          className
        )}
      >
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="size-8 rounded-full p-0 hover:bg-destructive/10 hover:text-destructive"
            disabled={loading}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete job</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="size-8 rounded-full p-0"
          >
            <Edit className="size-4" />
            <span className="sr-only">Edit job</span>
          </Button>
        </div>

        <CardHeader className="gap-3">
          <CardTitle className="text-balance text-xl font-semibold leading-tight">
            {href ? (
              <a
                href={href}
                className="text-primary underline-offset-4 hover:underline"
              >
                {title || "Untitled Job"}
              </a>
            ) : (
              <span className="text-foreground">{title || "Untitled Job"}</span>
            )}
          </CardTitle>

          <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Wallet className="size-4 text-accent-foreground" aria-hidden />
              {meta.rate || "Not specified"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{meta.level || "Not specified"}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <p className="text-pretty leading-relaxed text-foreground">{description || "No description provided"}</p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="rounded-full bg-muted text-muted-foreground"
                >
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleEvaluate}
              className="gap-2"
              disabled={evalLoading}
            >
              <Users className="size-4" />
              {evalLoading
                ? "Evaluating..."
                : hasEvaluation
                  ? "Re-Evaluate"
                  : "Evaluate Candidates"}
            </Button>

            {hasResponses && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewResponses}
                className="gap-2"
              >
                <FileText className="size-4" />
                Form Responses
              </Button>
            )}

            {hasEvaluation && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewResults}
                className="gap-2"
              >
                <Eye className="size-4" />
                View Results
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4 text-accent-foreground" aria-hidden />
              <span className="text-foreground">{location || "Not specified"}</span>
            </span>

            {duration && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" aria-hidden />
                <span className="text-foreground">{duration}</span>
              </span>
            )}

            {closingTime && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" aria-hidden />
                <span className="text-foreground">
                  {formatIST(closingTime)}
                </span>
              </span>
            )}

            <span className="text-green-600">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDd(!dd)}
                className="gap-2 hover:text-green-700"
              >
                <Users className="size-4" /> Applied Candidates: {proposals}
              </Button>
            </span>
            {dd && (
              <div className="absolute mt-64 sm:mt-48 sm:ml-64 w-64 bg-card border rounded-md shadow-md max-h-40 overflow-y-auto p-2">
                {candidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    No candidates
                  </p>
                ) : (
                  candidates.map((x, k) => (
                    <div key={k} className="p-2 text-sm border-b last:border-0">
                      <p className="font-medium">{x.name}</p>
                      <p className="text-xs text-muted-foreground">{x.email}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </CardFooter>
      </Card>
    </>
  );
}
