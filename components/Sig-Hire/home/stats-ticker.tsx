"use client";

import { STATS } from "./constants";

export function StatsTicker() {
  return (
    <section style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      background: "rgba(124,58,237,0.04)",
    }}>
      <div className="overflow-hidden py-5">
        <div className="ticker-inner flex items-center" style={{ width: "max-content" }}>
          {[...STATS, ...STATS, ...STATS, ...STATS].map((s, i) => (
            <div key={i} className="flex items-center gap-12 px-12" style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-3 whitespace-nowrap">
                <div style={{ color: "#a78bfa" }}>{s.icon}</div>
                <span className="syne text-xl font-bold text-white">{s.value}</span>
                <span style={{ fontSize: "13px", color: "rgba(148,163,184,0.6)" }}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
