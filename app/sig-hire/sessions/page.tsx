"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useMultiSession, SessionData } from "@/context/MultiSessionContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2, Users, ArrowRight } from "lucide-react";

// Simple relative-time helper (no date-fns needed)
function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const STEP_LABELS = ["Upload", "Rank", "Assign", "Evaluate"];

function getSessionStep(session: SessionData, assignmentsCount: number): number {
  if (session.status === "initialized" || session.status === "failed") return 0;
  if (session.status === "processing") return 1;
  // ready - user has completed ranking
  if (assignmentsCount > 0) return 3; // Has assignments, so at evaluate step
  return 1; // Ready but no assignments yet, at ranking step
}

function getMaxUnlockedStep(session: SessionData, assignmentsCount: number): number {
  if (session.status === "initialized" || session.status === "failed") return 0;
  // Once status is processing or ready, ranking is unlocked
  if (session.status === "processing" || session.status === "ready") {
    // If ready, both upload and ranking are unlocked
    if (session.status === "ready") {
      // If has assignments, all steps unlocked
      if (assignmentsCount > 0) return 3;
      // Otherwise upload, ranking, and assign are unlocked
      return 2;
    }
    // If processing, only upload is unlocked
    return 1;
  }
  return 0;
}

interface StepProgressProps { 
  currentStep: number;
  maxUnlockedStep: number;
  onStepClick?: (step: number) => void;
}
const SessionStepProgress = React.memo(function SessionStepProgress({ currentStep, maxUnlockedStep, onStepClick }: StepProgressProps) {
  return (
    <div className="py-3 border-t border-b border-white/5 my-3">
      <div className="flex items-start">
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={label}>
            <button
              onClick={() => i <= maxUnlockedStep && onStepClick?.(i)}
              disabled={i > maxUnlockedStep}
              className={cn(
                "flex flex-col items-center gap-1 shrink-0 transition-opacity",
                i <= maxUnlockedStep ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"
              )}
            >
              <div className="relative flex items-center justify-center h-4">
                {i === currentStep && (
                  <span className="absolute w-4 h-4 rounded-full bg-violet-400/20 animate-ping" />
                )}
                <div className={cn(
                  "w-2 h-2 rounded-full transition-colors relative z-10",
                  i < currentStep  && "bg-violet-600",
                  i === currentStep && "bg-violet-400 ring-2 ring-violet-400/40",
                  i > currentStep && i <= maxUnlockedStep && "bg-violet-600/50",
                  i > maxUnlockedStep  && "bg-white/15",
                )} />
              </div>
              <span className={cn(
                "text-[9px] whitespace-nowrap",
                i === currentStep ? "text-white/80 font-medium" : 
                i <= maxUnlockedStep ? "text-white/50" : "text-white/30"
              )}>{label}</span>
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn(
                "flex-1 h-px mt-2 mx-1",
                i < currentStep ? "bg-violet-600/40" : "bg-white/8"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});
import ChromeButton from "@/components/Sig-Hire/ChromeButton";
import { useDriverGuide } from "@/hooks/useDriverGuide";
import { sessionsGuide } from "@/lib/driver-config";
import { SigHireFooter } from "@/components/Sig-Hire/footer";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { Particles } from "@/components/ui/particles";
import { PageHeader } from "@/components/Sig-Hire/PageHeader";
import { showSuccess, showError, showConfirm } from "@/lib/swal";

function SessionsPageContent() {
  const router = useRouter();
  const supabase = createClient();
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    deleteSession,
    addSession,
    loadSessions,
  } = useMultiSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [assignmentsCounts, setAssignmentsCounts] = useState<
    Record<string, number>
  >({});
  const { startTour } = useDriverGuide("sessions", sessionsGuide, false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const loadUser = async () => {
      console.log("[Sessions Page] Starting loadUser...");
      const startTime = performance.now();

      const authStart = performance.now();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log(
        `[Sessions Page] Auth check took: ${(performance.now() - authStart).toFixed(2)}ms`,
      );

      if (!user) {
        console.log("[Sessions Page] No user found");
        setLoading(false);
        return;
      }

      console.log("[Sessions Page] User found:", user.id);
      setUser(user);

      try {
        const sessionsStart = performance.now();
        await loadSessions(user.id);
        console.log(
          `[Sessions Page] loadSessions took: ${(performance.now() - sessionsStart).toFixed(2)}ms`,
        );
      } catch (err) {
        console.error("Failed to load sessions:", err);
      }

      setLoading(false);
      console.log(
        `[Sessions Page] Total load time: ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    };
    loadUser();
  }, [loadSessions, supabase]);

  useEffect(() => {
    const loadAssignmentsCounts = async () => {
      console.log("[Sessions Page] Starting loadAssignmentsCounts...");
      const startTime = performance.now();

      if (sessions.length === 0) {
        console.log("[Sessions Page] No sessions, skipping assignments count");
        return;
      }

      const jobIds = sessions
        .map((s) => s.job_id)
        .filter((id): id is string => !!id);

      console.log(`[Sessions Page] Found ${jobIds.length} job IDs to query`);

      if (jobIds.length === 0) {
        setAssignmentsCounts({});
        return;
      }

      const client = createClient();
      const queryStart = performance.now();
      const { data } = await client
        .from("assignments")
        .select("job_id")
        .in("job_id", jobIds)
        .neq("candidate_id", "00000000-0000-0000-0000-000000000000");
      console.log(
        `[Sessions Page] Assignments query took: ${(performance.now() - queryStart).toFixed(2)}ms`,
      );

      const counts: Record<string, number> = {};
      sessions.forEach((session) => {
        if (session.job_id) {
          counts[session.session_id] =
            data?.filter((a) => a.job_id === session.job_id).length || 0;
        }
      });
      setAssignmentsCounts(counts);
      console.log(
        `[Sessions Page] Total assignments count load: ${(performance.now() - startTime).toFixed(2)}ms`,
      );
    };
    loadAssignmentsCounts();
  }, [sessions]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "processing":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "failed":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  const handleViewSession = (sessionId: string, status: string) => {
    setCurrentSessionId(sessionId);
    const route =
      status === "initialized"
        ? `/sig-hire/uploads?session_id=${sessionId}`
        : `/sig-hire/rankings?session_id=${sessionId}`;
    router.push(route);
  };

  const handleViewAssignments = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find((s) => s.session_id === sessionId);
    if (session?.job_id) {
      router.push(
        `/sig-hire/evaluations?job_id=${session.job_id}&session_id=${sessionId}`,
      );
    } else {
      router.push(`/sig-hire/assignments?session_id=${sessionId}`);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = await showConfirm(
      "Delete Session?",
      "This will also delete all related assignments. This action cannot be undone."
    );
    
    if (confirmed) {
      try {
        setCreatingSession(true);
        await deleteSession(sessionId);
        await showSuccess("Session deleted successfully");
      } catch (err) {
        await showError(err instanceof Error ? err.message : "Failed to delete session");
      } finally {
        setCreatingSession(false);
      }
    }
  };

  const handleCreateNew = async () => {
    if (!user) {
      await showError("Please log in to create a new session");
      return;
    }

    try {
      setCreatingSession(true);
      const { initializeSession } = await import("@/lib/ranking-api");
      const sessionResponse = await initializeSession(user.id);

      if (!sessionResponse.session_id) {
        throw new Error("Failed to create session");
      }

      await addSession({
        session_id: sessionResponse.session_id,
        client_id: user.id,
        status: "initialized",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setCreatingSession(false);
      await showSuccess("Session created successfully!");
      router.push(`/sig-hire/uploads?session_id=${sessionResponse.session_id}`);
    } catch (err) {
      setCreatingSession(false);
      await showError(err instanceof Error ? err.message : "Failed to create session");
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        {/* Same background as loaded state */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <Particles className="absolute inset-0" quantity={100} ease={80} color="#8566ff" refresh />
          <GlowOrb className="absolute bottom-0 left-1/4 -translate-x-1/2" color="rgba(124, 58, 237, 0.4)" size="1200px" parallaxIntensity={20} />
          <GlowOrb className="absolute top-0 right-1/4 translate-x-1/2" color="rgba(124, 58, 237, 0.4)" size="1200px" parallaxIntensity={20} />
        </div>

        <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
          {/* PageHeader skeleton — matches flex-col sm:flex-row layout */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-12">
            <div>
              <div className="h-9 md:h-12 w-72 bg-white/10 rounded-lg animate-pulse mb-2" />
              <div className="h-5 w-64 bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-10 w-36 bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Session cards skeleton — matches real card markup exactly */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative p-6 rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                  {/* Title row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-7 w-44 bg-white/10 rounded-lg animate-pulse mb-2" />
                      <div className="h-4 w-28 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                      <div className="h-6 w-11 bg-white/10 rounded-full animate-pulse" />
                    </div>
                  </div>
                  {/* Meta rows (candidates / assignments) */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-36 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-9 w-16 bg-white/10 rounded-lg animate-pulse" />
                    <div className="h-9 w-10 bg-red-500/10 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
      <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <PageHeader
          title="Job Ranking Sessions"
          description="Manage your candidate ranking and evaluation sessions"
          onHelpClick={startTour}
          actions={
            <ChromeButton
              onClick={handleCreateNew}
              disabled={creatingSession}
              className="flex items-center gap-2"
              data-tour="new-session-btn"
              type="button"
            >
              {creatingSession ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  New Session
                </>
              )}
            </ChromeButton>
          }
        />

        {sessions && sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session: SessionData, index: number) => {
              const assignCount = assignmentsCounts[session.session_id] ?? 0;
              const step = getSessionStep(session, assignCount);
              const maxUnlocked = getMaxUnlockedStep(session, assignCount);
              const isActive = currentSessionId === session.session_id;
              const isFailed = session.status === "failed";
              const isProcessing = session.status === "processing";

              const ctaLabel = (() => {
                if (isFailed) return "Retry Upload";
                if (isProcessing) return "Processing…";
                if (step === 0) return "Upload Data";
                if (step === 1) return "View Rankings";
                if (step === 2) return "Send Assignments";
                return "Review Evaluations";
              })();

              const handleCta = () => {
                if (isFailed || step === 0) {
                  setCurrentSessionId(session.session_id);
                  router.push(`/sig-hire/uploads?session_id=${session.session_id}`);
                } else if (step === 1) {
                  handleViewSession(session.session_id, session.status);
                } else if (step === 2) {
                  setCurrentSessionId(session.session_id);
                  router.push(`/sig-hire/assignments?session_id=${session.session_id}`);
                } else {
                  handleViewAssignments(session.session_id);
                }
              };

              return (
                <motion.div
                  key={session.session_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  data-tour={index === 0 ? "session-card" : undefined}
                  className={cn(
                    "relative p-6 rounded-md border backdrop-blur-xl transition-all duration-300 overflow-hidden",
                    isActive && "border-[var(--color-lavender)]",
                    isFailed && !isActive && "border-red-500/30",
                    !isActive && !isFailed && "border-[var(--color-glass-border)] hover:border-[var(--color-lavender)]/50",
                    "bg-[var(--color-glass-bg)]"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative z-10">

                    {/* Header row: active pill + status badge + delete */}
                    <div className="flex items-center gap-2 mb-3">
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                          Active
                        </span>
                      )}
                      <span className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full border",
                        getStatusBadgeColor(session.status)
                      )}>
                        {session.status}
                      </span>
                      <button
                        onClick={() => handleDeleteSession(session.session_id)}
                        className="ml-auto p-1 rounded-md text-white/30 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Job name */}
                    <h3 className="text-xl font-bold text-white leading-tight mb-1">
                      {session.job_name || (
                        <span className="text-white/60 italic font-normal text-base">New Session</span>
                      )}
                    </h3>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 text-white/50 text-xs mb-1">
                      <span>Started {relativeDate(session.created_at)}</span>
                      {session.candidates_count ? (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {session.candidates_count} candidates
                          </span>
                        </>
                      ) : null}
                    </div>

                    {/* Hint for new sessions */}
                    {!session.job_name && session.status === "initialized" && (
                      <p className="text-[11px] text-white/35 italic mb-2">
                        Upload a job description to get started
                      </p>
                    )}

                    {/* Error message */}
                    {session.error && (
                      <div className="text-xs text-red-300 bg-red-500/10 px-3 py-2 rounded-md border border-red-500/20 mb-2">
                        {session.error}
                      </div>
                    )}

                    {/* Step progress */}
                    <SessionStepProgress 
                      currentStep={step}
                      maxUnlockedStep={maxUnlocked}
                      onStepClick={(clickedStep) => {
                        setCurrentSessionId(session.session_id);
                        if (clickedStep === 0) {
                          router.push(`/sig-hire/uploads?session_id=${session.session_id}`);
                        } else if (clickedStep === 1) {
                          router.push(`/sig-hire/rankings?session_id=${session.session_id}`);
                        } else if (clickedStep === 2) {
                          router.push(`/sig-hire/assignments?session_id=${session.session_id}`);
                        } else {
                          handleViewAssignments(session.session_id);
                        }
                      }}
                    />

                    {/* Primary CTA */}
                    <button
                      onClick={handleCta}
                      disabled={isProcessing}
                      className={cn(
                        "w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer",
                        isProcessing
                          ? "bg-white/5 text-white/30 cursor-not-allowed"
                          : "bg-violet-600/80 hover:bg-violet-600 text-white"
                      )}
                    >
                      {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                      {ctaLabel}
                      {!isProcessing && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 p-12 rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl"
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              No Sessions Yet
            </h2>
            <p className="text-white/70 mb-6">
              Create your first ranking session to get started
            </p>
            <button onClick={handleCreateNew}>
              <ChromeButton>Create New Session</ChromeButton>
            </button>
          </motion.div>
        )}
      </div>
      <SigHireFooter />
    </main>
  );
}

export default function SessionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading sessions...
        </div>
      }
    >
      <SessionsPageContent />
    </Suspense>
  );
}
