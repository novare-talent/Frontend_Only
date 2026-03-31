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
          variant === "primary" &&
            "bg-gradient-to-b from-[#E2E2E5] via-[#646274] via-[#292642] to-[#8E89D1]",
          variant === "secondary" &&
            "bg-transparent border border-white/30 hover:bg-white/10",
          className
        )}
        style={{
          boxShadow: variant === "primary" ? "0px 8px 10px #2F2B5D" : undefined,
        }}
        {...props}
      >
        <span className="flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-b from-[#C5C5C7] to-[#5D5A97] text-white text-sm font-medium uppercase tracking-wider cursor-pointer">
          {children}
        </span>
      </button>
    );
  }
);

ChromeButton.displayName = "ChromeButton";

export default ChromeButton;
