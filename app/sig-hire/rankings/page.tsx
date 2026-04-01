"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { RankingsScreen } from "@/components/Sig-Hire/rankings-screen";
import { RankingBotCard } from "@/components/Sig-Hire/rankingbot";
import { SigHireFooter } from "@/components/Sig-Hire/footer";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { Particles } from "@/components/ui/particles";

function RankingsContent() {
  const searchParams = useSearchParams();
  const { sessionId: contextSessionId, setSessionId } = useSession();
  const urlSessionId = searchParams.get('session_id');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  
  const sessionId = urlSessionId || contextSessionId;

  useEffect(() => {
    setIsHydrated(true);
    
    if (urlSessionId) {
      setSessionId(urlSessionId);
    }
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, [urlSessionId, setSessionId]);

  const handleQuerySubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!isHydrated) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <Particles className="absolute inset-0" quantity={100} ease={80} color="#8566ff" refresh />
          <GlowOrb className="absolute bottom-0 left-1/4 -translate-x-1/2" color="rgba(124, 58, 237, 0.4)" size="1200px" parallaxIntensity={20} />
          <GlowOrb className="absolute top-0 right-1/4 translate-x-1/2" color="rgba(124, 58, 237, 0.4)" size="1200px" parallaxIntensity={20} />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(124,58,237,0.3)] border-t-[#7c3aed] animate-spin" />
        </div>
      </main>
    );
  }

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
      <div className="relative z-10 px-6 pt-32 pb-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <RankingsScreen sessionId={sessionId} refreshTrigger={refreshKey} />
          </div>

          <aside className="flex">
            <div className="w-full lg:sticky lg:top-32 lg:h-fit" data-tour="ranking-bot">
              <RankingBotCard className="h-[min(70vh,800px)]" sessionId={sessionId} onQuerySubmitted={handleQuerySubmitted} />
            </div>
          </aside>
        </div>
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
      <RankingsContent />
    </Suspense>
  );
}
