"use client";

import { motion } from "framer-motion";
import { Brain, CheckCircle, AlertTriangle, Shield, BarChart3, FileText } from "lucide-react";
import { SectionLabel, SectionHeading, SectionSubheading } from "./section-ui";
import GlowOrb from "@/components/landing/effects/GlowOrb";

// ─── Mini UI: AI Ranking mock ───────────────────────────────────────────────
function RankingMockUI() {
  const candidates = [
    { name: "Arjun M.", score: 94, bar: "94%", color: "#a78bfa", tag: "Top match" },
    { name: "Priya S.", score: 87, bar: "87%", color: "#818cf8", tag: "Strong fit" },
    { name: "Rohan D.", score: 71, bar: "71%", color: "#6366f1", tag: "Review" },
  ];
  return (
    <div className="mt-5 rounded-xl p-4 flex flex-col gap-2.5" style={{
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(139,92,246,0.12)",
    }}>
      {candidates.map((c, i) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + i * 0.12, duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <span style={{ color: "rgba(148,163,184,0.4)", fontSize: "11px", fontVariantNumeric: "tabular-nums", width: 14 }}>
            {i + 1}
          </span>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
            style={{ background: `${c.color}20`, color: c.color, border: `1px solid ${c.color}40` }}>
            {c.name[0]}
          </div>
          <span className="text-[12px] text-white/70 shrink-0 w-16">{c.name}</span>
          <div className="flex-1 rounded-full overflow-hidden h-1.5" style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: c.bar }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }}
            />
          </div>
          <span className="text-[12px] font-semibold shrink-0" style={{ color: c.color }}>{c.score}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0" style={{
            background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30`
          }}>{c.tag}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Mini UI: Bias checklist ─────────────────────────────────────────────────
function BiasCheckUI() {
  const criteria = [
    { label: "Skills assessment", done: true },
    { label: "Experience depth", done: true },
    { label: "Role alignment score", done: true },
    { label: "Culture indicators", done: false },
  ];
  return (
    <div className="mt-5 rounded-xl p-4 flex flex-col gap-2" style={{
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(16,185,129,0.12)",
    }}>
      <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "rgba(148,163,184,0.4)" }}>Evaluation criteria</p>
      {criteria.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + i * 0.1, duration: 0.35 }}
          className="flex items-center gap-2.5"
        >
          <div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{
            background: c.done ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${c.done ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)"}`,
          }}>
            {c.done && <CheckCircle className="w-2.5 h-2.5" style={{ color: "#10b981" }} />}
          </div>
          <span className="text-[12px]" style={{ color: c.done ? "rgba(255,255,255,0.75)" : "rgba(148,163,184,0.35)" }}>
            {c.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Mini UI: Report preview ─────────────────────────────────────────────────
function ReportMockUI() {
  return (
    <div className="mt-5 rounded-xl p-4" style={{
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(14,165,233,0.12)",
    }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-2 w-24 rounded-full mb-1.5" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="h-1.5 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
        <div className="text-[10px] px-2 py-1 rounded-full" style={{
          background: "rgba(14,165,233,0.1)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.25)"
        }}>PDF</div>
      </div>
      {[75, 55, 85, 45].map((w, i) => (
        <div key={i} className="h-1 rounded-full mb-1.5" style={{
          background: "rgba(255,255,255,0.06)", width: `${w}%`
        }} />
      ))}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.35 }}
        className="mt-3 flex items-center justify-between"
      >
        <span className="text-[11px]" style={{ color: "rgba(148,163,184,0.4)" }}>hiring_report_q4.pdf</span>
        <button className="text-[11px] px-2.5 py-1 rounded-lg" style={{
          background: "rgba(14,165,233,0.1)", color: "#38bdf8", border: "1px solid rgba(14,165,233,0.25)"
        }}>Export →</button>
      </motion.div>
    </div>
  );
}

// ─── Card variants ───────────────────────────────────────────────────────────
type CardSize = "small" | "wide";

interface BentoCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
  accentColor: string;
  glowColor: string;
  size: CardSize;
  index: number;
  visual?: React.ReactNode;
}

