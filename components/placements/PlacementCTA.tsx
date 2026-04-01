import { ArrowRight } from "lucide-react";

export default function PlacementCTA({ iitName }: { iitName?: string }) {
  const heading = iitName
    ? `Ready to Hire from ${iitName}?`
    : "Ready to Hire from IITs?";

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="section-padding relative z-10">
        <div className="glass rounded-3xl p-8 md:p-14 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-violet-accent)]/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              {heading}
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8">
              Novare Talent gives you curated access to verified IIT talent —
              without the formal placement cell process. Get 3-5 matched
              candidates in under 48 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/Dashboard"
                className="glow-button text-white font-medium px-8 py-3.5 rounded-full inline-flex items-center gap-2"
              >
                Hire IIT Talent
                <ArrowRight size={18} />
              </a>
              <a
                href="mailto:info@novaretalent.com"
                className="rounded-full px-8 py-3.5 border border-[var(--color-violet-accent)]/30 text-[var(--color-violet-accent)] hover:bg-[var(--color-violet-accent)]/10 transition-all duration-300 font-medium inline-flex items-center gap-2"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
