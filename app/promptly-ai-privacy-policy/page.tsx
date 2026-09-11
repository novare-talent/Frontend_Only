import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promptly AI Privacy Policy",
  description:
    "Privacy policy for Promptly AI, published by RD SwapSo Pvt. Ltd.",
  robots: { index: true, follow: true },
};

const SECTIONS = [
  { id: "info-we-collect", label: "Information We Collect" },
  { id: "how-we-use", label: "How We Use Your Information" },
  { id: "third-parties", label: "Third Parties We Share Data With" },
  { id: "retention", label: "Data Retention" },
  { id: "children", label: "Children's Privacy" },
  { id: "your-rights", label: "Your Rights and Account Deletion" },
  { id: "security", label: "Security" },
  { id: "transfers", label: "International Data Transfers" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PromptlyAIPrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F8] text-[#1A1826]">
      {/* Header */}
      <header className="border-b border-[#E4E2EC] bg-white">
        <div className="mx-auto max-w-4xl px-6 py-14 sm:px-8 sm:py-20">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-[#7C3AED]">
            Privacy Policy
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            Promptly AI
          </h1>
          <div className="mt-6 h-px w-16 bg-[#7C3AED]" />
          <dl className="mt-6 grid gap-x-10 gap-y-2 text-sm text-[#57536A] sm:grid-cols-2">
            <div className="flex gap-2">
              <dt className="font-medium text-[#1A1826]">Effective date</dt>
              <dd>11 September 2026</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-[#1A1826]">Published by</dt>
              <dd>RD SwapSo Pvt. Ltd.</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-4xl gap-12 px-6 py-12 sm:px-8 sm:py-16 lg:grid lg:grid-cols-[200px_1fr]">
        {/* Table of contents */}
        <nav
          aria-label="Table of contents"
          className="mb-10 hidden lg:mb-0 lg:block"
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#8B87A0]">
            On this page
          </p>
          <ol className="mt-4 space-y-2.5 border-l border-[#E4E2EC] pl-4 text-sm">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-[#57536A] transition-colors hover:text-[#7C3AED]"
                >
                  <span className="font-variant-numeric tabular-nums text-[#B5B2C4]">
                    {String(i + 1).padStart(2, "0")}
                  </span>{" "}
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Document body */}
        <article className="max-w-[68ch] font-sans text-[15px] leading-7 text-[#2B2838]">
          <p>
            RD SwapSo Pvt. Ltd. (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) operates Promptly AI, a mobile application
            that teaches people to work well with AI tools. This policy
            explains what information we collect through the app, why we
            collect it, who we share it with, and the choices you have.
          </p>
          <p className="mt-4">
            By creating an account or using Promptly AI, you agree to the
            collection and use of information in accordance with this
            policy.
          </p>

          <Section id="info-we-collect" n={1} title="Information We Collect">
            <h3 className="mt-6 font-serif text-lg font-semibold">
              1.1 Account information
            </h3>
            <p className="mt-2">When you create an account, we collect:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Email address and a securely hashed password, if you sign up
                directly; or
              </li>
              <li>
                Your name, email address, and profile photo from Google or
                GitHub, if you choose to sign in with one of those providers
                instead. We only receive what that provider&apos;s consent
                screen discloses to you at sign-in.
              </li>
            </ul>
            <p className="mt-2">
              Authentication is handled by our backend provider, Supabase
              &mdash; we never see or store your raw password.
            </p>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              1.2 Profile information
            </h3>
            <p className="mt-2">
              You choose a username, a display name, and (optionally) an
              avatar. Your username, display name, and avatar are visible to
              other users of the app.
            </p>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              1.3 Onboarding information
            </h3>
            <p className="mt-2">During first-time setup, we ask for:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>
                Your college/institution and country &mdash; both optional,
                and skippable.
              </li>
              <li>
                A self-reported answer to &ldquo;how do you currently use
                AI&rdquo; (e.g. conversation, tool, or system), used only to
                personalize which content is shown first.
              </li>
            </ul>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              1.4 Learning activity and content you create
            </h3>
            <p className="mt-2">
              As you use the app, we record which lessons and exercises
              you&apos;ve completed, your answers, your streaks, and a
              per-concept &ldquo;strength&rdquo; score used to schedule
              spaced-repetition review. For exercises that ask you to write a
              real prompt, the text you write is stored and sent to our AI
              grading provider (see section 3) to be scored.
            </p>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              1.5 What we do not collect
            </h3>
            <p className="mt-2">
              We do not currently use any third-party analytics,
              advertising, or tracking SDKs. We do not access your contacts,
              camera, microphone, or precise location, and we do not collect
              advertising identifiers.
            </p>
          </Section>

          <Section id="how-we-use" n={2} title="How We Use Your Information">
            <p className="mt-2">We use the information above to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Create and maintain your account and learning progress.</li>
              <li>Personalize the order and difficulty of lessons shown to you.</li>
              <li>
                Grade the &ldquo;write a prompt&rdquo; exercises using an AI
                service (see section 3).
              </li>
              <li>Maintain streaks and spaced-repetition reminders.</li>
              <li>Detect abuse and enforce rate limits on graded submissions.</li>
              <li>Respond to support requests you send us.</li>
            </ul>
          </Section>

          <Section
            id="third-parties"
            n={3}
            title="Third Parties We Share Data With"
          >
            <p className="mt-2">
              Promptly AI relies on the following service providers to
              operate. Each processes only the data necessary for its
              function, under its own privacy terms:
            </p>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              Supabase (database, authentication, and file hosting)
            </h3>
            <p className="mt-2">
              Stores your account, profile, and learning-progress data, and
              handles sign-in. Supabase&apos;s own privacy policy governs
              its infrastructure-level processing.
            </p>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              OpenAI (exercise grading)
            </h3>
            <p className="mt-2">
              When you submit a &ldquo;write a prompt&rdquo; exercise, that
              text is sent to OpenAI&apos;s API to be scored and to generate
              feedback. No other exercise types are sent to OpenAI.
            </p>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              Google / GitHub (optional sign-in)
            </h3>
            <p className="mt-2">
              If you choose to sign in with Google or GitHub, those
              providers share the profile information you approve at their
              consent screen (typically name, email, and profile photo).
            </p>

            <h3 className="mt-6 font-serif text-lg font-semibold">
              RevenueCat (in-app purchases)
            </h3>
            <p className="mt-2">
              The app includes in-app purchase infrastructure for an
              optional &ldquo;Pro&rdquo; tier. As of this policy&apos;s
              effective date, no purchases are being processed and no
              payment information is collected &mdash; this section will be
              updated if and when that changes.
            </p>

            <p className="mt-4 font-medium">
              We do not sell your personal information to anyone, for any
              purpose.
            </p>
          </Section>

          <Section id="retention" n={4} title="Data Retention">
            <p className="mt-2">
              We retain your account and learning data for as long as your
              account is active. If you request deletion (see section 6), we
              delete your profile, learning history, and exercise
              submissions within a reasonable period, except where we are
              required to retain limited records for legal or security
              purposes.
            </p>
          </Section>

          <Section id="children" n={5} title="Children's Privacy">
            <p className="mt-2">
              Promptly AI is not directed at children under 13, and we do
              not knowingly collect personal information from children
              under 13. If you believe a child has provided us with
              personal information, contact us at{" "}
              <a
                href="mailto:awatadeayush2524@gmail.com"
                className="text-[#7C3AED] underline underline-offset-2"
              >
                awatadeayush2524@gmail.com
              </a>{" "}
              and we will delete it.
            </p>
          </Section>

          <Section
            id="your-rights"
            n={6}
            title="Your Rights and Account Deletion"
          >
            <p className="mt-2">
              You may request to access, correct, or delete your personal
              data at any time by emailing{" "}
              <a
                href="mailto:awatadeayush2524@gmail.com"
                className="text-[#7C3AED] underline underline-offset-2"
              >
                awatadeayush2524@gmail.com
              </a>{" "}
              from the address associated with your account. We will verify
              your request and act on it within 30 days. Deleting your
              account permanently removes your profile, learning progress,
              and exercise submissions, and cannot be undone.
            </p>
            <p className="mt-4">
              Depending on where you live, you may have additional rights
              under laws such as the GDPR (EEA/UK) or state privacy laws
              (e.g. CCPA) &mdash; including the right to data portability
              and the right to object to certain processing. Contact{" "}
              <a
                href="mailto:awatadeayush2524@gmail.com"
                className="text-[#7C3AED] underline underline-offset-2"
              >
                awatadeayush2524@gmail.com
              </a>{" "}
              to exercise these rights.
            </p>
          </Section>

          <Section id="security" n={7} title="Security">
            <p className="mt-2">
              We use industry-standard safeguards to protect your data,
              including encrypted connections (HTTPS/TLS) between the app
              and our servers, and database-level access controls that
              ensure your data is only readable by you and, where
              applicable, other users viewing your public profile. No
              method of transmission or storage is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </Section>

          <Section id="transfers" n={8} title="International Data Transfers">
            <p className="mt-2">
              Our service providers may process and store data in countries
              other than your own. By using the app, you consent to your
              information being transferred to and processed in those
              countries, which may have different data protection laws
              than your home country.
            </p>
          </Section>

          <Section id="changes" n={9} title="Changes to This Policy">
            <p className="mt-2">
              We may update this policy from time to time. If we make
              material changes, we will notify you through the app or by
              email before the changes take effect. The &ldquo;Effective
              date&rdquo; at the top of this document reflects the most
              recent revision.
            </p>
          </Section>

          <Section id="contact" n={10} title="Contact Us">
            <p className="mt-2">
              If you have questions about this policy or how your data is
              handled, contact us at:
            </p>
            <div className="mt-4 rounded-lg border border-[#E4E2EC] bg-white p-5">
              <p className="font-serif text-base font-semibold">
                RD SwapSo Pvt. Ltd.
              </p>
              <a
                href="mailto:awatadeayush2524@gmail.com"
                className="mt-1 inline-block text-[#7C3AED] underline underline-offset-2"
              >
                awatadeayush2524@gmail.com
              </a>
            </div>
          </Section>

          <div className="mt-16 border-t border-[#E4E2EC] pt-6 text-xs text-[#8B87A0]">
            RD SwapSo Pvt. Ltd. &middot; Promptly AI
          </div>
        </article>
      </div>
    </main>
  );
}

function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-8 first:mt-10">
      <h2 className="flex items-baseline gap-3 font-serif text-2xl font-semibold text-balance">
        <span className="font-sans text-sm font-medium tabular-nums text-[#7C3AED]">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
