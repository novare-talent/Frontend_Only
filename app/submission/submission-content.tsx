"use client"

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CheckCircle, Loader, Upload } from "lucide-react";

export function SubmissionContent() {
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

      const data = await response.json();
      setSuccess("Assignment submitted successfully!");
      setFile(null);
      setFileName("");
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        window.location.href = `/submission/success`;
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jobId || !candidateId) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Missing Parameters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <p className="text-red-800">Please access this page from the assignment link sent to you.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Assignment</CardTitle>
        <CardDescription>Upload your code files for evaluation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary/50 transition-colors">
          <input
            type="file"
            id="file-input"
            onChange={handleFileChange}
            accept=".zip,.py"
            className="hidden"
            disabled={isSubmitting}
          />
          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center cursor-pointer gap-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              {fileName || "Click to upload or drag and drop"}
            </span>
            <span className="text-xs text-gray-500">ZIP or Python files only (max 50MB)</span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* File Info */}
        {file && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm">
              <span className="font-semibold text-blue-900">Selected file:</span>{" "}
              <span className="text-blue-800">{file.name}</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!file || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Assignment"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
