"use client"

import { Suspense } from "react";
import { EvaluationsContent } from "./evaluations-content";
import { Loader } from "lucide-react";
import { SigHireFooter } from "@/components/Sig-Hire/footer";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { Particles } from "@/components/ui/particles";

export default function Page() {
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
      <Suspense
        fallback={
          <div className="px-6 py-24 lg:pt-36 flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-8 h-8 animate-spin text-[var(--color-lavender)]" />
              <p className="text-white/70">Initializing...</p>
            </div>
          </div>
        }
      >
        <div className="relative z-10 px-6 py-24 lg:pt-36">
          <EvaluationsContent />
        </div>
      </Suspense>
      <SigHireFooter />
    </main>
  );
}
