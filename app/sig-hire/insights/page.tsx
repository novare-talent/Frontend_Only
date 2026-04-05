"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";
import { useDriverGuide } from "@/hooks/useDriverGuide";
import { insightsGuide } from "@/lib/driver-config";
import { SigHireFooter } from "@/components/Sig-Hire/footer";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import { Particles } from "@/components/ui/particles";
import { PageHeader } from "@/components/Sig-Hire/PageHeader";

function InsightsContent() {
  const { startTour } = useDriverGuide("insights", insightsGuide, false);
  
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background Effects - Fixed positioning */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Particles
          className="absolute inset-0"
          quantity={100}
          ease={80}
          color="#8566ff"
          refresh
        />
        <GlowOrb
          className="absolute bottom-0 left-1/4 -translate-x-1/2"
          color="rgba(124, 58, 237, 0.4)"
          size="1200px"
          parallaxIntensity={20}
        />
        <GlowOrb
          className="absolute top-0 right-1/4 translate-x-1/2"
          color="rgba(124, 58, 237, 0.4)"
          size="1200px"
          parallaxIntensity={20}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <PageHeader
          title="Insights & Analytics"
          description="Track your hiring performance and candidate metrics"
          onHelpClick={startTour}
        />

        {/* <div data-tour="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Users, label: "Total Candidates", value: "0", color: "purple" },
            { icon: Target, label: "Shortlisted", value: "0", color: "blue" },
            { icon: TrendingUp, label: "Success Rate", value: "0%", color: "green" },
            { icon: BarChart3, label: "Avg. Score", value: "0", color: "indigo" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-6 rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                  <span className="text-white/60 text-sm">{stat.label}</span>
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative text-center py-20 p-12 rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-[var(--color-lavender)]" />
            <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
            <p className="text-white/70">
              Advanced analytics and insights are being developed
            </p>
          </div>
        </motion.div>
      </div>
      <SigHireFooter />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a0118" }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 rounded-full border-2 border-[rgba(124,58,237,0.3)] border-t-[#7c3aed] animate-spin" />
        </div>
      </div>
    }>
      <InsightsContent />
    </Suspense>
  );
}
