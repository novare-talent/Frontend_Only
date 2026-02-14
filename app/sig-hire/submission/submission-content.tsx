"use client"

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader, Upload } from "lucide-react";

export function SigHireSubmissionContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id");
  const candidateId = searchParams.get("candidate_id");
  
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }
      if (!selectedFile.name.endsWith(".zip") && !selectedFile.name.endsWith(".py")) {
        setError("Only .zip and .py files are allowed");
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file || !jobId || !candidateId) {
      setError("Missing required information");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("job_id", jobId);
      formData.append("candidate_id", candidateId);

      const response = await fetch("/api/submission/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignment");
      }

      setSuccess("Assignment submitted successfully! ✅");
      setFile(null);
      setFileName("");

      setTimeout(() => {
        window.location.href = `/sig-hire/submission/success?job_id=${jobId}&candidate_id=${candidateId}`;
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jobId || !candidateId) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Invalid Request</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Missing job_id or candidate_id parameters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50 mb-6">
          <CardContent className="pt-6 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Success!</p>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Upload Your Solution</CardTitle>
          <CardDescription>
            Submit your code as a .zip file or single .py file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400/80 transition-colors bg-slate-800/50"
               onClick={() => document.getElementById("file-input")?.click()}>
            <input
              id="file-input"
              type="file"
              accept=".zip,.py"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {fileName ? (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-green-500 mx-auto" />
                <p className="font-semibold text-green-400">{fileName}</p>
                <p className="text-xs text-slate-400">Change file</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-purple-400/60 mx-auto" />
                <p className="font-semibold text-slate-200">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-400">Supported: .zip (up to 50MB) or .py files</p>
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-blue-300">Requirements:</p>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Submit a .zip file with your complete project or a .py file</li>
              <li>• Maximum file size: 50MB</li>
              <li>• Your submission will be automatically evaluated</li>
              <li>• You can resubmit your solution anytime</li>
            </ul>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Assignment'
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
