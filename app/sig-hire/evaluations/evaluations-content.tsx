"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AssignmentEvaluationScreen } from "@/components/Sig-Hire/evaluations-table";
import { useMultiSession } from "@/context/MultiSessionContext";
import { Loader, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EvaluationsContent() {
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("job_id");
  const urlSessionId = searchParams.get("session_id");
  const { sessions, currentSessionId, setCurrentSessionId } = useMultiSession();
  const [isLoading, setIsLoading] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check URL params first (job_id or assignment_id)
    if (urlJobId) {
      setJobId(urlJobId);
      // If we have a session_id in URL, set it as active
      if (urlSessionId) {
        setCurrentSessionId(urlSessionId);
      }
      localStorage.setItem("lastEvaluationJobId", urlJobId);
      setIsLoading(false);
      return;
    }

    // 2. Check URL session_id or active session
    const activeSessionId = urlSessionId || currentSessionId;
    if (activeSessionId) {
      // Set this as the active session
      setCurrentSessionId(activeSessionId);
      
      // Find the session and get its job_id
      const activeSession = sessions.find(s => s.session_id === activeSessionId);
      if (activeSession?.job_id) {
        setJobId(activeSession.job_id);
        localStorage.setItem("lastEvaluationJobId", activeSession.job_id);
        setIsLoading(false);
        return;
      }
    }

    // 3. Check localStorage for previously stored job_id
    const storedJobId = localStorage.getItem("lastEvaluationJobId");
    if (storedJobId) {
      setJobId(storedJobId);
      setIsLoading(false);
      return;
    }

    // 4. No job_id available
    setIsLoading(false);
  }, [urlJobId, urlSessionId, currentSessionId, sessions, setCurrentSessionId]);

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
              <p className="font-semibold text-red-900">No Evaluations Available</p>
              <p className="text-sm text-red-800">
                No job ID found for {currentSessionId ? `session ${currentSessionId.substring(0, 8)}...` : 'active session'}. 
                Please go to Sessions, select a session, and create assignments first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="space-y-2">
          {currentSessionId && (
            <p className="text-sm text-blue-900">
              <strong>Session:</strong> <span className="font-mono text-xs">{currentSessionId}</span>
            </p>
          )}
          <p className="text-sm text-blue-900">
            <strong>Job ID:</strong> <span className="font-mono text-xs">{jobId}</span>
          </p>
        </div>
      </div>

      <AssignmentEvaluationScreen jobId={jobId} />
    </div>
  );
}
