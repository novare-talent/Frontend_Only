import type { Metadata } from "next";
import NovareLanding from "@/components/landing-v2/NovareLanding";

export const metadata: Metadata = {
  title: "Novare Talent — Hire Better. Hire Smarter. Hire Novare.",
  description:
    "Novare Talent helps startups and enterprises hire top talent through AI-powered recruitment, intelligent candidate evaluation, and India's most trusted elite talent network.",
};

export default function Home() {
  return <NovareLanding />;
}
