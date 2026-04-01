import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PlacementStatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  subtext?: string;
  className?: string;
}

export default function PlacementStatsCard({
  icon: Icon,
  value,
  label,
  subtext,
  className,
}: PlacementStatsCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-6 glass-hover transition-all duration-300",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-violet-accent)]/10 flex items-center justify-center">
          <Icon size={20} className="text-[var(--color-violet-accent)]" />
        </div>
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl md:text-3xl font-bold gradient-text">{value}</p>
      {subtext && (
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{subtext}</p>
      )}
    </div>
  );
}
