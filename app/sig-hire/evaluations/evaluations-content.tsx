"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssignmentEvaluationScreen } from "@/components/Sig-Hire/evaluations-table";
import { useMultiSession } from "@/context/MultiSessionContext";
import { Loader, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDriverGuide } from "@/hooks/useDriverGuide";
import { evaluationsGuide } from "@/lib/driver-config";
import { PageHeader } from "@/components/Sig-Hire/PageHeader";

export function EvaluationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlJobId = searchParams.get("job_id");
  const urlSessionId = searchParams.get("session_id");
  const { sessions, currentSessionId, setCurrentSessionId } = useMultiSession();
  const [isLoading, setIsLoading] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const { startTour } = useDriverGuide("evaluations", evaluationsGuide, false);

  useEffect(() => {
    // Redirect to sessions if no session_id in URL
    if (!urlSessionId) {
      router.push('/sig-hire/sessions');
      return;
    }

    // 1. Check URL params first (job_id or assignment_id)
    if (urlJobId) {
      setJobId(urlJobId);
      setCurrentSessionId(urlSessionId);
      localStorage.setItem("lastEvaluationJobId", urlJobId);
      setIsLoading(false);
      return;
    }

    // 2. Use URL session_id
    setCurrentSessionId(urlSessionId);
    
    // Find the session and get its job_id
    const activeSession = sessions.find(s => s.session_id === urlSessionId);
    if (activeSession?.job_id) {
      setJobId(activeSession.job_id);
      localStorage.setItem("lastEvaluationJobId", activeSession.job_id);
      setIsLoading(false);
      return;
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
  }, [urlJobId, urlSessionId, sessions, setCurrentSessionId, router]);

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
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Assignment Evaluations"
          description="Review and evaluate candidate assignment submissions"
          onHelpClick={startTour}
        />
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">No Evaluations Available</p>
              <p className="text-sm text-red-800">
                No job ID found for session {urlSessionId?.substring(0, 8)}... 
                Please create assignments first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Assignment Evaluations"
        description={`Reviewing submissions for Job ID: ${jobId.substring(0, 12)}...${currentSessionId ? ` • Session: ${currentSessionId.substring(0, 8)}...` : ''}`}
        onHelpClick={startTour}
      />

      <AssignmentEvaluationScreen jobId={jobId} />
    </div>
  );
}
