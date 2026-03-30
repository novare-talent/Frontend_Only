"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LoadingOverlay } from "@/components/Sig-Hire/loading-overlay";
import { useSession } from "@/context/SessionContext";
import { useMultiSession } from "@/context/MultiSessionContext";
import { initializeSession } from "@/lib/ranking-api";
import { createClient } from "@/utils/supabase/client";
import GlowButton from "@/components/landing/ui/GlowButton";
import Footer from "@/components/landing/layout/Footer";
import { Brain, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";

const MOCK_CANDIDATES = [
  { name: "Arjun M.", score: 94, tag: "Strong fit", color: "#22c55e" },
  { name: "Priya S.", score: 87, tag: "Good fit", color: "#a78bfa" },
  { name: "Rohan D.", score: 71, tag: "Review", color: "#f59e0b" },
];

function HomePageContent() {
  const router = useRouter();
  const { setSessionId, setClientId, isLoading, setIsLoading, error, setError } = useSession();
  const { addSession, loadSessions, sessions } = useMultiSession();
  const [loadingMessage, setLoadingMessage] = useState("Initializing session...");

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadSessions(user.id);
      }
    };
    loadUser();
  }, [loadSessions]);

  const handleStartHiring = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLoadingMessage("Getting your profile...");

      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to continue");
      }

      setClientId(user.id);
      setLoadingMessage(`Profile ID: ${user.id}\nInitializing session...`);

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

      setSessionId(sessionResponse.session_id);
      setIsLoading(false);

      router.push(`/sig-hire/uploads?session_id=${sessionResponse.session_id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to initialize session. Please try again."
      );
      setIsLoading(false);
    }
  };

  const handleViewSessions = () => {
    router.push("/sig-hire/sessions");
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <LoadingOverlay 
        isVisible={isLoading} 
        message={loadingMessage}
        error={error}
        onRetry={handleStartHiring}
      />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#07050C]">

        {/* CSS-only background */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(ellipse 65% 55% at 65% 15%, rgba(124,58,237,0.14) 0%, transparent 68%), radial-gradient(ellipse 45% 50% at 5% 85%, rgba(79,70,229,0.09) 0%, transparent 60%)",
        }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(196,181,253,0.1) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 40%, black 10%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 40%, black 10%, transparent 100%)",
        }} />
        <div aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-px" style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.5) 30%, rgba(196,181,253,0.7) 50%, rgba(124,58,237,0.5) 70%, transparent 100%)",
        }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-28 pb-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — copy */}
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-[0.18em] uppercase" style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.3)",
                color: "#C4B5FD",
              }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] animate-pulse" style={{ boxShadow: "0 0 6px rgba(196,181,253,0.8)" }} />
                AI-Powered Recruitment
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="text-[clamp(2.8rem,5.5vw,4.8rem)] font-extrabold tracking-[-0.04em] leading-[1.02] text-white"
            >
              Hire the{" "}
              <span className="italic" style={{
                fontFamily: "var(--font-serif)",
                background: "linear-gradient(135deg, #C4B5FD 0%, #7C3AED 60%, #4F46E5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>best</span>
              <span style={{
                background: "linear-gradient(135deg, #C4B5FD 0%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="mt-5 text-[1.05rem] leading-[1.7] max-w-md"
              style={{ color: "#94A3B8" }}
            >
              Sighyre analyzes resumes, ranks candidates, highlights risks, and
              helps recruiters make confident decisions—faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.58 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <GlowButton 
                onClick={handleStartHiring} 
                disabled={isLoading}
                className="text-sm h-11 px-6"
              >
                Start Hiring
              </GlowButton>
              {sessions && sessions.length > 0 && (
                <button
                  onClick={handleViewSessions}
                  className="h-11 px-6 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#C4B5FD",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.12)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.4)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
                  }}
                >
                  View Sessions ({sessions.length})
                </button>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.75 }}
              className="mt-10 flex items-center gap-4 flex-wrap"
            >
              {["AI-ranked in seconds", "Risk flags included", "No setup needed"].map((txt, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[12px]" style={{ color: "#64748B" }}>
                  <span style={{ color: "#7C3AED" }}>✓</span> {txt}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — product preview card */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.75, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-col gap-3 items-end"
          >
            <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{
              background: "rgba(15,12,25,0.88)",
              border: "1px solid rgba(124,58,237,0.2)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
              backdropFilter: "blur(16px)",
            }}>
              {/* Card header */}
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED", boxShadow: "0 0 8px rgba(124,58,237,0.8)" }} />
                  <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "#64748B" }}>Candidate Rankings</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(124,58,237,0.15)", color: "#C4B5FD", border: "1px solid rgba(124,58,237,0.25)" }}>
                  3 results
                </span>
              </div>

              {/* Candidates */}
              <div className="px-5 py-2 flex flex-col gap-0">
                {MOCK_CANDIDATES.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.12, duration: 0.4 }}
                    className="flex items-center justify-between py-3"
                    style={i !== 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{
                        background: `rgba(124,58,237,0.2)`,
                        border: "1px solid rgba(196,181,253,0.15)",
                        color: "#C4B5FD",
                      }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white leading-tight">{c.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${c.color}18`, color: c.color }}>
                          {c.tag}
                        </span>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: `${c.score}%`, background: c.color, opacity: 0.85 }} />
                      </div>
                      <span className="text-[12px] font-mono font-semibold w-6 text-right" style={{ color: c.color }}>{c.score}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Card footer */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(124,58,237,0.04)" }}>
                <span className="text-[11px]" style={{ color: "#64748B" }}>Analyzed by Sighyre AI</span>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-1 h-3 rounded-sm animate-pulse" style={{ background: "#7C3AED", opacity: 0.35 + i * 0.2, animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Risk flag micro-card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: "rgba(15,12,25,0.9)",
                border: "1px solid rgba(245,158,11,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white leading-tight">Risk flag detected</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#94A3B8" }}>Gap in employment · Rohan D.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to top, #07050C, transparent)" }} />
      </section>

      {/* FEATURES */}
      <section className="relative py-20 px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-white"
          >
            Everything you need to shortlist better candidates
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Ranking"
              desc="Automatically rank candidates based on skills, experience, and role fit."
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="Skill Fit Analysis"
              desc="Clear breakdowns of skills and experience relevance."
            />
            <FeatureCard
              icon={<AlertTriangle className="w-8 h-8" />}
              title="Risk Detection"
              desc="Identify gaps, inconsistencies, and hiring concerns early."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center text-white mb-16"
          >
            How Sighyre works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <Step number="1" title="Upload resumes" />
            <Step number="2" title="AI analysis" />
            <Step number="3" title="Candidate ranking" />
            <Step number="4" title="Hire confidently" />
          </div>
        </div>
      </section>

      {/* AI BOT CTA */}
      <section className="relative py-20 px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center space-y-6 p-12 rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl"
        >
          <Sparkles className="mx-auto h-12 w-12 text-[var(--color-lavender)]" />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Talk to your ranking assistant
          </h2>
          <p className="text-lg text-white/80">
            Ask questions like "Who fits best for backend roles?" or "Any
            concerns with top candidates?"
          </p>
          <GlowButton className="mt-6">
            Try Ranking Bot
          </GlowButton>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: parseInt(number) * 0.1 }}
      className="space-y-4"
    >
      <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
        {number}
      </div>
      <p className="font-medium text-white text-lg">{title}</p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl hover:border-[var(--color-lavender)]/50 transition-all duration-300"
    >
      <div className="text-[var(--color-lavender)] mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/70">{desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
