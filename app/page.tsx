import dynamic from "next/dynamic";
import Navbar from "@/components/landing/layout/Navbar";
import Hero from "@/components/landing/sections/Hero";
import Footer from "@/components/landing/layout/Footer";
import BelowFoldSections from "@/components/landing/sections/BelowFoldSections";
import { ProgressiveBlur } from "@/components/landing/ui/progressive-blur";

// SSR'd (just below fold, important for immediate scroll)
const Zenhyre = dynamic(() => import("@/components/landing/sections/Zenhyre"));
const WhyTheOnePercent = dynamic(() => import("@/components/landing/sections/WhyTheOnePercent"));

export default function Home() {
  return (<>
    <main className="relative z-[1]">
      <Navbar />
      <Hero />
      {/* <SocialProofBar /> */}
      <Zenhyre />
      <WhyTheOnePercent />
      <BelowFoldSections />
      <Footer />
    </main>
      <div className="fixed bottom-0 inset-x-0 h-16 pointer-events-none z-50">
        <ProgressiveBlur height="100%" position="bottom"/>
      </div>
  </>
  );
}
