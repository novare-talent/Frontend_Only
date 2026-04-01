"use client";

import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
} from "lucide-react";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import SectionHeader from "@/components/landing/ui/SectionHeader";

// ─────────────────────────────────────────────────────────────────────────────
// ILLUSTRATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Card 1 — AI Ranking Engine */
function RankingIllustration() {
  const candidates = [
    { name: "Arjun M.", score: 94, pct: "94%", color: "#a78bfa", tag: "Top match" },
    { name: "Priya S.", score: 87, pct: "87%", color: "#818cf8", tag: "Strong fit" },
    { name: "Rohan D.", score: 71, pct: "71%", color: "#6366f1", tag: "Review" },
  ];

  return (
    <div className="mt-5 space-y-2.5">
      {/* Ranking bot query bubble */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(139,92,246,0.18)" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style={{ background: "#a78bfa" }}
        />
        <span
          className="text-[11px] truncate"
          style={{ color: "rgba(167,139,250,0.72)" }}
        >
          Find candidates with React + 3 yrs exp
        </span>
      </motion.div>

      {/* Candidate rows */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(139,92,246,0.1)" }}
      >
        {candidates.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.44 + i * 0.1, duration: 0.4 }}
            className="flex items-center gap-2.5 px-3 py-2.5"
            style={{
              background: i === 0 ? "rgba(139,92,246,0.09)" : "rgba(0,0,0,0.2)",
              borderBottom: i < candidates.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            {/* Rank */}
            <span
              className="shrink-0 tabular-nums"
              style={{ color: "rgba(148,163,184,0.35)", fontSize: "10px", width: 12, textAlign: "center" }}
            >
              {i + 1}
            </span>

            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}35` }}
            >
              {c.name[0]}
            </div>

            {/* Name */}
            <span className="text-[12px] text-white/65 flex-1 min-w-0 truncate">{c.name}</span>

            {/* Progress bar */}
            <div
              className="h-1.5 rounded-full overflow-hidden shrink-0"
              style={{ background: "rgba(255,255,255,0.05)", width: "clamp(48px, 15%, 80px)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: c.pct }}
                viewport={{ once: true }}
                transition={{ delay: 0.54 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}66)` }}
              />
            </div>

            {/* Score */}
            <span
              className="text-[12px] font-semibold shrink-0 w-6 text-right"
              style={{ color: c.color }}
            >
              {c.score}
            </span>

            {/* Tag — hidden on very small screens */}
            <span
              className="hidden sm:block text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}25` }}
            >
              {c.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Card 2 — Skill Fit Analysis */
function SkillFitIllustration() {
  const skills = [
    { label: "React",         match: 96, color: "#818cf8" },
    { label: "Python",        match: 82, color: "#a78bfa" },
    { label: "System Design", match: 74, color: "#6366f1" },
    { label: "Leadership",    match: 58, color: "#8b5cf6" },
  ];

  return (
    <div className="mt-5 space-y-2.5">
      <p
        className="text-[10px] uppercase tracking-widest mb-3"
        style={{ color: "rgba(148,163,184,0.35)" }}
      >
        Skill match
      </p>

      {skills.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
          className="flex items-center gap-2.5"
        >
          <span
            className="text-[11px] text-white/45 shrink-0"
            style={{ width: "88px" }}
          >
            {s.label}
          </span>

          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden min-w-0"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${s.match}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.65, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}70)` }}
            />
          </div>

          <span
            className="text-[11px] font-medium shrink-0 w-8 text-right"
            style={{ color: s.color }}
          >
            {s.match}%
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/** Card 3 — Risk Detection */
function RiskIllustration() {
  const items = [
    { label: "Work history verified", status: "ok"      as const, note: "4 companies confirmed"   },
    { label: "Employment gap",        status: "warn"    as const, note: "8 months unexplained"     },
    { label: "Skills confirmed",      status: "ok"      as const, note: "GitHub activity matches"  },
    { label: "Reference check",       status: "pending" as const, note: "Awaiting response"        },
  ];
  const colors = { ok: "#10b981", warn: "#f59e0b", pending: "rgba(148,163,184,0.4)" } as const;

  return (
    <div className="mt-5 space-y-1.5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.09, duration: 0.35 }}
          className="flex items-start gap-2.5 px-3 py-2 rounded-lg"
          style={{
            background: item.status === "warn" ? "rgba(245,158,11,0.06)" : "rgba(0,0,0,0.18)",
            border: `1px solid ${item.status === "warn" ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.04)"}`,
          }}
        >
          <div
            className="w-3 h-3 rounded-full mt-0.5 shrink-0"
            style={{
              background: `${colors[item.status]}22`,
              border: `1.5px solid ${colors[item.status]}`,
            }}
          />
          <div className="min-w-0">
            <p className="text-[12px] text-white/60 leading-tight">{item.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: `${colors[item.status]}aa` }}>
              {item.note}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Card 4 — Bias Reduction */
function BiasIllustration() {
  const criteria = [
    { label: "Skills assessment",  done: true  },
    { label: "Experience depth",   done: true  },
    { label: "Role alignment",     done: true  },
    { label: "Culture indicators", done: false },
  ];

  return (
    <div className="mt-5">
      {/* Balance visual */}
      <div className="flex items-end justify-center gap-8 mb-5">
        {[
          { label: "Candidate A", score: 87 },
          { label: "Candidate B", score: 85 },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[22px] font-bold" style={{ color: "#10b981" }}>
              {c.score}
            </span>
            <div
              className="w-16 h-7 rounded-lg"
              style={{
                background: "rgba(16,185,129,0.07)",
                border: "1px solid rgba(16,185,129,0.18)",
              }}
            />
            <span className="text-[9px] text-white/28">{c.label}</span>
          </motion.div>
        ))}

        {/* Divider */}
        <div className="flex flex-col items-center gap-0.5 pb-2">
          <div className="w-px h-10" style={{ background: "rgba(16,185,129,0.22)" }} />
          <span style={{ color: "rgba(16,185,129,0.45)", fontSize: "15px" }}>⚖</span>
        </div>
      </div>

      {/* Criteria list */}
      <p
        className="text-[10px] uppercase tracking-widest mb-2"
        style={{ color: "rgba(148,163,184,0.35)" }}
      >
        Evaluation criteria
      </p>
      <div className="space-y-1.5">
        {criteria.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + i * 0.09, duration: 0.35 }}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-4 h-4 rounded flex items-center justify-center shrink-0"
              style={{
                background: c.done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${c.done ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              {c.done && (
                <CheckCircle className="w-2.5 h-2.5" style={{ color: "#10b981" }} />
              )}
            </div>
            <span
              className="text-[12px]"
              style={{ color: c.done ? "rgba(255,255,255,0.65)" : "rgba(148,163,184,0.28)" }}
            >
              {c.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Card 5 — Comparative Insights */
function ComparativeIllustration() {
  const attrs = ["Skills", "Experience", "Culture", "Risk"];
  const scoreA = [94, 82, 76, 88];
  const scoreB = [71, 90, 81, 65];

  return (
    <div className="mt-5">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3.5">
        {[
          { name: "Arjun M.", color: "#f472b6", score: 94 },
          { name: "Priya S.", color: "#818cf8", score: 87 },
        ].map((c) => (
          <div key={c.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
            <span className="text-[11px] text-white/45">{c.name}</span>
            <span className="text-[11px] font-semibold" style={{ color: c.color }}>
              {c.score}
            </span>
          </div>
        ))}
      </div>

      {/* Attribute bars */}
      <div className="space-y-3">
        {attrs.map((attr, i) => (
          <motion.div
            key={attr}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
            className="space-y-1"
          >
            <span className="text-[10px] text-white/28">{attr}</span>
            <div className="flex flex-col gap-1">
              {[
                { val: scoreA[i], color: "#f472b6" },
                { val: scoreB[i], color: "#818cf8" },
              ].map((bar, bi) => (
                <div
                  key={bi}
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${bar.val}%` }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.4 + i * 0.07 + bi * 0.04,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{ background: bar.color }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Card 6 — Shareable Reports */
function ReportIllustration() {
  const circumference = 2 * Math.PI * 20;

  return (
    <div className="mt-5">
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(14,165,233,0.15)" }}
      >
        {/* Header */}
        <div
          className="px-4 py-2.5 flex items-center justify-between gap-2"
          style={{
            background: "rgba(14,165,233,0.06)",
            borderBottom: "1px solid rgba(14,165,233,0.1)",
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: "#38bdf8" }} />
            <span className="text-[11px] text-white/50 truncate">
              hiring_report_arjun.pdf
            </span>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={{
              background: "rgba(16,185,129,0.15)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            HIRE
          </motion.span>
        </div>

        {/* Body */}
        <div className="px-4 py-3" style={{ background: "rgba(0,0,0,0.18)" }}>
          <div className="flex items-center gap-3 mb-3">
            {/* Radial score ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="24" cy="24" r="20"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset: circumference * (1 - 0.87) }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 1.1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold" style={{ color: "#38bdf8" }}>87</span>
              </div>
            </div>

            {/* Candidate summary */}
            <div>
              <p className="text-[12px] text-white/60">Arjun M.</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {["React", "Python", "API"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "rgba(14,165,233,0.09)",
                      color: "#38bdf8",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton text lines */}
          {[75, 55, 85].map((w, i) => (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: `${w}%`, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.68 + i * 0.07, duration: 0.5 }}
              className="h-1 rounded-full mb-1.5"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
          ))}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px]" style={{ color: "rgba(148,163,184,0.3)" }}>
              Generated just now
            </span>
            <button
              className="text-[10px] px-2.5 py-1 rounded-lg"
              style={{
                background: "rgba(14,165,233,0.1)",
                color: "#38bdf8",
                border: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              Share →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface BentoCardProps {
  title: string;
  desc: string;
  accentColor: string;
  glowColor: string;
  /** Responsive Tailwind col-span classes e.g. "col-span-1 md:col-span-2 lg:col-span-2" */
  colSpan: string;
  index: number;
  visual: React.ReactNode;
}

function BentoCard({
  title,
  desc,
  accentColor,
  glowColor,
  colSpan,
  index,
  visual,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.07,
        duration: 0.55,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={`relative overflow-hidden rounded-sm ${colSpan}`}
      style={{
        background: "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Corner radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 0% 0%, ${glowColor} 0%, transparent 65%)`,
        }}
      />

      {/* Hover border inset glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-sm"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ boxShadow: `inset 0 0 0 1px ${accentColor}40` }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">


        <h3
          className="font-semibold text-white mb-1.5 leading-snug"
          style={{ fontSize: "15px", letterSpacing: "-0.015em" }}
        >
          {title}
        </h3>

        <p style={{ color: "rgba(148,163,184,0.55)", fontSize: "13px", lineHeight: "1.65" }}>
          {desc}
        </p>

        {visual}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
//
// Grid layout per breakpoint:
//   mobile  (1-col): all cards stack full-width
//   tablet  (2-col): [Card1(2)] / [Card2(1)+Card3(1)] / [Card4(1)+Card5(1)] / [Card6(2)]
//   desktop (3-col): [Card1(2)+Card2(1)] / [Card3(1)+Card4(2)] / [Card5(1)+Card6(2)]
// ─────────────────────────────────────────────────────────────────────────────

const CARDS: Omit<BentoCardProps, "index">[] = [
  {
    title: "AI Ranking Engine",
    desc: "Automatically rank every candidate on skills, experience, and role alignment — with transparent scoring breakdowns.",
    accentColor: "#a78bfa",
    glowColor: "rgba(139,92,246,0.13)",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    visual: <RankingIllustration />,
  },
  {
    title: "Skill Fit Analysis",
    desc: "Granular breakdowns of what each candidate brings vs. what your role demands — no more resume guesswork.",
    accentColor: "#818cf8",
    glowColor: "rgba(99,102,241,0.13)",
    colSpan: "col-span-1",
    visual: <SkillFitIllustration />,
  },
  {
    title: "Risk Detection",
    desc: "Surface employment gaps, inconsistencies, and red flags before they become expensive hiring mistakes.",
    accentColor: "#fbbf24",
    glowColor: "rgba(245,158,11,0.12)",
    colSpan: "col-span-1",
    visual: <RiskIllustration />,
  },
  {
    title: "Bias Reduction",
    desc: "Standardized, criteria-based evaluation removes unconscious bias from every first-pass screening.",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.12)",
    colSpan: "col-span-1 lg:col-span-2",
    visual: <BiasIllustration />,
  },
  {
    title: "Comparative Insights",
    desc: "Side-by-side candidate comparisons with detailed score rationale so your whole team stays aligned.",
    accentColor: "#f472b6",
    glowColor: "rgba(236,72,153,0.12)",
    colSpan: "col-span-1",
    visual: <ComparativeIllustration />,
  },
  {
    title: "Shareable Reports",
    desc: "Export clean, professional PDF reports for every evaluation — ready to share with hiring managers in one click.",
    accentColor: "#38bdf8",
    glowColor: "rgba(14,165,233,0.12)",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    visual: <ReportIllustration />,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────────────────────

export function FeaturesSection() {
  return (
    <section className="relative py-16 md:py-28 px-4 sm:px-6">
      <GlowOrb
        className="-top-20 -left-20"
        color="rgba(124,58,237,0.1)"
        size="700px"
        parallaxIntensity={20}
      />
      <GlowOrb
        className="-bottom-20 -right-20"
        color="rgba(99,102,241,0.08)"
        size="600px"
        parallaxIntensity={15}
        parallaxInvert
      />

      <div className="max-w-5xl mx-auto">
        <SectionHeader
          tag="Capabilities"
          title="Everything you need to shortlist"
          titleAccent="better candidates"
          description="Every feature is designed to turn resume chaos into confident, defensible hiring decisions."
        />

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {CARDS.map((card, i) => (
            <BentoCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
