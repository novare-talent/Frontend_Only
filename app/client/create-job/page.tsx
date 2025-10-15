"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { JobCreateForm, type JobMeta } from "@/components/Client-Dashboard/job-create-form"
import { QuestionBuilder, type Question } from "@/components/Client-Dashboard/question-builder"
import { JobFormPreview } from "@/components/Client-Dashboard/job-form-preview"

export default function NewJobPage() {
  const [meta, setMeta] = useState<JobMeta>({
    title: "Front-End Developer",
    level: "Entry level",
    stipend: "$800/month",
    location: "Remote",
    duration: "6 months",
    closingTime: "",
    tags: ["React", "Next.js", "TypeScript"],
    description:
      "Build a high‑performance recipe blog frontend with dashboards, image galleries, personalization, offline saves, and monetization.",
    jdFile: null,
    jdFileName: undefined,
  })

  const [questions, setQuestions] = useState<Question[]>([])

  function handleCreate() {
    // In a real app, POST to your API here.
    console.log("[v0] Create Job payload:", { meta, questions })
    alert("Job payload logged to console.")
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Top: Create Job Form (metadata) */}
      <JobCreateForm value={meta} onChange={setMeta} className="mb-6" />

      {/* Bottom: Create Form (builder) and Form Preview */}
      <section className="grid gap-6 md:grid-cols-2">
        <QuestionBuilder value={questions} onChange={setQuestions} />
        <JobFormPreview questions={questions} />
      </section>

      {/* Footer CTA */}
      <div className="mt-6 flex justify-end">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleCreate}>
          Create Job
        </Button>
      </div>
    </main>
  )
}
