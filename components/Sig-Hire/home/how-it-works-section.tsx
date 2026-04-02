"use client";

import { motion } from "framer-motion";
import { STEPS } from "./constants";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import GlowButton from "@/components/landing/ui/GlowButton";
import ParticleCanvas from "@/components/landing/effects/ParticleCanvas";
import { Sparkles } from "lucide-react";

/* ─── shared design tokens ─────────────────────────────────────────── */
const G = {
  bg:       "rgba(18,12,40,0.95)",
  panel:    "rgba(139,92,246,0.07)",
  panelBdr: "rgba(139,92,246,0.18)",
  panelHi:  "rgba(139,92,246,0.28)",
  pill:     "rgba(139,92,246,0.15)",
  pillBdr:  "rgba(139,92,246,0.35)",
  glow:     "rgba(139,92,246,0.22)",
  bar1:     "rgba(139,92,246,0.75)",
  bar2:     "rgba(99,102,241,0.65)",
  bar3:     "rgba(168,85,247,0.55)",
  dot:      "rgba(255,255,255,0.45)",
  text:     "rgba(255,255,255,0.85)",
  textDim:  "#9b96b0",
};

/* Scatter dot accents */
function Dots({ positions }: { positions: [string, string][] }) {
  return (
    <>
      {positions.map(([t, l], i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{ top: t, left: l, width: 2.5, height: 2.5, background: G.dot }}
        />
      ))}
    </>
  );
}

/* ─── ILLUSTRATION 1: Upload ────────────────────────────────────────
   Layered glass panels, floating document card, dashed drop-zone    */
