import { Suspense } from "react";
import { SubmissionContent } from "./submission-content";
import { Loader } from "lucide-react";

export default function SubmissionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-muted-foreground">Loading submission page...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-900 mb-2">Assignment Submission</h1>
            <p className="text-slate-700">Upload your code to submit the assignment</p>
          </div>
          <SubmissionContent />
        </div>
      </div>
    </Suspense>
  );
}
