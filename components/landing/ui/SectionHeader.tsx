import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/landing/effects/ScrollReveal";

interface SectionHeaderProps {
  tag?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  className?: string;
  centered?: boolean;
}

export default function SectionHeader({
  tag,
  title,
  titleAccent,
  description,
  className,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div className={cn(centered && "text-center", "mb-10", className)}>
      {tag && (
        <ScrollReveal>
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium tracking-wide text-[var(--color-lavender)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] mb-6">
            {tag}
          </span>
        </ScrollReveal>
      )}
      <ScrollReveal delay={0.1}>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          {title}
          {titleAccent && (
            <span className="gradient-text"> {titleAccent}</span>
          )}
        </h2>
      </ScrollReveal>
      {description && (
        <ScrollReveal delay={0.2}>
          <p className="mt-4 text-lg text-white max-w-2xl mx-auto">
            {description}
          </p>
        </ScrollReveal>
      )}
    </div>
  );
}
