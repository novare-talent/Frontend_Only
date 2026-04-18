"use client";

import dynamic from "next/dynamic";

const HowItWorks = dynamic(() => import("./HowItWorks"), { ssr: false });
const NovareStandard = dynamic(() => import("./NovareStandard"), { ssr: false });
const Testimonials = dynamic(() => import("./Testimonials"), { ssr: false });
const Team = dynamic(() => import("./Team"), { ssr: false });
const FAQs = dynamic(() => import("./FAQs"), { ssr: false });
const FinalCTA = dynamic(() => import("./FinalCTA"), { ssr: false });

export default function BelowFoldSections() {
  return (
    <>
      <HowItWorks />
      <NovareStandard />
      <Testimonials />
      <Team />
      <FAQs />
      <FinalCTA />
    </>
  );
}
