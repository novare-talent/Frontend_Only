"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface MousePosition {
  /** Normalized X [-1, 1], smoothed */
  nx: number;
  /** Normalized Y [-1, 1], smoothed */
  ny: number;
  /** Raw pixel X */
  x: number;
  /** Raw pixel Y */
  y: number;
  /** Whether the device is touch-only */
  isTouch: boolean;
}

const defaultPosition: MousePosition = {
  nx: 0,
  ny: 0,
  x: 0,
  y: 0,
  isTouch: false,
};

const MousePositionContext = createContext<MousePosition>(defaultPosition);

const LERP_FACTOR = 0.07;

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function MousePositionProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<MousePosition>(defaultPosition);
  const rawRef = useRef({ x: 0, y: 0, nx: 0, ny: 0 });
  const smoothRef = useRef({ nx: 0, ny: 0, x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const isTouchRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);
  const UPDATE_INTERVAL = 3; // Only update React state every 3 frames (~50ms at 60fps)

  const animate = useCallback(() => {
    if (reducedMotionRef.current) {
      setPosition((prev) =>
        prev.nx === 0 && prev.ny === 0
          ? prev
          : { nx: 0, ny: 0, x: 0, y: 0, isTouch: isTouchRef.current }
      );
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    if (isTouchRef.current) {
      // Gentle auto-oscillation for touch devices
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      rawRef.current.nx = Math.sin(elapsed * 0.3) * 0.25;
      rawRef.current.ny = Math.cos(elapsed * 0.5) * 0.18;
    }

    smoothRef.current.nx = lerp(
      smoothRef.current.nx,
      rawRef.current.nx,
      LERP_FACTOR
    );
    smoothRef.current.ny = lerp(
      smoothRef.current.ny,
      rawRef.current.ny,
      LERP_FACTOR
    );
    smoothRef.current.x = lerp(
      smoothRef.current.x,
      rawRef.current.x,
      LERP_FACTOR
    );
    smoothRef.current.y = lerp(
      smoothRef.current.y,
      rawRef.current.y,
      LERP_FACTOR
    );

    // Only update React state every N frames to reduce re-renders
    frameCountRef.current++;
    if (frameCountRef.current >= UPDATE_INTERVAL) {
      frameCountRef.current = 0;
      setPosition({
        nx: smoothRef.current.nx,
        ny: smoothRef.current.ny,
        x: smoothRef.current.x,
        y: smoothRef.current.y,
        isTouch: isTouchRef.current,
      });
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Detect reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    motionQuery.addEventListener("change", handleMotionChange);

    // Detect touch device
    isTouchRef.current =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const handleMouseMove = (e: MouseEvent) => {
      // If we get a mouse event, it's not touch-only
      isTouchRef.current = false;
      const w = window.innerWidth;
      const h = window.innerHeight;
      rawRef.current.x = e.clientX;
      rawRef.current.y = e.clientY;
      rawRef.current.nx = (e.clientX / w) * 2 - 1;
      rawRef.current.ny = (e.clientY / h) * 2 - 1;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Start animation loop
    startTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      motionQuery.removeEventListener("change", handleMotionChange);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return (
    <MousePositionContext.Provider value={position}>
      {children}
    </MousePositionContext.Provider>
  );
}

export function useMousePosition(): MousePosition {
  return useContext(MousePositionContext);
}

/**
 * Returns a ref that stays in sync with mouse position
 * without causing React re-renders. Ideal for canvas/rAF consumers.
 */
export function useMousePositionRef() {
  const position = useMousePosition();
  const ref = useRef(position);
  ref.current = position;
  return ref;
}
