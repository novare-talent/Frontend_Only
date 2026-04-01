import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { LoadingOverlay } from "./loading-overlay";
import { uploadSessionData, waitForSessionReady, initializeSession } from "@/lib/ranking-api";
import { useSession } from "@/context/SessionContext";
import { useMultiSession } from "@/context/MultiSessionContext";
import { createSigHireJob } from "@/app/actions/jobs";
import { useDriverGuide } from "@/hooks/useDriverGuide";
import { uploadsGuide } from "@/lib/driver-config";
import { PageHeader } from "@/components/Sig-Hire/PageHeader";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionId: contextSessionId, setSessionId } = useSession();
  const { sessions } = useMultiSession();
  const { startTour } = useDriverGuide("uploads", uploadsGuide, false);
  
  const urlSessionId = searchParams.get('session_id');
  const sessionId = urlSessionId || contextSessionId;

  const [jobDescription, setJobDescription] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [candidatesCSV, setCandidatesCSV] = useState("");
  const [candidatesFile, setCandidatesFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Processing your data...");

  // Save sessionId to context if from URL
  useEffect(() => {
    if (urlSessionId) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId, setSessionId]);

  const validateInputs = (): boolean => {
    if (!jobDescription && !jobFile) {
      setError("Please provide either job description text or upload a job document");
      return false;
    }
    if (!candidatesCSV && !candidatesFile) {
      setError("Please provide either candidates CSV or upload a candidates file");
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    try {
      if (!validateInputs()) return;

      setIsLoading(true);
      setError(null);

      let activeSessionId = sessionId;

      // If no existing session, initialize a new one
      if (!activeSessionId) {
        setLoadingMessage("Initializing session...");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not authenticated. Please log in to continue.");
        }

        const sessionResponse = await initializeSession(user.id);
        activeSessionId = sessionResponse.session_id;
        setSessionId(activeSessionId);
      }

      setLoadingMessage(`Session ID: ${activeSessionId}\n\nUploading files...`);

      // Upload data to API
      await uploadSessionData(
        activeSessionId,
        jobDescription,
        jobFile,
        candidatesCSV,
        candidatesFile
      );

      setLoadingMessage(`Session ID: ${activeSessionId}\n\nProcessing files (1/8)...`);

      let checkCount = 1;
      // Wait for session to be ready (max 5 checks with 2 second intervals)
      await waitForSessionReady(
        activeSessionId,
        8,
        2000,
        (status) => {
          checkCount++;
          setLoadingMessage(
            `Session ID: ${activeSessionId}\n\nProcessing files (${Math.min(checkCount, 8)}/8)...\nStatus: ${status}`
          );
        }
      );

      // Create job record in jobs table
      setLoadingMessage(`Session ID: ${activeSessionId}\n\nCreating job record...`);
      
      const jobResult = await createSigHireJob({
        job_name: jobDescription || 'Uploaded Job',
        job_description: jobDescription || 'Job uploaded via Sighyre',
        jd_file: jobFile || undefined,
        form_id: activeSessionId,
      });

      if (!jobResult.success) {
        console.warn('Job creation warning:', jobResult.error);
        // Continue even if job creation fails - the session data is more critical
      }

      // Session is now ready - backend has updated it

      setIsLoading(false);

      // Navigate to rankings page with session_id
      router.push(`/sig-hire/rankings?session_id=${activeSessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload data. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={isLoading} 
        message={loadingMessage}
        error={error}
        onRetry={handleContinue}
      />

      <PageHeader
        title="Welcome to SigHyre"
        description="Upload your job description and candidate information to get started"
        onHelpClick={startTour}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Description Card */}
        <Card 
          data-tour="job-upload" 
          className="flex flex-col overflow-hidden rounded-3xl border-border bg-card shadow-lg transition-shadow hover:shadow-xl"
        >
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-primary">
              Job Description
            </CardTitle>
            <CardDescription>
              Upload or write your job description below
            </CardDescription>
          </CardHeader>

          <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Write Job Description
              </label>
              <textarea
                className="min-h-[240px] w-full rounded-lg border border-input bg-background p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Type the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Upload Document or PDF
              </label>
              <input
                type="file"
                className="w-full cursor-pointer rounded-lg border border-input bg-background p-2 text-sm transition-colors file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:border-primary/50"
                onChange={(e) => setJobFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx"
              />
            </div>
          </div>
        </Card>

        {/* Candidates Card */}
        <Card 
          data-tour="resume-upload" 
          className="flex flex-col overflow-hidden rounded-3xl border-border bg-card shadow-lg transition-shadow hover:shadow-xl"
        >
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-primary">
              Candidates
            </CardTitle>
            <CardDescription>
              Upload or enter your candidate details below
            </CardDescription>
          </CardHeader>

          <div className="flex flex-1 flex-col gap-4 p-6 pt-0">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Enter CSV of your job candidates
              </label>
              <textarea
                className="min-h-[240px] w-full rounded-lg border border-input bg-background p-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Paste CSV data here (name, email, resume_url, etc.)..."
                value={candidatesCSV}
                onChange={(e) => setCandidatesCSV(e.target.value)}
              />
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Upload Document, CSV, PDF
              </label>
              <input
                type="file"
                className="w-full cursor-pointer rounded-lg border border-input bg-background p-2 text-sm transition-colors file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:border-primary/50"
                onChange={(e) => setCandidatesFile(e.target.files?.[0] || null)}
                accept=".csv,.pdf,.doc,.docx"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          variant="default"
          size="lg"
          className="min-w-[200px] transition-all duration-300"
          onClick={handleContinue}
          disabled={isLoading}
        >
          Continue
        </Button>
      </div>
    </>
  )
}