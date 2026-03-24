import Navbar from "@/components/landing/layout/Navbar";
import Hero from "@/components/landing/sections/Hero";
import SocialProofBar from "@/components/landing/sections/SocialProofBar";
import WhyTheOnePercent from "@/components/landing/sections/WhyTheOnePercent";
import HowItWorks from "@/components/landing/sections/HowItWorks";
import NovareStandard from "@/components/landing/sections/NovareStandard";
import Zenhyre from "@/components/landing/sections/Zenhyre";
import Team from "@/components/landing/sections/Team";
import Testimonials from "@/components/landing/sections/Testimonials";
import FAQs from "@/components/landing/sections/FAQs";
import FinalCTA from "@/components/landing/sections/FinalCTA";
import Footer from "@/components/landing/layout/Footer";
import { ProgressiveBlur } from "@/components/landing/ui/progressive-blur";

export default function Home() {
  return (<>
    <main className="relative z-[1]">
      <Navbar />
      <Hero />
      {/* <SocialProofBar /> */}
      <Zenhyre />
      <WhyTheOnePercent />
      <HowItWorks />
      <NovareStandard />
      <Testimonials />
      <Team />
      <FAQs />
      <FinalCTA />
      <Footer />
    </main>
      <div className="fixed bottom-0 inset-x-0 h-16 pointer-events-none z-50">
        <ProgressiveBlur height="100%" position="bottom"/>
      </div>
  </>
  );
}
