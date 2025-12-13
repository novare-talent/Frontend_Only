"use client"
import { CandidateRankingScreen } from "@/components/Sig-Hire/candidate-rankings";
import { ChatbotCard } from "@/components/Sig-Hire/chatbot";
import { CandidateRankingScreenProps } from "@/components/Sig-Hire/candidate-rankings";

export default function Page() {
//   return (
//     // <div className="flex flex-1 flex-col">
//     //   <div className="@container/main flex flex-1 flex-row gap-4">
//     //     <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
//     //       <CandidateRankingScreen />
//     //       {/* This requires the onSubmitUploads function which comes from the last screen */}
//     //     </div>
//     //     <div className="flex flex-col p-4">
//     //       <ChatbotCard />
//     //     </div>
//     //   </div>
//     // </div>
//   <div className="flex flex-1 flex-row">
//   <div className="@container/main flex flex-1 flex-row gap-2">
    
//     <div className="grid grid-rows-1 lg:grid-rows-2 gap-6 py-4 md:py-6">

//       {/* LEFT PANEL */}
//       <div className="flex flex-row">
//         <CandidateRankingScreen />
//       </div>

//       {/* RIGHT PANEL */}
//       <div className="flex flex-row">
//         <ChatbotCard />
//       </div>

//     </div>
//   </div>
// </div>

//   );
// }
// Example handler — replace with your real implementation
  const handleUploads = (files: File[]) => {
    console.log("uploads from CandidateRankingScreen:", files);
  };

  return (
    <div className="px-4 py-4">
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
            {/* ChatbotCard accepts className to control height/scrolling */}
            <ChatbotCard className="h-[min(70vh,800px)]" />
          </div>
        </aside>
      </div>
    </div>
  );
}



  