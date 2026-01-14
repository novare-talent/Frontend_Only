"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card"
import {
  IconBrain,
  IconChecklist,
  IconSearch,
  IconRobot,
} from "@tabler/icons-react";

/* ---------------- Animations ---------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

/* ---------------- Page ---------------- */

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* HERO */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-8 py-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        <div className="space-y-6">
          <h1 className="text-5xl font-bold leading-tight">
            Hire smarter with{" "}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600
          bg-clip-text text-transparent">AI-powered</span> candidate ranking
          </h1>

          <p className="text-muted-foreground text-lg">
            Sighire analyzes resumes, ranks candidates, highlights risks, and
            helps recruiters make confident decisions—faster.
          </p>

          <div className="flex gap-4">
            <Button size="lg" className="bg-gradient-to-r from-primary to-indigo-600 hover:bg-primary cursor-pointer">Start Hiring</Button>
            <Button variant="outline" size="lg">
              See Demo
            </Button>
          </div>
        </div>

        {/* Hero preview placeholder */}
        <div className="h-[360px] rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
          Product Preview
        </div>
      </motion.section>

      {/* FEATURES */}
      <section className="px-8 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-10 dark:text-white">
          <h2 className="text-3xl font-semibold text-center">
            Everything you need to shortlist better candidates
          </h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <FeatureCard
              icon={<IconBrain />}
              title="AI Ranking"
              desc="Automatically rank candidates based on skills, experience, and role fit."
            />
            <FeatureCard
              icon={<IconChecklist />}
              title="Skill Fit Analysis"
              desc="Clear breakdowns of skills and experience relevance."
            />
            <FeatureCard
              icon={<IconSearch />}
              title="Risk Detection"
              desc="Identify gaps, inconsistencies, and hiring concerns early."
            />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-12">
          How Sighire works
        </h2>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
        >
          <Step number="1" title="Upload resumes" />
          <Step number="2" title="AI analysis" />
          <Step number="3" title="Candidate ranking" />
          <Step number="4" title="Hire confidently" />
        </motion.div>
      </section>

      {/* AI BOT CTA */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="px-8 py-20 bg-primary text-primary-foreground"
      >
        <div className="max-w-4xl mx-auto text-center space-y-6 bg-primary">
          <IconRobot className="mx-auto h-10 w-10" />
          <h2 className="text-3xl font-bold">
            Talk to your ranking assistant
          </h2>
          <p className="opacity-90">
            Ask questions like “Who fits best for backend roles?” or “Any
            concerns with top candidates?”
          </p>
          <Button variant="secondary" size="lg">
            Try Ranking Bot
          </Button>
        </div>
      </motion.section>
      {/* FOOTER */}
      <footer className="px-8 py-6 border-t text-sm text-muted-foreground flex justify-between">
        <span>© 2025 Novare Talent Private Limited. All rights reserved</span>
        <span>Privacy · Terms</span>
      </footer>
    </main>
  );
}

/* ---------------- Components ---------------- */

function Step({ number, title }: { number: string; title: string }) {
  return (
    <motion.div variants={fadeUp} className="space-y-2">
      <div className="mx-auto h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
        {number}
      </div>
      <p className="font-medium">{title}</p>
    </motion.div>
  );
}
