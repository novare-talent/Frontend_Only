"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ChromeButton from "@/components/Sig-Hire/ChromeButton";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { DotPattern } from "@/components/landing/ui/dot-pattern";

export function CTASection() {
  return (
    <section className="relative py-16 px-4 ">
      <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" color="rgba(124,58,237,0.12)" size="800px" parallaxIntensity={25} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden border border-white/10 backdrop-blur-sm rounded-md mx-auto max-w-6xl"
        style={{ background: "radial-gradient(ellipse at top, rgba(124,58,237,0.6) 0%, transparent 70%), rgba(0,0,0,0.8)" }}
      >
        <DotPattern
          width={20}
          height={20}
          cr={0.8}
          className="text-violet-400/30 mask-[radial-gradient(ellipse_at_center,white_30%,transparent_80%)]"
        />
        <div className="relative z-10 flex flex-col items-center justify-center gap-10 py-16 px-4">
          <h2 className="text-white text-4xl md:text-7xl font-extrabold tracking-tight max-w-xs md:max-w-xl text-center">
            Hire smarter,{" "}
            <br />
            <span className="gradient-text">faster with AI</span>
          </h2>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sig-hire/sessions">
                <ChromeButton className="text-base">
                  Try Ranking Bot
                </ChromeButton>
              </Link>
            </div>
            <p className="text-white/80 text-md text-center max-w-lg">
              Join teams already screening candidates{" "}
              <span className="font-semibold text-white">10x faster with Sighyre</span>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
