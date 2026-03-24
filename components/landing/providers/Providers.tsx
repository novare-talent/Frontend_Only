"use client";

import { MousePositionProvider } from "@/hooks/useMousePosition";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <MousePositionProvider>{children}</MousePositionProvider>;
}
