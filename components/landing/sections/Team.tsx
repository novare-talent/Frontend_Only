"use client";

import Image from "next/image";
import { StaggerContainer, StaggerItem } from "@/components/landing/effects/ScrollReveal";
import ScrollReveal from "@/components/landing/effects/ScrollReveal";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { TEAM_MEMBERS } from "@/lib/constants";

export default function Team() {
  return (
    <section className="py-16 md:py-28 relative overflow-hidden" id="team">
      <GlowOrb
        className="top-0 right-0"
        color="rgba(124, 58, 237, 0.4)"
        size="1000px"
        parallaxIntensity={15}
        parallaxInvert
      />

      <div className="section-padding relative z-10">
        {/* Editorial left-aligned header */}
        <div className="mb-14 md:mb-20 max-w-xl">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-violet-accent" />
              <span className="text-[11px] tracking-[0.25em] uppercase text-violet-accent font-medium">
                The Team
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
              Built by{" "}
              <span className="gradient-text">IIT Bombay</span>{" "}
              minds
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-5 text-white text-base leading-relaxed">
              A team of builders who understand the talent ecosystem from the inside.
            </p>
          </ScrollReveal>
        </div>

        {/* Portrait card grid — alternating vertical offset for editorial rhythm */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-start">
          {TEAM_MEMBERS.map((member, i) => (
            <StaggerItem key={member.name}>
              <div className={i % 2 === 1 ? "mt-8 md:mt-14" : ""}>
                {/* Card shell */}
                <div className="relative overflow-hidden border border-glass-border bg-[rgba(15,15,30,0.5)] rounded-md">

                  {/* Portrait photo */}
                  <div className="relative aspect-3/4 overflow-hidden">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-violet-accent/20 to-indigo-accent/20 flex items-center justify-center">
                        <span className="text-4xl font-bold gradient-text">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    )}

                    {/* Gradient: photo bleeds into card info */}
                    <div className="absolute inset-0 bg-linear-to-t from-[rgba(15,15,30,0.9)] via-[rgba(15,15,30,0.08)] to-transparent pointer-events-none" />
                  </div>

                  {/* Info */}
                  <div className="px-4 py-4">
                    <h3 className="text-sm md:text-[0.9rem] font-semibold text-text-primary leading-snug">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-violet-accent mt-1 tracking-wide">
                      {member.role}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-[0.15em]">
                      {member.college}
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
