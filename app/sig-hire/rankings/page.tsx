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
  
  // Use URL sessionId if provided, otherwise fallback to context (localStorage)
  const sessionId = urlSessionId || contextSessionId;

  useEffect(() => {
    // Mark as hydrated after first render to avoid hydration mismatches
    setIsHydrated(true);
    
    // If URL has sessionId, save it to context (and localStorage)
    if (urlSessionId) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId, setSessionId]);

  const handleQuerySubmitted = () => {
    // Trigger a refresh of the rankings table
    setRefreshKey((prev) => prev + 1);
  };

  // Return loading UI until hydrated to prevent mismatch errors
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
    <div className="px-6 py-4">
      {/* Container that drives responsiveness */}
      <div className="@container/main grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: main content (takes remaining space) */}
        <main className="flex flex-col gap-6">
          <RankingsScreen sessionId={sessionId} refreshTrigger={refreshKey} />
        </main>

        {/* RIGHT: Chatbot sidebar — fixed width (360px) on lg+, stacks below on sm */}
        <aside className="flex">
          {/* make the sidebar sticky so it remains visible while scrolling */}
          <div className="w-full lg:sticky lg:top-6">
            {/* RankingBotCard accepts className to control height/scrolling */}
            <RankingBotCard className="h-[min(70vh,800px)]" sessionId={sessionId} onQuerySubmitted={handleQuerySubmitted} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="px-6 py-4"><div className="flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></div>}>
      <RankingsContent />
    </Suspense>
  );
}



  