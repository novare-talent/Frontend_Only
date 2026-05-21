"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { GraduationCap, Users } from "lucide-react";

// ─── Per-rank colour tokens ───────────────────────────────────────────────────
// All tokens follow light-first convention; dark: overrides where needed.
const RANK_THEME = {
  1: {
    crestBg:     "bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-500/30 dark:to-teal-600/30",
    crestBorder: "border-cyan-400 dark:border-cyan-400",
    crestGlow:   "shadow-[0_0_18px_2px_rgba(34,211,238,0.25)]",
    icon:        "text-cyan-600 dark:text-cyan-300",
    rankNum:     "text-cyan-600 dark:text-cyan-300",
    label:       "text-foreground",
    count:       "text-cyan-600 dark:text-cyan-400",
    rankLabel:   "text-cyan-600 dark:text-cyan-400",
    platform:    "from-cyan-200/70 to-cyan-50/40 dark:from-cyan-500/25 dark:to-teal-500/10 border-cyan-300 dark:border-cyan-500/30",
  },
  2: {
    crestBg:     "bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-400/25 dark:to-blue-500/20",
    crestBorder: "border-slate-400",
    crestGlow:   "shadow-[0_0_14px_2px_rgba(148,163,184,0.2)]",
    icon:        "text-slate-600 dark:text-slate-300",
    rankNum:     "text-slate-600 dark:text-slate-300",
    label:       "text-foreground",
    count:       "text-slate-700 dark:text-slate-300",
    rankLabel:   "text-slate-500 dark:text-slate-400",
    platform:    "from-slate-200/70 to-slate-100/40 dark:from-slate-500/20 dark:to-blue-600/10 border-slate-300 dark:border-slate-500/30",
  },
  3: {
    crestBg:     "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/25 dark:to-orange-600/20",
    crestBorder: "border-amber-500",
    crestGlow:   "shadow-[0_0_14px_2px_rgba(245,158,11,0.2)]",
    icon:        "text-amber-600 dark:text-amber-400",
    rankNum:     "text-amber-600 dark:text-amber-400",
    label:       "text-foreground",
    count:       "text-amber-700 dark:text-amber-400",
    rankLabel:   "text-amber-600 dark:text-amber-500",
    platform:    "from-amber-100/70 to-amber-50/40 dark:from-amber-500/20 dark:to-orange-600/10 border-amber-300 dark:border-amber-500/30",
  },
} as const;

// Ordered most-specific → least-specific so longer codes shadow shorter ones
// e.g. "iitkgp" is checked before "iitk", "iitmandi" before "iitm", etc.
const IIT_PATTERNS: [RegExp, string][] = [
  [/iitkgp|kgpian/,        "IIT Kharagpur"],
  [/iitjammu/,             "IIT Jammu"],
  [/iitbhilai/,            "IIT Bhilai"],
  [/iitbhu|itbhu/,         "IIT BHU (Varanasi)"],
  [/iitbbs/,               "IIT Bhubaneswar"],
  [/iitism/,               "IIT (ISM) Dhanbad"],
  [/iitmandi/,             "IIT Mandi"],
  [/iitrpr/,               "IIT Ropar"],
  [/iitgoa/,               "IIT Goa"],
  [/iitgn/,                "IIT Gandhinagar"],
  [/iitpkd/,               "IIT Palakkad"],
  [/iittp/,                "IIT Tirupati"],
  [/iitdh/,                "IIT Dharwad"],
  [/iitb/,                 "IIT Bombay"],
  [/iitd/,                 "IIT Delhi"],
  [/iitm/,                 "IIT Madras"],
  [/iitk/,                 "IIT Kanpur"],
  [/iitr/,                 "IIT Roorkee"],
  [/iitg/,                 "IIT Guwahati"],
  [/iith/,                 "IIT Hyderabad"],
  [/iitj/,                 "IIT Jodhpur"],
  [/iitp/,                 "IIT Patna"],
  [/iiti/,                 "IIT Indore"],
];

function detectIIT(domain: string): string | null {
  const d = domain.toLowerCase();
  for (const [pattern, name] of IIT_PATTERNS) {
    if (pattern.test(d)) return name;
  }
  return null;
}

