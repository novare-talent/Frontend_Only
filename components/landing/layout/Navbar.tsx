"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import GlowButton from "@/components/landing/ui/GlowButton";
import { createClient } from "@/utils/supabase/client";

interface NavbarProps {
  simplified?: boolean;
}

export default function Navbar({ simplified = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleAuthClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      router.push("/Dashboard");
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <>
      {/* Floating Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-5 left-6 z-40 hidden xl:flex h-14 items-center"
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.svg"
            alt="Novare Talent"
            width={150}
            height={28}
          />
        </Link>
      </motion.div>

      {/* Floating Glass Nav — center */}
      {!simplified && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-40 hidden xl:flex"
        >
          <nav className="flex items-center gap-1 px-4 h-14 rounded-full glass backdrop-blur-lg border border-white/10">

            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white hover:text-white/80 transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-white/5 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </motion.div>
      )}
      
      {simplified && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.05 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-40 hidden xl:flex"
        >
          <nav className="flex items-center gap-1 px-4 h-14 rounded-full glass backdrop-blur-lg border border-white/10">
            <Link
              href="/"
              className="text-sm text-white hover:text-white/80 transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-white/5 whitespace-nowrap"
            >
              Home
            </Link>
          </nav>
        </motion.div>
      )}

      {/* Floating Right — socials + apply */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
        className="fixed top-5 right-6 z-40 hidden xl:flex items-center gap-3 h-14"
      >
        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors">
          <Instagram size={18} />
        </a>
        <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
        <a href="https://arena.novaretalent.com" target="_blank" rel="noopener noreferrer">
          <GlowButton variant="gaming">
            Try ArenaX<sup className="beta">beta</sup>
          </GlowButton>
        </a>
        <a href="/sign-in" onClick={handleAuthClick}>
          <GlowButton>
            Start your Journey
          </GlowButton>
        </a>
      </motion.div>

      {/* Mobile header - Floating Pill */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-5 left-4 right-4 z-40 xl:hidden"
      >
        <div className="flex items-center justify-between px-6 h-14 rounded-full glass border border-white/10 shadow-lg">
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/images/logo.svg"
              alt="Novare Talent"
              width={120}
              height={24}
            />
          </a>
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
            className="fixed inset-0 z-30 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl xl:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {!simplified && (
                <>
                  {NAV_LINKS.map((link, i) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setMobileOpen(false)}
                      className="text-2xl font-medium text-white hover:text-[var(--color-lavender)] transition-colors"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </>
              )}
              
              {simplified && (
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-medium text-white hover:text-[var(--color-lavender)] transition-colors"
                >
                  Home
                </Link>
              )}
              
              <a href="https://arena.novaretalent.com" target="_blank" rel="noopener noreferrer">
                <GlowButton variant="gaming">
                  Try ArenaX<sup className="beta">beta</sup>
                </GlowButton>
              </a>
              <a href="/sign-up" onClick={handleAuthClick}>
                <GlowButton>
                  Apply to Hire
                </GlowButton>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