const UploadIllustration = () => (
  <div className="relative w-full h-full">
    <Dots positions={[["7%","5%"],["10%","90%"],["85%","8%"],["88%","85%"],["48%","95%"]]} />

    {/* Back glass panel — browser mockup */}
    <div
      className="absolute rounded-sm overflow-hidden"
      style={{
        inset: "12% 8% auto 8%", height: "60%",
        background: "linear-gradient(140deg, rgba(139,92,246,0.13) 0%, rgba(25,12,55,0.55) 100%)",
        border: `1px solid ${G.panelBdr}`,
        boxShadow: `0 0 32px ${G.glow}`,
      }}
    >
      <div className="flex items-center gap-1.5 px-2.5 py-2" style={{ borderBottom: `1px solid ${G.panelBdr}` }}>
        {["#f87171","#fbbf24","#34d399"].map((c,i)=>
          <div key={i} className="rounded-full" style={{ width:8, height:8, background:c, opacity:0.65 }} />
        )}
        <div className="mx-3 h-2 rounded-sm flex-1 max-w-[60%]" style={{ background: G.pill, border:`1px solid ${G.pillBdr}` }} />
      </div>
      <div className="p-2.5 space-y-2">
        {[80,60,72,50].map((w,i)=>
          <div key={i} className="h-1.5 rounded-sm" style={{ width:`${w}%`, background: G.bar2, opacity: 0.38 - i*0.05 }} />
        )}
      </div>
    </div>

    {/* Floating document card */}
    <motion.div
      animate={{ y: [0,-7,0], rotate: [-1.5,1,-1.5] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className="absolute rounded-sm"
      style={{
        bottom: "10%", left: "6%", width: "34%", height: "37%",
        background: "linear-gradient(155deg, rgba(110,65,210,0.28) 0%, rgba(139,92,246,0.13) 100%)",
        border: `1px solid ${G.panelHi}`,
        backdropFilter: "blur(10px)",
        boxShadow: `0 8px 28px rgba(100,55,200,0.3)`,
      }}
    >
      <div className="p-2 space-y-1.5">
        <div className="w-[28%] aspect-square rounded-sm flex items-center justify-center mb-2"
          style={{ background:"rgba(139,92,246,0.35)", border:`1px solid ${G.pillBdr}` }}>
          <svg viewBox="0 0 20 20" fill="none" className="w-[70%] h-[70%]">
            <path d="M4 4h8l4 4v8H4V4z" stroke="rgba(210,185,255,0.85)" strokeWidth="1.5"/>
            <path d="M12 4v4h4" stroke="rgba(210,185,255,0.85)" strokeWidth="1.5"/>
          </svg>
        </div>
        {[70,55,80].map((w,i)=>
          <div key={i} className="rounded-sm h-1" style={{ width:`${w}%`, background: G.bar3, opacity: 0.55-i*0.12 }} />
        )}
      </div>
    </motion.div>

    {/* Dashed upload zone */}
    <motion.div
      animate={{ scale:[1,1.04,1], opacity:[0.8,1,0.8] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute rounded-sm flex flex-col items-center justify-center gap-1"
      style={{
        bottom: "8%", right: "5%", width: "37%", height: "37%",
        background: "linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(79,45,165,0.12) 100%)",
        border: `1.5px dashed ${G.panelHi}`,
        backdropFilter: "blur(6px)",
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" style={{ width:"30%", color:"rgba(190,160,255,0.9)" }} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <span style={{ fontSize:"0.42rem", color: G.text, letterSpacing:"0.06em" }}>DROP FILES</span>
    </motion.div>

    {/* Ambient glow */}
    <div className="absolute rounded-full pointer-events-none" style={{
      width:"55%", height:"55%", top:"22%", left:"22%",
      background:"radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)",
      filter:"blur(22px)",
    }}/>
  </div>
);

/* ─── ILLUSTRATION 2: AI Analysis ──────────────────────────────────
   Dashboard glass panel with animated score bars + floating chip    */
const AnalysisIllustration = () => (
  <div className="relative w-full h-full">
    <Dots positions={[["5%","5%"],["6%","91%"],["91%","6%"],["89%","89%"],["46%","97%"]]} />

    {/* Main glass card */}
    <div
      className="absolute rounded-sm overflow-hidden"
      style={{
        inset: "7% 7% 7% 7%",
        background:"linear-gradient(155deg, rgba(139,92,246,0.11) 0%, rgba(22,11,50,0.65) 100%)",
        border:`1px solid ${G.panelBdr}`,
        boxShadow:`0 0 40px ${G.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        backdropFilter:"blur(12px)",
      }}
    >
      {/* Chrome bar */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom:`1px solid ${G.panelBdr}` }}>
        <div className="flex gap-1">
          {["#f87171","#fbbf24","#34d399"].map((c,i)=>
            <div key={i} className="rounded-full" style={{ width:8, height:8, background:c, opacity:0.6 }} />
          )}
        </div>
        <div className="rounded-sm px-2 py-0.5" style={{ background:G.pill, border:`1px solid ${G.pillBdr}`, fontSize:"0.5rem", color:G.text }}>
          AI ANALYSIS
        </div>
        <motion.div
          animate={{ opacity:[0.4,1,0.4] }}
          transition={{ duration:1.6, repeat:Infinity }}
          className="rounded-full"
          style={{ width:6, height:6, background:"rgba(139,92,246,0.95)", boxShadow:"0 0 7px rgba(139,92,246,0.8)" }}
        />
      </div>

      {/* Score bars */}
      <div className="px-3 pt-3 space-y-2.5">
        {[
          { label:"Experience", pct:82, color:G.bar1 },
          { label:"Skills",     pct:91, color:G.bar2 },
          { label:"Culture Fit",pct:74, color:G.bar3 },
        ].map(({ label, pct, color }, i)=>(
          <div key={i} className="space-y-1">
            <div className="flex justify-between" style={{ fontSize:"0.5rem", color:G.text }}>
              <span>{label}</span>
              <span style={{ color:G.text }}>{pct}%</span>
            </div>
            <div className="rounded-sm overflow-hidden" style={{ height:5, background:"rgba(139,92,246,0.09)" }}>
              <motion.div
                initial={{ width:"8%" }}
                animate={{ width:`${pct}%` }}
                transition={{ duration:1.3, delay:i*0.2, repeat:Infinity, repeatDelay:2.8, ease:"easeOut" }}
                className="h-full rounded-sm"
                style={{ background:`linear-gradient(90deg, ${color}, rgba(210,170,255,0.55))` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Score chip */}
      <div className="absolute bottom-3 right-3 rounded-sm px-2 py-1 flex items-center gap-1.5"
        style={{ background:"rgba(139,92,246,0.22)", border:`1px solid ${G.pillBdr}`, backdropFilter:"blur(6px)" }}>
        <motion.div
          animate={{ scale:[1,1.25,1] }}
          transition={{ duration:1.6, repeat:Infinity }}
          className="rounded-full"
          style={{ width:5, height:5, background:"rgba(139,92,246,1)", boxShadow:"0 0 5px rgba(139,92,246,0.9)" }}
        />
        <span style={{ fontSize:"0.5rem", color:G.text, fontWeight:600 }}>MATCH 88</span>
      </div>
    </div>

    {/* Floating circular icon */}
  <motion.div
  animate={{ y:[-4,4,-4], x:[-2,2,-2] }}
  transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut" }}
  className="absolute flex items-center justify-center rounded-full"
  style={{
    width: "15%",
    aspectRatio: "1 / 1",
    top: "3%",
    right: "3%",
    background:"linear-gradient(135deg, rgba(139,92,246,0.48) 0%, rgba(79,50,170,0.32) 100%)",
    border:"1px solid rgba(185,150,255,0.42)",
    boxShadow:"0 4px 20px rgba(120,75,220,0.38), inset 0 1px 0 rgba(255,255,255,0.1)",
    backdropFilter:"blur(8px)",
  }}
>

  <Sparkles size={20} color="rgba(215,190,255,0.9)"/>


</motion.div>

    <div className="absolute rounded-full pointer-events-none" style={{
      width:"58%", height:"58%", top:"21%", left:"21%",
      background:"radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
      filter:"blur(24px)",
    }}/>
  </div>
);

/* ─── ILLUSTRATION 3: Ranking ───────────────────────────────────────
   Glass data table, animated slide-in rows, floating sort badge     */
const RankingIllustration = () => (
  <div className="relative w-full h-full">
    <Dots positions={[["5%","4%"],["5%","93%"],["92%","5%"],["91%","92%"],["50%","96%"]]} />

    {/* Table panel */}
    <div
      className="absolute rounded-sm overflow-hidden"
      style={{
        inset: "7% 7% 14% 7%",
        background:"linear-gradient(155deg, rgba(139,92,246,0.11) 0%, rgba(22,11,52,0.65) 100%)",
        border:`1px solid ${G.panelBdr}`,
        boxShadow:`0 0 36px ${G.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        backdropFilter:"blur(12px)",
      }}
    >
      {/* Column headers */}
      <div
        className="grid items-center px-3 py-1.5"
        style={{ gridTemplateColumns:"1.3fr 2.2fr 0.8fr", borderBottom:`1px solid ${G.panelBdr}` }}
      >
        {["Candidate","Score","Rank"].map(h=>
          <span key={h} style={{ fontSize:"0.5rem", color:G.textDim, textTransform:"uppercase", letterSpacing:"0.09em" }}>{h}</span>
        )}
      </div>

      {/* Rows */}
      {[
        { name:"Alex R.",   score:94, rank:1, alpha:0.9,  bgA:0.14, bdrA:0.38 },
        { name:"Priya M.",  score:87, rank:2, alpha:0.75, bgA:0.09, bdrA:0.25 },
        { name:"Sam K.",    score:79, rank:3, alpha:0.65, bgA:0.07, bdrA:0.20 },
        { name:"Jordan T.", score:71, rank:4, alpha:0.50, bgA:0.04, bdrA:0.14 },
      ].map(({ name, score, rank, alpha, bgA, bdrA }, i)=>(
        <motion.div
          key={i}
          initial={{ opacity:0, x:-14 }}
          animate={{ opacity:1, x:0 }}
          transition={{ delay:i*0.15, duration:0.4, repeat:Infinity, repeatDelay:3.2 }}
          className="grid items-center px-2 py-1.5 mx-1.5 my-1 rounded-sm"
          style={{
            gridTemplateColumns:"1.3fr 2.2fr 0.8fr",
            background:`rgba(139,92,246,${bgA})`,
            border:`1px solid rgba(139,92,246,${bdrA})`,
          }}
        >
          <span style={{ fontSize:"0.5rem", color:G.text }}>{name}</span>
          <div className="pr-2">
            <div className="rounded-sm overflow-hidden" style={{ height:4, background:"rgba(139,92,246,0.1)" }}>
              <div className="h-full rounded-sm"
                style={{ width:`${score}%`, background:`linear-gradient(90deg, rgba(139,92,246,${alpha}), rgba(200,160,255,0.35))` }} />
            </div>
          </div>

    <div
  className="flex items-center justify-center rounded-full"
  style={{
    width: "18px",
    height: "18px",
    background: `rgba(139,92,246,${bgA+0.08})`,
    border: `1px solid rgba(139,92,246,${bdrA})`,
  }}
>
  <span
    style={{
      fontSize: "0.36rem",
      color: `rgba(200,175,255,${alpha})`,
      fontWeight: 700,
      lineHeight: 1,
    }}
  >
    #{rank}
  </span>
</div>
        </motion.div>
      ))}
    </div>

    {/* Floating sort icon badge */}
<motion.div
  animate={{ y:[3,-4,3], rotate:[0,5,0] }}
  transition={{ duration:3.2, repeat:Infinity, ease:"easeInOut" }}
  className="absolute flex items-center justify-center rounded-full"
  style={{
    width: "15%",
    aspectRatio: "1 / 1",   // ✅ ensures perfect circle
    bottom: "5%",
    right: "5%",
    background:"linear-gradient(135deg, rgba(139,92,246,0.46) 0%, rgba(79,50,170,0.30) 100%)",
    border:"1.5px solid rgba(185,150,255,0.40)",
    boxShadow:"0 4px 20px rgba(120,75,220,0.38), inset 0 1px 0 rgba(255,255,255,0.1)",
    backdropFilter:"blur(8px)",
  }}
>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    style={{ width:"52%", color:"rgba(215,190,255,0.9)" }}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
    />
  </svg>
</motion.div>

    <div className="absolute rounded-full pointer-events-none" style={{
      width:"55%", height:"55%", top:"22%", left:"22%",
      background:"radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
      filter:"blur(20px)",
    }}/>
  </div>
);

/* ─── ILLUSTRATION 4: Hire ──────────────────────────────────────────
   Concentric orbital rings, animated check, floating HIRED badge    */
const HireIllustration = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    <Dots positions={[["7%","7%"],["7%","88%"],["88%","7%"],["88%","88%"],["50%","97%"],["3%","50%"]]} />

    {/* Outer static ring */}
    <div
      className="absolute rounded-full"
      style={{
        width: "80%",
        aspectRatio: "1 / 1",
        top: "10%",
        left: "10%",
        border: "1px solid rgba(139,92,246,0.12)",
      }}
    />

    {/* Rotating mid ring */}
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute rounded-full"
      style={{
        width: "64%",
        aspectRatio: "1 / 1",
        top: "18%",
        left: "18%",
        border: "1.5px solid rgba(139,92,246,0.22)",
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 65%)",
      }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: 5,
          height: 5,
          background: "rgba(139,92,246,0.85)",
          top: -2,
          left: "50%",
          transform: "translateX(-50%)",
          boxShadow: "0 0 7px rgba(139,92,246,0.9)",
        }}
      />
    </motion.div>

    {/* Core success circle */}
    <motion.div
      initial={{ scale: 0.55, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.55, repeat: Infinity, repeatDelay: 3 }}
      className="absolute flex items-center justify-center rounded-full"
      style={{
        width: "42%",
        aspectRatio: "1 / 1",
        top: "29%",
        left: "29%",
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.38) 0%, rgba(79,50,170,0.26) 100%)",
        border: "2px solid rgba(185,150,255,0.50)",
        boxShadow:
          "0 0 32px rgba(139,92,246,0.38), inset 0 1px 0 rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.svg
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.4,
          repeat: Infinity,
          repeatDelay: 3,
        }}
        viewBox="0 0 24 24"
        fill="none"
        style={{ width: "48%", color: "rgba(215,190,255,0.95)" }}
        stroke="currentColor"
      >
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d="M5 13l4 4L19 7"
        />
      </motion.svg>
    </motion.div>

    {/* HIRED badge */}
    <motion.div
      animate={{ y: [-5, 5, -5], x: [2, -2, 2] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="absolute rounded-sm px-2 py-1 flex items-center gap-1.5"
      style={{
        top: "7%",
        right: "7%",
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.32) 0%, rgba(79,50,170,0.22) 100%)",
        border: "1px solid rgba(185,150,255,0.42)",
        boxShadow: "0 4px 16px rgba(100,55,200,0.30)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: 5,
          height: 5,
          background: "rgba(139,92,246,1)",
          boxShadow: "0 0 5px rgba(139,92,246,0.9)",
        }}
      />
      <span
        style={{
          fontSize: "0.40rem",
          color: G.text,
          fontWeight: 700,
          letterSpacing: "0.10em",
        }}
      >
        HIRED
      </span>
    </motion.div>

    {/* Avatar badge */}
    <motion.div
      animate={{ y: [4, -4, 4], x: [-3, 3, -3] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute flex items-center justify-center rounded-full"
      style={{
        width: "18%",
        aspectRatio: "1 / 1",
        bottom: "8%",
        left: "8%",
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.40) 0%, rgba(79,50,170,0.28) 100%)",
        border: "1.5px solid rgba(185,150,255,0.38)",
        boxShadow: "0 4px 14px rgba(100,55,200,0.30)",
        backdropFilter: "blur(8px)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        style={{ width: "55%", color: "rgba(215,190,255,0.9)" }}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </motion.div>

    {/* Glow */}
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: "50%",
        aspectRatio: "1 / 1",
        top: "25%",
        left: "25%",
        background:
          "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
        filter: "blur(16px)",
      }}
    />
  </div>
);

const ILLUSTRATIONS = [
  <UploadIllustration   key="upload" />,
  <AnalysisIllustration key="analysis" />,
  <RankingIllustration  key="ranking" />,
  <HireIllustration     key="hire" />,
];

/* ─── SECTION ───────────────────────────────────────────────────────── */
export function HowItWorksSection() {
  return (
    <section className="relative py-6 sm:py-8 md:py-10 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 opacity-90"><ParticleCanvas /></div>
      <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        color="rgba(124,58,237,0.07)" size="900px" parallaxIntensity={20} />
      <div style={{ position:"absolute",top:0,left:0,right:0,height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)" }}/>
      <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"1px",
        background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent)" }}/>

      <div className="max-w-7xl mx-auto relative">

        {/* ── Mobile < md ── */}
        <div className="lg:hidden flex flex-col gap-5">
          <div className="flex items-center justify-center px-2">
            <SectionHeader title="How" titleAccent="Sighyre works"
              description="No complex setup. No training required. Upload and let Sighyre do the heavy lifting." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STEPS.map((step,i) => <StepCard key={i} {...step} index={i} />)}
          </div>
          <div className="flex flex-col items-center text-center gap-3 px-4 py-5 rounded-sm"
            style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <GlowButton className="text-sm">Powered by Novare Talent</GlowButton>
            <p className="max-w-xl text-xs sm:text-sm leading-relaxed opacity-70">
              Built on cutting-edge AI technology by Novare Talent, Sighyre transforms the way
              companies identify and hire top talent. Our intelligent platform combines recruitment
              expertise with advanced machine learning to deliver unmatched accuracy.
            </p>
          </div>
        </div>

        {/* ── Desktop ≥ md ── */}
        <div className="hidden lg:block">
          {/* Top row + header overlay */}
          <div className="relative mb-2">
            <div className="grid md:grid-cols-4 gap-1.5">
              {Array.from({ length:4 }).map((_,i) => <EmptyCard key={`t${i}`} />)}
            </div>
            <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
              <SectionHeader title="How" titleAccent="Sighyre works"
                description="No complex setup. No training required. Upload and let Sighyre do the heavy lifting." />
            </div>
          </div>
          {/* Step cards */}
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {STEPS.map((step,i) => <StepCard key={i} {...step} index={i} />)}
          </div>
          {/* Bottom row + powered-by overlay */}
          <div className="relative">
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length:4 }).map((_,i) => <EmptyCard key={`b${i}`} />)}
            </div>
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6">
              <GlowButton className="mb-4 text-base">Powered by Novare Talent</GlowButton>
              <p className="max-w-3xl text-sm md:text-base leading-relaxed opacity-75">
                Built on cutting-edge AI technology by Novare Talent, Sighyre transforms the way
                companies identify and hire top talent. Our intelligent platform combines years of
                recruitment expertise with advanced machine learning to deliver unmatched accuracy and efficiency.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─── EMPTY CARD ─────────────────────────────────────────────────── */
