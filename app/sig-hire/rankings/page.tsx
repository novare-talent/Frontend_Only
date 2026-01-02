"use client";
import { CandidateRankingScreen } from "@/components/Sig-Hire/candidate-rankings";
import { RankingBotCard } from "@/components/Sig-Hire/rankingbot";

export default function Page() {

  return (
    <div className="px-6 py-4">
      {/* Container that drives responsiveness */}
      <div className="@container/main grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: main content (takes remaining space) */}
        <main className="flex flex-col gap-6">
          {/* pass the required prop to satisfy TS (change name if different) */}
          <CandidateRankingScreen onSubmitUploads={function (candidates: string[]): void {
            throw new Error("Function not implemented.");
          } } />
        </main>

        {/* RIGHT: Chatbot sidebar — fixed width (360px) on lg+, stacks below on sm */}
        <aside className="flex">
          {/* make the sidebar sticky so it remains visible while scrolling */}
          <div className="w-full lg:sticky lg:top-6">
            {/* RankingBotCard accepts className to control height/scrolling */}
            <RankingBotCard className="h-[min(70vh,800px)]" />
          </div>
        </aside>
      </div>
    </div>
  );
}



  