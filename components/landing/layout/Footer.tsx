"use client";

import { Instagram } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FOOTER_LINKS, SOCIAL_LINKS, CONTACT } from "@/lib/constants";
import { createClient } from "@/utils/supabase/client";

export default function Footer() {
  const router = useRouter();

  const handleAuthClick = async (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      router.push("/Dashboard");
    } else {
      router.push(path);
    }
  };
  return (
    <footer className="relative overflow-hidden  bg-black/80 backdrop-blur-sm " style={{ backgroundImage: 'url(/images/footer-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative section-padding py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo.svg"
                alt="Novare Talent"
                width={140}
                height={26}
                className="text-[var(--color-violet-accent)]"
              />
            </div>
            <p className="text-sm text-white mb-4 leading-relaxed">
              India&apos;s elite talent network. Connecting top 1% institute graduates with companies building the future.
            </p>
            <p className="text-xs text-white">
              Incubated at SINE, IIT Bombay
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white hover:text-gray-300 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Discover
            </h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.discover.map((link) => (
                <li key={link.label}>
                  {link.href === "/Dashboard" || link.href === "/sign-up" ? (
                    <a
                      href={link.href}
                      onClick={(e) => handleAuthClick(e, link.href)}
                      className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-white hover:text-gray-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Connect
            </h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-sm text-white hover:text-gray-300 transition-colors"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <span className="text-sm text-white">
                  +91 {CONTACT.phone}
                </span>
              </li>
            </ul>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white text-center sm:text-left">
            © {new Date().getFullYear()} Novare Talent Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-end">
            {FOOTER_LINKS.legal.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-white hover:text-gray-300 transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
