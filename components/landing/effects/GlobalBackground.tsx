"use client";

import GlowOrb from "@/components/landing/effects/GlowOrb";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Top-right violet orb */}
      <GlowOrb
        className="top-[10%] right-[-10%]"
        color="rgba(124, 58, 237, 0.06)"
        size="900px"
        parallaxIntensity={30}
      />
      {/* Bottom-left indigo orb */}
      <GlowOrb
        className="bottom-[5%] left-[-10%]"
        color="rgba(79, 70, 229, 0.05)"
        size="800px"
        parallaxIntensity={20}
        parallaxInvert
      />
      {/* Center-left subtle violet */}
      <GlowOrb
        className="top-[45%] left-[-5%]"
        color="rgba(124, 58, 237, 0.04)"
        size="700px"
        parallaxIntensity={15}
      />
      {/* Mid-right accent */}
      <GlowOrb
        className="top-[65%] right-[-8%]"
        color="rgba(79, 70, 229, 0.04)"
        size="650px"
        parallaxIntensity={18}
        parallaxInvert
      />
    </div>
  );
}
