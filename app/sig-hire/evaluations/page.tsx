"use client"
import { AssignmentEvaluationScreen } from "@/components/Sig-Hire/evaluations-table";
import { SubmissionReceivedCard } from "@/components/Sig-Hire/submissions-received";

export default function Page() {
  return (
    // <div className="flex flex-1 flex-col">
    //   <div className="@container/main flex flex-1 flex-col gap-2">
    //     <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
    //       <AssignmentEvaluationScreen />
    //     </div>
    //   </div>
    // </div>
    <div className="px-6 py-4">
          {/* Container that drives responsiveness */}
          <div className="@container/main grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* LEFT: main content (takes remaining space) */}
            <main className="flex flex-col gap-6">
              {/* pass the required prop to satisfy TS (change name if different) */}
              <AssignmentEvaluationScreen onApprove={function (): void {
            throw new Error("Function not implemented.");
          } } />
            </main>
    
            {/* RIGHT: Chatbot sidebar — fixed width (360px) on lg+, stacks below on sm */}
            <aside className="flex">
              {/* make the sidebar sticky so it remains visible while scrolling */}
              <div className="w-full lg:sticky lg:top-6">
                {/* ChatbotCard accepts className to control height/scrolling */}
                <SubmissionReceivedCard className="h-[min(70vh,800px)]" />
              </div>
            </aside>
          </div>
    </div>
  );
}