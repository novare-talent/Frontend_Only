"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import AnimatedCounter from "@/components/landing/ui/AnimatedCounter";
import GlowOrb from "@/components/landing/effects/GlowOrb";

const DOTS_COUNT = 1000;

const PROOF_STATS = [
  { value: 4.2, suffix: " Days", label: "Avg. time to shortlist" },
  { value: 94, suffix: "%", label: "Retention at 12 months" },
  { value: 100, suffix: "%", label: "Referral-only network" },
];

export default function WhyTheOnePercent() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const dotsOpacity = useTransform(scrollYProgress, [0.2, 0.6], [1, 0]);
  const glowScale = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const statsOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);

  return (
    <section ref={sectionRef} className="py-16 md:py-12 relative overflow-hidden" id="about">
      <GlowOrb
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        color="rgba(124, 58, 237, 0.06)"
        size="900px"
        parallaxIntensity={20}
      />

      <div className="section-padding relative z-10">
        <SectionHeader
          // tag="Why Novare"
          title="From thousands, we find"
          titleAccent="the few."
          description="Most platforms give you volume. We give you precision."
        />

        {/* Dot Grid Animation */}
        <div className="relative h-64 md:h-80 flex items-center justify-center my-12">
          {/* Fading dots */}
          <motion.div
            style={{ opacity: dotsOpacity }}
            className="grid grid-cols-25 md:grid-cols-50 gap-2 md:gap-3"
          >
            {Array.from({ length: DOTS_COUNT }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-white/10"
              />
            ))}
          </motion.div>

          {/* Remaining glowing dots */}
          <motion.div
            style={{ scale: glowScale, opacity: glowScale }}
            className="absolute inset-0 flex items-center justify-center gap-6"
          >
            <div className="w-4 h-4 rounded-full bg-[var(--color-violet-accent)] shadow-[0_0_20px_var(--color-violet-accent),0_0_40px_var(--color-violet-accent)]" />
            <div className="w-4 h-4 rounded-full bg-[var(--color-indigo-accent)] shadow-[0_0_20px_var(--color-indigo-accent),0_0_40px_var(--color-indigo-accent)]" />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          style={{ opacity: statsOpacity }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {PROOF_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">
                <AnimatedCounter
                  value={Math.floor(stat.value)}
                  suffix={stat.suffix}
                />
              </div>
              <div className="text-sm text-white mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
