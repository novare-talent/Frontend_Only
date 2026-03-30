"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SectionCards } from "@/components/Sig-Hire/assignment-cards";

function AssignmentsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const candidatesParam = searchParams.get('candidates');
  const candidateIds = candidatesParam ? candidatesParam.split(',') : undefined;

  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 px-6 py-24">
        <SectionCards sessionId={sessionId || undefined} candidateIds={candidateIds} />
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-4"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></div>}>
      <AssignmentsContent />
    </Suspense>
  );
}
