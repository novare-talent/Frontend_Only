"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useParams } from "next/navigation"
import { Mail, Phone, User } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

type EvalRecord = {
  id?: string
  name?: string
  email?: string
  phone?: string
  results?: {
    skills_match?: string
    experience_relevance?: string
    communication_clarity?: string
    overall_fit?: string
    final_score?: number | string
    justification?: string
  }
}

export default function EvaluationPage() {
  const { id } = useParams()
  const supabase = createClient()
  const [evaluation, setEvaluation] = useState<any>(null)
  const [jobTitle, setJobTitle] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true)

        // 1️⃣ Fetch evaluation directly from Supabase
        const { data: evalData, error: evalError } = await supabase
          .from("evaluations")
          .select("*")
          .eq("job_id", id)
          .maybeSingle()

        if (evalError) {
          console.error("Error fetching evaluation:", evalError)
          setLoading(false)
          return
        }

        if (!evalData) {
          setLoading(false)
          return
        }

        setEvaluation(evalData)

        // 2️⃣ Fetch job title directly from Supabase
        if (evalData?.job_id) {
          const { data: job, error } = await supabase
            .from("jobs")
            .select("Job_Name, Job_Description")
            .eq("job_id", evalData.job_id)
            .maybeSingle()

          if (!error && job) {
            const possibleTitle =
              job.Job_Name ||
              job.Job_Description ||
              "Untitled Job"
            setJobTitle(possibleTitle)
          } else {
            setJobTitle("Untitled Job")
          }
        } else {
          setJobTitle("Untitled Job")
        }
      } catch (err) {
        console.error("Error fetching evaluation:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchEvaluationData()
  }, [id, supabase])

  if (loading) return <p className="text-center mt-10">Loading evaluation...</p>
  if (!evaluation) return <p className="text-center mt-10">No evaluation found.</p>

  const results: EvalRecord[] = evaluation.results || []

  return (
    <div className="container mx-auto py-10">
      <Card className="border border-primary/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Candidate Evaluations</CardTitle>
          <CardDescription>
            Job: <span className="font-semibold text-primary">{jobTitle}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {results.length === 0 ? (
            <p className="text-muted-foreground">No candidates evaluated yet.</p>
          ) : (
            results.map((r, i) => (
              <div key={i} className="rounded-lg border p-4 bg-muted/20">
                {/* Candidate Info */}
                <div className="mb-3 space-y-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="size-4 text-primary" />{" "}
                    <span>{r.name || "Unnamed Candidate"}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" /> {r.email || "Not provided"}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" /> {r.phone || "Not provided"}
                  </p>
                </div>

                <Separator className="mb-3" />

                {/* Evaluation Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="font-medium">Skills Match:</p>
                    <p className="text-muted-foreground">{r.results?.skills_match || "—"}</p>
                  </div>

                  <div>
                    <p className="font-medium">Experience Relevance:</p>
                    <p className="text-muted-foreground">{r.results?.experience_relevance || "—"}</p>
                  </div>

                  <div>
                    <p className="font-medium">Communication Clarity:</p>
                    <p className="text-muted-foreground">{r.results?.communication_clarity || "—"}</p>
                  </div>

                  <div>
                    <p className="font-medium">Overall Fit:</p>
                    <p className="text-muted-foreground">{r.results?.overall_fit || "—"}</p>
                  </div>
                </div>

                {/* Justification */}
                <div className="mt-4">
                  <p className="font-medium">Justification:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {r.results?.justification || "No justification provided."}
                  </p>
                </div>

                {/* Score */}
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    Final Score:{" "}
                    <span className="ml-1 font-semibold">
                      {r.results?.final_score ?? "N/A"}
                    </span>{" "}
                    / 100
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}