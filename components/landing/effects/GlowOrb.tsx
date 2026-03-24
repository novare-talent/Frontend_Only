"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMousePosition } from "@/hooks/useMousePosition";

interface GlowOrbProps {
  className?: string;
  color?: string;
  size?: string;
  /** Max pixel displacement from cursor, default 30 */
  parallaxIntensity?: number;
  /** Move opposite to cursor direction for depth, default false */
  parallaxInvert?: boolean;
  /** Enable cursor tracking, default true */
  interactive?: boolean;
}

const springConfig = { damping: 30, stiffness: 80, mass: 1 };

export default function GlowOrb({
  className,
  color = "rgba(124, 58, 237, 0.15)",
  size = "600px",
  parallaxIntensity = 30,
  parallaxInvert = false,
  interactive = true,
}: GlowOrbProps) {
  const { nx, ny } = useMousePosition();
  const direction = parallaxInvert ? -1 : 1;

  const targetX = interactive ? nx * parallaxIntensity * direction : 0;
  const targetY = interactive ? ny * parallaxIntensity * direction : 0;

  const springX = useSpring(targetX, springConfig);
  const springY = useSpring(targetY, springConfig);

  // Update spring targets reactively
  springX.set(targetX);
  springY.set(targetY);

  return (
    <motion.div
      className={cn(
        "absolute rounded-full pointer-events-none blur-3xl",
        className
      )}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        width: size,
        height: size,
        x: springX,
        y: springY,
        willChange: "transform",
      }}
    />
  );
}
