import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import CareerBlogsClient from "./CareerBlogsClient";

const TITLE = "Career Navigator Blogs | Novare Talent";
const DESCRIPTION =
  "Practical career guides, resources and downloads for students and early-career professionals, curated by Novare Talent.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/career-blogs` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/career-blogs`,
  },
};

export default function CareerBlogsPage() {
  return <CareerBlogsClient />;
}
