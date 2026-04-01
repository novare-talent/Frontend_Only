"use client";

import { motion } from "framer-motion";
import { STEPS } from "./constants";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import GlowButton from "@/components/landing/ui/GlowButton";
import ParticleCanvas from "@/components/landing/effects/ParticleCanvas";

export function HowItWorksSection() {
  return (
    <section className="relative py-16 md:py-28 px-4 sm:px-6 overflow-hidden" >
            <div className="absolute inset-0 opacity-90">
              <ParticleCanvas />
            </div>
      <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="rgba(124,58,237,0.07)" size="900px" parallaxIntensity={20} />

      {/* Top / bottom border lines */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto relative">
        {/* Background Grid */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Top row of empty cards with header overlay */}
            <div className="relative mb-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 relative z-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <EmptyCard key={`top-${i}`} />
                ))}
              </div>
              {/* Header Section - positioned over the top empty cards */}
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <SectionHeader
                  tag="Process"
                  title="How"
                  titleAccent="Sighyre works"
                  description="No complex setup. No training required. Upload and let Sighyre do the heavy lifting."
                />
              </div>
            </div>
            {/* Middle row with step cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-1 relative z-0 mb-3">
              {STEPS.map((step, i) => (
                <StepCard key={i} {...step} index={i} />
              ))}
            </div>
            
            {/* Bottom row of empty cards with powered by overlay */}
            <div className="relative mb-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 relative z-0">
                {Array.from({ length: 4 }).map((_, i) => (
                  <EmptyCard key={`bottom-${i}`} />
                ))}
              </div>
              {/* Powered by section - positioned over the bottom empty cards */}
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6">
                <GlowButton variant="primary" className="mb-4">
                  Powered by Novare Talent
                </GlowButton>
                <p className="max-w-2xl" style={{ color: "rgba(148,163,184,0.8)", fontSize: "14px", lineHeight: "1.6" }}>
                  Built on cutting-edge AI technology by Novare Talent, Sighyre transforms the way companies identify and hire top talent. 
                  Our intelligent platform combines years of recruitment expertise with advanced machine learning to deliver unmatched accuracy and efficiency.
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}

function EmptyCard() {
  return (
    <div
      className="md:aspect-square rounded-xl min-h-[100px] md:min-h-[275px]"
      style={{
        background: "rgba(255,255,255,0.008)",
        border: "1px solid rgba(255,255,255,0.03)",
        // backdropFilter: "blur(4px)",
      }}
    />
  );
}

