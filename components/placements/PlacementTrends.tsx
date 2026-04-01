"use client";

import { motion } from "framer-motion";
import type { YearlyPlacement } from "@/data/iit-placements";

function parsePackageToNumber(pkg: string): number {
  const cleaned = pkg.replace(/[₹,+\s]/g, "");
  if (cleaned.includes("Cr")) return parseFloat(cleaned) * 100;
  if (cleaned.includes("LPA")) return parseFloat(cleaned);
  return parseFloat(cleaned) || 0;
}

export default function PlacementTrends({
  placements,
}: {
  placements: YearlyPlacement[];
}) {
  if (placements.length < 2) return null;

  const reversed = [...placements].reverse();
  const maxAvg = Math.max(...reversed.map((p) => parsePackageToNumber(p.averagePackage)));
  const maxHigh = Math.max(...reversed.map((p) => parsePackageToNumber(p.highestPackage)));

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Average Package Trend */}
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Average Package
          </p>
          <div className="space-y-3">
            {reversed.map((p, i) => {
              const val = parsePackageToNumber(p.averagePackage);
              const pct = (val / maxAvg) * 100;
              return (
                <div key={p.year} className="flex items-center gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)] w-12 shrink-0">
                    {p.year}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[var(--color-violet-accent)] to-[var(--color-indigo-accent)] rounded-full flex items-center justify-end pr-3"
                    >
                      <span className="text-xs font-medium text-white whitespace-nowrap">
                        {p.averagePackage}
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Highest Package Trend */}
        <div>
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Highest Package
          </p>
          <div className="space-y-3">
            {reversed.map((p, i) => {
              const val = parsePackageToNumber(p.highestPackage);
              const pct = (val / maxHigh) * 100;
              return (
                <div key={p.year} className="flex items-center gap-4">
                  <span className="text-sm text-[var(--color-text-secondary)] w-12 shrink-0">
                    {p.year}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-7 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[var(--color-lavender)]/60 to-[var(--color-violet-accent)] rounded-full flex items-center justify-end pr-3"
                    >
                      <span className="text-xs font-medium text-white whitespace-nowrap">
                        {p.highestPackage}
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
