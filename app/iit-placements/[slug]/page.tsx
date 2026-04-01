import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Globe,
  Award,
  MapPin,
  ExternalLink,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/placements/Breadcrumbs";
import PlacementStatsCard from "@/components/placements/PlacementStatsCard";
import BranchWiseTable from "@/components/placements/BranchWiseTable";
import PlacementTrends from "@/components/placements/PlacementTrends";
import PlacementFAQ from "@/components/placements/PlacementFAQ";
import PlacementCTA from "@/components/placements/PlacementCTA";
import ScrollReveal from "@/components/effects/ScrollReveal";
import {
  getAllIITs,
  getIITBySlug,
  getRelatedIITs,
  getLatestPlacement,
} from "@/data/iit-placements";

export function generateStaticParams() {
  return getAllIITs().map((iit) => ({ slug: iit.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const iit = getIITBySlug(slug);
  if (!iit) return {};

  const p = getLatestPlacement(iit);
  return {
    title: `${iit.name} Placements 2025: Highest Package, Average Salary & Top Recruiters | Novare Talent`,
    description: `Complete ${iit.name} placement data for 2025. Highest package: ${p.highestPackage}, Average: ${p.averagePackage}. Branch-wise stats, top recruiters, and placement trends for ${iit.fullName}.`,
    openGraph: {
      title: `${iit.name} Placements 2025 | Novare Talent`,
      description: `${iit.name} placement stats: Highest ${p.highestPackage}, Average ${p.averagePackage}, ${p.placementPercentage} placed. Complete guide.`,
      type: "article",
      url: `https://www.novaretalent.com/iit-placements/${iit.slug}`,
    },
    alternates: {
      canonical: `https://www.novaretalent.com/iit-placements/${iit.slug}`,
    },
  };
}

export default async function IITSubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const iit = getIITBySlug(slug);
  if (!iit) notFound();

  const latestPlacement = getLatestPlacement(iit);
  const related = getRelatedIITs(slug);

  const genLabel =
    iit.generation === "gen1"
      ? "Original IIT"
      : iit.generation === "gen2"
        ? "Established 2008-09"
        : "Newer IIT";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${iit.name} Placements 2025: Complete Salary & Recruiter Guide`,
    author: {
      "@type": "Organization",
      name: "Novare Talent",
      url: "https://www.novaretalent.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Novare Talent",
      url: "https://www.novaretalent.com",
    },
    datePublished: "2025-03-01",
    dateModified: "2025-03-31",
    description: `Complete placement data for ${iit.fullName} including salary packages, top recruiters, branch-wise statistics, and placement trends.`,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: iit.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="relative z-[1]">
      <Navbar />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "IIT Placements", href: "/iit-placements" },
          { label: `${iit.name} Placements` },
        ]}
      />

      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="pt-8 pb-16 md:pb-20">
        <div className="section-padding">
          <ScrollReveal>
            <Link
              href="/iit-placements"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-lavender)] transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              All IIT Placements
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.05}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-violet-accent)]/20 text-[var(--color-lavender)]">
                {genLabel}
              </span>
              {iit.nirfRank && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-[var(--color-text-secondary)]">
                  NIRF Rank #{iit.nirfRank}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <MapPin size={12} />
                {iit.city}, {iit.state}
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-4xl">
              {iit.name} Placements 2025:{" "}
              <span className="gradient-text">
                Packages, Recruiters & Complete Stats
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg text-[var(--color-text-secondary)] max-w-3xl leading-relaxed">
              {iit.description}
            </p>
          </ScrollReveal>

          {iit.ocsLink && (
            <ScrollReveal delay={0.25}>
              <a
                href={iit.ocsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-[var(--color-violet-accent)] hover:text-[var(--color-lavender)] transition-colors"
              >
                Official Placement Cell
                <ExternalLink size={14} />
              </a>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          KEY STATS
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-24">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-xl md:text-2xl font-bold mb-6">
              Key Placement Highlights — {latestPlacement.year}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <PlacementStatsCard
                icon={TrendingUp}
                value={latestPlacement.highestPackage}
                label="Highest Package"
              />
              <PlacementStatsCard
                icon={Award}
                value={latestPlacement.averagePackage}
                label="Average Package"
              />
              <PlacementStatsCard
                icon={GraduationCap}
                value={latestPlacement.medianPackage}
                label="Median Package"
              />
              <PlacementStatsCard
                icon={Users}
                value={latestPlacement.placementPercentage}
                label="Placement Rate"
              />
              <PlacementStatsCard
                icon={Building2}
                value={latestPlacement.totalOffers}
                label="Total Offers"
              />
              <PlacementStatsCard
                icon={Globe}
                value={latestPlacement.internationalOffers}
                label="Intl. Offers"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BRANCH-WISE DATA
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-24">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Branch-wise Placement Data
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Average and median packages by department for the {latestPlacement.year} placement season.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="max-w-2xl">
              <BranchWiseTable branches={latestPlacement.branchWise} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PLACEMENT TRENDS (if multi-year data exists)
      ════════════════════════════════════════════ */}
      {iit.placements.length >= 2 && (
        <section className="pb-20 md:pb-24">
          <div className="section-padding">
            <ScrollReveal>
              <h2 className="text-xl md:text-2xl font-bold mb-6">
                Year-over-Year Placement Trends
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <PlacementTrends placements={iit.placements} />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          TOP RECRUITERS
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-24">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Top Recruiters at {iit.name}
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              Companies that actively recruit from {iit.name} during campus placements.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex flex-wrap gap-2">
                {latestPlacement.topRecruiters.map((company) => (
                  <span
                    key={company}
                    className="px-4 py-2 rounded-full text-sm bg-white/5 text-white border border-white/10 hover:border-[var(--color-violet-accent)]/30 transition-colors"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          HOW TO HIRE
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-24">
        <div className="section-padding max-w-4xl">
          <ScrollReveal>
            <h2 className="text-xl md:text-2xl font-bold mb-6">
              How to Hire from {iit.name}
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed space-y-4">
              <p>
                Companies looking to recruit from {iit.name} have two primary
                pathways:
              </p>

              <h3 className="text-lg font-semibold text-white mt-6 mb-3">
                1. Through the Official Placement Cell
              </h3>
              <p>
                {iit.name}&apos;s placement cell manages the formal campus
                recruitment process. Companies need to register in advance
                (typically by August-September), meet minimum CTC requirements,
                and follow the institute&apos;s placement policies. The process is
                well-structured but requires significant lead time and
                administrative coordination.
              </p>
              {iit.ocsLink && (
                <p>
                  Visit the{" "}
                  <a
                    href={iit.ocsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-violet-accent)] hover:text-[var(--color-lavender)] transition-colors"
                  >
                    official placement cell website
                  </a>{" "}
                  for registration details and recruitment guidelines.
                </p>
              )}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="mt-8 glass rounded-2xl p-6 md:p-8 border-[var(--color-violet-accent)]/30 shadow-[0_0_30px_rgba(124,58,237,0.15)] hover:shadow-[0_0_40px_rgba(124,58,237,0.25)] transition-shadow">
              <h3 className="text-lg font-semibold mb-3">
                <span className="gradient-text">2. Through Novare Talent</span>
              </h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
                For companies — especially startups and growing firms — that want
                to hire {iit.name} talent without navigating the formal placement
                process, Novare Talent offers a streamlined alternative. We
                provide curated access to verified {iit.name} students and alumni,
                with 3-5 matched candidates delivered within 48 hours.
              </p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-5">
                This is particularly useful for roles that don&apos;t fit the
                traditional campus recruitment mould: off-season hiring, niche
                technical roles, internship-to-hire pipelines, and positions at
                companies that may not meet the placement cell&apos;s minimum CTC
                requirements.
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-violet-accent)] hover:text-[var(--color-lavender)] transition-colors"
              >
                Get Started
                <ChevronRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQs
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-24">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">
              Frequently Asked Questions — {iit.name} Placements
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 text-center">
              Common questions about placement outcomes at {iit.name}.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl mx-auto">
              <PlacementFAQ faqs={iit.faqs} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          RELATED IITs
      ════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="pb-20 md:pb-24">
          <div className="section-padding">
            <ScrollReveal>
              <h2 className="text-xl md:text-2xl font-bold mb-6">
                Compare with Related IITs
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {related.map((rel) => {
                  const rp = getLatestPlacement(rel);
                  return (
                    <Link
                      key={rel.slug}
                      href={`/iit-placements/${rel.slug}`}
                      className="glass rounded-2xl p-6 glass-hover transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-[var(--color-lavender)] transition-colors">
                            {rel.name}
                          </h3>
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            {rel.city} · {rel.nirfRank ? `NIRF #${rel.nirfRank}` : "—"}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-[var(--color-text-muted)] group-hover:text-[var(--color-violet-accent)] transition-colors shrink-0 mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">Highest</p>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            {rp.highestPackage}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">Average</p>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            {rp.averagePackage}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[var(--color-text-muted)]">Placed</p>
                          <p className="text-sm font-semibold text-white mt-0.5">
                            {rp.placementPercentage}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* CTA */}
      <PlacementCTA iitName={iit.name} />

      <Footer />
    </main>
  );
}