function StepCard({ title, desc, index }: {
  title: string; desc: string; index: number;
}) {
  const stepNames = ["STEP-ONE", "STEP-TWO", "STEP-THREE", "STEP-FOUR"]

  const illustrations = [
    // Upload illustration - Drag & Drop UI
    <div key="upload" className="relative w-24 h-24">
      {/* Document being dragged */}
      <motion.div 
        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-2 left-2 w-10 h-12 rounded-sm bg-white shadow-lg z-10"
        style={{ background: "linear-gradient(180deg, #fff 0%, #f8f9fa 100%)", border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="p-1.5 space-y-1">
          <div className="h-1 bg-gray-300 rounded-sm w-6" />
          <div className="h-1 bg-gray-300 rounded-sm w-5" />
          <div className="h-1 bg-gray-300 rounded-sm w-7" />
        </div>
      </motion.div>
      {/* Cursor */}
      <motion.div
        animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 z-20"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>
          <path d="M0 0L0 11L3 8L5 13L7 12L5 7L9 7L0 0Z" />
        </svg>
      </motion.div>
      {/* Drop zone */}
      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center" style={{ borderColor: "rgba(139,92,246,0.5)", background: "rgba(139,92,246,0.1)" }}>
        <svg className="w-6 h-6" style={{ color: "rgba(139,92,246,0.7)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
    </div>,
    
    // AI Analysis illustration - Processing UI
    <div key="analysis" className="relative w-24 h-24">
      {/* Browser/App window */}
      <div className="absolute inset-0 rounded-lg overflow-hidden" style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Window header */}
        <div className="h-4 flex items-center px-2 gap-1" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>
        {/* Content area */}
        <div className="p-2 space-y-1.5">
          <motion.div 
            animate={{ width: ["40%", "80%", "40%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 rounded"
            style={{ background: "rgba(139,92,246,0.6)" }}
          />
          <motion.div 
            animate={{ width: ["60%", "90%", "60%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="h-1.5 rounded"
            style={{ background: "rgba(59,130,246,0.6)" }}
          />
          <motion.div 
            animate={{ width: ["50%", "70%", "50%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="h-1.5 rounded"
            style={{ background: "rgba(236,72,153,0.6)" }}
          />
        </div>
        {/* AI particles */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-1/2 right-2 w-2 h-2 rounded-full"
          style={{ background: "rgba(139,92,246,0.8)" }}
        />
      </div>
    </div>,
    
    // Ranking illustration - List with scores
    <div key="ranking" className="relative w-24 h-24">
      {/* Ranking list */}
      <div className="absolute inset-0 rounded-lg p-2 space-y-1.5" style={{ background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Rank 1 */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          className="flex items-center gap-1.5 p-1 rounded" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <div className="w-4 h-4 rounded-sm bg-green-500 flex items-center justify-center text-white text-[8px] font-bold">1</div>
          <div className="flex-1 h-1 bg-green-400 rounded" />
          <div className="text-[8px] font-bold text-green-400">94</div>
        </motion.div>
        {/* Rank 2 */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, repeatDelay: 2 }}
          className="flex items-center gap-1.5 p-1 rounded" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}
        >
          <div className="w-4 h-4 rounded-sm bg-purple-500 flex items-center justify-center text-white text-[8px] font-bold">2</div>
          <div className="flex-1 h-1 bg-purple-400 rounded" style={{ width: "70%" }} />
          <div className="text-[8px] font-bold text-purple-400">87</div>
        </motion.div>
        {/* Rank 3 */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4, repeat: Infinity, repeatDelay: 2 }}
          className="flex items-center gap-1.5 p-1 rounded" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
        >
          <div className="w-4 h-4 rounded-sm bg-amber-500 flex items-center justify-center text-white text-[8px] font-bold">3</div>
          <div className="flex-1 h-1 bg-amber-400 rounded" style={{ width: "50%" }} />
          <div className="text-[8px] font-bold text-amber-400">71</div>
        </motion.div>
      </div>
    </div>,
    
    // Hire illustration - Success checkmark with confetti
    <div key="hire" className="relative w-24 h-24 flex items-center justify-center">
      {/* Success circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        className="relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))", border: "2px solid rgba(34,197,94,0.5)" }}
      >
        <motion.svg 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
          className="w-8 h-8 text-green-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </motion.svg>
      </motion.div>
      {/* Confetti particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -20, 20],
            x: [0, (i % 2 ? 15 : -15), (i % 2 ? 20 : -20)],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 1.5, delay: 0.5 + i * 0.1, repeat: Infinity, repeatDelay: 2 }}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{ 
            background: ["#8b5cf6", "#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"][i],
            top: "50%",
            left: "50%"
          }}
        />
      ))}
    </div>
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.13, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center text-center relative md:aspect-square min-h-[200px] md:min-h-[275px]"
    >
      {/* Glass card body */}
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full h-full rounded-xl p-6 flex flex-col justify-center"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(124,58,237,0.1)",
        }}
      >
        {/* Subtle top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-xl"
          style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)" }} />

        <div className="text-sm font-medium mb-3" style={{ color: "rgba(139,92,246,0.8)" }}>
          {stepNames[index]}
        </div>

        {/* Illustration */}
        <div className="mb-4 flex justify-center">
          {illustrations[index]}
        </div>

        <h3 className="text-white font-semibold mb-3" style={{ fontSize: "16px", letterSpacing: "-0.015em" }}>
          {title}
        </h3>
        <p style={{ color: "rgba(148,163,184,0.6)", fontSize: "13px", lineHeight: "1.5" }}>
          {desc}
        </p>
      </motion.div>
    </motion.div>
  );
}
