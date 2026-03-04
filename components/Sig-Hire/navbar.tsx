"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@heroui/react";
import { ModeToggle } from "../toggle-button";
import { useSession } from "@/context/SessionContext";
import { ChevronRight } from "lucide-react";

const navItems = [
  { label: "Home", href: "/sig-hire/home" },
  { label: "Sessions", href: "/sig-hire/sessions" },
  { label: "Uploads", href: "/sig-hire/uploads" },
  { label: "Rankings", href: "/sig-hire/rankings" },
  { label: "Assignments", href: "/sig-hire/assignments" },
  { label: "Evaluations", href: "/sig-hire/evaluations" },
  { label: "Insights", href: "/sig-hire/insights" },
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sessionId } = useSession();
  
  const currentSessionId = searchParams.get('session_id') || sessionId;
  const sessionDisplay = currentSessionId ? 
    `Session: ${currentSessionId.substring(0, 8)}...` : 
    null;

  return (
    <nav
      className="sticky top-0 z-50 w-full
      border-b border-purple-100
      bg-white/80 backdrop-blur-md
      dark:border-white/10 dark:bg-neutral-950/80"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2">
        {/* Logo */}
        <Link
          href="/sig-hire/home"
          className="text-xl font-extrabold
          bg-gradient-to-r from-purple-600 to-indigo-600
          bg-clip-text text-transparent"
        >
          SigHyre
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            // Add session_id to certain routes
            const shouldAddSessionId = [
              '/sig-hire/uploads',
              '/sig-hire/rankings',
              '/sig-hire/assignments',
              '/sig-hire/evaluations'
            ].includes(item.href);

            const href = shouldAddSessionId && currentSessionId 
              ? `${item.href}?session_id=${currentSessionId}`
              : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap",
                  "text-neutral-600 hover:text-purple-600 hover:bg-purple-50",
                  "dark:text-neutral-300 dark:hover:text-purple-400 dark:hover:bg-white/5",
                  isActive &&
                    "text-purple-600 bg-purple-100/70 dark:text-purple-400 dark:bg-purple-500/10"
                )}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full
                    bg-gradient-to-r from-purple-500 to-indigo-500"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Session indicator and Right actions */}
        <div className="flex items-center gap-3">
          {sessionDisplay && (
            <div className="text-xs px-2 py-1 rounded-full bg-purple-100/50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 flex items-center gap-1">
              {sessionDisplay}
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
