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
import ChromeButton from "@/components/Sig-Hire/ChromeButton";
import { FileText, Users, Upload } from "lucide-react";
import { showError } from "@/lib/swal";

export function SectionCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionId: contextSessionId, setSessionId } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sessions } = useMultiSession();
  const { startTour } = useDriverGuide("uploads", uploadsGuide, false);
  
  const urlSessionId = searchParams.get('session_id');
  const sessionId = urlSessionId || contextSessionId;

  const [jobDescription, setJobDescription] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);

  const [candidatesFile, setCandidatesFile] = useState<File | null>(null);
  const [isDragOverJob, setIsDragOverJob] = useState(false);
  const [isDragOverCandidates, setIsDragOverCandidates] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");

  const handleJobDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverJob(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".pdf") && !ext.endsWith(".doc") && !ext.endsWith(".docx")) {
      showError("Only .pdf, .doc, .docx files are allowed for job description");
      return;
    }
    setJobFile(file);
  };

  const handleCandidatesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCandidates(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      showError("Only CSV files are allowed for candidates");
      return;
    }
    setCandidatesFile(file);
  };

  // Save sessionId to context if from URL
  useEffect(() => {
    if (urlSessionId) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId, setSessionId]);

  const validateInputs = (): boolean => {
    if (!jobDescription && !jobFile) {
      showError("Please provide either job description text or upload a job document");
      return false;
    }
    if (!candidatesFile) {
      showError("Please upload a candidates CSV file");
      return false;
    }
    return true;
  };

  const handleContinue = async () => {
    try {
      if (!validateInputs()) return;

      setIsLoading(true);

      let activeSessionId = sessionId;

      // If no existing session, initialize a new one
      if (!activeSessionId) {
        setLoadingMessage("Setting things up...");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not authenticated. Please log in to continue.");
        }

        const sessionResponse = await initializeSession(user.id);
        activeSessionId = sessionResponse.session_id;
        setSessionId(activeSessionId);
      }

      setLoadingMessage("Uploading your files...");

      // Upload data to API - pass jobDescription as additional_prompt for context
      await uploadSessionData(
        activeSessionId,
        jobDescription,
        jobFile,
        "",
        candidatesFile,
        jobDescription // Pass JD text as additional context to API
      );

      const messages = [
        "Analyzing job requirements...",
        "Reading candidate profiles...",
        "Extracting key qualifications...",
        "Matching skills and experience...",
        "Evaluating candidates...",
        "Calculating compatibility scores...",
        "Ranking results...",
        "Almost there..."
      ];

      let checkCount = 0;
      // Wait for session to be ready (max 8 checks with 2 second intervals)
      await waitForSessionReady(
        activeSessionId,
        8,
        2000,
        () => {
          setLoadingMessage(messages[checkCount % messages.length]);
          checkCount++;
        }
      );

      // Create job record in jobs table
      setLoadingMessage("Finalizing...");
      
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
      const errorMessage = err instanceof Error ? err.message : "Failed to upload data. Please try again.";
      showError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={isLoading} 
        message={loadingMessage}
        onRetry={handleContinue}
      />

      <PageHeader
        title="Welcome to SigHyre"
        description="Upload your job description and candidate information to get started"
        onHelpClick={startTour}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Description Card */}
        <div
          data-tour="job-upload"
          className="relative flex flex-col overflow-hidden rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl transition-all duration-300 hover:border-lavender/50"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 p-6 pb-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <FileText className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white leading-tight">Job Description</h3>
              <p className="text-xs text-white/40 mt-0.5">Upload or write your job description</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Write Job Description
              </label>
              <textarea
                className="min-h-[140px] w-full rounded-lg p-3 text-sm text-white/80 placeholder-white/25 outline-none resize-none transition-colors"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
                placeholder="Type the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="relative  flex items-center gap-4">
              <span className="flex-1 border-t border-white/10" />
              <span className="text-lg font-bold uppercase tracking-widest gradient-text">or</span>
              <span className="flex-1 border-t border-white/10" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Upload Document or PDF
              </label>
              <label
                className="flex flex-col items-center justify-center gap-2 w-full cursor-pointer rounded-lg px-4 py-5 transition-all duration-200 text-center"
                style={{
                  background: isDragOverJob ? "rgba(124,58,237,0.1)" : "rgba(0,0,0,0.2)",
                  border: `2px dashed ${isDragOverJob ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)"}`,
                }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragOverJob(true); }}
                onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragOverJob(false); }}
                onDrop={handleJobDrop}
              >
                <Upload className="w-5 h-5" style={{ color: isDragOverJob ? "var(--color-lavender)" : "rgba(255,255,255,0.25)" }} />
                <span className="text-sm truncate max-w-full" style={{ color: jobFile ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                  {jobFile ? jobFile.name : isDragOverJob ? "Drop file here" : "Drag & drop or click to upload (.pdf, .doc, .docx)"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setJobFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Candidates Card */}
        <div
          data-tour="resume-upload"
          className="relative flex flex-col overflow-hidden rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl transition-all duration-300 hover:border-lavender/50"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 p-6 pb-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <Users className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white leading-tight">Candidates</h3>
              <p className="text-xs text-white/40 mt-0.5">Upload a CSV file with candidate information</p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-between gap-4 p-6 flex-1">
            <div className="flex flex-col gap-3 p-4 rounded-lg" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <h4 className="text-xs font-semibold text-white/80 uppercase tracking-wider">CSV Requirements</h4>
              <ul className="space-y-1.5 text-xs text-white/60">
                <li className="flex items-start gap-2">
                  <span className="text-lavender mt-0.5">•</span>
                  <span>Must include a <span className="text-white/80 font-medium">resume</span> column with resume URLs or text</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lavender mt-0.5">•</span>
                  <span>Google Drive links must be <span className="text-white/80 font-medium">publicly visible</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lavender mt-0.5">•</span>
                  <span>Supported formats: PDF links, Google Drive links, or resume text</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lavender mt-0.5">•</span>
                  <span>Other columns: name, email, phone, github, linkedin, etc.</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Upload CSV
              </label>
              <label
                className="flex flex-col items-center justify-center gap-2 w-full cursor-pointer rounded-lg px-4 py-5 transition-all duration-200 text-center"
                style={{
                  background: isDragOverCandidates ? "rgba(124,58,237,0.1)" : "rgba(0,0,0,0.2)",
                  border: `2px dashed ${isDragOverCandidates ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.1)"}`,
                }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragOverCandidates(true); }}
                onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragOverCandidates(false); }}
                onDrop={handleCandidatesDrop}
              >
                <Upload className="w-5 h-5" style={{ color: isDragOverCandidates ? "var(--color-lavender)" : "rgba(255,255,255,0.25)" }} />
                <span className="text-sm truncate max-w-full" style={{ color: candidatesFile ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)" }}>
                  {candidatesFile ? candidatesFile.name : isDragOverCandidates ? "Drop CSV here" : "Drag & drop or click to upload (.csv)"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setCandidatesFile(e.target.files?.[0] || null)}
                  accept=".csv"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <ChromeButton
          onClick={handleContinue}
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? "Processing..." : "Continue"}
        </ChromeButton>
      </div>
    </>
  )
}