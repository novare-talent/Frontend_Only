"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { type IITPlacementData, getLatestPlacement } from "@/data/iit-placements";

type SortKey = "nirfRank" | "highestPackage" | "averagePackage" | "medianPackage" | "placementPercentage";

function parsePackageValue(pkg: string): number {
  const cleaned = pkg.replace(/[₹,+\s]/g, "");
  if (cleaned.includes("Cr")) return parseFloat(cleaned) * 100;
  if (cleaned.includes("LPA")) return parseFloat(cleaned);
  return parseFloat(cleaned) || 0;
}

function parsePercentage(pct: string): number {
  return parseFloat(pct.replace(/[%+]/g, "")) || 0;
}

export default function IITPlacementTable({ data }: { data: IITPlacementData[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("nirfRank");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const pA = getLatestPlacement(a);
      const pB = getLatestPlacement(b);
      let valA: number, valB: number;

      switch (sortKey) {
        case "nirfRank":
          valA = a.nirfRank ?? 99;
          valB = b.nirfRank ?? 99;
          break;
        case "highestPackage":
          valA = parsePackageValue(pA.highestPackage);
          valB = parsePackageValue(pB.highestPackage);
          break;
        case "averagePackage":
          valA = parsePackageValue(pA.averagePackage);
          valB = parsePackageValue(pB.averagePackage);
          break;
        case "medianPackage":
          valA = parsePackageValue(pA.medianPackage);
          valB = parsePackageValue(pB.medianPackage);
          break;
        case "placementPercentage":
          valA = parsePercentage(pA.placementPercentage);
          valB = parsePercentage(pB.placementPercentage);
          break;
      }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [data, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "nirfRank");
    }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={14} className="opacity-20" />;
    return sortAsc ? (
      <ChevronUp size={14} className="text-[var(--color-violet-accent)]" />
    ) : (
      <ChevronDown size={14} className="text-[var(--color-violet-accent)]" />
    );
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-4 font-semibold text-[var(--color-lavender)] whitespace-nowrap sticky left-0 bg-[var(--color-glass-bg)] backdrop-blur-xl z-10">
                IIT
              </th>
              {(
                [
                  ["nirfRank", "NIRF Rank"],
                  ["highestPackage", "Highest"],
                  ["averagePackage", "Average"],
                  ["medianPackage", "Median"],
                  ["placementPercentage", "Placed %"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="text-right px-4 py-4 font-semibold text-[var(--color-lavender)] whitespace-nowrap cursor-pointer select-none hover:text-white transition-colors"
                >
                  <span className="inline-flex items-center gap-1 justify-end">
                    {label}
                    <SortIcon col={key} />
                  </span>
                </th>
              ))}
              <th className="text-left px-4 py-4 font-semibold text-[var(--color-lavender)] whitespace-nowrap hidden lg:table-cell">
                Top Recruiters
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((iit) => {
              const p = getLatestPlacement(iit);
              return (
                <tr
                  key={iit.slug}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3.5 font-medium sticky left-0 bg-[var(--color-glass-bg)] backdrop-blur-xl z-10">
                    <Link
                      href={`/iit-placements/${iit.slug}`}
                      className="text-white hover:text-[var(--color-lavender)] transition-colors"
                    >
                      {iit.name}
                    </Link>
                    <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
                      {iit.city}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[var(--color-text-secondary)]">
                    {iit.nirfRank ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-white">
                    {p.highestPackage}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[var(--color-text-secondary)]">
                    {p.averagePackage}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[var(--color-text-secondary)]">
                    {p.medianPackage}
                  </td>
                  <td className="px-4 py-3.5 text-right text-[var(--color-text-secondary)]">
                    {p.placementPercentage}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--color-text-muted)] text-xs hidden lg:table-cell max-w-[200px] truncate">
                    {p.topRecruiters.slice(0, 5).join(", ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
