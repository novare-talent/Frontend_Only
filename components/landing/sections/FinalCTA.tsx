"use client";

import GlowButton from "@/components/landing/ui/GlowButton";


export default function FinalCTA() {
  return (

    
    <section id="cta" className="relative overflow-hidden border border-white/10 bg-black/80 backdrop-blur-sm rounded-2xl mx-auto max-w-6xl m-8" style={{background: 'radial-gradient(ellipse at top, rgba(124, 58, 237, 0.6) 0%, transparent 70%)'}} > 
      <div className="relative z-10 flex flex-col items-center justify-center gap-10 py-16 px-4">
        <h2 className="text-white text-4xl md:text-7xl font-extrabold tracking-tight max-w-xs md:max-w-xl text-center">
          Ready to hire{" "}
          <br />
          <span className="gradient-text">Top 1% talent</span>?
        </h2>

        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GlowButton href="/hire" className="text-base">
              Hire Top 1% Talent
            </GlowButton>
            <GlowButton href="/get-hired" variant="secondary" className="text-base">
              Get Hired
            </GlowButton>
          </div>
          <p className="text-white/80 text-sm text-center max-w-lg">
            Join the network of companies building the future with{" "}
            <span className="font-semibold text-white">India&apos;s best minds</span>
          </p>
        </div>
      </div>
    </section>
  );
}
