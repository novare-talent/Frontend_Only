"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/context/SessionContext";
import { RankingsScreen } from "@/components/Sig-Hire/rankings-screen";
import { RankingBotCard } from "@/components/Sig-Hire/rankingbot";

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
  }, [urlSessionId, setSessionId]);

  const handleQuerySubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (!isHydrated) {
    return (
      <div className="px-6 py-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-background">
      <div className="container mx-auto max-w-[1600px] px-4 pt-24 pb-12 sm:px-6 lg:px-8 lg:pt-28">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <RankingsScreen sessionId={sessionId} refreshTrigger={refreshKey} />
          </div>

          <aside className="flex">
            <div className="w-full lg:sticky lg:top-28 lg:h-fit" data-tour="ranking-bot">
              <RankingBotCard className="h-[min(70vh,800px)]" sessionId={sessionId} onQuerySubmitted={handleQuerySubmitted} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-4"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></div>}>
      <RankingsContent />
    </Suspense>
  );
}
