"use client";

import { motion } from "framer-motion";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex justify-center mb-4"
    >
      <span className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] uppercase px-4 py-1.5 rounded-full" style={{
        background: "rgba(124,58,237,0.08)",
        border: "1px solid rgba(124,58,237,0.2)",
        color: "#a78bfa",
      }}>
        {children}
      </span>
    </motion.div>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="syne text-center text-white mb-4"
      style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: "1.15" }}
    >
      {children}
    </motion.h2>
  );
}

export function SectionSubheading({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="text-center mx-auto"
      style={{ color: "rgba(148,163,184,0.6)", fontSize: "17px", lineHeight: "1.6", maxWidth: "560px" }}
    >
      {children}
    </motion.p>
  );
}
