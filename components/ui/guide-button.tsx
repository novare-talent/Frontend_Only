import { HelpCircle } from "lucide-react";

interface GuideButtonProps {
  onClick: () => void;
  className?: string;
}

export function GuideButton({ onClick, className = "" }: GuideButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] hover:border-[var(--color-lavender)]/50 transition-colors ${className}`}
      title="Start Guide"
      aria-label="Start interactive guide"
    >
      <HelpCircle className="w-5 h-5 text-[var(--color-lavender)]" />
    </button>
  );
}
