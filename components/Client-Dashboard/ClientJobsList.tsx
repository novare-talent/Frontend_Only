"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { driver } from "driver.js"
import "driver.js/dist/driver.css" // Ensure this is installed via npm install driver.js

import { JobCard } from "./Job-Card"
import CreateJobButtonServerChecked from "./CreateJobButton"

type Job = {
  job_id: string
  Job_Name: string | null
  Job_Description: string | null
  level: string | null
  location: string | null
  stipend: string | null
  duration: string | null
  tags: string[] | null
  Applied_Candidates?: string[] | null
  status: string
  closingTime?: string | null
}

export default function ClientJobs() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // --- 1. Driver.js Tour Logic ---
  useEffect(() => {
    // Only run the tour if loading is finished and there are no jobs
    if (!loading && jobs.length === 0) {
      const driverObj = driver({
        showProgress: true,
        steps: [
          { 
            element: '#create-job-btn', 
            popover: { 
              title: 'Create Your First Job', 
              description: 'Click here to start posting a new job opening and find the right talent.', 
              side: "left", 
              align: 'start' 
            } 
          },
        ]
      });

      // Optional: Check local storage so it doesn't pop up every single time
      const hasSeenTour = localStorage.getItem('hasSeenClientTour');
      if (!hasSeenTour) {
        driverObj.drive();
        localStorage.setItem('hasSeenClientTour', 'true');
      }
    }
  }, [loading, jobs.length]);

  // --- 2. Data Fetching Logic ---
  useEffect(() => {
    const fetchJobs = async () => {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      try {
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
        <div className="text-center animate-pulse text-muted-foreground">Loading your dashboard...</div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl px-5 pl-6 py-2">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-balance text-2xl font-semibold text-brand">Created Jobs</h1>
        </div>
        
        {/* The ID matches the driver.js step element */}
        <div className="gap-0.5 mr-2" id="create-job-btn">
          <CreateJobButtonServerChecked className="max-w-20 pl-4"/>
        </div>
      </header>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center mt-20 border-2 border-dashed rounded-xl border-muted">
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
          <h3 className="mb-2 text-xl font-semibold">Ready to hire?</h3>
          <p className="mb-6 text-muted-foreground max-w-md">
            You haven't posted any jobs yet. Use the button in the top right to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <JobCard
              key={job.job_id}
              jobId={job.job_id}
              title={job.Job_Name || "Untitled Job"}
              meta={{
                rate: job.stipend || "Not specified",
                level: job.level || "Not specified",
              }}
              description={job.Job_Description || "No description provided"}
              tags={job.tags || []}
              location={job.location || "Not specified"}
              proposals={((Array.isArray(job.Applied_Candidates) ? job.Applied_Candidates.length : 0) || 0).toString()}
              className="hover:shadow-md transition-shadow"
              duration={job.duration || undefined}
              closingTime={job.closingTime || null}
            />
          ))}
        </div>
      )}
    </main>
  )
}