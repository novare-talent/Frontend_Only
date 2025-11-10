"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Users, Wallet, MapPin, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

export type JobCardProps = {
  jobId?: string
  title: string
  href?: string
  meta: {
    rate: string
    level: string
  }
  description: string
  tags?: string[]
  location?: string
  proposals?: string
  className?: string
  onDelete?: (jobId: string) => void
}

export function JobCard({
  jobId,
  title,
  href,
  meta,
  description,
  tags = [],
  location = "United States",
  proposals = "Less than 5",
  className,
  onDelete,
}: JobCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hasEvaluation, setHasEvaluation] = useState(false)
  const supabase = createClient()

  // Check evaluations table directly to see if an evaluation exists for this job_id
  useEffect(() => {
    const checkEvaluation = async () => {
      if (!jobId) return
      try {
        // Query the evaluations table directly
        const { data, error } = await supabase
          .from("evaluations")
          .select("job_id")
          .eq("job_id", jobId)
          .limit(1)
          .maybeSingle()

        if (error) {
          // Log but don't disrupt UI
          console.error("Error checking evaluations table:", error)
          setHasEvaluation(false)
          return
        }

        // If data present, mark hasEvaluation true
        if (data && Object.keys(data).length > 0) {
          setHasEvaluation(true)
        } else {
          setHasEvaluation(false)
        }
      } catch (err) {
        console.error("Unexpected error checking evaluation existence:", err)
        setHasEvaluation(false)
      }
    }

    checkEvaluation()
    // run when jobId changes
  }, [jobId, supabase])

  const handleEdit = () => {
    if (jobId) router.push(`/client/edit/${jobId}`)
  }

  const handleDelete = () => {
    if (jobId && onDelete) onDelete(jobId)
  }

  const handleEvaluate = async () => {
    if (!jobId) return
    try {
      setLoading(true)
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
      })

      if (!res.ok) throw new Error("Evaluation failed")
      router.push(`/client/evaluate/${jobId}`)
    } catch (err) {
      console.error(err)
      alert("Error while evaluating job.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewResults = () => {
    if (jobId) router.push(`/client/evaluate/${jobId}`)
  }

  return (
    <Card
      className={cn(
        "group relative rounded-2xl border bg-card/80 shadow-sm transition-colors",
        "hover:border-brand/60 hover:ring-1 hover:ring-primary/70",
        className,
      )}
    >
      {/* Action Buttons */}
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="size-8 rounded-full p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete job</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="size-8 rounded-full p-0"
        >
          <Edit className="size-4" />
          <span className="sr-only">Edit job</span>
        </Button>
      </div>

      <CardHeader className="gap-3">
        <CardTitle className="text-balance text-xl font-semibold leading-tight">
          {href ? (
            <a href={href} className="text-primary underline-offset-4 hover:underline">
              {title}
            </a>
          ) : (
            <span className="text-foreground">{title}</span>
          )}
        </CardTitle>

        <CardDescription className="flex flex-wrap items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1">
            <Wallet className="size-4 text-accent-foreground" aria-hidden />
            {meta.rate}
          </span>
          <span className="text-muted-foreground">•</span>
          <span>{meta.level}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-pretty leading-relaxed">{description}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="rounded-full bg-muted text-muted-foreground">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleEvaluate}
            className="gap-2"
            disabled={loading}
          >
            <Users className="size-4" />
            {loading
              ? "Evaluating..."
              : hasEvaluation
              ? "Re-Evaluate"
              : "Evaluate Candidates"}
          </Button>

          {hasEvaluation && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewResults}
              className="gap-2"
            >
              <Eye className="size-4" />
              View Results
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4 text-accent-foreground" aria-hidden />
            <span className="text-foreground">{location}</span>
          </span>
          <span className="text-green-600">Applied Candidates: {proposals}</span>
        </div>
      </CardFooter>
    </Card>
  )
}
