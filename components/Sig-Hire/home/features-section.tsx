"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, EyeOff } from "lucide-react";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { Particles } from "@/components/ui/particles";
import SectionHeader from "@/components/landing/ui/SectionHeader";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — same palette as HowItWorks
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  // text
  text:      "rgba(255,255,255)",
  textMid:   "rgba(255,255,255,0.75)",
  textDim:   "#9b96b0",
  label:     "#9b96b0",

  // purple spectrum
  p100: "#c4b5fd",   // lightest
  p200: "#a78bfa",
  p300: "#818cf8",
  p400: "#6366f1",
  p500: "#4f46e5",   // deepest

  // glass surfaces
  surface:   "rgba(139,92,246,0.07)",
  surfaceHi: "rgba(139,92,246,0.13)",
  border:    "rgba(139,92,246,0.18)",
  borderHi:  "rgba(139,92,246,0.32)",
  row0:      "rgba(139,92,246,0.09)",
  rowAlt:    "rgba(0,0,0,0.20)",
  rowBase:   "rgba(0,0,0,0.14)",
  divider:   "rgba(255,255,255,0.04)",

  // glow
  glow:      "rgba(139,92,246,0.22)",
};

// ─────────────────────────────────────────────────────────────────────────────
// ILLUSTRATIONS
// ─────────────────────────────────────────────────────────────────────────────

/** Card 1 — AI Ranking Engine */
function RankingIllustration() {
  const rows = [
    { name: "Arjun M.", score: 94, color: T.p200, tag: "Top match"  },
    { name: "Priya S.", score: 87, color: T.p300, tag: "Strong fit" },
    { name: "Rohan D.", score: 71, color: T.p400, tag: "Review"     },
  ];

  return (
    <div className="mt-5 space-y-2.5">
    
      {/* Query bubble */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="flex items-center gap-2 px-3 py-2 rounded-sm"
        style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}` }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: T.p200 }} />
        <span className="text-[11px] truncate" style={{ color: "rgba(167,139,250,0.72)" }}>
          Find candidates with React + 3 yrs exp
        </span>
      </motion.div>

      {/* Candidate rows */}
      <div className="rounded-sm overflow-hidden" style={{ border: `1px solid rgba(139,92,246,0.12)` }}>
        {rows.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 + i * 0.1, duration: 0.35 }}
            className="flex items-center gap-2.5 px-3 py-2.5"
            style={{
              background: i === 0 ? T.row0 : T.rowAlt,
              borderBottom: i < rows.length - 1 ? `1px solid ${T.divider}` : "none",
            }}
          >
            <span className="shrink-0 tabular-nums" style={{ color: T.label, fontSize: 10, width: 12, textAlign: "center" }}>
              {i + 1}
            </span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: `${c.color}18`, color: c.color, border: `1px solid ${c.color}35` }}
            >
              {c.name[0]}
            </div>
            <span className="text-[12px] flex-1 min-w-0 truncate" style={{ color: T.textMid }}>
              {c.name}
            </span>
            <div className="h-1.5 rounded-full overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,0.05)", width: "clamp(48px,15%,80px)" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${c.score}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${c.color}, ${c.color}55)` }}
              />
            </div>
            <span className="text-[12px] font-semibold shrink-0 w-6 text-right" style={{ color: c.color }}>
              {c.score}
            </span>
            <span
              className="hidden sm:block text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: `${c.color}12`, color: c.color, border: `1px solid ${c.color}28` }}
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
    { label: "React / TS",     match: 96, color: T.p200 },
    { label: "Python",         match: 82, color: T.p300 },
    { label: "System Design",  match: 74, color: T.p400 },
    { label: "Leadership",     match: 58, color: T.p500 },
  ];

  return (
    <div className="mt-5 space-y-2.5">
      <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.label }}>
        Skill match
      </p>
      {skills.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28 + i * 0.08, duration: 0.35 }}
          className="flex items-center gap-2.5"
        >
          <span className="text-[11px] shrink-0" style={{ width: 90, color: T.textDim }}>{s.label}</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden min-w-0" style={{ background: "rgba(255,255,255,0.05)" }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${s.match}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.38 + i * 0.08, duration: 0.65, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${s.color}, ${s.color}60)` }}
            />
          </div>
          <span className="text-[11px] font-medium shrink-0 w-8 text-right" style={{ color: s.color }}>
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
    { label: "Work history verified", status: "ok"      as const, note: "4 companies confirmed"  },
    { label: "Employment gap",        status: "warn"    as const, note: "8 months unexplained"    },
    { label: "Skills confirmed",      status: "ok"      as const, note: "GitHub activity matches" },
    { label: "Reference check",       status: "pending" as const, note: "Awaiting response"       },
  ];
  // monochromatic status colors — bright / mid / dim purple
  const C = { ok: T.p200, warn: T.p100, pending: "rgba(139,92,246,0.35)" } as const;
  const BG = { ok: T.rowAlt, warn: T.surface, pending: T.rowBase } as const;
  const BD = { ok: T.divider, warn: T.border, pending: "rgba(255,255,255,0.04)" } as const;

  return (
    <div className="mt-5 space-y-1.5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 5 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28 + i * 0.09, duration: 0.35 }}
          className="flex items-start gap-2.5 px-3 py-2 rounded-sm"
          style={{ background: BG[item.status], border: `1px solid ${BD[item.status]}` }}
        >
          <div
            className="w-3 h-3 rounded-full mt-0.5 shrink-0"
            style={{ background: `${C[item.status]}22`, border: `1.5px solid ${C[item.status]}` }}
          />
          <div className="min-w-0">
            <p className="text-[12px] leading-tight" style={{ color: T.textMid }}>{item.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: `${C[item.status]}aa` }}>{item.note}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Card 4 — Bias Reduction */
