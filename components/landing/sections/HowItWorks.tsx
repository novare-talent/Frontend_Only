"use client";

import { GraduationCap, Search, Users, Zap } from "lucide-react";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import { StaggerContainer, StaggerItem } from "@/components/landing/effects/ScrollReveal";
import ParticleCanvas from "@/components/landing/effects/ParticleCanvas";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={32} />,
  Search: <Search size={32} />,
  Users: <Users size={32} />,
  Zap: <Zap size={32} />,
};

const iconGlow: Record<string, string> = {
  GraduationCap: "rgba(124,58,237,0.5)",
  Search: "rgba(99,102,241,0.5)",
  Users: "rgba(139,92,246,0.5)",
  Zap: "rgba(167,139,250,0.5)",
};

export default function HowItWorks() {
  const [f0, f1, f2, f3] = FEATURES;

  return (
    <section className="py-16 md:py-12 relative overflow-hidden" id="how-it-works">
      <div className="absolute inset-0 opacity-90">
        <ParticleCanvas />
      </div>
      <GlowOrb
        className="bottom-0 left-1/4"
        color="rgba(124, 58, 237, 0.4)"
        size="700px"
        parallaxIntensity={20}
      />
      <div className="section-padding relative z-10">
        <SectionHeader
          tag="How It Works"
          title="How Novare finds"
          titleAccent="the top 1%"
          description="A rigorous, human-driven process that delivers quality over quantity."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {/* Row 1 — two equal cards */}
          <StaggerItem className="md:col-span-3">
            <BentoCard feature={f0} className="min-h-[240px]" />
          </StaggerItem>
          <StaggerItem className="md:col-span-2">
            <BentoCard feature={f1} className="min-h-[240px]" />
          </StaggerItem>

          {/* Row 2 — wide left + narrow right */}
          <StaggerItem className="md:col-span-2">
            <BentoCard feature={f2} className="min-h-[240px]" />
          </StaggerItem>
          <StaggerItem className="md:col-span-3">
            <BentoCard feature={f3} className="min-h-[240px]" accent />
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

function BentoCard({
  feature,
  className = "",
  accent,
}: {
  feature: (typeof FEATURES)[number];
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative rounded-md overflow-hidden border border-white/[0.06] bg-white/[0.03] group cursor-default transition-all duration-150 hover:border-white/[0.12] hover:bg-white/[0.05] flex flex-col justify-end p-7 ${className}`}
    >
      {/* Background glow blob */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-200"
        style={{ background: iconGlow[feature.icon] }}
      />

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${
          accent
            ? "bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-violet-300"
            : "bg-white/[0.06] text-white/70"
        } group-hover:scale-105 transition-transform duration-150`}
      >
        {iconMap[feature.icon]}
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-white mb-1.5">
        <span className={accent ? "text-violet-300" : "text-white"}>{feature.title}.</span>
      </h3>
      <p className="text-sm text-white/50 leading-relaxed max-w-xs">
        {feature.description}
      </p>
    </div>
  );
}
