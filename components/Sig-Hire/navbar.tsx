"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@heroui/react";
import { ModeToggle } from "../toggle-button";

const navItems = [
  { label: "Home", href: "/sig-hire/home" },
  { label: "Uploads", href: "/sig-hire/uploads" },
  { label: "Rankings", href: "/sig-hire/rankings" },
  { label: "Assignments", href: "/sig-hire/assignments" },
  { label: "Evaluations", href: "/sig-hire/evaluations" },
  { label: "Insights", href: "/sig-hire/insights" },
];

export function Navbar() {
  const pathname = usePathname();

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
          href="/"
          className="text-xl font-extrabold
          bg-gradient-to-r from-purple-600 to-indigo-600
          bg-clip-text text-transparent"
        >
          SigHire
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-4 py-2 text-sm font-large transition",
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

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
