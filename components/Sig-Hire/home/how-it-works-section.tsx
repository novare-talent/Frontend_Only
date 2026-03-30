"use client";

import { motion } from "framer-motion";
import { STEPS } from "./constants";
import { SectionLabel, SectionHeading, SectionSubheading } from "./section-ui";
import GlowOrb from "@/components/landing/effects/GlowOrb";

export function HowItWorksSection() {
  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "rgba(124,58,237,0.025)" }}>
      <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="rgba(124,58,237,0.07)" size="900px" parallaxIntensity={20} />

      {/* Top / bottom border lines */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />

      <div className="max-w-5xl mx-auto">
        <SectionLabel>Process</SectionLabel>
        <SectionHeading>
          How{" "}
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Sighyre works
          </span>
        </SectionHeading>
        <SectionSubheading>
          No complex setup. No training required. Upload and let Sighyre do the heavy lifting.
        </SectionSubheading>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute" style={{
            top: "54px",
            left: "calc(12.5% + 28px)",
            right: "calc(12.5% + 28px)",
            height: "1px",
            background: "linear-gradient(90deg, rgba(124,58,237,0.35), rgba(99,102,241,0.2), rgba(124,58,237,0.35))",
            zIndex: 0,
          }} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            {STEPS.map((step, i) => (
              <StepCard key={i} {...step} index={i} total={STEPS.length} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCard({ number, icon, title, desc, index, total }: {
  number: string; icon: React.ReactNode; title: string; desc: string; index: number; total: number;
}) {
  const isLast = index === total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.13, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center text-center relative"
    >
      {/* Large faded step number — decorative background */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 select-none pointer-events-none syne font-black"
        style={{
          fontSize: "88px",
          lineHeight: 1,
          color: "rgba(124,58,237,0.07)",
          letterSpacing: "-0.04em",
          zIndex: 0,
        }}>
        {number}
      </div>

      {/* Icon circle */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.2 }}
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-5 z-10"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(99,102,241,0.1))",
          border: "1px solid rgba(124,58,237,0.28)",
          boxShadow: "0 0 28px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ color: "#a78bfa" }}>{icon}</div>

        {/* Step badge */}
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{ background: "rgba(124,58,237,0.9)", color: "#fff", border: "1px solid rgba(139,92,246,0.5)", boxShadow: "0 0 10px rgba(124,58,237,0.4)" }}>
          {index + 1}
        </span>

        {/* Arrow connector (between steps, desktop) */}
        {!isLast && (
          <div className="hidden md:flex absolute -right-[calc(50%+12px)] top-1/2 -translate-y-1/2 items-center"
            style={{ width: "calc(100% + 24px - 14px)", pointerEvents: "none", zIndex: 20 }}>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.13 + 0.3, duration: 0.4 }}
              style={{ transformOrigin: "left" }}
              className="flex items-center gap-0.5"
            >
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <path d="M1 5h13M10 1l4 4-4 4" stroke="rgba(139,92,246,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Glass card body */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full rounded-2xl px-4 py-4"
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Subtle top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent)" }} />

        <h3 className="text-white font-semibold mb-1.5" style={{ fontSize: "15px", letterSpacing: "-0.015em" }}>
          {title}
        </h3>
        <p style={{ color: "rgba(148,163,184,0.5)", fontSize: "13px", lineHeight: "1.65" }}>
          {desc}
        </p>
      </motion.div>
    </motion.div>
  );
}
