"use client";

import { motion } from "framer-motion";
import ThreeGrid from "@/components/landing/effects/ThreeGrid";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import GlowButton from "@/components/landing/ui/GlowButton";
import SocialProofBar from "./SocialProofBar";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background — 3D grid + parallax orbs */}
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

      {/* Content */}
      <div className="relative z-10 text-center section-padding pt-24 pb-2 max-w-5xl mx-auto">
        {/* Tag */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full text-xs font-mono tracking-[0.2em] uppercase text-[var(--color-lavender)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] mb-2"
        >
          India&apos;s Elite Talent Network
        </motion.span>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[1.05]"
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
          className="mt-6 text-lg md:text-xl text-white max-w-2xl mx-auto"
        >
          From thousands of candidates to the few who change outcomes.
          <br className="hidden md:block" />
          Curated talent from IITs, IIMs, and India&apos;s top institutes.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex flex-row flex-wrap items-stretch justify-center gap-3"
        >
          <GlowButton href="/sign-up?role=recruiter" className="text-base flex-1 min-w-[140px] max-w-[180px] h-12">
            Hire Top 1% Talent
          </GlowButton>
          <span className="text-[var(--color-lavender)] font-medium self-center">or</span>
          <GlowButton href="/sign-up" className="text-base flex-1 min-w-[140px] max-w-[180px] h-12 bg-transparent border border-[var(--color-glass-border)] hover:bg-white/5">
            Get Hired
          </GlowButton>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-6 text-center"
        >
          <GlowButton
            href="#how-it-works"
            className="px-6 py-3 rounded-full text-sm font-medium text-[var(--color-lavender)] hover:text-white transition-all duration-300"
            variant="secondary"
          >
            See How It Works
          </GlowButton>
        </motion.div>

      </div>


      {/* Scroll indicator */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-[var(--color-lavender)]" />
        </motion.div>
      </motion.div> */}

            <SocialProofBar />

      {/* Bottom fade overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-bg-primary to-transparent pointer-events-none" />

    </section>
  );
}
