"use client";

import { ArrowUpRight, Briefcase, GraduationCap, Users, Target, Zap, MapPin, BookOpen, Wrench } from "lucide-react";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import GlowButton from "@/components/landing/ui/GlowButton";
import { StaggerContainer, StaggerItem } from "@/components/landing/effects/ScrollReveal";
import GlowOrb from "@/components/landing/effects/GlowOrb";

const cards = [
  {
    label: "For Recruiters",
    title: "Looking to expand your team?",
    cta: "Sign up as Recruiter",
    href: "/sign-up?role=recruiter",
    icon: Briefcase,

    benefits: [
      { text: "Access to exclusive talent pool", icon: Users },
      { text: "Hire curated candidates", icon: Target },
      { text: "Faster and simpler process", icon: Zap },
    ],
    // Dark card — inverted
    variant: "dark",
  },
  {
    label: "For Students",
    title: "Searching for opportunities?",
    cta: "Sign up as Student",
    href: "/sign-up",
    icon: GraduationCap,

    benefits: [
      { text: "Internships and job opportunities", icon: MapPin },
      { text: "Resources for career guidance", icon: BookOpen },
      { text: "Tools & much more", icon: Wrench },
    ],
    // Light/ghost card
    variant: "light",
  },
];

export default function Zenhyre() {
  return (
    <section className="py-16 md:py-28 relative overflow-x-clip">
      {/* <AuroraMesh intensity={1} opacity={1} className="z-0" /> */}
      

      <GlowOrb
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        color="rgba(124, 58, 237, 0.5)"
        size="800px"
        parallaxIntensity={18}
      />

      <div className="section-padding relative z-10">
        <SectionHeader
          tag="A product from Novare Talent"
          title="Introducing"
          titleAccent="Zenhyre"
          description="A curated portal exclusively for recruiters and students from India's top colleges, designed to connect each other simpler and faster."
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-12">
          {cards.map((card) => {
            const Icon = card.icon;
            const isDark = card.variant === "dark";

            return (
              <StaggerItem key={card.title}>
                <div
                  className={`
                    relative rounded-md p-8 h-full flex flex-col overflow-hidden
                    transition-all duration-500 group cursor-pointer
                    ${isDark
                      ? "bg-[var(--color-violet-accent)]/10 border border-[var(--color-violet-accent)]/20 hover:border-[var(--color-violet-accent)]/50 hover:bg-[var(--color-violet-accent)]/15"
                      : "bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                    }
                  `}
                >
                  {/* Top row: label + icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                        isDark
                          ? "text-[var(--color-violet-accent)]"
                          : "text-white"
                      }`}
                    >
                      {card.label}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                        isDark
                          ? "border-[var(--color-violet-accent)]/30 text-[var(--color-violet-accent)]"
                          : "border-white/10 text-white"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold leading-snug mb-8 pr-4">
                    {card.title}
                  </h3>

                  {/* Benefits */}
                  <ul className="space-y-3 mb-10 flex-1">
                    {card.benefits.map((benefit) => {
                      const BenefitIcon = benefit.icon;
                      return (
                        <li key={benefit.text} className="flex items-center gap-3 text-sm text-white leading-relaxed">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isDark
                              ? "bg-[var(--color-violet-accent)]/20 text-[var(--color-violet-accent)]"
                              : "bg-white/10 text-white/80"
                          }`}>
                            <BenefitIcon size={12} strokeWidth={2} />
                          </div>
                          <span>{benefit.text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  <GlowButton href={card.href} variant={isDark ? "primary" : "secondary"}>
                    <span className="flex items-center gap-2">
                      {card.cta}
                      <ArrowUpRight size={14} />
                    </span>
                  </GlowButton>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
