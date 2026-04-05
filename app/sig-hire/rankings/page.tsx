"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { RankingsScreen } from "@/components/Sig-Hire/rankings-screen";
import { RankingBotCard } from "@/components/Sig-Hire/rankingbot";
import { SigHireFooter } from "@/components/Sig-Hire/footer";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { Particles } from "@/components/ui/particles";
import { IconMessageChatbot, IconX } from "@tabler/icons-react";

function RankingsContent() {
  const searchParams = useSearchParams();
  const { sessionId: contextSessionId, setSessionId } = useSession();
  const urlSessionId = searchParams.get('session_id');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);

  const sessionId = urlSessionId || contextSessionId;

  useEffect(() => {
    setIsHydrated(true);

    if (urlSessionId) {
      setSessionId(urlSessionId);
    }

    window.scrollTo(0, 0);
  }, [urlSessionId, setSessionId]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isBotOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isBotOpen]);

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
    <main className="relative min-h-screen" style={{ overflowX: "clip" }}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles className="absolute inset-0" quantity={100} ease={80} color="#8566ff" refresh />
        <GlowOrb className="absolute bottom-0 left-1/4 -translate-x-1/2" color="rgba(124, 58, 237, 0.4)" size="1200px" parallaxIntensity={20} />
        <GlowOrb className="absolute top-0 right-1/4 translate-x-1/2" color="rgba(124, 58, 237, 0.4)" size="1200px" parallaxIntensity={20} />
      </div>

      <div className="relative z-10">
        {/* Mobile: Rankings only, bot via FAB */}
        <div className="lg:hidden px-4 pt-28 pb-28">
          <RankingsScreen sessionId={sessionId} refreshTrigger={refreshKey} />
        </div>

        {/* Desktop: Two-column layout with sticky right sidebar */}
        <div className="hidden lg:flex items-start px-6 pt-32">
          {/* Left side - scrolls normally */}
          <div className="flex-1 min-w-0 pb-12">
            <div className="max-w-[1200px] mx-auto">
              <RankingsScreen sessionId={sessionId} refreshTrigger={refreshKey} />
            </div>
          </div>

          {/* Right side - sticky, full viewport height */}
          <aside
            className="w-[400px] shrink-0 pl-6 self-stretch mb-6"
            data-tour="ranking-bot"
          >
            <div className="sticky top-32 h-[calc(100vh-10rem)]">
              <RankingBotCard sessionId={sessionId} onQuerySubmitted={handleQuerySubmitted} />
            </div>
          </aside>
        </div>
      </div>

      <SigHireFooter />

      {/* Mobile FAB */}
      <button
        onClick={() => setIsBotOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/50 transition-transform active:scale-95"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
          border: "1px solid rgba(167,139,250,0.4)",
        }}
        aria-label="Open Ranking Bot"
      >
        <IconMessageChatbot className="w-6 h-6 text-white" />
      </button>

      {/* Mobile Bot Drawer */}
      {isBotOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsBotOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-2xl overflow-hidden"
            style={{
              height: "90dvh",
              background: "rgba(10,1,24,0.97)",
              border: "1px solid rgba(124,58,237,0.25)",
              borderBottom: "none",
            }}
          >
            {/* Drag handle + close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
              <span className="text-sm font-semibold text-white/70">Ranking Bot</span>
              <button
                onClick={() => setIsBotOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
                aria-label="Close"
              >
                <IconX className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Bot content */}
            <div className="flex-1 min-h-0 p-4" data-tour="ranking-bot">
              <RankingBotCard sessionId={sessionId} onQuerySubmitted={handleQuerySubmitted} />
            </div>
          </div>
        </div>
      )}
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