function BentoCard({ icon, title, desc, gradient, accentColor, glowColor, size, index, visual }: BentoCardProps) {
  const isWide = size === "wide";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl overflow-hidden ${isWide ? "col-span-2" : "col-span-1"}`}
      style={{
        background: "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Gradient accent top-left */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at 0% 0%, ${glowColor} 0%, transparent 60%)`,
      }} />

      {/* Hover border glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ border: `1px solid ${accentColor}50` }}
      />

      <div className={`relative z-10 ${isWide ? "p-7" : "p-6"}`}>
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}35`,
            color: accentColor,
            boxShadow: `0 0 20px ${glowColor}`,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <h3
          className="text-white font-semibold mb-2"
          style={{ fontSize: isWide ? "18px" : "15px", letterSpacing: "-0.015em" }}
        >
          {title}
        </h3>
        <p style={{ color: "rgba(148,163,184,0.55)", fontSize: "13.5px", lineHeight: "1.65", maxWidth: isWide ? "380px" : "unset" }}>
          {desc}
        </p>

        {/* Embedded visual for wide cards */}
        {isWide && visual && visual}
      </div>
    </motion.div>
  );
}

// ─── Bento grid data ─────────────────────────────────────────────────────────
const BENTO_ITEMS: Omit<BentoCardProps, "index">[] = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "AI Ranking Engine",
    desc: "Automatically rank every candidate on skills, experience depth, and role alignment — with transparent scoring breakdowns.",
    gradient: "from-violet-500/20 to-purple-600/10",
    accentColor: "#a78bfa",
    glowColor: "rgba(139,92,246,0.12)",
    size: "wide",
    visual: <RankingMockUI />,
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Skill Fit Analysis",
    desc: "Granular breakdowns of what each candidate brings vs. what your role demands — no more resume guesswork.",
    gradient: "from-indigo-500/20 to-blue-600/10",
    accentColor: "#818cf8",
    glowColor: "rgba(99,102,241,0.12)",
    size: "small",
  },
  {
    icon: <AlertTriangle className="w-5 h-5" />,
    title: "Risk Detection",
    desc: "Surface employment gaps, inconsistencies, and red flags before they become expensive hiring mistakes.",
    gradient: "from-amber-500/20 to-orange-600/10",
    accentColor: "#fbbf24",
    glowColor: "rgba(245,158,11,0.12)",
    size: "small",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Bias Reduction",
    desc: "Standardized, criteria-based evaluation removes unconscious bias from every first-pass screening.",
    gradient: "from-emerald-500/20 to-teal-600/10",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.12)",
    size: "wide",
    visual: <BiasCheckUI />,
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Comparative Insights",
    desc: "Side-by-side candidate comparisons with detailed score rationale so your team stays aligned.",
    gradient: "from-pink-500/20 to-rose-600/10",
    accentColor: "#f472b6",
    glowColor: "rgba(236,72,153,0.12)",
    size: "small",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Shareable Reports",
    desc: "Export clean, professional reports for every session — easy to share with hiring managers or stakeholders.",
    gradient: "from-sky-500/20 to-cyan-600/10",
    accentColor: "#38bdf8",
    glowColor: "rgba(14,165,233,0.12)",
    size: "wide",
    visual: <ReportMockUI />,
  },
];

// ─── Section ─────────────────────────────────────────────────────────────────
export function FeaturesSection() {
  return (
    <section className="relative py-28 px-6">
      <GlowOrb className="-top-20 -left-20" color="rgba(124,58,237,0.1)" size="700px" parallaxIntensity={20} />
      <GlowOrb className="-bottom-20 -right-20" color="rgba(99,102,241,0.08)" size="600px" parallaxIntensity={15} parallaxInvert />

      <div className="max-w-5xl mx-auto">
        <SectionLabel>Capabilities</SectionLabel>
        <SectionHeading>
          Everything you need to shortlist{" "}
          <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            better candidates
          </span>
        </SectionHeading>
        <SectionSubheading>
          Every feature is designed to turn resume chaos into confident, defensible hiring decisions.
        </SectionSubheading>

        {/* Bento grid */}
        <div className="grid grid-cols-3 gap-4 mt-14">
          {BENTO_ITEMS.map((item, i) => (
            <BentoCard key={item.title} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
