"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThreeGrid from "@/components/landing/effects/ThreeGrid";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import GlowButton from "@/components/landing/ui/GlowButton";
import SocialProofBar from "./SocialProofBar";
import { createClient } from "@/utils/supabase/client";

export default function Hero() {
  const router = useRouter();

  const handleAuthClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      router.push("/Dashboard");
    } else {
      router.push(path);
    }
  };

  /* ── Shared card style ─────────────────────────────────────────── */
  const cardBase =
    "glass rounded-2xl p-5 border border-[var(--color-glass-border)] hover:border-[var(--color-violet-accent)] transition-all duration-300 group flex flex-col h-full";

  const secondaryCards = [
    {
      title: "Career Navigator",
      desc: "Career guidance & mentorship",
      href: "https://www.careernavigator4u.com",
      external: true,
    },
    {
      title: "SigHyre",
      desc: "AI-powered candidate ranking",
      href: "/sig-hire",
      external: false,
    },
    {
      title: "ArenaX",
      desc: "Coding & skill assessment",
      href: "https://arena.novaretalent.com",
      external: true,
    },
    {
      title: "IIT Placements",
      desc: "Placement data & insights",
      href: "/iit-placements",
      external: false,
    },
  ];

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
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 w-full"
        >

          {/* ══════════════════════════════════════════════════════════
              MOBILE  (< sm)
              Stack: ZenHyre full-width → 2-col grid for the 4 others
          ══════════════════════════════════════════════════════════ */}
          <div className="sm:hidden flex flex-col gap-4">
            {/* ZenHyre — hero card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="glass rounded-2xl p-6 border-2 border-[var(--color-violet-accent)] bg-gradient-to-br from-[var(--color-violet-accent)]/15 to-transparent text-center">
           
                <h3 className="text-2xl font-extrabold gradient-text mb-1">ZenHyre</h3>
                <p className="text-sm text-white/70 mb-5">Elite Talent Network</p>
                <div className="flex flex-col gap-3">
                  <a
                    href="/sign-up?role=recruiter"
                    onClick={(e) => handleAuthClick(e, "/sign-up?role=recruiter")}
                  >
                    <GlowButton className="w-full text-sm py-3">Hire Top 1%</GlowButton>
                  </a>
                  <a
                    href="/sign-up"
                    onClick={(e) => handleAuthClick(e, "/sign-up")}
                  >
                    <GlowButton className="w-full text-sm py-3">Get Hired</GlowButton>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* 2-col grid for secondary cards */}
            <div className="grid grid-cols-2 gap-3">
              {secondaryCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 1.0 + i * 0.07 }}
                  className="flex"
                >
                  <div className={cardBase}>
                    <h3 className="text-sm font-bold gradient-text mb-1 text-center">{card.title}</h3>
                    <p className="text-xs text-white/70 mb-4 flex-1 leading-snug text-center">{card.desc}</p>
                    <a
                      href={card.href}
                      {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <GlowButton className="w-full text-xs py-2">Explore →</GlowButton>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              TABLET  (sm → lg)
              ZenHyre full-width on top, 4 cards in a 2×2 grid below
          ══════════════════════════════════════════════════════════ */}
          <div className="hidden sm:flex lg:hidden flex-col gap-5">
            {/* ZenHyre — hero card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <div className="glass rounded-2xl p-8 border-2 border-[var(--color-violet-accent)] bg-gradient-to-br from-[var(--color-violet-accent)]/15 to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div className="text-left">
              
                    <h3 className="text-3xl font-extrabold gradient-text mb-1">ZenHyre</h3>
                    <p className="text-sm text-white/70">Elite Talent Network — IITs, IIMs & Top Institutes</p>
                  </div>
                  <div className="flex gap-3 sm:flex-col sm:min-w-[160px]">
                    <a
                      href="/sign-up?role=recruiter"
                      onClick={(e) => handleAuthClick(e, "/sign-up?role=recruiter")}
                      className="flex-1"
                    >
                      <GlowButton className="w-full text-sm py-3">Hire Top 1%</GlowButton>
                    </a>
                    <a
                      href="/sign-up"
                      onClick={(e) => handleAuthClick(e, "/sign-up")}
                      className="flex-1"
                    >
                      <GlowButton className="w-full text-sm py-3">Get Hired</GlowButton>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 2×2 grid for secondary cards */}
            <div className="grid grid-cols-2 gap-4">
              {secondaryCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 1.0 + i * 0.07 }}
                  className="flex"
                >
                  <div className={cardBase}>
                    <h3 className="text-base font-bold gradient-text mb-1">{card.title}</h3>
                    <p className="text-sm text-white/70 mb-4 flex-1">{card.desc}</p>
                    <a
                      href={card.href}
                      {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <GlowButton className="w-full text-sm py-2.5">Explore →</GlowButton>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              DESKTOP  (lg+)
              Arch / Λ layout:
                [SigHyre]  [Career Nav]  [ZenHyre↑↑]  [ArenaX]  [IIT Placements]
              Outer cards sit lower (mt-8), inner ones (mt-4), ZenHyre on top
          ══════════════════════════════════════════════════════════ */}
          <div className="hidden lg:flex items-end justify-center gap-4 xl:gap-5">

            {/* Career Navigator — outer left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.9 }}
              className="w-[19%] xl:w-[18%] mt-5"
            >
              <div className={cardBase} style={{ minHeight: "188px" }}>
                <h3 className="text-base font-bold gradient-text mb-1.5">Career Navigator</h3>
                <p className="text-sm text-white/70 mb-4 flex-1 leading-snug">Career guidance & mentorship</p>
                <a href="https://www.careernavigator4u.com" target="_blank" rel="noopener noreferrer">
                  <GlowButton className="w-full text-sm py-2.5">Explore →</GlowButton>
                </a>
              </div>
            </motion.div>

            {/* SigHyre — inner left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.95 }}
              className="w-[19%] xl:w-[18%] mt-5"
            >
              <div className={cardBase} style={{ minHeight: "188px" }}>
                <h3 className="text-base font-bold gradient-text mb-1.5">SigHyre</h3>
                <p className="text-sm text-white/70 mb-4 flex-1 leading-snug">AI-powered candidate ranking</p>
                <a href="/sig-hire">
                  <GlowButton className="w-full text-sm py-2.5">Explore →</GlowButton>
                </a>
              </div>
            </motion.div>

            {/* ZenHyre — center hero, tallest */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="w-[25%] flex-shrink-0"
            >
              <div className="glass rounded-2xl p-6 xl:p-7 border-2 border-[var(--color-violet-accent)] bg-gradient-to-br from-[var(--color-violet-accent)]/15 to-transparent text-center flex flex-col" style={{ minHeight: "228px" }}>
           
                <h3 className="text-2xl xl:text-3xl font-extrabold gradient-text mb-1">ZenHyre</h3>
                <p className="text-sm text-white/70 mb-5 flex-1">Elite Talent Network</p>
                <div className="flex gap-2 xl:gap-3">
                  <a
                    href="/sign-up?role=recruiter"
                    onClick={(e) => handleAuthClick(e, "/sign-up?role=recruiter")}
                    className="flex-1"
                  >
                    <GlowButton className="w-full text-sm xl:text-sm py-2.5">Hire Top 1%</GlowButton>
                  </a>
                  <a
                    href="/sign-up"
                    onClick={(e) => handleAuthClick(e, "/sign-up")}
                    className="flex-1"
                  >
                    <GlowButton className="w-full text-sm xl:text-sm py-2.5">Get Hired</GlowButton>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* ArenaX — inner right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.05 }}
              className="w-[19%] xl:w-[18%] mt-5"
            >
              <div className={cardBase} style={{ minHeight: "188px" }}>
                <h3 className="text-base font-bold gradient-text mb-1.5">ArenaX</h3>
                <p className="text-sm text-white/70 mb-4 flex-1 leading-snug">Coding & skill assessment</p>
                <a href="https://arena.novaretalent.com" target="_blank" rel="noopener noreferrer">
                  <GlowButton className="w-full text-sm py-2.5">Explore →</GlowButton>
                </a>
              </div>
            </motion.div>

            {/* IIT Placements — outer right */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1.1 }}
              className="w-[19%] xl:w-[18%] mt-5"
            >
              <div className={cardBase} style={{ minHeight: "188px" }}>
                <h3 className="text-base font-bold gradient-text mb-1.5">IIT Placements</h3>
                <p className="text-sm text-white/70 mb-4 flex-1 leading-snug">Placement data & insights</p>
                <Link href="/iit-placements">
                  <GlowButton className="w-full text-sm py-2.5">Explore →</GlowButton>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* See How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
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