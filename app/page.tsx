import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import NovareLanding from "@/components/landing-v2/NovareLanding";

// Fonts are declared here (not in the root layout) so they only load on the
// landing page — dashboards keep Satoshi without preloading these.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Novare Talent — Hire Better. Hire Smarter. Hire Novare.",
  description:
    "Novare Talent helps startups and enterprises hire top talent through AI-powered recruitment, intelligent candidate evaluation, and India's most trusted elite talent network.",
};

export default function Home() {
  return (
    <div className={`${poppins.variable} ${inter.variable}`}>
      <NovareLanding />
    </div>
  );
}
