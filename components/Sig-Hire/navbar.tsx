"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/context/SessionContext";
import { Menu, X, Sparkles, LogOut } from "lucide-react";
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

const SESSION_AWARE_PATHS = [
  "/sig-hire/uploads",
  "/sig-hire/rankings",
  "/sig-hire/assignments",
  "/sig-hire/evaluations",
];

// Inner component that uses useSearchParams — must be wrapped in <Suspense>
function NavbarInner() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sessionId, setSessionId, setClientId } = useSession();
  const { addSession, sessions } = useMultiSession();
  const isHomePage = pathname === "/sig-hire";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const currentSessionId = searchParams.get("session_id") || sessionId;
  const sessionDisplay = currentSessionId
    ? `${currentSessionId.substring(0, 8)}...`
    : null;

  const buildHref = (item: (typeof navItems)[number]) =>
    SESSION_AWARE_PATHS.includes(item.href) && currentSessionId
      ? `${item.href}?session_id=${currentSessionId}`
      : item.href;

  const isActive = (href: string) =>
    pathname === href || (href !== "/sig-hire" && pathname.startsWith(href));

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSessionId(null);
    setClientId(null);
    router.push("/sig-hire");
  };

  const handleStartHiring = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/sign-in?redirect=/sig-hire/sessions");
      return;
    }

    if (sessions && sessions.length > 0) {
      router.push("/sig-hire/sessions");
      return;
    }

    try {
      setIsLoading(true);
      setClientId(user.id);
      const sessionResponse = await initializeSession(user.id);

      if (!sessionResponse.session_id) throw new Error("Failed to create session");

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

  const floatingStyles = {
    width: scrolled ? "85%" : "100%",
    minWidth: "900px",
    maxWidth: scrolled ? "1400px" : "calc(100% - 3rem)",
    transition: "width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1), max-width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
  };

  const scrolledBarClass = cn(
    "transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
    scrolled
      ? "bg-zinc-950/80 border-white/20 shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset] backdrop-blur-lg"
      : "border-transparent"
  );

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: scrolled ? 20 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-40 hidden lg:flex"
        style={floatingStyles}
      >
        <div className={cn("flex items-center justify-between w-full h-16 px-6 rounded-md border", scrolledBarClass)}>
          {/* Logo */}
          <div className="flex-shrink-0" style={{ width: "180px" }}>
            <Link href="/sig-hire" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold gradient-text">SigHyre</span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={buildHref(item)}
                data-tour={item.tourId}
                className={cn(
                  "text-sm transition-colors duration-200 px-3 py-1.5 rounded-md relative whitespace-nowrap",
                  isActive(item.href)
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3 justify-end flex-shrink-0" style={{ width: "240px" }}>
            {!isHomePage && sessionDisplay && (
              <div className="text-xs px-3 py-2 rounded-md glass border border-white/10 text-white/90 flex items-center gap-1 whitespace-nowrap">
                <span className="w-2 h-2 rounded-md bg-purple-500 animate-pulse" />
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
            <button
              onClick={handleLogout}
              className="text-white/70 hover:text-white transition-colors p-2 rounded-md hover:bg-white/5 flex-shrink-0 cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile Header ── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: scrolled ? 20 : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-40 lg:hidden"
        style={{
          width: scrolled ? "90%" : "calc(100% - 2rem)",
          transition: "width 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      >
        <div
          className={cn(
            "flex items-center justify-between px-4 sm:px-6 h-14 rounded-md border",
            "transition-all duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            scrolled || mobileOpen
              ? "bg-zinc-950/80 border-white/20 shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset] backdrop-blur-lg"
              : "border-transparent"
          )}
        >
          <Link href="/sig-hire" className="flex items-center gap-2">
            <span className="text-xl font-extrabold gradient-text">SigHyre</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* ── Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-14 shrink-0">
              <Link
                href="/sig-hire"
                className="text-xl font-extrabold gradient-text"
                onClick={() => setMobileOpen(false)}
              >
                SigHyre
              </Link>
              <button onClick={() => setMobileOpen(false)} className="text-white p-2">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 gap-5 px-6 pb-10">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={buildHref(item)}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "text-xl font-medium transition-colors",
                      isActive(item.href) ? "text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {!isHomePage && sessionDisplay && (
                <div className="mt-2 text-sm px-4 py-2 rounded-md glass border border-white/10 text-white/90 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-md bg-purple-500 animate-pulse" />
                  Session: {sessionDisplay}
                </div>
              )}

              {isHomePage && (
                <div className="mt-2">
                  <ChromeButton
                    onClick={() => { handleStartHiring(); setMobileOpen(false); }}
                    disabled={isLoading}
                    variant="primary"
                    className="flex items-center gap-2"
                  >
                    <Sparkles size={16} className="mr-2" />
                    {isLoading ? "Starting..." : "Start Hiring"}
                  </ChromeButton>
                </div>
              )}

              <motion.button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="mt-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors px-4 py-2 rounded-md hover:bg-white/5 cursor-pointer"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.06 }}
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Public export wraps the inner component in Suspense for useSearchParams
export function Navbar() {
  return (
    <Suspense fallback={null}>
      <NavbarInner />
    </Suspense>
  );
}