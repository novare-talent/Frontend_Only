"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";
import { useMultiSession } from "@/context/MultiSessionContext";
import { createClient } from "@/utils/supabase/client";

const WORKFLOW_STEPS = [
  { label: "Upload",      path: "/sig-hire/uploads" },
  { label: "Rankings",    path: "/sig-hire/rankings" },
  { label: "Assignments", path: "/sig-hire/assignments" },
  { label: "Evaluations", path: "/sig-hire/evaluations" },
];

const WORKFLOW_PATHS = WORKFLOW_STEPS.map((s) => s.path);

function getMaxUnlockedStep(sessionStatus: string, hasAssignments: boolean): number {
  if (sessionStatus === "initialized" || sessionStatus === "failed") return 0;
  if (sessionStatus === "processing") return 1;
  if (sessionStatus === "ready") {
    if (hasAssignments) return 3;
    return 2;
  }
  return 0;
}

function WorkflowStepperInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sessionId } = useSession();
  const { currentSessionId, sessions } = useMultiSession();
  const [assignmentsCount, setAssignmentsCount] = useState(0);

  const activeSessionId = searchParams.get("session_id") || currentSessionId || sessionId;
  const activeStepIndex = WORKFLOW_STEPS.findIndex((s) => pathname === s.path || pathname.startsWith(s.path + "?"));
  const isWorkflowPage = WORKFLOW_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"));

  const currentSession = sessions.find(s => s.session_id === activeSessionId);

  useEffect(() => {
    const loadAssignmentsCount = async () => {
      if (!currentSession?.job_id) {
        setAssignmentsCount(0);
        return;
      }

      const client = createClient();
      const { data } = await client
        .from("assignments")
        .select("job_id", { count: 'exact', head: true })
        .eq("job_id", currentSession.job_id)
        .neq("candidate_id", "00000000-0000-0000-0000-000000000000");
      
      setAssignmentsCount(data?.length || 0);
    };
    
    loadAssignmentsCount();
  }, [currentSession?.job_id]);

  if (!isWorkflowPage || !activeSessionId) return null;

  const maxUnlockedStep = currentSession 
    ? getMaxUnlockedStep(currentSession.status, assignmentsCount > 0)
    : 0;

  const navigateTo = (stepIndex: number) => {
    if (stepIndex > maxUnlockedStep) return;
    const path = WORKFLOW_STEPS[stepIndex].path;
    router.push(`${path}?session_id=${activeSessionId}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
      >
        {/* Desktop stepper */}
        <div className="hidden lg:flex items-center justify-center px-6 py-2.5 border-t border-white/5">
          <div className="flex items-center gap-0 max-w-lg w-full">
            {WORKFLOW_STEPS.map((step, i) => {
              const isCompleted = i < activeStepIndex;
              const isActive = i === activeStepIndex;
              const isUnlocked = i <= maxUnlockedStep;
              const isClickable = isUnlocked && !isActive;

              return (
                <div key={step.path} className="flex items-center flex-1 last:flex-none">
                  {/* Step item */}
                  <button
                    onClick={() => isClickable && navigateTo(i)}
                    disabled={!isClickable}
                    className={cn(
                      "flex flex-col items-center gap-1 group",
                      isClickable ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    {/* Dot */}
                    <div className="relative flex items-center justify-center">
                      {isActive && (
                        <span className="absolute w-5 h-5 rounded-full bg-violet-400/25 animate-ping" />
                      )}
                      <div
                        className={cn(
                          "w-3.5 h-3.5 rounded-full transition-all duration-200 relative z-10",
                          isCompleted && "bg-violet-600 group-hover:bg-violet-500",
                          isActive && "bg-violet-400 ring-2 ring-violet-400/50",
                          !isCompleted && !isActive && isUnlocked && "bg-violet-600/50 group-hover:bg-violet-600/70",
                          !isUnlocked && "bg-white/15"
                        )}
                      />
                      {isCompleted && (
                        <svg
                          className="absolute w-2 h-2 text-white z-20"
                          viewBox="0 0 8 8"
                          fill="none"
                        >
                          <path d="M1.5 4L3 5.5L6.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {/* Label */}
                    <span
                      className={cn(
                        "text-[10px] whitespace-nowrap transition-colors duration-200",
                        isCompleted && "text-violet-400 group-hover:text-violet-300",
                        isActive && "text-white font-medium",
                        !isCompleted && !isActive && isUnlocked && "text-white/50 group-hover:text-white/70",
                        !isUnlocked && "text-white/30"
                      )}
                    >
                      {step.label}
                    </span>
                  </button>

                  {/* Connector line (not after last item) */}
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="flex-1 mx-2 mb-4">
                      <div
                        className={cn(
                          "h-px transition-colors duration-200",
                          i < activeStepIndex ? "bg-violet-600/50" : "bg-white/10"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile compact stepper */}
        <div className="lg:hidden flex items-center justify-center py-1.5 border-t border-white/5">
          <span className="text-xs text-white/50">
            <span className="text-white/80 font-medium">Step {activeStepIndex + 1} of {WORKFLOW_STEPS.length}</span>
            {" · "}
            <span className="text-violet-400">{WORKFLOW_STEPS[activeStepIndex]?.label}</span>
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function WorkflowStepper() {
  return (
    <Suspense fallback={null}>
      <WorkflowStepperInner />
    </Suspense>
  );
}
