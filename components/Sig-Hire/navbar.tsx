"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";
import { ChevronRight, Menu, X, Sparkles } from "lucide-react";
import Image from "next/image";
import ChromeButton from "@/components/Sig-Hire/ChromeButton";
import { useMultiSession } from "@/context/MultiSessionContext";
import { initializeSession } from "@/lib/ranking-api";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { label: "Home", href: "/sig-hire", tourId: "nav-home" },
  { label: "Sessions", href: "/sig-hire/sessions", tourId: "nav-sessions" },
  { label: "Uploads", href: "/sig-hire/uploads", tourId: "nav-uploads" },
  { label: "Rankings", href: "/sig-hire/rankings", tourId: "nav-rankings" },
  { label: "Assignments", href: "/sig-hire/assignments", tourId: "nav-assignments" },
  { label: "Evaluations", href: "/sig-hire/evaluations", tourId: "nav-evaluations" },
  { label: "Insights", href: "/sig-hire/insights", tourId: "nav-insights" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sessionId, setSessionId, setClientId } = useSession();
  const { addSession } = useMultiSession();
  const isHomePage = pathname === "/sig-hire";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
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
      {/* Desktop Navbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: scrolled ? 20 : 0, 
          opacity: 1
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-40 hidden lg:flex"
        style={{
          width: scrolled ? "85%" : "100%",
          minWidth: "900px",
          maxWidth: scrolled ? "1400px" : "calc(100% - 3rem)",
          transition: "width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), max-width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)"
        }}
      >
        <div className={cn(
          "flex items-center justify-between w-full h-16 px-6 rounded-full backdrop-blur-lg border",
          "transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          scrolled 
            ? "bg-neutral-950/80 border-white/20 shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            : "border-transparent"
        )}>
          {/* Logo - Fixed Width */}
          <div className="flex-shrink-0" style={{ width: "180px" }}>
            <Link href="/sig-hire" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold gradient-text">
                SigHyre
              </span>
            </Link>
          </div>

          {/* Nav Items - Centered */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/sig-hire" && pathname.startsWith(item.href));
              const shouldAddSessionId = ['/sig-hire/uploads', '/sig-hire/rankings', '/sig-hire/assignments', '/sig-hire/evaluations'].includes(item.href);
              const href = shouldAddSessionId && currentSessionId ? `${item.href}?session_id=${currentSessionId}` : item.href;

              return (
                <Link
                  key={item.href}
                  href={href}
                  data-tour={item.tourId}
                  className={cn(
                    "text-sm transition-colors duration-200 px-3 py-1.5 rounded-full relative whitespace-nowrap",
                    isActive ? "text-white bg-white/10" : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section - Fixed Width */}
          <div className="flex items-center gap-3 justify-end flex-shrink-0" style={{ width: "180px" }}>
            {!isHomePage && sessionDisplay && (
              <div className="text-xs px-3 py-2 rounded-full glass border border-white/10 text-white/90 flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                {sessionDisplay}
              </div>
            )}
            {isHomePage && (
              <ChromeButton 
                onClick={handleStartHiring} 
                disabled={isLoading}
                variant="primary"
                className="flex items-center gap-2 whitespace-nowrap"
                data-tour="start-hiring-btn"
              >
                <Sparkles size={16} />
                {isLoading ? "Starting..." : "Start Hiring"}
              </ChromeButton>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile header - Floating Pill */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ 
          y: scrolled ? 20 : 0, 
          opacity: 1
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-5 left-4 right-4 z-40 lg:hidden mx-auto"
        style={{ 
          width: scrolled ? "90%" : "calc(100% - 2rem)",
          maxWidth: scrolled ? "90%" : "100%",
          transition: "width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), max-width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)"
        }}
      >
        <div className={cn(
          "flex items-center justify-between px-6 h-16 rounded-full border shadow-lg backdrop-blur-lg",
          "transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
          scrolled
            ? "bg-neutral-950/80 border-white/20 shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]"
            : "border-transparent"
        )}>
          <Link href="/sig-hire" className="flex items-center gap-2">
            <span className="text-xl font-extrabold gradient-text">
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
              {!isHomePage && sessionDisplay && (
                <div className="text-sm px-4 py-2 rounded-full glass border border-white/10 text-white/90 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  Session: {sessionDisplay}
                </div>
              )}
              {isHomePage && (
                <ChromeButton 
                  onClick={() => { handleStartHiring(); setMobileOpen(false); }} 
                  disabled={isLoading}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  {isLoading ? "Starting..." : "Start Hiring"}
                </ChromeButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
