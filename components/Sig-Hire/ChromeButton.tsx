import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ChromeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const ChromeButton = forwardRef<HTMLButtonElement, ChromeButtonProps>(
  ({ className, children, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative px-1 py-1 rounded-md transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95",
          variant === "primary" &&
            "bg-gradient-to-b from-[#bbbbed] via-[#646274] via-[#5e5897] to-[#7c3aed]",
          variant === "secondary" &&
            "bg-transparent border border-white/30 hover:bg-white/10",
          className
        )}
        style={{
          boxShadow: variant === "primary" ? "0px 8px 10px #2F2B5D" : undefined,
        }}
        {...props}

      >
        <span className="flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-b from-[#C5C5C7] to-[#7c3aed] text-white text-sm font-medium uppercase tracking-wider cursor-pointer shadow-xs transition-all duration-300">
          {children}
        </span>
      </button>
    );
  }
);

ChromeButton.displayName = "ChromeButton";

export default ChromeButton;
