"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { JobCreateForm, type JobMeta } from "@/components/Client-Dashboard/job-create-form"
import { QuestionBuilder, type Question } from "@/components/Client-Dashboard/question-builder"
import { JobFormPreview } from "@/components/Client-Dashboard/job-form-preview"
import { createClient } from "@/utils/supabase/client"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [meta, setMeta] = useState<JobMeta>({
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

  const [questions, setQuestions] = useState<Question[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch job data
  useEffect(() => {
    const fetchJobData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      if (!user) {
        toast("Error", { description: "You must be logged in to edit a job" })
        router.push('/login')
        return
      }

      try {
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('job_id', jobId)
          .single()

        if (jobError) throw jobError

        if (job.employer_id !== user.id) {
          toast.error("Error", { description: "You don't have permission to edit this job" })
          router.push('/client/jobs')
          return
        }

        let formQuestions: Question[] = []
        if (job.form_id) {
          const { data: form } = await supabase
            .from('forms')
            .select('form')
            .eq('form_id', job.form_id)
            .single()

          if (form?.form?.questions) {
            formQuestions = form.form.questions.map((q: any) => ({
              id: Math.random().toString(36).slice(2, 9),
              type: q.type.toLowerCase(),
              title: q.title,
              required: q.required || false,
              options: q.options || undefined
            }))
          }
        }

        setMeta({
          title: job.Job_Name || "",
          level: job.level || "",
          stipend: job.stipend || "",
          location: job.location || "",
          duration: job.duration || "",
          closingTime: job.closingTime ? new Date(job.closingTime).toISOString().slice(0, 16) : "",
          tags: job.tags || [],
          description: job.Job_Description || "",
          jdFile: null,
          jdFileName: job.JD_pdf ? "Existing JD File" : undefined,
        })

        setQuestions(formQuestions)
      } catch (error: any) {
        toast.error("Error", { description: `Failed to load job: ${error.message}` })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobData()
  }, [jobId, router])

  async function handleUpdate() {
    if (!userId) {
      toast.error("Error", { description: "You must be logged in to update a job" })
      return
    }

    setIsUpdating(true)

    try {
      let jdUrl = null
      if (meta.jdFile) {
        const fileName = `${Date.now()}-${meta.jdFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('jd')
          .upload(`jobs/${fileName}`, meta.jdFile)

        if (uploadError) throw uploadError
        jdUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/jd/jobs/${fileName}`
      }

      const jobUpdateData: any = {
        Job_Name: meta.title,
        Job_Description: meta.description,
        level: meta.level,
        stipend: meta.stipend,
        location: meta.location,
        duration: meta.duration,
        closingTime: meta.closingTime,
        tags: meta.tags,
      }

      if (jdUrl) jobUpdateData.JD_pdf = jdUrl

      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .update(jobUpdateData)
        .eq('job_id', jobId)
        .select()
        .single()

      if (jobError) throw jobError

      if (questions.length > 0) {
        const formId = job.form_id || crypto.randomUUID()
        const formData = {
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
          }
        }

        if (job.form_id) {
          const { error: formError } = await supabase
            .from('forms')
            .update(formData)
            .eq('form_id', formId)
          if (formError) throw formError
        } else {
          const { error: formError } = await supabase
            .from('forms')
            .insert(formData)
          if (formError) throw formError

          await supabase
            .from('jobs')
            .update({ form_link: `/apply/${formId}`, form_id: formId })
            .eq('job_id', jobId)
        }
      }

      toast("Success", { description: "Job updated successfully!" })
      router.push('/client')
    } catch (error: any) {
      toast.error("Error", { description: `Failed to update job: ${error.message}` })
    } finally {
      setIsUpdating(false)
    }
  }

  async function generateFormWithAI() {
  if (!jobId) return

  try {
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("JD_pdf")
      .eq("job_id", jobId)
      .single()

    console.log("SUPABASE JOB FETCH", job)

    if (jobError || !job?.JD_pdf) {
      console.log("SUPABASE ERROR", jobError)
      toast("Error", { description: "Failed to fetch JD URL from Supabase" })
      return
    }

    const jdUrl = job.JD_pdf
    console.log("JD URL FROM SUPABASE", jdUrl)

    const payload = { jdUrl }
    console.log("AI REQUEST PAYLOAD", JSON.stringify(payload, null, 2))

    const r = await fetch("/api/generate-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    console.log("AI RESPONSE STATUS", r.status)
    const t = await r.text()
    console.log("AI RAW RESPONSE", t)

    if (!r.ok) {
      toast("Error", { description: t || "AI request failed" })
      return
    }

    const j = JSON.parse(t)
    console.log("AI PARSED JSON", j)

    const a: Question[] = j.questions.map((q: any) => ({
      id: Math.random().toString(36).slice(2, 9),
      type: q.type.toLowerCase(),
      title: q.title,
      required: q.required || false,
      options: q.options || undefined,
    }))

    setQuestions(a)
    toast("Form Generated", { description: "AI questions ready" })
  } catch (e) {
    console.log("AI FETCH ERROR", e)
    toast("Error", { description: "Check console for details" })
  }
}

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-center">Loading job data...</div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary">Edit Job</h1>
        <p className="text-muted-foreground">Update your job posting and application form</p>
      </div>

      <JobCreateForm value={meta} onChange={setMeta} className="mb-6" />

      <section className="grid gap-6 md:grid-cols-2">
        <QuestionBuilder
          value={questions}
          onChange={setQuestions}
          onGenerateAI={generateFormWithAI}
        />
        <JobFormPreview questions={questions} />
      </section>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push('/client/jobs')}>
          Cancel
        </Button>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleUpdate}
          disabled={isUpdating || !meta.title || !meta.description}
        >
          {isUpdating ? 'Updating...' : 'Update Job'}
        </Button>
      </div>
    </main>
  )
}
