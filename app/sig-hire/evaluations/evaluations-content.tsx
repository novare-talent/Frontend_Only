"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AssignmentEvaluationScreen } from "@/components/Sig-Hire/evaluations-table";
import { Loader, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EvaluationsContent() {
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("job_id");
  const urlAssignmentId = searchParams.get("assignment_id");
  const [isLoading, setIsLoading] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check URL params first (job_id or assignment_id)
    if (urlJobId) {
      setJobId(urlJobId);
      localStorage.setItem("lastEvaluationJobId", urlJobId);
      setIsLoading(false);
      return;
    }

    if (urlAssignmentId) {
      // If assignment_id is provided, treat it as job_id
      setJobId(urlAssignmentId);
      localStorage.setItem("lastEvaluationJobId", urlAssignmentId);
      setIsLoading(false);
      return;
    }

    // 2. Check localStorage for previously stored job_id
    const storedJobId = localStorage.getItem("lastEvaluationJobId");
    if (storedJobId) {
      setJobId(storedJobId);
      setIsLoading(false);
      return;
    }

    // 3. No job_id available
    setIsLoading(false);
  }, [urlJobId, urlAssignmentId]);

  if (isLoading) {
    return (
      <div className="px-6 py-4 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="px-6 py-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Parameters Missing</p>
              <p className="text-sm text-red-800">No assignment ID found. Please go to the assignments page and select a job to evaluate candidates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Assignment ID:</strong> <span className="font-mono text-xs">{jobId}</span>
        </p>
      </div>

      <AssignmentEvaluationScreen jobId={jobId} />
    </div>
  );
}
