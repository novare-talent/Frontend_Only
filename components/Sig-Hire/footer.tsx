import Link from "next/link";
import { Linkedin, Instagram } from "lucide-react";

export function SigHireFooter() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <Link href="/sig-hire" className="inline-block mb-4">
              <span className="text-2xl font-extrabold gradient-text">
                SigHyre
              </span>
            </Link>
            <p className="text-white/60 text-sm">
              AI-powered candidate ranking and evaluation platform
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Product</h3>
            <div className="space-y-2">
              <Link href="/sig-hire/sessions" className="block text-white/60 hover:text-white text-sm transition-colors">
                Sessions
              </Link>
              <Link href="/sig-hire/rankings" className="block text-white/60 hover:text-white text-sm transition-colors">
                Rankings
              </Link>
              <Link href="/sig-hire/insights" className="block text-white/60 hover:text-white text-sm transition-colors">
                Insights
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Company</h3>
            <div className="space-y-2">
              <Link href="/#About" className="block text-white/60 hover:text-white text-sm transition-colors">
                About
              </Link>
              <Link href="/#contact" className="block text-white/60 hover:text-white text-sm transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Legal</h3>
            <div className="space-y-2">
              <Link href="/Terms&Conditions.pdf" className="block text-white/60 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/Refund&CreditPolicy.pdf" className="block text-white/60 hover:text-white text-sm transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/60 text-sm text-center md:text-left">
            <p>© {new Date().getFullYear()} Novare Talent Private Limited. All rights reserved</p>
            <p className="mt-1">sahil@novaretalent.com • Contact: 8708260409</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="https://www.linkedin.com/company/novare-talent/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.instagram.com/novare_talent?igsh=MWZnc3dnMG5xbXR2OQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
