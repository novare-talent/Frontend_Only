"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Target, HelpCircle } from "lucide-react";
import { useDriverGuide } from "@/hooks/useDriverGuide";
import { insightsGuide } from "@/lib/driver-config";

function InsightsContent() {
  const { startTour } = useDriverGuide("insights", insightsGuide, false);
  
  return (
    <main className="relative min-h-screen">
      <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Insights & Analytics
            </h1>
            <p className="text-white/70 text-lg">
              Track your hiring performance and candidate metrics
            </p>
          </motion.div>
          <button
            onClick={startTour}
            className="p-2 rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] hover:border-[var(--color-lavender)]/50 transition-colors"
            title="Start Guide"
          >
            <HelpCircle className="w-5 h-5 text-[var(--color-lavender)]" />
          </button>
        </div>

        <div data-tour="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
              className="p-6 rounded-2xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <span className="text-white/60 text-sm">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-20 p-12 rounded-3xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl"
        >
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-[var(--color-lavender)]" />
          <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
          <p className="text-white/70">
            Advanced analytics and insights are being developed
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <InsightsContent />
    </Suspense>
  );
}
