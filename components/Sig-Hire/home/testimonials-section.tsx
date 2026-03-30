"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TESTIMONIALS } from "./constants";
import SectionHeader from "@/components/landing/ui/SectionHeader";
import GlowOrb from "@/components/landing/effects/GlowOrb";

export function TestimonialsSection() {
  return (
    <section className="relative py-28 px-6">
      <GlowOrb className="top-0 right-0" color="rgba(124,58,237,0.1)" size="800px" parallaxIntensity={15} parallaxInvert />
      <GlowOrb className="bottom-0 left-0" color="rgba(99,102,241,0.07)" size="600px" parallaxIntensity={20} />
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          tag="Social Proof"
          title="Teams hiring smarter"
          titleAccent="with Sighyre"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} {...t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, author, role, rating, index }: {
  quote: string; author: string; role: string; rating: number; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="gradient-border-card rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.02)" }}
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      <p className="mb-5" style={{ color: "rgba(226,232,240,0.8)", fontSize: "15px", lineHeight: "1.65", fontStyle: "italic" }}>
        &ldquo;{quote}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold" style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(99,102,241,0.3))",
          border: "1px solid rgba(124,58,237,0.3)",
          color: "#a78bfa",
        }}>
          {author[0]}
        </div>
        <div>
          <p className="text-white font-medium" style={{ fontSize: "13px" }}>{author}</p>
          <p style={{ fontSize: "11px", color: "rgba(148,163,184,0.5)" }}>{role}</p>
        </div>
      </div>
    </motion.div>
  );
}
