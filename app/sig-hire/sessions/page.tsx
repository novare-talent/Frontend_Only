"use client";

import React, { useEffect, useState, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useMultiSession, SessionData } from "@/context/MultiSessionContext";
import { motion } from "framer-motion";
import {
  Loader2,
  Plus,
  Trash2,
  Eye,
  BookOpen,
  Calendar,
  Users,
  FileText,
} from "lucide-react";
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
    getSessionAssignments,
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

      router.push(`/sig-hire/uploads?session_id=${sessionResponse.session_id}`);
    } catch (err) {
      await showError(err instanceof Error ? err.message : "Failed to create session");
      setCreatingSession(false);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen">
        <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <div className="h-12 w-96 bg-white/10 rounded-lg animate-pulse mb-3" />
              <div className="h-6 w-80 bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/10 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative p-6 rounded-md border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="h-7 w-48 bg-white/10 rounded-lg animate-pulse mb-2" />
                      <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
                      <div className="h-6 w-11 bg-white/10 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="h-5 w-36 bg-white/5 rounded-lg animate-pulse" />
                    <div className="h-5 w-40 bg-white/5 rounded-lg animate-pulse" />
                  </div>
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
            {sessions.map((session: SessionData, index: number) => (
              <motion.div
                key={session.session_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-tour={index === 0 ? "session-card" : undefined}
                className={`relative p-6 rounded-md border backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-lavender)]/50 overflow-hidden ${
                  currentSessionId === session.session_id
                    ? "border-[var(--color-lavender)] bg-[var(--color-glass-bg)]"
                    : "border-[var(--color-glass-border)] bg-[var(--color-glass-bg)]"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {session.job_name || "Untitled Job"}
                      </h3>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border ${getStatusBadgeColor(session.status)}`}
                      >
                        {session.status}
                      </span>
                      <button
                        onClick={() => setCurrentSessionId(session.session_id)}
                        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
                        style={{
                          backgroundColor:
                            currentSessionId === session.session_id
                              ? "var(--color-lavender)"
                              : "rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            currentSessionId === session.session_id
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {session.candidates_count && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Users className="w-4 h-4 text-[var(--color-lavender)]" />
                        <span className="text-sm">
                          {session.candidates_count} Candidates
                        </span>
                      </div>
                    )}
                    {assignmentsCounts[session.session_id] !== undefined && (
                      <div className="flex items-center gap-2 text-white/80">
                        <FileText className="w-4 h-4 text-[var(--color-lavender)]" />
                        <span className="text-sm">
                          {assignmentsCounts[session.session_id]} Assignments
                        </span>
                      </div>
                    )}
                    {session.error && (
                      <div className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        Error: {session.error}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        handleViewSession(session.session_id, session.status)
                      }
                      disabled={
                        session.status === "failed" ||
                        session.status === "processing"
                      }
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      {session.status === "initialized" ? "Upload" : "Rankings"}
                    </button>
                    {assignmentsCounts[session.session_id] !== undefined &&
                      assignmentsCounts[session.session_id] > 0 && (
                        <button
                          onClick={() =>
                            handleViewAssignments(session.session_id)
                          }
                          className="px-3 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          {assignmentsCounts[session.session_id]}
                        </button>
                      )}
                    <button
                      onClick={() => handleDeleteSession(session.session_id)}
                      className="px-3 py-2 text-sm rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
