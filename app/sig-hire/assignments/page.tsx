"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SectionCards } from "@/components/Sig-Hire/assignment-cards";
import { SigHireFooter } from "@/components/Sig-Hire/footer";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { Particles } from "@/components/ui/particles";

function AssignmentsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const candidatesParam = searchParams.get('candidates');
  const candidateIds = candidatesParam ? candidatesParam.split(',') : undefined;

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Effects - Fixed positioning */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#8566ff"
          refresh
        />
        <GlowOrb
          className="absolute bottom-0 left-1/4 -translate-x-1/2"
          color="rgba(124, 58, 237, 0.4)"
          size="1200px"
          parallaxIntensity={20}
        />
        <GlowOrb
          className="absolute top-0 right-1/4 translate-x-1/2"
          color="rgba(124, 58, 237, 0.4)"
          size="1200px"
          parallaxIntensity={20}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <SectionCards sessionId={sessionId || undefined} candidateIds={candidateIds} />
      </div>
      <SigHireFooter />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a0118" }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(124,58,237,0.3)] border-t-[#7c3aed] animate-spin" />
        </div>
      </div>
    }>
      <AssignmentsContent />
    </Suspense>
  );
}
