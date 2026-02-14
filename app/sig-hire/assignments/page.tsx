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
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards sessionId={sessionId || undefined} candidateIds={candidateIds} />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-4"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></div>}>
      <AssignmentsContent />
    </Suspense>
  );
}
