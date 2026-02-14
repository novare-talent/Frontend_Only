import { Suspense } from "react";
import { SigHireSubmissionSuccessContent } from "./submission-success-content";
import { Loader } from "lucide-react";

export default function SubmissionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6 flex items-center justify-center">
        <SigHireSubmissionSuccessContent />
      </div>
    </Suspense>
  );
}
