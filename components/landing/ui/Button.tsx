"use client";

import { cn } from "@/lib/utils";
import GlowButton from "@/components/landing/ui/GlowButton";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: ButtonProps) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variants = {
    primary: "", // Will use GlowButton for primary
    secondary:
      "bg-transparent border border-violet-accent/30 text-violet-accent hover:bg-violet-accent/10 transition-all duration-300",
  };

  // Use GlowButton for primary variant
  if (variant === "primary") {
    return (
      <GlowButton href={href} className={cn(sizes[size], className)}>
        {children}
      </GlowButton>
    );
  }

  const classes = cn(
    "rounded-full inline-flex items-center justify-center cursor-pointer",
    sizes[size],
    variants[variant],
    className
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
