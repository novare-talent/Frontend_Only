"use client";

import React from "react";
import Image from "next/image";
import { Marquee } from "@/components/landing/ui/Marquee";
import ScrollReveal from "@/components/landing/effects/ScrollReveal";

const LOGOS = [
  { src: "/images/sine-logo.png", alt: "SINE IIT Bombay" },
  { src: "/images/iitbaa-logo.png", alt: "IIT Bombay Alumni Association" },
];

export default function SocialProofBar() {
  return (
    <section className="py-2 border-y border-white/5 relative">
      <ScrollReveal className="text-center">
        <p className="text-sm text-white tracking-wide uppercase">
          Trusted by founders and backed by
        </p>
      </ScrollReveal>

      {/* <Marquee style={{ "--duration": "25s" } as React.CSSProperties}> */}
      <div className="flex flex-row">
        {LOGOS.map((logo, i) => (
          <div
            key={i}
            className="flex items-center justify-center w-48 h-24 mx-8 hover:grayscale-0 opacity-75 hover:opacity-100 transition-all duration-500"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={180}
              height={90}
              className="object-contain max-h-20"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        ))}
      </div>
      {/* </Marquee> */}
    </section>
  );
}
