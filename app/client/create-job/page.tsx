"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { JobCreateForm, type JobMeta } from "@/components/Client-Dashboard/job-create-form"
import { QuestionBuilder, type Question } from "@/components/Client-Dashboard/question-builder"
import { JobFormPreview } from "@/components/Client-Dashboard/job-form-preview"
import { createClient } from "@/utils/supabase/client"

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
  const [isCreating, setIsCreating] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Get the current user ID
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  async function handleCreate() {
  if (!userId) {
    alert("You must be logged in to create a job")
    return
  }

  setIsCreating(true)
  const supabase = createClient()
  
  try {
    console.log("Starting job creation process...")
    console.log("User ID:", userId)

    // 1. Upload JD file if exists
    let jdUrl = null
    if (meta.jdFile) {
      console.log("Uploading JD file...")
      const fileName = `${Date.now()}-${meta.jdFile.name}`
      const { data: _uploadData, error: uploadError } = await supabase.storage
        .from('jd')
        .upload(`jobs/${fileName}`, meta.jdFile)
      
      if (uploadError) {
        console.error("JD upload error:", uploadError)
        throw uploadError
      }
      
      jdUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/jd/jobs/${fileName}`
      console.log("JD uploaded successfully:", jdUrl)
    }

    // 2. Create job and form in a single operation
    const jobId = crypto.randomUUID()
    const formId = crypto.randomUUID()
    
    console.log("Creating job and form together...")
    
    // Prepare job data
    const jobData = {
      job_id: jobId,
      Job_Name: meta.title,
      Job_Description: meta.description,
      JD_pdf: jdUrl,
      level: meta.level,
      stipend: meta.stipend,
      location: meta.location,
      duration: meta.duration,
      closingTime: meta.closingTime,
      tags: meta.tags,
      status: 'active',
      employer_id: userId,
      created_at: new Date().toISOString(),
      form_link: questions.length > 0 ? `/Jobs/${formId}` : null,
      form_id: questions.length > 0 ? formId : null,
    }

    // Prepare form data if questions exist
    const formData = questions.length > 0 ? {
      form_id: formId,
      job_id: jobId,
      form: {
        title: `${meta.title} - Application Form`,
        questions: questions.map(q => ({
          type: q.type.toUpperCase(),
          title: q.title,
          required: q.required || false,
          options: q.options || undefined
        }))
      },
      created_at: new Date().toISOString(),
    } : null

    // Insert job first
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (jobError) {
      console.error("Job insertion error:", jobError)
      throw jobError
    }
    
    console.log("Job created successfully:", job)

    // Then insert form if questions exist
    if (formData) {
      console.log("Creating form...")
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert(formData)
        .select()
        .single()

      if (formError) {
        console.error("Form insertion error:", formError)
        
        // If form creation fails, delete the job to maintain consistency
        await supabase.from('jobs').delete().eq('job_id', jobId)
        throw formError
      }

      console.log("Form created successfully:", form)
    }

    // Success
    console.log("Job created successfully:", { jobId, meta, questions })
    alert("Job created successfully!")
    
    // Reset form
    setMeta({
      title: "",
      level: "",
      stipend: "",
      location: "",
      duration: "",
      closingTime: "",
      tags: [],
      description: "",
      jdFile: null,
      jdFileName: undefined,
    })
    setQuestions([])

  } catch (error: any) {
    console.error('Failed to create job:', error)
    alert(`Failed to create job: ${error.message}`)
  } finally {
    setIsCreating(false)
  }
}

  async function generateFormWithAI() {
    try {
      // Call your AI service to generate questions
      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: meta.title,
          jobDescription: meta.description,
          level: meta.level,
          tags: meta.tags
        })
      })
      
      if (!response.ok) throw new Error('AI service failed')
      
      const { questions: aiQuestions } = await response.json()
      
      // Convert AI response to your Question format
      const convertedQuestions: Question[] = aiQuestions.map((q: any) => ({
        id: Math.random().toString(36).slice(2, 9),
        type: q.type.toLowerCase(),
        title: q.title,
        required: q.required || false,
        options: q.options || undefined
      }))
      
      setQuestions(convertedQuestions)
    } catch (error) {
      console.error('Failed to generate form with AI:', error)
      alert('Failed to generate form with AI. Please try again.')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Top: Create Job Form (metadata) */}
      <JobCreateForm value={meta} onChange={setMeta} className="mb-6" />

      {/* Bottom: Create Form (builder) and Form Preview */}
      <section className="grid gap-6 md:grid-cols-2">
        <QuestionBuilder 
          value={questions} 
          onChange={setQuestions}
          onGenerateAI={generateFormWithAI}
        />
        <JobFormPreview questions={questions} />
      </section>

      {/* Footer CTA */}
      <div className="mt-6 flex justify-end">
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90" 
          onClick={handleCreate}
          disabled={isCreating || !meta.title || !meta.description}
        >
          {isCreating ? 'Creating...' : 'Create Job'}
        </Button>
      </div>
    </main>
  )
}