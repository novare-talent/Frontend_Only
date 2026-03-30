"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";
import { ChevronRight, Menu, X, Sparkles } from "lucide-react";
import Image from "next/image";
import GlowButton from "@/components/landing/ui/GlowButton";
import { useMultiSession } from "@/context/MultiSessionContext";
import { initializeSession } from "@/lib/ranking-api";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { label: "Home", href: "/sig-hire" },
  { label: "Sessions", href: "/sig-hire/sessions" },
  { label: "Uploads", href: "/sig-hire/uploads" },
  { label: "Rankings", href: "/sig-hire/rankings" },
  { label: "Assignments", href: "/sig-hire/assignments" },
  { label: "Evaluations", href: "/sig-hire/evaluations" },
  { label: "Insights", href: "/sig-hire/insights" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sessionId, setSessionId, setClientId } = useSession();
  const { addSession } = useMultiSession();
  
  const currentSessionId = searchParams.get('session_id') || sessionId;
  const sessionDisplay = currentSessionId ? 
    `${currentSessionId.substring(0, 8)}...` : 
    null;

  const handleStartHiring = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/sign-in");
        return;
      }

      setClientId(user.id);
      const sessionResponse = await initializeSession(user.id);
      
      if (!sessionResponse.session_id) {
        throw new Error("Failed to create session");
      }

      await addSession({
        session_id: sessionResponse.session_id,
        client_id: user.id,
        status: "initialized",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      setSessionId(sessionResponse.session_id);
      router.push(`/sig-hire/uploads?session_id=${sessionResponse.session_id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-5 left-6 z-40 hidden lg:flex"
      >
        <Link href="/sig-hire" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            SigHyre
          </span>
        </Link>
      </motion.div>

      {/* Floating Glass Nav — center */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
        className="fixed top-5 left-1/2 -translate-x-1/2 z-40 hidden lg:flex"
      >
        <nav className="flex items-center gap-1 px-4 py-2 rounded-full glass backdrop-blur-lg border border-white/10">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/sig-hire" && pathname.startsWith(item.href));
            const shouldAddSessionId = ['/sig-hire/uploads', '/sig-hire/rankings', '/sig-hire/assignments', '/sig-hire/evaluations'].includes(item.href);
            const href = shouldAddSessionId && currentSessionId ? `${item.href}?session_id=${currentSessionId}` : item.href;

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "text-sm transition-colors duration-200 px-3 py-1.5 rounded-full relative",
                  isActive ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </motion.div>

      {/* Floating Right — session indicator + start hiring */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        className="fixed top-5 right-6 z-40 hidden lg:flex items-center gap-3"
      >
        {sessionDisplay && (
          <div className="text-xs px-3 py-2 rounded-full glass border border-white/10 text-white/90 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            {sessionDisplay}
          </div>
        )}
        <GlowButton 
          onClick={handleStartHiring} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Sparkles size={16} />
          {isLoading ? "Starting..." : "Start Hiring"}
        </GlowButton>
      </motion.div>

      {/* Mobile header - Floating Pill */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-5 left-4 right-4 z-40 lg:hidden"
      >
        <div className="flex items-center justify-between px-6 h-14 rounded-full glass border border-white/10 shadow-lg">
          <Link href="/sig-hire" className="flex items-center gap-2">
            <span className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              SigHyre
            </span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navItems.map((item, i) => {
                const shouldAddSessionId = ['/sig-hire/uploads', '/sig-hire/rankings', '/sig-hire/assignments', '/sig-hire/evaluations'].includes(item.href);
                const href = shouldAddSessionId && currentSessionId ? `${item.href}?session_id=${currentSessionId}` : item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="text-2xl font-medium text-white hover:text-[var(--color-lavender)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              {sessionDisplay && (
                <div className="text-sm px-4 py-2 rounded-full glass border border-white/10 text-white/90 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Session: {sessionDisplay}
                </div>
              )}
              <GlowButton 
                onClick={() => { handleStartHiring(); setMobileOpen(false); }} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Sparkles size={16} />
                {isLoading ? "Starting..." : "Start Hiring"}
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
