import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Globe,
  Award,
  Briefcase,
  BarChart3,
  Target,
  Rocket,
} from "lucide-react";
import Breadcrumbs from "@/components/placements/Breadcrumbs";
import PlacementStatsCard from "@/components/placements/PlacementStatsCard";
import IITPlacementTable from "@/components/placements/IITPlacementTable";
import PlacementFAQ from "@/components/placements/PlacementFAQ";
import PlacementCTA from "@/components/placements/PlacementCTA";
import {
  getAllIITs,
  getIITsByGeneration,
  HUB_FAQS,
  getLatestPlacement,
} from "@/data/iit-placements";
import ScrollReveal from "@/components/landing/effects/ScrollReveal";
import GlowOrb from "@/components/landing/effects/GlowOrb";
import Navbar from "@/components/landing/layout/Navbar";
import Footer from "@/components/landing/layout/Footer";

export const metadata: Metadata = {
  title:
    "IIT Placements 2025: Salary, Stats, Recruiters & Complete Guide | Novare Talent",
  description:
    "Comprehensive guide to IIT placements 2025. Compare salary packages, top recruiters, placement stats across all 23 IITs. Data updated for the latest placement season.",
  openGraph: {
    title: "IIT Placements 2025: The Complete Guide | Novare Talent",
    description:
      "Compare salaries, recruiters, and placement stats across all 23 IITs. The most comprehensive IIT placement resource on the internet.",
    type: "article",
    url: "https://www.novaretalent.com/iit-placements",
  },
  alternates: {
    canonical: "https://www.novaretalent.com/iit-placements",
  },
};

