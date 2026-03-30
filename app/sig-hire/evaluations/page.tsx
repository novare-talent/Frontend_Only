"use client"

import { Suspense } from "react";
import { EvaluationsContent } from "./evaluations-content";
import { Loader } from "lucide-react";

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <Suspense
        fallback={
          <div className="px-6 py-24 flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 animate-spin text-[var(--color-lavender)]" />
              <p className="text-white/70">Initializing...</p>
            </div>
          </div>
        }
      >
        <div className="relative z-10 px-6 py-24">
          <EvaluationsContent />
        </div>
      </Suspense>
    </main>
  );
}
