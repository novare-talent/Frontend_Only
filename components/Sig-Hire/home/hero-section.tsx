"use client";

import { motion } from "framer-motion";
import { History, Sparkles } from "lucide-react";
import ChromeButton from "@/components/Sig-Hire/ChromeButton";
import { MOCK_CANDIDATES } from "./constants";
import { Particles } from "@/components/ui/particles";

interface HeroSectionProps {
  onStartHiring: () => void;
  isLoading: boolean;
  sessions: { session_id: string }[];
  onViewSessions: () => void;
}

export function HeroSection({ onStartHiring, isLoading, sessions, onViewSessions }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(24.45% 22.45% at 50% 0%, rgba(133,102,255,0.04) 0%, rgba(133,102,255,0) 100%), " +
          "radial-gradient(38.5% 24.47% at 50% 11.59%, rgba(133,102,255,0.08) 0%, rgba(133,102,255,0) 100%), " +
          "#0a0118",
        paddingBottom: "64px",
      }}
    >
      {/* Top border line */}
      <div aria-hidden className="pointer-events-none absolute top-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(270deg, rgba(61,53,78,0) 28.87%, #3d354e 45.39%, #3d354e 53.54%, rgba(61,53,78,0) 70.06%)",
      }} />

      {/* Radial background lights */}
      <div aria-hidden className="pointer-events-none absolute" style={{
        background:
          "radial-gradient(47.84% 61.25% at 50% 0%, rgba(113,61,255,0.06) 0%, rgba(113,61,255,0) 100%), " +
          "radial-gradient(28.37% 15.33% at 50% 42.67%, rgba(113,61,255,0.2) 0%, rgba(113,61,255,0) 100%)",
        height: "1331px",
        width: "1640px",
        left: "calc(50% - 820px)",
        top: 0,
        zIndex: 0,
      }} />

      <HeroBackground />

      {/* Particles effect */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color="#8566ff"
        refresh
      />

      {/* Dot grid overlay */}
      <div aria-hidden className="pointer-events-none absolute" style={{
        backgroundImage: "radial-gradient(circle, rgba(196,181,253,0.1) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(43.27% 50% at 50% 35%, #fff 17.51%, rgba(255,255,255,0) 100%)",
        WebkitMaskImage: "radial-gradient(43.27% 50% at 50% 35%, #fff 17.51%, rgba(255,255,255,0) 100%)",
        height: "591px",
        width: "1440px",
        left: "calc(50% - 720px)",
        zIndex: 8,
      }} />

      {/* Hero content */}
      <div className="relative z-10 text-center" style={{ paddingTop: "clamp(80px, 15vw, 196px)" }}>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="flex items-center justify-center gap-2 mb-3"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-mono tracking-[0.18em] uppercase backdrop-blur-2xl" style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#C4B5FD",
          }}>
            {/* <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5FD] animate-pulse" style={{ boxShadow: "0 0 6px rgba(196,181,253,0.8)" }} /> */}
            AI-Powered Recruitment
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="syne mb-3 pb-2 mx-auto px-4"
          style={{
            fontSize: "clamp(32px, 6vw, 72px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: "1.11",
            background: "linear-gradient(180deg, #fff 40.5%, rgba(255,255,255,0.7) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxWidth: "900px",
          }}
        >
          Hire Smarter with <br />AI-Powered Ranking
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="mx-auto mb-6 px-4"
          style={{
            color: "#9b96b0",
            fontSize: "clamp(15px, 3.5vw, 20px)",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            lineHeight: "28px",
            maxWidth: "700px",
          }}
        >
          Sighyre analyzes resumes, ranks candidates by fit, flags potential risks,
          and helps you make confident hiring decisions - in seconds, not hours.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.58 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 mb-12 sm:mb-20"
        >
          <ChromeButton
            onClick={onStartHiring}
            disabled={isLoading}
            className="scale-[1.15] w-48"
          >
                            <Sparkles size={16} className="mr-2" />

            Start Hiring
          </ChromeButton>

          {sessions?.length > 0 && (
            <ChromeButton
              onClick={onViewSessions}
              variant="secondary"
              className="scale-[1.15] w-48 "
            >
              <History className="w-4 h-4 mr-2" />
              Past Sessions ({sessions.length})
            </ChromeButton>
          )}
        </motion.div>

        {/* Preview card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.65 }}
          className="mx-auto px-6"
          style={{
            maxWidth: "1200px",
          }}
        >
          <div className="w-full rounded-md overflow-hidden" style={{
            background: "rgba(15,12,25,0.88)",
            border: "1px solid rgba(124,58,237,0.2)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
            backdropFilter: "blur(16px)",
          }}>
            {/* Card header */}
            <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED", boxShadow: "0 0 8px rgba(124,58,237,0.8)" }} />
                <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "#64748B" }}>
                  Candidate Rankings
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{
                background: "rgba(124,58,237,0.15)",
                color: "#C4B5FD",
                border: "1px solid rgba(124,58,237,0.25)",
              }}>
                3 results
              </span>
            </div>

            {/* Candidates */}
            <div className="px-5 py-2 flex flex-col gap-0">
              {MOCK_CANDIDATES.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + i * 0.12, duration: 0.4 }}
                  className="flex items-center justify-between py-3"
                  style={i !== 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{
                      background: "rgba(124,58,237,0.2)",
                      border: "1px solid rgba(196,181,253,0.15)",
                      color: "#C4B5FD",
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white leading-tight">{c.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${c.color}18`, color: c.color }}>
                        {c.tag}
                      </span>
                    </div>
                  </div>

                  {/* Animated score bar */}
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${c.score}%` }}
                        transition={{ duration: 1, delay: 0.9 + i * 0.15 }}
                        style={{ background: c.color, opacity: 0.85 }}
                      />
                    </div>
                    <span className="text-[12px] font-mono font-semibold w-6 text-right" style={{ color: c.color }}>
                      {c.score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Card footer */}
            <div className="px-5 py-3 flex items-center justify-between" style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(124,58,237,0.04)",
            }}>
              <span className="text-[11px]" style={{ color: "#64748B" }}>Analyzed by Sighyre AI</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1 h-3 rounded-sm animate-pulse" style={{
                    background: "#7C3AED",
                    opacity: 0.35 + i * 0.2,
                    animationDelay: `${i * 0.2}s`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust bullets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.95 }}
          className="mt-12 flex items-center justify-center gap-8 flex-wrap"
          style={{ opacity: 0.45 }}
        >
          {["AI-ranked in seconds", "Risk flags included", "No setup needed"].map((txt, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[12px]" style={{ color: "#64748B" }}>
              <span style={{ color: "#7C3AED" }}>✓</span> {txt}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom border line */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 right-0 h-px" style={{
        background: "linear-gradient(270deg, rgba(61,53,78,0) 28.87%, #3d354e 45.39%, #3d354e 53.54%, rgba(61,53,78,0) 70.06%)",
      }} />
    </section>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute" style={{
      left: "calc(50vw - 624px)",
      top: "80px",
      width: "1248px",
      zIndex: 9,
    }}>
      {/* Top animated section */}
      <div
        className="relative"
        style={{
          backgroundImage: "url('/images/hero/hero-background-top.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          height: "202px",
          marginBottom: "138px",
          width: "100%",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full"
          style={{
            maskImage: "url('/images/hero/hero-background-top-mask.png')",
            WebkitMaskImage: "url('/images/hero/hero-background-top-mask.png')",
            maskSize: "cover",
            WebkitMaskSize: "cover",
            height: "200px",
          }}
        >
          <motion.div
            className="relative w-full"
            style={{
              background: "linear-gradient(180deg, rgba(183,164,251,0) 0%, #b7a4fb 100%, #8562ff 100%, rgba(133,98,255,0) 0%)",
              height: "200px",
              position: "relative",
              top: 0,
              zIndex: 88888,
            }}
            initial={{ y: -202 }}
            animate={{ y: 202 }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: [0.62, 0.62, 0.28, 0.67],
              repeatType: "loop",
            }}
          />
        </div>
      </div>

      {/* Bottom animated section */}
      <div className="relative" style={{ height: "530px", width: "100%" }}>
        <div className="absolute inset-0" style={{ mixBlendMode: "overlay", zIndex: 12 }}>
          <img src="/images/hero/hero-background-bottom.png" alt="Hero background" className="w-full h-full" />
        </div>

        {[
          { mask: "hero-background-bottom-line-1.png", delay: 0 },
          { mask: "hero-background-bottom-line-2.png", delay: 2 },
          { mask: "hero-background-bottom-line-3.png", delay: 3 },
          { mask: "hero-background-bottom-line-4.png", delay: 1 },
        ].map(({ mask, delay }, i) => (
          <div
            key={i}
            className="absolute overflow-hidden"
            style={{
              height: "179px",
              left: 0,
              width: "100%",
              maskImage: `url('/images/hero/${mask}')`,
              WebkitMaskImage: `url('/images/hero/${mask}')`,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskSize: "contain",
              WebkitMaskSize: "contain",
            }}
          >
            <motion.div
              className="w-full"
              style={{
                background: "linear-gradient(180deg, rgba(183,164,251,0) 0%, rgba(183,164,251,0.5) 100%, rgba(133,98,255,0.5) 100%, rgba(133,98,255,0) 0%)",
                height: "150px",
              }}
              animate={{ y: [-530, 400] }}
              transition={{ duration: 4, repeat: Infinity, ease: [0.62, 0.62, 0.14, 1], delay }}
            />
          </div>
        ))}

        {/* Ray animation */}
        <div
          className="absolute overflow-hidden"
          style={{
            height: "179px",
            left: 0,
            width: "100%",
            maskImage: "url('/images/hero/hero-background-bottom-ray.png')",
            WebkitMaskImage: "url('/images/hero/hero-background-bottom-ray.png')",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
          }}
        >
          <motion.div
            className="w-full"
            style={{
              backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0) 10.42%, rgba(255,255,255,0.1) 26.56%, rgba(255,255,255,0) 37.5%)",
              height: "530px",
            }}
            animate={{ y: [-530, 0, 530, -530] }}
            transition={{ duration: 10.2, repeat: Infinity, ease: [0.62, 0.62, 0, 1], times: [0, 0.49, 0.88, 1] }}
          />
        </div>

        {/* Background lights */}
        <div
          className="absolute"
          style={{
            backgroundImage: "url('/images/hero/hero-background-lights.png')",
            height: "725px",
            left: "50%",
            top: "-50px",
            transform: "translate(-50%)",
            width: "1680px",
            zIndex: -1,
          }}
        />
      </div>
    </div>
  );
}