export default function IITPlacementsHub() {
  const allIITs = getAllIITs();
  const gen1 = getIITsByGeneration("gen1");
  const gen2 = getIITsByGeneration("gen2");
  const gen3 = getIITsByGeneration("gen3");

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "IIT Placements 2025: The Complete Guide to Salaries, Recruiters & Stats",
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
    description:
      "Comprehensive guide to IIT placements 2025 covering salary packages, top recruiters, and placement statistics across all 23 IITs.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HUB_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Novare Talent",
    url: "https://www.novaretalent.com",
    description:
      "India's elite talent network connecting top 1% institute graduates with companies building the future.",
    foundingDate: "2024",
    founders: [{ "@type": "Person", name: "Sahil Sheoran" }],
  };

  return (
    <main className="relative z-[1] overflow-hidden">
      <GlowOrb
        className="-top-40 -right-40"
        color="rgba(124, 58, 237, 0.5)"
        size="800px"
        parallaxIntensity={40}
      />
      <GlowOrb
        className="bottom-0 -left-40"
        color="rgba(124, 58, 237, 0.5)"
        size="700px"
        parallaxIntensity={25}
        parallaxInvert
      />
      <Navbar simplified />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "IIT Placements" },
        ]}
      />

      {/* ════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════ */}
      <section className="pt-8 pb-16 md:pb-24">
        <div className="section-padding">
          <ScrollReveal>
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium tracking-wide text-[var(--color-lavender)] border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] mb-6">
              IIT Placements 2025
            </span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight max-w-4xl">
              IIT Placements 2025:{" "}
              <span className="gradient-text">
                The Complete Guide to Salaries, Recruiters & Stats
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)] max-w-3xl leading-relaxed">
              Everything you need to know about campus placements at India&apos;s
              23 Indian Institutes of Technology. Compare packages, explore
              recruiter lists, understand the placement process, and discover how
              to hire from IITs — all in one definitive resource.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-start">
              <a
                href="#comparison-table"
                className="glow-button text-white font-medium px-8 py-3.5 rounded-full inline-flex items-center gap-2"
              >
                Compare All 23 IITs
                <BarChart3 size={18} />
              </a>
              <div className="flex items-center gap-4">
                <a
                  href="/sign-up?role=recruiter"
                  className="rounded-full px-8 py-3.5 border border-[var(--color-violet-accent)]/30 text-[var(--color-violet-accent)] hover:bg-[var(--color-violet-accent)]/10 transition-all duration-300 font-medium inline-flex items-center gap-2"
                >
                  Hire IIT Talent
                </a>
                <span className="text-[var(--color-lavender)] font-medium">or</span>
                <a
                  href="/sign-up"
                  className="rounded-full px-8 py-3.5 border border-[var(--color-violet-accent)]/30 text-[var(--color-violet-accent)] hover:bg-[var(--color-violet-accent)]/10 transition-all duration-300 font-medium inline-flex items-center gap-2"
                >
                  Get Hired
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2 — QUICK STATS DASHBOARD
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <PlacementStatsCard
                icon={TrendingUp}
                value="₹2.44 Cr"
                label="Highest Package"
                subtext="IIT Kharagpur 2025"
              />
              <PlacementStatsCard
                icon={Award}
                value="₹23.5 LPA"
                label="Top Avg Package"
                subtext="IIT Bombay"
              />
              <PlacementStatsCard
                icon={Users}
                value="10,000+"
                label="Students Placed"
                subtext="Across all 23 IITs"
              />
              <PlacementStatsCard
                icon={Building2}
                value="1,500+"
                label="Recruiters"
                subtext="Unique companies"
              />
              <PlacementStatsCard
                icon={Globe}
                value="200+"
                label="Intl. Offers"
                subtext="Global placements"
              />
              <PlacementStatsCard
                icon={GraduationCap}
                value="23"
                label="IITs"
                subtext="Across India"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3 — INTRO + CONTEXT
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding max-w-4xl">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Understanding IIT Placements in 2025
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] leading-relaxed space-y-4">
              <p>
                The Indian Institutes of Technology (IITs) are India&apos;s premier
                engineering institutions, producing some of the most sought-after
                graduates in the world. Every year, the IIT placement season
                attracts hundreds of global companies — from Silicon Valley tech
                giants and Wall Street financial firms to top management
                consulting houses and leading Indian conglomerates.
              </p>
              <p>
                The 2024-25 placement season has been one of the strongest in
                recent years. IIT Kharagpur set a new record with a highest
                package of ₹2.44 Crore, while IIT Bombay saw its average package
                climb to ₹23.5 LPA. Across all 23 IITs, over 10,000 students
                received placement offers from more than 1,500 unique companies.
              </p>
              <p>
                The IIT system in India now comprises 23 institutes spread across
                the country, categorized into three generations based on their
                year of establishment. The original gen-1 IITs (Bombay, Delhi,
                Madras, Kanpur, Kharagpur, Roorkee, and Guwahati) have the
                strongest placement records, with average packages ranging from
                ₹19-23.5 LPA. Gen-2 IITs established in 2008-09 (Hyderabad,
                Indore, Gandhinagar, and others) have been catching up rapidly,
                with averages of ₹14-18 LPA. The newest gen-3 IITs, while still
                building their reputation, offer the IIT brand value and education
                quality at more accessible JEE cutoffs.
              </p>
              <p>
                This guide provides the most comprehensive and up-to-date
                placement data for all 23 IITs. Whether you&apos;re a student
                researching your options, a parent evaluating IITs, or a recruiter
                looking to hire from these elite institutions, you&apos;ll find
                everything you need below — from branch-wise salary data and
                recruiter lists to the mechanics of how IIT placements actually
                work.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4 — COMPARISON TABLE
      ════════════════════════════════════════════ */}
      <section id="comparison-table" className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              All 23 IITs — Placement Comparison
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8">
              Click column headers to sort. Click any IIT name for detailed
              placement data.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <IITPlacementTable data={allIITs} />
            <p className="text-xs text-[var(--color-text-muted)] mt-4 italic">
              * Placement data is compiled from publicly available placement reports,
              media coverage, and institute releases. Figures are approximate and may
              vary from official records. For exact data, refer to individual IIT
              placement cells.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5 — GENERATION-WISE BREAKDOWN
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-10">
              IITs by Generation
            </h2>
          </ScrollReveal>

          {/* Gen 1 */}
          <ScrollReveal delay={0.1}>
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-violet-accent)]/20 text-[var(--color-lavender)]">
                  GEN 1
                </span>
                Original IITs — The Flagships
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-6 max-w-3xl">
                The seven gen-1 IITs are the oldest and most prestigious, with
                the strongest placement records, widest recruiter networks, and
                highest salary packages. These institutes — IIT Bombay, IIT
                Delhi, IIT Madras, IIT Kanpur, IIT Kharagpur, IIT Roorkee, and
                IIT Guwahati — collectively account for the majority of ₹1 Crore+
                placement offers and international placements at IITs.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gen1.map((iit) => (
                  <Link
                    key={iit.slug}
                    href={`/iit-placements/${iit.slug}`}
                    className="glass rounded-xl p-4 glass-hover transition-all duration-300 group"
                  >
                    <p className="font-medium text-white group-hover:text-[var(--color-lavender)] transition-colors">
                      {iit.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      NIRF #{iit.nirfRank} · Avg{" "}
                      {getLatestPlacement(iit).averagePackage}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Gen 2 */}
          <ScrollReveal delay={0.15}>
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-indigo-accent)]/20 text-[var(--color-lavender)]">
                  GEN 2
                </span>
                Established 2008-09 — The Rising Stars
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-6 max-w-3xl">
                The gen-2 IITs were established during India&apos;s IIT expansion
                in 2008-09. Led by IIT Hyderabad (NIRF #8), these institutes have
                matured rapidly and now offer placement statistics that rival some
                gen-1 IITs. With 15+ years of graduating batches, they have
                built robust alumni networks and strong recruiter relationships.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gen2.map((iit) => (
                  <Link
                    key={iit.slug}
                    href={`/iit-placements/${iit.slug}`}
                    className="glass rounded-xl p-4 glass-hover transition-all duration-300 group"
                  >
                    <p className="font-medium text-white group-hover:text-[var(--color-lavender)] transition-colors">
                      {iit.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {iit.nirfRank ? `NIRF #${iit.nirfRank}` : "NIRF —"} · Avg{" "}
                      {getLatestPlacement(iit).averagePackage}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Gen 3 */}
          <ScrollReveal delay={0.2}>
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-[var(--color-lavender)]">
                  GEN 3
                </span>
                Newer IITs (2012+) — Building Momentum
              </h3>
              <p className="text-[var(--color-text-secondary)] mb-6 max-w-3xl">
                The newest IITs are still building their campus infrastructure
                and placement track records. While their average packages are
                lower than older IITs, they offer the IIT brand, quality
                education, and access to the vast IIT alumni network at more
                accessible JEE cutoffs. IIT (ISM) Dhanbad and IIT (BHU) Varanasi
                stand out in this group due to their pre-IIT heritage.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gen3.map((iit) => (
                  <Link
                    key={iit.slug}
                    href={`/iit-placements/${iit.slug}`}
                    className="glass rounded-xl p-4 glass-hover transition-all duration-300 group"
                  >
                    <p className="font-medium text-white group-hover:text-[var(--color-lavender)] transition-colors">
                      {iit.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {iit.nirfRank ? `NIRF #${iit.nirfRank}` : "NIRF —"} · Avg{" "}
                      {getLatestPlacement(iit).averagePackage}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 6 — HOW IIT PLACEMENTS WORK (Block Layout with Images)
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              How IIT Placements Work: A Complete Guide
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-12 max-w-3xl">
              IIT placements follow a highly structured process refined over
              decades. Here&apos;s how the entire system works — from the
              placement cell to final offers.
            </p>
          </ScrollReveal>

          {/* Block 1 — Placement Cell */}
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  The Placement Cell
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
                  Each IIT has a dedicated placement body — called the Office of
                  Career Services (OCS) at IIT Bombay, the Career Development
                  Centre (CDC) at IIT Kharagpur, or the Students&apos; Placement
                  Office (SPO) at IIT Kanpur.
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Run by a faculty-in-charge along with student placement
                  coordinators, the cell handles everything: company outreach,
                  registration, logistics, scheduling, and policy enforcement.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/images/PlacementCell.png"
                  alt="IIT Placement Cell structure showing connections to Companies, Students, Policies, Scheduling, and Logistics"
                  className="rounded-2xl w-full max-w-md"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Block 2 — Day-Based Slot System */}
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
              <div className="md:order-2">
                <h3 className="text-xl font-semibold text-white mb-4">
                  The Day-Based Slot System
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
                  Companies are assigned to specific &quot;days&quot; based on the CTC they
                  offer. Day 1 features the highest-paying firms — Google,
                  Goldman Sachs, McKinsey, Tower Research (₹25+ LPA). Day 2
                  covers ₹15-25 LPA offers, and so on.
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Students appear for companies on their day and all subsequent
                  days. Accepting an offer exits you from the process. This
                  system ensures orderly placements across thousands of students.
                </p>
              </div>
              <div className="flex justify-center md:order-1">
                <img
                  src="/images/DaySlots.png"
                  alt="Day-based slot system showing Day 1, Day 2, and Day 3+ companies with placement rates"
                  className="rounded-2xl w-full max-w-md"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Block 3 — PPOs */}
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  Pre-Placement Offers (PPOs)
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-3">
                  Before the formal season, 20-30% of students at top IITs
                  receive PPOs based on their summer internship performance.
                  Companies like Google, Microsoft, and Goldman Sachs use
                  internships as a primary hiring funnel.
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  PPO conversion rates can be as high as 70-80% for strong
                  performers. This pathway provides placement security months
                  before the main season even starts.
                </p>
              </div>
              <div className="flex justify-center">
                <img
                  src="/images/PPO.png"
                  alt="PPO vs Placements flow — PPO shows Internship to Offer, Placements shows Application through Technical and HR rounds to Offer"
                  className="rounded-2xl w-full max-w-md"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Block 4 — Timeline */}
          <ScrollReveal delay={0.1}>
            <div className="mb-16">
              <h3 className="text-xl font-semibold text-white mb-4">
                Placement Timeline
              </h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mb-6">
                The IIT placement season follows a structured timeline spanning
                nearly the full academic year:
              </p>
              <div className="flex justify-center mb-8">
                <img
                  src="/images/Timeline.png"
                  alt="Placement timeline from Registrations through PPTs & Tests, Day 1 Execution, Phase 1, to Phase 2"
                  className="rounded-2xl w-full max-w-2xl"
                />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { period: "Jul-Aug", desc: "Company registrations open; PPO offers roll in" },
                  { period: "Sep-Nov", desc: "Pre-placement talks, online assessments, shortlisting" },
                  { period: "Dec 1", desc: "Phase 1 begins — Day 1 placements (highest packages)" },
                  { period: "Dec-Feb", desc: "Phase 1 continues through Day 2, Day 3, etc." },
                  { period: "Mar-May", desc: "Phase 2 — remaining students, additional companies" },
                ].map((item) => (
                  <div key={item.period} className="glass rounded-xl p-4">
                    <p className="text-sm font-semibold text-[var(--color-lavender)] mb-1">
                      {item.period}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Block 5 — Policies */}
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="md:order-2">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Placement Policies & Rules
                </h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mb-4">
                  IIT placement cells enforce strict policies to ensure fairness
                  for both students and companies:
                </p>
                <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--color-violet-accent)] shrink-0">&#8226;</span>
                    <span><strong className="text-white">One offer rule:</strong> Students hold only one offer at a time</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-violet-accent)] shrink-0">&#8226;</span>
                    <span><strong className="text-white">Minimum CTC:</strong> Companies must meet a threshold (₹6-10 LPA)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-violet-accent)] shrink-0">&#8226;</span>
                    <span><strong className="text-white">No poaching:</strong> Direct student contact outside process is barred</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-violet-accent)] shrink-0">&#8226;</span>
                    <span><strong className="text-white">Dream roles:</strong> Some IITs let students reject for higher offers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--color-violet-accent)] shrink-0">&#8226;</span>
                    <span><strong className="text-white">Ethics:</strong> Offer reneging leads to company blacklisting</span>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center md:order-1">
                <img
                  src="/images/PolicyEngine.png"
                  alt="Placement System Policy Engine showing One Offer, Minimum CTC, No Poaching, Dream Roles, Ethics, and Privacy policies"
                  className="rounded-2xl w-full max-w-md"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 7 — TOP RECRUITERS
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Top Recruiters at IITs
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-10 max-w-3xl">
              Over 1,500 companies recruit from IITs each year. Here are the
              major recruiters organized by sector — these companies consistently
              offer the most positions and highest packages.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                sector: "Technology",
                icon: Briefcase,
                companies: [
                  "Google",
                  "Microsoft",
                  "Amazon",
                  "Apple",
                  "Meta",
                  "Uber",
                  "Flipkart",
                  "Samsung",
                  "Qualcomm",
                  "Texas Instruments",
                  "Intel",
                  "Oracle",
                  "Adobe",
                  "Cisco",
                  "PhonePe",
                ],
                note: "Tech companies are the largest recruiters, accounting for 40-50% of all offers at most IITs.",
              },
              {
                sector: "Consulting",
                icon: Target,
                companies: [
                  "McKinsey & Company",
                  "Boston Consulting Group (BCG)",
                  "Bain & Company",
                  "Kearney",
                  "Accenture Strategy",
                  "EY Parthenon",
                  "Deloitte Consulting",
                ],
                note: "Management consulting firms recruit across all branches, valuing analytical and problem-solving skills.",
              },
              {
                sector: "Finance & Trading",
                icon: TrendingUp,
                companies: [
                  "Goldman Sachs",
                  "JP Morgan",
                  "Morgan Stanley",
                  "Tower Research Capital",
                  "DE Shaw",
                  "Graviton",
                  "Optiver",
                  "WorldQuant",
                  "Citadel",
                ],
                note: "Quantitative trading firms offer the highest packages — often ₹50 LPA to ₹2.44 Cr for top candidates.",
              },
              {
                sector: "Core Engineering",
                icon: Building2,
                companies: [
                  "Tata Steel",
                  "L&T",
                  "Reliance Industries",
                  "Shell",
                  "Schlumberger",
                  "ISRO",
                  "DRDO",
                  "ONGC",
                  "Coal India",
                  "Caterpillar",
                ],
                note: "Core engineering roles are especially strong at IITs with traditional engineering departments.",
              },
              {
                sector: "FMCG & Consumer",
                icon: Users,
                companies: [
                  "Hindustan Unilever (HUL)",
                  "Procter & Gamble (P&G)",
                  "ITC",
                  "Nestlé",
                  "Asian Paints",
                  "Marico",
                ],
                note: "FMCG companies recruit for management and supply chain roles, offering ₹15-25 LPA packages.",
              },
              {
                sector: "Startups & Growth-Stage",
                icon: Rocket,
                companies: [
                  "Zomato",
                  "CRED",
                  "Razorpay",
                  "Meesho",
                  "Swiggy",
                  "PhonePe",
                  "Groww",
                  "Zerodha",
                  "Ola",
                ],
                note: "Well-funded startups increasingly participate in IIT placements, offering competitive packages plus ESOPs.",
              },
            ].map((sector) => (
              <ScrollReveal key={sector.sector}>
                <div className="glass rounded-2xl p-6 h-full glass-hover transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-violet-accent)]/10 flex items-center justify-center">
                      <sector.icon
                        size={18}
                        className="text-[var(--color-violet-accent)]"
                      />
                    </div>
                    <h3 className="font-semibold text-white">{sector.sector}</h3>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                    {sector.note}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sector.companies.map((co) => (
                      <span
                        key={co}
                        className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-[var(--color-text-muted)] border border-white/5"
                      >
                        {co}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 8 — SECTOR-WISE BREAKDOWN (Two-Column)
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Sector-wise Placement Breakdown at IITs
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-10 max-w-3xl">
              While IT dominates in volume and average salaries, IIT placements
              have diversified significantly in recent years.
            </p>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Information Technology",
                share: "40-50%",
                range: "₹12-60 LPA",
                desc: "The largest recruiter at IITs — software development, data engineering, cloud computing, DevOps, and cybersecurity. Led by Google, Microsoft, Amazon, and major Indian tech firms.",
              },
              {
                title: "Consulting",
                share: "10-15%",
                range: "₹20-40 LPA",
                desc: "McKinsey, BCG, and Bain recruit from all branches, valuing analytical and problem-solving skills. The selection includes case study interviews and behavioural assessments.",
              },
              {
                title: "Finance & Quantitative Trading",
                share: "8-12%",
                range: "₹20 LPA - ₹2+ Cr",
                desc: "Includes investment banking (Goldman Sachs, JP Morgan), quant trading (Tower Research, DE Shaw, Graviton), and analytics. Quant firms offer the highest packages across all sectors.",
              },
              {
                title: "Core Engineering & Manufacturing",
                share: "15-20%",
                range: "₹8-20 LPA",
                desc: "Automotive, energy, and infrastructure roles for Mechanical, Chemical, Civil, and Met. Engineering students. Companies include Tata Steel, L&T, Shell, ISRO, and Caterpillar.",
              },
              {
                title: "Research & Development",
                share: "5-8%",
                range: "₹8-35 LPA",
                desc: "R&D roles at ISRO, DRDO, BARC, Google Research, Microsoft Research, and Samsung R&D. Popular among M.Tech and PhD graduates seeking deep technical careers.",
              },
              {
                title: "Emerging Sectors",
                share: "Growing",
                range: "₹10-40 LPA",
                desc: "Electric vehicles (Ola Electric, Ather), space tech (Skyroot, Agnikul, Pixxel), climate tech, semiconductor design, and Web3/blockchain are creating new avenues for IIT graduates.",
              },
            ].map((sector) => (
              <ScrollReveal key={sector.title}>
                <div className="glass rounded-2xl p-6 h-full glass-hover transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{sector.title}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-violet-accent)]/15 text-[var(--color-lavender)] font-medium">
                      {sector.share}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                    {sector.desc}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Package range: <span className="text-white font-medium">{sector.range}</span>
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 9 — HOW STARTUPS CAN HIRE FROM IITs
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <div className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-violet-accent)]/5 to-transparent pointer-events-none" />
              <div className="relative z-10 max-w-3xl">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-violet-accent)]/20 text-[var(--color-lavender)] mb-4">
                  For Recruiters
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  How Startups & Growing Companies Can Hire from IITs
                </h2>
                <div className="text-[var(--color-text-secondary)] leading-relaxed space-y-4">
                  <p>
                    While established companies can navigate the formal IIT
                    placement process, startups and growing companies often face
                    significant barriers:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Minimum CTC requirements:</strong> Many IIT
                      placement cells require a minimum CTC of ₹8-15 LPA,
                      which may not align with early-stage startup budgets
                    </li>
                    <li>
                      <strong>Complex registration:</strong> The formal process
                      involves paperwork, company verification, and advance
                      planning months ahead
                    </li>
                    <li>
                      <strong>Competition with giants:</strong> Startups compete
                      directly with Google, McKinsey, and Goldman Sachs for the
                      same talent pool
                    </li>
                    <li>
                      <strong>Timing constraints:</strong> The placement calendar
                      is fixed — you can&apos;t hire on your own timeline
                    </li>
                  </ul>
                  <p>
                    <strong className="text-white">
                      This is where Novare Talent comes in.
                    </strong>{" "}
                    We provide curated access to verified IIT talent — without
                    the formal placement cell process. Here&apos;s how it works:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>
                      Share your requirements (role, skills, budget) with our
                      team
                    </li>
                    <li>
                      We source and screen candidates from our IIT talent pool
                    </li>
                    <li>
                      You receive 3-5 matched, pre-vetted candidates within 48
                      hours
                    </li>
                    <li>
                      Interview and hire directly — no placement cell overhead
                    </li>
                  </ol>
                  <p>
                    We&apos;ve helped companies like Bizongo, Motor 360,
                    InvoicEase, and many other startups hire exceptional talent
                    from IIT Bombay and other top institutes.
                  </p>
                </div>
                <div className="mt-8">
                  <a
                    href="/Dashboard"
                    className="glow-button text-white font-medium px-8 py-3.5 rounded-full inline-flex items-center gap-2"
                  >
                    Start Hiring from IITs
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 10 — BRANCH-WISE ANALYSIS
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Branch-wise Salary Analysis Across IITs
            </h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8 max-w-3xl">
              One of the most important factors affecting IIT placement outcomes
              is the branch or department. There is a significant salary
              differential between Computer Science and other engineering
              branches. Here is a detailed analysis:
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-violet-accent)]" />
                  Computer Science (CSE)
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  CSE is by far the highest-paying branch at every IIT. At gen-1
                  IITs, CSE averages range from ₹36-55 LPA. IIT Bombay CSE leads
                  at ₹55 LPA, followed by IIT Madras at ₹53.2 LPA and IIT Delhi at
                  ₹50 LPA. Even at gen-3 IITs, CSE averages are ₹16-20 LPA —
                  significantly higher than other branches. The demand for software
                  engineers, AI/ML specialists, and system designers ensures CSE
                  graduates command premium salaries.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-indigo-accent)]" />
                  Electrical Engineering (EE)
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Electrical Engineering is typically the second-highest paying
                  branch, with averages of ₹20-28 LPA at gen-1 IITs. EE graduates
                  are hired by semiconductor companies (Qualcomm, Texas
                  Instruments, Intel), as well as tech companies for software
                  roles. The growing semiconductor manufacturing push in India is
                  expected to further boost EE placements.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-lavender)]" />
                  Mechanical Engineering (ME)
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Mechanical Engineering placements average ₹15-18 LPA at gen-1
                  IITs. The sector is evolving — traditional core companies like
                  Tata Motors, L&amp;T, and Maruti Suzuki are joined by EV startups,
                  robotics companies, and automation firms. Many ME graduates also
                  transition to software and consulting roles, which can
                  significantly boost their package.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white/40" />
                  Civil Engineering
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Civil Engineering typically has the lowest average among major
                  branches, ranging from ₹12-16 LPA at gen-1 IITs. The primary
                  recruiters are L&amp;T, Tata Projects, and government bodies. However,
                  IIT Roorkee — with its 175+ year civil engineering heritage —
                  tends to have stronger civil engineering placements than other IITs.
                </p>
              </div>

              <div className="glass rounded-2xl p-6 md:p-8 md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--color-violet-accent)] to-[var(--color-lavender)]" />
                  Emerging Programmes
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  Several IITs now offer programmes in AI &amp; Data Science, Engineering
                  Physics, Mathematics &amp; Computing, and Design. These programmes
                  often command salaries comparable to or higher than traditional EE,
                  given the industry demand for these skills. IIT Hyderabad&apos;s AI
                  programme (avg ₹28 LPA), IIT Guwahati&apos;s Design programme (avg
                  ₹18 LPA), and Mathematics &amp; Computing programmes at IIT Delhi and
                  Kanpur are notable examples.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 11 — FAQs
      ════════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="section-padding">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center">
              Frequently Asked Questions About IIT Placements
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-8 text-center">
              Everything students, parents, and recruiters want to know.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="max-w-3xl mx-auto">
              <PlacementFAQ faqs={HUB_FAQS} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 12 — CTA
      ════════════════════════════════════════════ */}
      <PlacementCTA />

      <Footer />
    </main>
  );
}
