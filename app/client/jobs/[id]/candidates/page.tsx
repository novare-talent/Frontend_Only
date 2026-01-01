"use client"
import React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CandidatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const jobId = id
  const supabase = createClient()

  const [c, setC] = useState<any[]>([])
  const [s, setS] = useState(false)
  const [o, setO] = useState(false)

  const [j, setJ] = useState<any>(null)
  const [r, setR] = useState(false)

  useEffect(() => {
    const init = async () => {
      setS(true)
      try {

        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .select("Applied_Candidates, Shortlisted_Candidates")
          .eq("job_id", jobId)
          .single()

        if (jobError || !job) {
          toast("Error", { description: "Job not found" })
          return
        }

        setJ(job)

        const ids = job.Applied_Candidates || []

        if (ids.length === 0) {
          toast("No Candidates", { description: "No one has applied yet." })
          return
        }

        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", ids)

        console.log("PROFILES FETCH RESULT", profiles, profileError)

        if (profileError) {
          toast("Error", { description: "Failed to load profiles" })
          return
        }

        setC(profiles || [])
      } catch (e) {
        console.log("UNEXPECTED ERROR", e)
        toast("Error", { description: "Check console logs for debug" })
      } finally {
        setS(false)
      }
    }

    init()
  }, [jobId])

  const selectCandidate = async (id: string) => {
    if (!j) return
    if (r) return

    try {
      setR(true)

      const sArr = j.Shortlisted_Candidates || []
      const newArr = Array.from(new Set([...sArr, id]))

      console.log("SHORTLIST UPDATE", { id, newArr })

      const { error } = await supabase
        .from("jobs")
        .update({ Shortlisted_Candidates: newArr })
        .eq("job_id", jobId)

      console.log("SHORTLIST SUPABASE RESULT", error)

      if (error) {
        toast("Error", { description: "Shortlist failed" })
        return
      }

      setO(false)
      toast("Candidate Selected", { description: "Selection saved. Emails will be sent." })

    } finally {
      setR(false)
    }
  }

  return (
    <main className="max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Applied Candidates</h1>

      {s && <div className="text-center text-muted-foreground">Loading...</div>}

      {!s && c.length > 0 && (
        <Table className="border rounded-lg">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {c.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {p.first_name} {p.last_name}
                  </div>
                </TableCell>

                <TableCell>
                  {p.phone || "—"} <br />
                  {p.email || "—"}
                </TableCell>

                <TableCell>
  {p.github_link && (
    <a href={p.github_link} target="_blank" rel="noopener noreferrer">
      <div>GitHub</div>
    </a>
  )}
  {p.linkedin_link && (
    <a href={p.linkedin_link} target="_blank" rel="noopener noreferrer">
      <div>LinkedIn</div>
    </a>
  )}
</TableCell>


                <TableCell className="text-right">
                  <Popover open={o} onOpenChange={setO}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          console.log("CANDIDATE SELECT CLICKED", p.id)
                          setO(true)
                        }}
                        disabled={r}
                      >
                        {r ? "Processing..." : "Select Candidate"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-80 p-3">
                      <h3 className="font-semibold mb-2">Confirm Selection</h3>

                      <pre className="bg-muted p-2 rounded text-xs overflow-auto mb-2">
{`You are selecting: ${p.first_name} ${p.last_name}
This candidate will be forwarded a SELECTION email.
All others will NOT be selected.
Action is irreversible.
Emails will be triggered instantly.
Proceed carefully.`}
                      </pre>

                      <div className="flex justify-end gap-2">
                        <Button variant="destructive" size="sm" onClick={() => selectCandidate(p.id)}>
                          Confirm
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  )
}
