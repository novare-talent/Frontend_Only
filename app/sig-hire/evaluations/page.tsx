"use client"

import { Suspense } from "react";
import { EvaluationsContent } from "./evaluations-content";
import { Loader } from "lucide-react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="px-6 py-4 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Initializing...</p>
          </div>
        </div>
      }
    >
      <EvaluationsContent />
    </Suspense>
  );
}
