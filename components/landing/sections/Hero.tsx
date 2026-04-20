"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import GlowButton from "@/components/landing/ui/GlowButton";
import SocialProofBar from "./SocialProofBar";
import ThreeGrid from "@/components/landing/effects/ThreeGrid";
import { getUserRole, getDashboardPathByRole } from "@/utils/getUserRole";

export default function Hero() {
  const router = useRouter();

  const handleAuthClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (session) {
      // User is logged in - get their role and route accordingly
      const role = await getUserRole();
      const dashboardPath = getDashboardPathByRole(role);
      router.push(dashboardPath);
    } else {
      // User not logged in - go to sign up
      router.push(path);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* ── Background ─────────────────────────────────────────────── */}
      <ThreeGrid />
      <GlowOrb
        className="-top-40 -right-40"
        color="rgba(124, 58, 237, 0.08)"
        size="800px"
        parallaxIntensity={40}
      />
      <GlowOrb
        className="-bottom-40 -left-40"
        color="rgba(79, 70, 229, 0.06)"
        size="700px"
        parallaxIntensity={25}
        parallaxInvert
      />

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center section-padding pt-24 pb-4 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Tag */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full text-sm font-mono tracking-[0.2em] uppercase text-[var(--color-lavender)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] mb-4"
        >
          India&apos;s Elite Talent Network
        </motion.span>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05]"
        >
          We find the{" "}
          <span className="font-[var(--font-serif)] italic gradient-text px-2">
            1%
          </span>
          <span className="gradient-text">.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-5 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
        >
          From thousands of candidates to the few who change outcomes.
          <br className="hidden sm:block" />
          Curated talent from IITs, IIMs, and India&apos;s top institutes.
        </motion.p>

        {/* ── Card Grid ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="mt-10 w-full px-4"
        >
          {/* ZenHyre Card */}
          <div className="flex justify-center">
            <div className="w-full max-w-4xl">
              <div className="relative glass rounded-3xl p-8 sm:p-12 md:p-16 border-2 border-[var(--color-violet-accent)] bg-gradient-to-br from-[var(--color-violet-accent)]/20 to-transparent text-center overflow-hidden group hover:border-[var(--color-violet-accent)]/80 transition-all duration-500">
                {/* Animated background glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-violet-accent)]/10 via-transparent to-transparent" />
                </div>

                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text mb-2">ZenHyre</h2>
                  <p className="text-base sm:text-lg text-white/70 mb-10 md:mb-12">Connecting Elite Talent Network — IITs, IIMs & Top Institutes</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <a
                        href="/sign-up?role=recruiter"
                        onClick={(e) => handleAuthClick(e, "/sign-up?role=recruiter")}
                        className="block"
                      >
                        <div className="relative group/btn overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-violet-accent)]/50 via-[var(--color-violet-accent)]/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 blur-lg" />
                          <GlowButton className="w-full text-base sm:text-lg md:text-xl font-bold py-4 sm:py-5 md:py-6 relative">
                            Hire Top 1%
                          </GlowButton>
                        </div>
                      </a>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1"
                    >
                      <a
                        href="/sign-up"
                        onClick={(e) => handleAuthClick(e, "/sign-up")}
                        className="block"
                      >
                        <div className="relative group/btn overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-violet-accent)]/50 via-[var(--color-violet-accent)]/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 blur-lg" />
                          <GlowButton className="w-full text-base sm:text-lg md:text-xl font-bold py-4 sm:py-5 md:py-6 relative">
                            Get Hired
                          </GlowButton>
                        </div>
                      </a>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* See How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-8 text-center"
        >
          <GlowButton
            href="#how-it-works"
            variant="secondary"
            className="px-6 py-3 rounded-full text-sm font-medium text-[var(--color-lavender)] hover:text-white transition-all duration-300"
          >
            See How It Works ↓
          </GlowButton>
        </motion.div>
      </div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="w-full flex justify-center"
      >
        <SocialProofBar />
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[var(--color-bg-primary,#0a0a0a)] to-transparent pointer-events-none" />
    </section>
  );
}