"use client";

import { motion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMousePosition } from "@/hooks/useMousePosition";

interface AuroraMeshProps {
  className?: string;
  /** Overall movement intensity multiplier, default 1 */
  intensity?: number;
  /** Base opacity, default 1 */
  opacity?: number;
}

const springConfig = { damping: 40, stiffness: 50, mass: 1.2 };

interface BlobConfig {
  color: string;
  size: string;
  position: string;
  parallax: number;
  driftClass: string;
  blur: string;
}

const blobs: BlobConfig[] = [
  {
    color: "rgba(124, 58, 237, 0.4)",
    size: "60%",
    position: "top-[-20%] left-[-10%]",
    parallax: 35,
    driftClass: "animate-aurora-drift-1",
    blur: "blur-[80px]",
  },
  {
    color: "rgba(79, 70, 229, 0.3)",
    size: "50%",
    position: "bottom-[-15%] right-[-15%]",
    parallax: -25,
    driftClass: "animate-aurora-drift-2",
    blur: "blur-[60px]",
  },
  {
    color: "rgba(59, 130, 246, 0.25)",
    size: "45%",
    position: "top-[30%] right-[10%]",
    parallax: 45,
    driftClass: "animate-aurora-drift-3",
    blur: "blur-[100px]",
  },
  {
    color: "rgba(168, 85, 247, 0.2)",
    size: "40%",
    position: "bottom-[10%] left-[20%]",
    parallax: -18,
    driftClass: "animate-aurora-drift-4",
    blur: "blur-[70px]",
  },
];

export default function AuroraMesh({
  className,
  intensity = 1,
  opacity = 1,
}: AuroraMeshProps) {
  const { nx, ny } = useMousePosition();

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      style={{ opacity, contain: "layout style paint" }}
    >
      {blobs.map((blob, i) => {
        const targetX = nx * blob.parallax * intensity;
        const targetY = ny * blob.parallax * intensity;

        return (
          <AuroraBlob
            key={i}
            blob={blob}
            targetX={targetX}
            targetY={targetY}
          />
        );
      })}
    </div>
  );
}

function AuroraBlob({
  blob,
  targetX,
  targetY,
}: {
  blob: BlobConfig;
  targetX: number;
  targetY: number;
}) {
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);

  springX.set(targetX);
  springY.set(targetY);

  return (
    <motion.div
      className={cn(
        "absolute rounded-full",
        blob.blur,
        blob.position,
        blob.driftClass
      )}
      style={{
        background: `radial-gradient(circle, ${blob.color} 0%, transparent 65%)`,
        width: blob.size,
        aspectRatio: "1",
        x: springX,
        y: springY,
        willChange: "transform",
      }}
    />
  );
}
