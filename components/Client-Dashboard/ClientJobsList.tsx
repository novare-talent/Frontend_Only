"use client"

import { JobCard } from "./Job-Card"

export default function ClientJobs() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-balance text-2xl font-semibold text-brand">Created Jobs</h1>
      </header>

      <JobCard
        title="Front-End Development"
        href="#"
        meta={{
          rate: "Hourly: $5–$10",
          level: "Entry level",
        }}
        description="Build the frontend for a viral recipe blog, delivering a production‑ready PWA and a mobile app interface. A responsive, high‑performance UI with dashboards, image galleries, personalization filters, offline saves, and monetization features. Tech Stack: React, Next.js, Vercel, TypeScript, Payload CMS, Supabase."
        tags={["React", "Next.js", "Vercel", "TypeScript", "Payload CMS", "Supabase", "Page Speed"]}
        location="Mumbai"
        proposals="5"
        className="mb-8"
      />
    </main>
  )
}
