import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hermit — Coming Soon",
  description:
    "Hermit sources qualified candidates directly from WhatsApp. Describe the role in plain English — Hermit searches, qualifies and coordinates without leaving the chat. Coming soon.",
};

export default function HermitComingSoon() {
  return (
    <div className="nvl-root ambient flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="microlabel" style={{ color: "var(--color-lav-deep)" }}>
        Hermit
      </p>
      <h1
        className="display mt-6 text-ink"
        style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.06 }}
      >
        Coming soon.
      </h1>
      <p className="mt-6 max-w-[46ch] text-[17px] leading-7 text-ink-2">
        Hiring that begins where conversations already happen. Hermit sources,
        qualifies and coordinates candidates directly from WhatsApp.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        <Link href="/" className="textlink">
          <span aria-hidden="true">&larr;</span> Back to home
        </Link>
        <a
          href="mailto:sahil@novaretalent.com?subject=Briefing%20request"
          className="textlink"
        >
          Schedule Briefing <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
