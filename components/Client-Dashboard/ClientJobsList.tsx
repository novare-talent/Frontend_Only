"use client"

import { JobCard } from "./Job-Card"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import CreateJobButtonServerChecked from "./CreateJobButton"

type Job = {
  job_id: string
  Job_Name: string
  Job_Description: string
  level: string
  location: string
  stipend: string
  duration: string
  tags: string[]
  Applied_Candidates?: string[]
  status: string
  closingTime?: string | null
}

export default function ClientJobs() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  const handleCreateJob = () => {
    router.push('/client/create-job')
  }

  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log("No user found")
        setLoading(false)
        return
      }

      try {
        // Fetch jobs for the current employer
        const { data: jobsData, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('employer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setJobs(jobsData || [])
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="text-center">Loading jobs...</div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl px-5 pl-6 py-2">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-balance text-2xl font-semibold text-brand">Created Jobs</h1>
        <div className="gap-0.5 mr-2">
          <CreateJobButtonServerChecked className="max-w-20 pl-40"/>
        </div>
      </header>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center mt-20">
          <div className="mb-4 rounded-full bg-muted p-6">
            <svg 
              className="h-12 w-12 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold">No Jobs Created</h3>
          <p className="mb-6 text-muted-foreground max-w-md">
            You have not created any jobs yet. Start by posting your first job opening.
          </p>
          {/* <Link href="/client/create-job">
            <Button className="bg-primary hover:bg-primary/90 text-lg gap-1">
              <Plus className="size-5" />
              Create Job
            </Button>
          </Link> */}
        </div>
      ) : (
        jobs.map((job) => (
          <JobCard
            key={job.job_id}
            jobId={job.job_id}
            title={job.Job_Name}
            meta={{
              rate: job.stipend,
              level: job.level,
            }}
            description={job.Job_Description}
            tags={job.tags}
            location={job.location}
            proposals={job.Applied_Candidates?.length?.toString() || "0"}
            className="mb-8"
            // NEW: pass duration and closingTime so JobCard can display them
            duration={job.duration}
            closingTime={job.closingTime}
          />
        ))
      )}
    </main>
  )
}
