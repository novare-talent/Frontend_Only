"use client";

import { useEffect, useRef } from "react";
import { useMousePositionRef } from "@/hooks/useMousePosition";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  opacity: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const mousePos = useMousePositionRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const count = Math.min(80, Math.floor(window.innerWidth / 15));
    particlesRef.current = Array.from({ length: count }, () => {
      const baseOpacity = Math.random() * 0.5 + 0.2;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        baseOpacity,
        opacity: baseOpacity,
      };
    });

    const maxDist = 150;
    const attractRadius = 250;
    const spotlightRadius = 300;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mousePos.current;

      // Draw cursor spotlight — a soft radial glow at cursor position
      if (!mouse.isTouch && mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          spotlightRadius
        );
        gradient.addColorStop(0, "rgba(124, 58, 237, 0.04)");
        gradient.addColorStop(0.5, "rgba(124, 58, 237, 0.015)");
        gradient.addColorStop(1, "rgba(124, 58, 237, 0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, spotlightRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      for (const p of particles) {
        // Mouse interaction with enhanced attraction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < attractRadius) {
          const force = (1 - dist / attractRadius) * 0.00008;
          p.vx += dx * force;
          p.vy += dy * force;

          // Particles near cursor glow brighter
          const glowFactor = 1 - dist / attractRadius;
          p.opacity = p.baseOpacity + glowFactor * 0.5;
        } else {
          // Decay back to base opacity
          p.opacity += (p.baseOpacity - p.opacity) * 0.02;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Wrap edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Color shift: violet → indigo near cursor
        const nearCursor = dist < attractRadius;
        const r = nearCursor ? Math.round(124 - (dist / attractRadius) * 45) : 124;
        const g = nearCursor ? Math.round(58 + (1 - dist / attractRadius) * 12) : 58;
        const b = nearCursor ? Math.round(237 - (1 - dist / attractRadius) * 8) : 237;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + (nearCursor ? (1 - dist / attractRadius) * 1.5 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(p.opacity, 1)})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            // Boost connection opacity near cursor
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const cursorDist = Math.sqrt(
              (mouse.x - midX) ** 2 + (mouse.y - midY) ** 2
            );
            const cursorBoost =
              cursorDist < attractRadius
                ? 1 + (1 - cursorDist / attractRadius) * 1.5
                : 1;

            const opacity = (1 - dist / maxDist) * 0.15 * cursorBoost;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124, 58, 237, ${Math.min(opacity, 0.4)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [mousePos]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