const IIT_SHORT: Record<string, string> = {
  "IIT Bombay": "IITB",
  "IIT Delhi": "IITD",
  "IIT Madras": "IITM",
  "IIT Kharagpur": "IITKGP",
  "IIT Kanpur": "IITK",
  "IIT Roorkee": "IITR",
  "IIT Guwahati": "IITG",
  "IIT Hyderabad": "IITH",
  "IIT Gandhinagar": "IITGN",
  "IIT Jodhpur": "IITJ",
  "IIT Patna": "IITP",
  "IIT Ropar": "IITRpr",
  "IIT Mandi": "IITMdi",
  "IIT Indore": "IITI",
  "IIT BHU (Varanasi)": "IITBHU",
  "IIT Bhubaneswar": "IITBBS",
  "IIT Tirupati": "IITTP",
  "IIT (ISM) Dhanbad": "IITISM",
  "IIT Jammu": "IITJmu",
  "IIT Bhilai": "IITBhi",
  "IIT Dharwad": "IITDhw",
  "IIT Palakkad": "IITPkd",
  "IIT Goa": "IITGoa",
};

function getMonthYear() {
  return new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function PodiumCrest({ name, rank }: { name: string; rank: 1 | 2 | 3 }) {
  const short = IIT_SHORT[name] ?? name.replace("IIT ", "");
  const t = RANK_THEME[rank];
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-full border-2 ${t.crestBg} ${t.crestBorder} ${t.crestGlow} text-center`}
      style={{ width: 72, height: 72 }}
    >
      <GraduationCap className={`h-3.5 w-3.5 ${t.icon}`} />
      <span className={`text-lg font-black leading-none ${t.rankNum}`}>{rank}</span>
      <span className={`text-[9px] font-bold leading-tight ${t.icon} opacity-80`}>{short}</span>
    </div>
  );
}

function PodiumCard({
  rank,
  iit,
  count,
  platformHeight,
}: {
  rank: 1 | 2 | 3;
  iit: string;
  count: number;
  platformHeight: string;
}) {
  const t = RANK_THEME[rank];
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className={`text-xs font-semibold ${t.rankLabel}`}>
        {String(rank).padStart(2, "0")}
      </div>
      <PodiumCrest name={iit} rank={rank} />
      <div className={`text-xs font-medium text-center leading-tight ${t.label}`}>
        {iit}
      </div>
      <div className={`text-3xl font-black ${t.count}`}>{count}</div>

      {/* Podium platform */}
      <div
        className={`w-full rounded-t-md bg-gradient-to-b border ${t.platform}`}
        style={{ height: platformHeight }}
      />
    </div>
  );
}

export default function IITLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<{ iit: string; count: number }[]>([]);
  const [totalIITUsers, setTotalIITUsers] = useState(0);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const supabase = createClient();
      let allEmails: string[] = [];
      let from = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from("profiles")
          .select("email")
          .range(from, from + pageSize - 1);
        if (error || !data || data.length === 0) break;
        allEmails = allEmails.concat(
          data.map((p: { email: string }) => p.email).filter(Boolean)
        );
        if (data.length < pageSize) break;
        from += pageSize;
      }

      const counts: Record<string, number> = {};

      for (const email of allEmails) {
        const domain = email.split("@")[1]?.toLowerCase();
        if (!domain) continue;
        const iit = detectIIT(domain);
        if (iit) counts[iit] = (counts[iit] ?? 0) + 1;
      }

      const sorted = Object.entries(counts)
        .map(([iit, count]) => ({ iit, count }))
        .sort((a, b) => b.count - a.count);

      setLeaderboard(sorted);
      setTotalIITUsers(sorted.reduce((sum, e) => sum + e.count, 0));
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumRanks = [2, 1, 3];
  const platformHeights = ["56px", "80px", "44px"];

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="max-w-3xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tight text-foreground">The IIT leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            IITians on Novare Talent &middot; {getMonthYear()}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-48 rounded-xl bg-muted animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No IIT users found yet.</p>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            {top3.length > 0 && (
              <div className="rounded-xl border bg-card p-6 mb-4">
                <div className="flex items-end gap-3">
                  {podiumOrder.map((entry, i) =>
                    entry ? (
                      <PodiumCard
                        key={entry.iit}
                        rank={podiumRanks[i] as 1 | 2 | 3}
                        iit={entry.iit}
                        count={entry.count}
                        platformHeight={platformHeights[i]}
                      />
                    ) : (
                      <div key={i} className="flex-1" />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Ranks 4+ — horizontal grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {rest.map(({ iit, count }, i) => (
                  <div
                    key={iit}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-accent/40 transition-colors"
                  >
                    <span className="text-xs font-bold text-muted-foreground shrink-0">
                      {String(i + 4).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-medium text-xs truncate text-gray-800 dark:text-gray-200">{iit}</span>
                    <span className="font-bold tabular-nums text-sm shrink-0 text-gray-900 dark:text-gray-100">{count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl border bg-card">
              <span className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                Total on Platform
              </span>
              <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{totalIITUsers}</span>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-3">
              novaretalent.com &mdash; matched via institutional email domain
            </p>
          </>
        )}
      </div>
    </div>
  );
}
