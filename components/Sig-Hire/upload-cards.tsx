import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { LoadingOverlay } from "./loading-overlay";
import { uploadSessionData, waitForSessionReady, initializeSession } from "@/lib/ranking-api";
import { useSession } from "@/context/SessionContext";
import { createSigHireJob } from "@/app/actions/jobs";
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
  
  const urlSessionId = searchParams.get('session_id');
  // Use URL sessionId if provided, otherwise fallback to context (localStorage)
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
        job_description: jobDescription || 'Job uploaded via Sigyre',
        jd_file: jobFile || undefined,
        form_id: activeSessionId,
      });

      if (!jobResult.success) {
        console.warn('Job creation warning:', jobResult.error);
        // Continue even if job creation fails - the session data is more critical
      }

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
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:h-fit-content *:data-[slot=card]:shadow-s lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
      <LoadingOverlay 
        isVisible={isLoading} 
        message={loadingMessage}
        error={error}
        onRetry={handleContinue}
      />
      {/* Card 1: Welcome to SmartHire */}
      <Card
  className="@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  hover:shadow-[0_30px_70px_-25px_rgba(124,58,237,0.35)]

  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
"
>
  {/* Glow layer */}
  <div className="pointer-events-none absolute inset-0">
    <div
      className="absolute -top-24 -left-24 h-80 w-80 rounded-full
      bg-purple-300/30 blur-3xl
      dark:bg-purple-600/20"
    />
    <div
      className="absolute bottom-0 right-0 h-72 w-72 rounded-full
      bg-indigo-200/30 blur-3xl
      dark:bg-indigo-500/10"
    />
  </div>

  <CardHeader className="relative z-10 space-y-5">
    <div
      className="h-1 w-12 rounded-full
      bg-gradient-to-r from-purple-500 to-indigo-500"
    />

    <CardTitle
      className="text-4xl font-extrabold tracking-tight
      text-neutral-900 dark:text-white"
    >
      Welcome To
      <div
        className="text-5xl text-primary py-2"
      >
      SigHyre
      </div>
    </CardTitle>

    <CardDescription
      className="max-w-md text-lg leading-relaxed
      text-neutral-600 dark:text-neutral-300"
    >
      Enter your job description and candidate information, then click{" "}
      <span className="font-medium text-primary">
        Continue
      </span>{" "}
      to let our ranking engine find the best matches.
    </CardDescription>
  </CardHeader>
</Card>


      {/* Card 2: Job Upload */}
<Card className="@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
">
  <CardHeader>
    <CardTitle className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl">
      Job Description
    </CardTitle>
    <CardDescription>Upload or write your job description below</CardDescription>
  </CardHeader>

  <div className="flex flex-col gap-4">

    {/* Text Box Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Write Job Description</label>
      <textarea
        className="w-full min-h-60 rounded-md border border-primary/30 bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type the job description here..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
    </div>
                <div className="p-3 text-muted-secondary font-thin text-center">OR</div>
    {/* Document Upload Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Upload Document or PDF</label>
      <input
        type="file"
        className="w-full rounded-md border border-primary/30 bg-card p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white cursor-pointer"
        onChange={(e) => setJobFile(e.target.files?.[0] || null)}
        accept=".pdf,.doc,.docx"
      />
    </div>
 </div>
</Card>


      {/* Card 3: Average Time to Fill */}
      <Card className="@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
">
  <CardHeader>
    <CardTitle className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl">
      Candidates
    </CardTitle>
    <CardDescription>Upload or enter your candidate details below</CardDescription>
  </CardHeader>

  <div className="flex flex-col gap-4">

    {/* Text Box Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Enter CSV of your job candidates here</label>
      <textarea
        className="w-full min-h-60 rounded-md border border-primary/30 bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Paste CSV data here (name, email, resume_url, etc.)..."
        value={candidatesCSV}
        onChange={(e) => setCandidatesCSV(e.target.value)}
      />
    </div>
                <div className="p-3 text-muted-secondary font-thin text-center">OR</div>
    {/* Document Upload Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Upload Document, CSV, PDF</label>
      <input
        type="file"
        className="w-full rounded-md border border-primary/30 bg-card p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white cursor-pointer"
        onChange={(e) => setCandidatesFile(e.target.files?.[0] || null)}
        accept=".csv,.pdf,.doc,.docx"
      />
    </div>
    <div className="py-2">
        {/* <button className="p-6 bg-primary text-white rounded-md mx-auto block justify-center">Submit</button> */}
        <Button
                variant="default"
                size="lg"
                className="mx-auto block gap-2 transition-all duration-300"
                onClick={handleContinue}
                disabled={isLoading}
        >Continue</Button>
        {/* On click it will send onSubmitUploads */}
    </div>  
 </div>
 </Card>
    </div>
  )
}