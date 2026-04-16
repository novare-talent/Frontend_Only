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

function getMaxUnlockedStep(sessionStatus: string, hasAssignments: boolean, currentStepIndex: number): number {
  let calculatedMax = 0;

  if (sessionStatus === "initialized" || sessionStatus === "failed") calculatedMax = 0;
  else if (sessionStatus === "processing") calculatedMax = 1;
  else if (sessionStatus === "ready") {
    calculatedMax = hasAssignments ? 3 : 2;
  }

  return Math.max(calculatedMax, currentStepIndex);
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" className="w-3 h-3">
      <path
        d="M2 5.5L4 7.5L8 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
      <rect x="2" y="4.5" width="6" height="4.5" rx="1" fill="currentColor" opacity="0.5" />
      <path
        d="M3.5 4.5V3.5a1.5 1.5 0 0 1 3 0v1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
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

  const storageKey = `workflow_max_step_${activeSessionId}`;
  const [persistedMaxStep, setPersistedMaxStep] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return stored ? parseInt(stored, 10) : activeStepIndex;
    }
    return activeStepIndex;
  });

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

  const maxUnlockedStep = currentSession
    ? Math.max(
        getMaxUnlockedStep(currentSession.status, assignmentsCount > 0, activeStepIndex),
        persistedMaxStep
      )
    : Math.max(activeStepIndex, persistedMaxStep);

  useEffect(() => {
    if (maxUnlockedStep > persistedMaxStep) {
      setPersistedMaxStep(maxUnlockedStep);
      localStorage.setItem(storageKey, maxUnlockedStep.toString());
    }
  }, [maxUnlockedStep, persistedMaxStep, storageKey]);

  if (!isWorkflowPage || !activeSessionId) return null;

  const navigateTo = (stepIndex: number) => {
    if (stepIndex > maxUnlockedStep) return;
    const path = WORKFLOW_STEPS[stepIndex].path;
    router.push(`${path}?session_id=${activeSessionId}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="border-t border-white/6"
      >
        {/* Desktop stepper */}
        <div className="hidden lg:flex items-center justify-center px-8 py-3">
          <div className="flex items-center w-full max-w-[520px]">
            {WORKFLOW_STEPS.map((step, i) => {
              const isActive   = i === activeStepIndex;
              const isComplete = i < activeStepIndex && i <= maxUnlockedStep;
              const isUnlocked = i <= maxUnlockedStep;
              const isClickable = isUnlocked && !isActive;
              const isLocked   = !isUnlocked;

              return (
                <div key={step.path} className="flex items-center flex-1 last:flex-none">
                  {/* Step button */}
                  <button
                    onClick={() => isClickable && navigateTo(i)}
                    disabled={!isClickable}
                    className={cn(
                      "group relative flex flex-col items-center gap-1.5 px-1 py-1 transition-all duration-200",
                      isClickable ? "cursor-pointer" : "cursor-default",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
                    )}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {/* Circle indicator */}
                    <div className="relative flex items-center justify-center">
                      {/* Active glow */}
                      {isActive && (
                        <span className="absolute inset-0 rounded-full bg-violet-500/20 blur-sm scale-150" />
                      )}

                      {/* Outer ring for active */}
                      {isActive && (
                        <motion.span
                          className="absolute w-8 h-8 rounded-full border border-violet-400/30"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      )}

                      {/* Main circle */}
                      <motion.div
                        className={cn(
                          "relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                          isActive   && "bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]",
                          isComplete && "bg-violet-600/80 group-hover:bg-violet-500/90 group-hover:shadow-[0_0_10px_rgba(139,92,246,0.35)]",
                          isLocked   && "bg-white/6 border border-white/10",
                          isUnlocked && !isActive && !isComplete && "bg-violet-700/50 border border-violet-500/30 group-hover:bg-violet-600/60 group-hover:border-violet-400/50",
                        )}
                        whileHover={isClickable ? { scale: 1.08 } : {}}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {isComplete ? (
                          <span className="text-violet-100">
                            <CheckIcon />
                          </span>
                        ) : isLocked ? (
                          <span className="text-white/25">
                            <LockIcon />
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "text-[10px] font-semibold tabular-nums leading-none",
                              isActive ? "text-white" : "text-violet-300"
                            )}
                          >
                            {i + 1}
                          </span>
                        )}
                      </motion.div>
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "text-[11px] font-medium tracking-wide whitespace-nowrap transition-colors duration-200",
                        isActive    && "text-white",
                        isComplete  && "text-violet-400 group-hover:text-violet-300",
                        isLocked    && "text-white/20",
                        isUnlocked && !isActive && !isComplete && "text-violet-400/60 group-hover:text-violet-300",
                      )}
                    >
                      {step.label}
                    </span>
                  </button>

                  {/* Connector */}
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="flex-1 mx-1.5 mb-[18px] h-px overflow-hidden rounded-full">
                      <div className="h-full bg-white/[0.07] relative">
                        {i < maxUnlockedStep && (
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-linear-to-r from-violet-600/70 to-violet-500/40"
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            style={{ width: "100%" }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile stepper */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5">
          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {WORKFLOW_STEPS.map((_, i) => {
              const isActive   = i === activeStepIndex;
              const isComplete = i < activeStepIndex && i <= maxUnlockedStep;
              const isUnlocked = i <= maxUnlockedStep;
              return (
                <button
                  key={i}
                  onClick={() => isUnlocked && !isActive && navigateTo(i)}
                  disabled={!isUnlocked || isActive}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    isActive   && "w-4 h-1.5 bg-violet-400",
                    isComplete && "w-1.5 h-1.5 bg-violet-600/70",
                    !isActive && !isComplete && isUnlocked  && "w-1.5 h-1.5 bg-violet-700/50",
                    !isUnlocked && "w-1.5 h-1.5 bg-white/10",
                  )}
                />
              );
            })}
          </div>

          {/* Step label */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-white/35 tabular-nums">
              {activeStepIndex + 1}/{WORKFLOW_STEPS.length}
            </span>
            <span className="text-[11px] text-white/60">·</span>
            <span className="text-[11px] font-medium text-violet-400 tracking-wide">
              {WORKFLOW_STEPS[activeStepIndex]?.label}
            </span>
          </div>
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