function BiasIllustration() {
  const candidates = [
    { id: "Cand. A", score: 91, bars: [88, 94, 87] },
    { id: "Cand. B", score: 89, bars: [91, 86, 90] },
  ];
  const ignored  = ["Name / gender", "Photo", "University", "Age"];
  const included = ["Skill scores", "Work depth", "Role alignment"];

  return (
    <div className="mt-5 space-y-3">
      {/* Blind mode banner */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="flex items-center gap-2 px-3 py-2 rounded-sm"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <EyeOff className="w-3 h-3 shrink-0" style={{ color: T.p200 }} />
        <span className="text-[11px]" style={{ color: "rgba(167,139,250,0.75)" }}>
          Blind screening active — identifiers hidden
        </span>
      </motion.div>

      {/* Anonymous candidate panels */}
      <div className="grid grid-cols-2 gap-2">
        {candidates.map((c, ci) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + ci * 0.1, duration: 0.35 }}
            className="rounded-sm px-2.5 py-2.5 space-y-2"
            style={{ background: T.rowAlt, border: `1px solid rgba(255,255,255,0.05)` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full shrink-0" style={{ background: T.surface, border: `1px solid ${T.border}` }} />
              <div className="space-y-1 flex-1">
                <div className="h-1.5 rounded-full w-[70%]" style={{ background: "rgba(255,255,255,0.07)" }} />
                <div className="h-1   rounded-full w-[45%]" style={{ background: "rgba(255,255,255,0.04)" }} />
              </div>
            </div>
            {c.bars.map((val, bi) => (
              <div key={bi} className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${val}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + ci * 0.1 + bi * 0.06, duration: 0.55, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${T.p300}99, ${T.p300}40)` }}
                />
              </div>
            ))}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[9px]" style={{ color: T.label }}>{c.id}</span>
              <span className="text-[12px] font-bold" style={{ color: T.p200 }}>{c.score}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ignored vs evaluated */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: T.label }}>Ignored</p>
          <div className="space-y-1">
            {ignored.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.48 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-1.5"
              >
                <div className="w-2.5 h-2.5 rounded-sm shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.1)", border: `1px solid rgba(139,92,246,0.25)` }}>
                  <div className="w-1 h-px rounded-full" style={{ background: "rgba(139,92,246,0.55)" }} />
                </div>
                <span className="text-[10px]" style={{ color: T.textDim }}>{f}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: T.label }}>Evaluated</p>
          <div className="space-y-1">
            {included.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.48 + i * 0.06, duration: 0.3 }}
                className="flex items-center gap-1.5"
              >
                <CheckCircle className="w-2.5 h-2.5 shrink-0" style={{ color: T.p200 }} />
                <span className="text-[10px]" style={{ color: T.textMid }}>{f}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Card 5 — Comparative Insights */
function ComparativeIllustration() {
  const rows = [
    { attr: "Skills",      a: 94, b: 71 },
    { attr: "Experience",  a: 82, b: 90 },
    { attr: "Culture fit", a: 76, b: 81 },
    { attr: "Risk score",  a: 88, b: 65 },
  ];
  const colorA = T.p200;
  const colorB = T.p400;

  return (
    <div className="mt-5 space-y-2.5">
      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="flex items-center justify-between px-3 py-2 rounded-sm"
        style={{ background: "rgba(0,0,0,0.25)", border: `1px solid rgba(255,255,255,0.05)` }}
      >
        {[
          { label: "Arjun M.", color: colorA, score: 85 },
          { label: "Priya S.", color: colorB, score: 82 },
        ].map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            <span className="text-[11px]" style={{ color: T.textDim }}>{c.label}</span>
            <span className="text-[11px] font-semibold" style={{ color: c.color }}>{c.score}</span>
          </div>
        ))}
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-full"
          style={{ background: T.surface, color: T.label, border: `1px solid ${T.border}` }}
        >
          vs
        </span>
      </motion.div>

      {/* Comparison rows */}
      <div className="rounded-sm overflow-hidden" style={{ border: `1px solid rgba(255,255,255,0.05)` }}>
        {rows.map((row, i) => {
          const winner = row.a >= row.b ? "a" : "b";
          const delta  = Math.abs(row.a - row.b);
          return (
            <motion.div
              key={row.attr}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
              className="px-3 py-2.5"
              style={{
                background: i % 2 === 0 ? T.rowAlt : T.rowBase,
                borderBottom: i < rows.length - 1 ? `1px solid ${T.divider}` : "none",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px]" style={{ color: T.label }}>{row.attr}</span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: winner === "a" ? `${colorA}15` : `${colorB}15`,
                    color:      winner === "a" ? colorA : colorB,
                    border:     `1px solid ${winner === "a" ? colorA : colorB}30`,
                  }}
                >
                  +{delta}
                </span>
              </div>
              <div className="space-y-1">
                {[{ val: row.a, color: colorA }, { val: row.b, color: colorB }].map((bar, bi) => (
                  <div key={bi} className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.val}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + i * 0.08 + bi * 0.04, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: bar.color }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** Card 6 — Shareable Reports */
function ReportIllustration() {
  const circumference = 2 * Math.PI * 20;

  return (
    <div className="mt-5">
      <div className="rounded-sm overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
        {/* Header */}
        <div
          className="px-4 py-2.5 flex items-center justify-between gap-2"
          style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: T.p200 }} />
            <span className="text-[11px] truncate" style={{ color: T.textMid }}>
              candidate_report.pdf
            </span>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
            style={{ background: `${T.p200}18`, color: T.p200, border: `1px solid ${T.p200}30` }}
          >
            HIRE ✓
          </motion.span>
        </div>

        {/* Body */}
        <div className="px-4 py-3" style={{ background: "rgba(0,0,0,0.18)" }}>
          <div className="flex items-center gap-3 mb-3">
            {/* Score ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <motion.circle
                  cx="24" cy="24" r="20"
                  fill="none" stroke={T.p200} strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset: circumference * (1 - 0.94) }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55, duration: 1.1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold" style={{ color: T.p200 }}>94</span>
              </div>
            </div>
            {/* Name + tags */}
            <div>
              <p className="text-[12px] mb-1" style={{ color: T.textMid }}>Arjun M.</p>
              <div className="flex flex-wrap gap-1">
                {["React", "Python", "APIs"].map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ background: T.surface, color: T.p200, border: `1px solid ${T.border}` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton lines */}
          {[72, 55, 82].map((w, i) => (
            <motion.div
              key={i}
              initial={{ width: 0, opacity: 0 }}
              whileInView={{ width: `${w}%`, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.62 + i * 0.07, duration: 0.5 }}
              className="h-1 rounded-full mb-1.5"
              style={{ background: "rgba(139,92,246,0.12)" }}
            />
          ))}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px]" style={{ color: T.label }}>Generated just now</span>
            <button
              className="text-[10px] px-2.5 py-1 rounded-sm"
              style={{ background: T.surface, color: T.p200, border: `1px solid ${T.border}` }}
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
// BENTO CARD
// ─────────────────────────────────────────────────────────────────────────────

interface BentoCardProps {
  title: string;
  desc: string;
  colSpan: string;
  index: number;
  visual: React.ReactNode;
}

function BentoCard({ title, desc, colSpan, index, visual }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={`relative overflow-hidden rounded-sm ${colSpan}`}
      style={{
        background:    "rgba(255,255,255,0.022)",
        border:        "1px solid rgba(255,255,255,0.07)",
        backdropFilter:"blur(12px)",
        boxShadow:     "0 8px 32px rgba(124,58,237,0.08)",
      }}
    >
      {/* Top shimmer */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)" }}
      />
      {/* Corner glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(139,92,246,0.10) 0%, transparent 60%)" }}
      />
              {/* Particles effect */}
            <Particles
              className="absolute inset-0"
              quantity={10}
              ease={80}
              color="#fff"
              refresh
            />
      {/* Hover border */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-sm"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.35)" }}
      />

      <div className="relative z-10 p-6">
        <h3
          className="font-semibold leading-snug mb-1.5"
          style={{ fontSize: "15px", letterSpacing: "-0.015em", color: T.text }}
        >
          {title}
        </h3>
        <p className="text-sm" style={{ color: T.textDim }}>
          {desc}
        </p>
        {visual}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CARDS DATA — layout: 2+1 / 1+2 / 2+1  (lg: 3-col grid)
// ─────────────────────────────────────────────────────────────────────────────
//  lg row 1 : Card1(span-2) + Card2(span-1)   → 2 + 1
//  lg row 2 : Card3(span-1) + Card4(span-2)   → 1 + 2
//  lg row 3 : Card5(span-2) + Card6(span-1)   → 2 + 1
//
//  md row 1 : Card1(span-2) full
//  md row 2 : Card2(span-1) + Card3(span-1)
//  md row 3 : Card4(span-2) full
//  md row 4 : Card5(span-1) + Card6(span-1)
// ─────────────────────────────────────────────────────────────────────────────

const CARDS: Omit<BentoCardProps, "index">[] = [
  {
    title:   "AI Ranking Engine",
    desc:    "Automatically rank every candidate on skills, experience, and role alignment — with transparent scoring breakdowns.",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    visual:  <RankingIllustration />,
  },
  {
    title:   "Skill Fit Analysis",
    desc:    "Granular breakdowns of what each candidate brings vs. what your role demands — no more resume guesswork.",
    colSpan: "col-span-1",
    visual:  <SkillFitIllustration />,
  },
  {
    title:   "Risk Detection",
    desc:    "Surface employment gaps, inconsistencies, and red flags before they become expensive hiring mistakes.",
    colSpan: "col-span-1",
    visual:  <RiskIllustration />,
  },
  {
    title:   "Bias Reduction",
    desc:    "Standardized, criteria-based evaluation removes unconscious bias from every first-pass screening.",
    colSpan: "col-span-1 md:col-span-2 lg:col-span-2",
    visual:  <BiasIllustration />,
  },
  {
    title:   "Comparative Insights",
    desc:    "Side-by-side candidate comparisons with detailed score rationale so your whole team stays aligned.",
    colSpan: "col-span-1 md:col-span-1 lg:col-span-2",
    visual:  <ComparativeIllustration />,
  },
  {
    title:   "Shareable Reports",
    desc:    "Export clean, professional PDF reports for every evaluation — ready to share with hiring managers in one click.",
    colSpan: "col-span-1",
    visual:  <ReportIllustration />,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────────────────────

export function FeaturesSection() {
  return (
    <section className="relative py-16 md:py-28 px-4 sm:px-6 overflow-hidden" id="features">
      <GlowOrb className="-top-20 -left-20"    color="rgba(124,58,237,0.1)"  size="700px" parallaxIntensity={20} />
      <GlowOrb className="-bottom-20 -right-20" color="rgba(99,102,241,0.08)" size="600px" parallaxIntensity={15} parallaxInvert />

      <div className="max-w-5xl mx-auto">
        <SectionHeader
          // tag="Capabilities"
          title="Everything you need to shortlist"
          titleAccent="better candidates"
          description="Every feature is designed to turn resume chaos into confident, defensible hiring decisions."
        />

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CARDS.map((card, i) => (
            <BentoCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}