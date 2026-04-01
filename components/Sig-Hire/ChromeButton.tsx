import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ShineBorder } from "@/components/landing/ui/shine-border";

interface ChromeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const ChromeButton = forwardRef<HTMLButtonElement, ChromeButtonProps>(
  ({ className, children, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative px-1 py-1 rounded-md transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] cursor-pointer overflow-hidden",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95",
          variant === "primary" &&
            "bg-gradient-to-b from-[#bbbbed] via-[#646274] via-[#5e5897] to-[#7c3aed]",
          variant === "secondary" &&
            "bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-xl",
          className
        )}

        style={{
          boxShadow:
          "0px 8px 10px #2F2B5D" 
        }}
        {...props}

      >
        {variant === "primary" && <ShineBorder shineColor={["#7C3AED", "#FFFFFF", "#7a5af8"]} />}
        {variant === "secondary" && <ShineBorder shineColor={["#FFFFFF", "#C4B5FD", "#FFFFFF"]} />}
        <span className={cn(
          "flex items-center justify-center px-4 py-2 rounded-full text-white text-sm font-medium uppercase tracking-wider cursor-pointer transition-all duration-300",
          variant === "primary" && "bg-gradient-to-b from-[#C5C5C7] to-[#7c3aed] shadow-xs",
          variant === "secondary" && "bg-gradient-to-b from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-lg"
        )}>
          {children}
        </span>
      </button>
    );
  }
);

ChromeButton.displayName = "ChromeButton";

export default ChromeButton;