function EmptyCard() {
  return (
    <div className="aspect-square rounded-sm w-full"
      style={{ background:"rgba(255,255,255,0.006)", border:"1px solid rgba(255,255,255,0.03)" }}/>
  );
}

/* ─── STEP CARD ──────────────────────────────────────────────────── */
function StepCard({ title, index }: { title:string; desc:string; index:number }) {
  const stepNames = ["STEP-ONE","STEP-TWO","STEP-THREE","STEP-FOUR"];

  return (
    <motion.div
      initial={{ opacity:0, y:28 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ delay:index*0.13, duration:0.55, ease:[0.25,0.46,0.45,0.94] }}
      className="relative w-full aspect-square"
    >
      <div
        className="relative z-10 w-full h-full rounded-sm flex flex-col overflow-hidden"
        style={{
          background:"rgba(255,255,255,0.022)",
          border:"1px solid rgba(255,255,255,0.07)",
          backdropFilter:"blur(12px)",
          boxShadow:"0 8px 32px rgba(124,58,237,0.1)",
        }}
      >
        {/* Top shimmer line */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.55),transparent)" }}/>
        {/* Inner ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:"radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.09) 0%, transparent 65%)" }}/>

        {/* Text header */}
        <div className="px-3 pt-3 pb-1 shrink-0 relative z-10">
          <div className="text-[9px] sm:text-[10px] font-semibold tracking-widest mb-0.5"
            style={{ color:"rgba(255,255,255,0.75)" }}>
            {stepNames[index]}
          </div>
          <h3 className="text-white font-semibold text-[11px] sm:text-sm md:text-base leading-tight">
            {title}
          </h3>
        </div>

        {/* Illustration */}
        <div className="flex-1 min-h-0 p-2 relative z-10">
          {ILLUSTRATIONS[index]}
        </div>
      </div>
    </motion.div>
  );
}