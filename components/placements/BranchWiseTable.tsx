import type { BranchPlacement } from "@/data/iit-placements";

export default function BranchWiseTable({
  branches,
}: {
  branches: BranchPlacement[];
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-6 py-4 font-semibold text-[var(--color-lavender)]">
                Branch
              </th>
              <th className="text-right px-6 py-4 font-semibold text-[var(--color-lavender)]">
                Avg Package
              </th>
              <th className="text-right px-6 py-4 font-semibold text-[var(--color-lavender)]">
                Median Package
              </th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b, i) => (
              <tr
                key={i}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-3.5 font-medium text-white">{b.branch}</td>
                <td className="px-6 py-3.5 text-right text-[var(--color-text-secondary)]">
                  {b.avgPackage}
                </td>
                <td className="px-6 py-3.5 text-right text-[var(--color-text-secondary)]">
                  {b.medianPackage}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
