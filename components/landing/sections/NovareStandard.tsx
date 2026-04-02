"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, CheckCircle2, FlaskConical, FolderGit2, UserCheck } from "lucide-react";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import ScrollReveal from "@/components/landing/effects/ScrollReveal";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { EVALUATION_STEPS } from "@/lib/constants";

const STEP_ICONS = [FlaskConical, FolderGit2, UserCheck];

export default function NovareStandard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0.2, 0.7], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="py-20 md:py-16 relative overflow-x-clip" id="for-companies">
      <GlowOrb
        className="top-0 right-0"
        color="rgba(124, 58, 237, 0.4)"
        size="600px"
        parallaxIntensity={22}
        parallaxInvert
      />

      <div className="section-padding">
        <SectionHeader
          // tag="The Novare Standard"
          title="Rigorous by design,"
          titleAccent="elite by outcome."
          description="Every candidate passes a multi-stage evaluation before reaching your pipeline."
        />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto mt-4 items-center">

          {/* Steps - 1/3 of screen on desktop */}
          <div className="w-full lg:w-1/3 space-y-3">
            {/* Timeline steps — line only between circles */}
            <div className="relative">
              {/* Connecting line — sits between first and last circle centers */}
              <div
                className="absolute w-px bg-white/5"
                style={{
                  left: "19px",
                  top: "40px",           /* bottom of first circle */
                  bottom: "40px",        /* top of last circle */
                }}
              >
                <motion.div
                  style={{ height: lineHeight }}
                  className="w-full bg-gradient-to-b from-[var(--color-violet-accent)] to-[var(--color-indigo-accent)]"
                />
              </div>

              <div className="space-y-4">
                {EVALUATION_STEPS.map((step, i) => {
                  const Icon = STEP_ICONS[i];
                  return (
                    <ScrollReveal key={step.step} delay={i * 1}>
                      <div className="group flex gap-5 items-start">
                        {/* Circle */}
                        <div className="relative shrink-0 z-10">
                          <div className="w-10 h-10 rounded-full bg-[rgba(15,15,30,1)] border border-[var(--color-glass-border)] flex items-center justify-center text-white transition-all duration-300 group-hover:border-[var(--color-violet-accent)] group-hover:shadow-[0_0_16px_rgba(124,58,237,0.35)]">
                            <Icon size={16} />
                          </div>
                        </div>

                        {/* Card */}
                        <div className="flex-1 rounded-md border border-white/5 bg-[rgba(15,15,30,0.4)] px-5 py-4 transition-all duration-300 group-hover:border-[rgba(124,58,237,0.2)] group-hover:bg-[rgba(124,58,237,0.04)] group-hover:shadow-[0_0_24px_rgba(124,58,237,0.06)]">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <span className="text-[10px] font-sans text-[var(--color-violet-accent)] tracking-[0.15em]">
                              {step.step}
                            </span>
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-sm text-white leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>

            {/* Certified badge */}
            <ScrollReveal delay={0.5}>
              <div className="relative ml-15 mt-2">
                <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-sm border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.08)] shadow-[0_0_28px_rgba(124,58,237,0.12)]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--color-violet-accent)] to-[var(--color-indigo-accent)] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                    <Shield size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold gradient-text tracking-widest">
                      NOVARE CERTIFIED
                    </div>
                    <div className="text-[10px] text-white mt-0.5">
                      Only the top 1% pass all stages
                    </div>
                  </div>
                  <CheckCircle2 size={14} className="text-[var(--color-violet-accent)] ml-1" />
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Video - 2/3 of screen on desktop */}
          {/* <ScrollReveal variant="scale-in"> */}
            <div className="w-full lg:w-2/3">
              <div className="relative overflow-hidden aspect-video">
                <video
                  src="/videos/eval.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-md"
                />
                {/* Bottom gradient fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent opacity-40" />
                {/* Top label */}
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,0,0,0.55)] backdrop-blur-sm border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-violet-accent)] animate-pulse" />
                    <span className="text-[10px] font-medium text-white/80 tracking-wide">
                      Novare Evaluation Process
                    </span>
                  </div>
                </div>
              </div>
            </div>
          {/* </ScrollReveal> */}
        </div>
      </div>
    </section>
  );
}
