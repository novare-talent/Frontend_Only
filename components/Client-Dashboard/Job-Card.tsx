"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Edit,
  Trash2,
  Users,
  Wallet,
  MapPin,
  Eye,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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
  duration?: string
  closingTime?: string | null
}

function formatIST(dateString: string | null | undefined) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
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
  duration,
  closingTime,
}: JobCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hasEvaluation, setHasEvaluation] = useState(false)
  const supabase = createClient()

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info"
    title: string
    message: string
  } | null>(null)

  const showNotification = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
  ) => {
    setNotification({ type, title, message })
    setNotificationOpen(true)
    setTimeout(() => setNotificationOpen(false), 5000)
  }

  const getNotificationIcon = () => {
    if (!notification) return null
    switch (notification.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationStyles = () => {
    if (!notification) return ""
    switch (notification.type) {
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
      case "info":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
    }
  }

  useEffect(() => {
    const checkEvaluation = async () => {
      if (!jobId) return
      const { data } = await supabase
        .from("evaluations")
        .select("job_id")
        .eq("job_id", jobId)
        .limit(1)
        .maybeSingle()

      setHasEvaluation(!!data)
    }

    checkEvaluation()
  }, [jobId, supabase])

  const handleEdit = () => {
    if (jobId) router.push(`/client/edit/${jobId}`)
  }

  const handleDelete = async () => {
    if (!jobId) return
    setLoading(true)
    await supabase.from("evaluations").delete().eq("job_id", jobId)
    await supabase.from("forms").delete().eq("job_id", jobId)
    await supabase.from("jobs").delete().eq("job_id", jobId)
    onDelete?.(jobId)
    router.refresh()
    setLoading(false)
  }

  // --------------------------------------------------
  // ✅ CORRECT EVALUATION FLOW (FIXED)
  // --------------------------------------------------
  const handleEvaluate = async () => {
    if (!jobId) return

    try {
      setLoading(true)
      showNotification("info", "Starting evaluation", "Fetching form details…")

      console.log("[JobCard] jobId:", jobId)

      // 1️⃣ Fetch form_id from jobs table
      const { data: job, error } = await supabase
        .from("jobs")
        .select("form_id")
        .eq("job_id", jobId)
        .single()

      console.log("[JobCard] job fetch result:", { job, error })

      if (error || !job?.form_id) {
        showNotification(
          "error",
          "Evaluation failed",
          "Form ID not found for this job.",
        )
        return
      }

      const formId = job.form_id
      console.log("[JobCard] Using form_id:", formId)

      // 2️⃣ Call hosted evaluation API with CORRECT IDs
      const url = `https://evaluation.novaretalent.com/evaluate/${jobId}/${formId}`
      console.log("[JobCard] Calling evaluation API:", url)

      const res = await fetch(url, { method: "POST" })

      const body = await res.text()
      console.log("[JobCard] Evaluation response:", res.status, body)

      if (!res.ok) {
        showNotification("error", "Evaluation failed", body || "Request failed")
        return
      }

      showNotification("success", "Evaluation started", "Redirecting…")
      router.push(`/client/evaluate/${jobId}`)
    } catch (err: any) {
      console.error("[JobCard] Evaluation error:", err)
      showNotification("error", "Evaluation failed", err?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleViewResults = () => {
    if (jobId) router.push(`/client/evaluate/${jobId}`)
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className={`w-full max-w-md ${getNotificationStyles()}`}>
            <div className="flex gap-3">
              {getNotificationIcon()}
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{notification?.title}</h4>
                <p className="text-sm text-muted-foreground">{notification?.message}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setNotificationOpen(false)}>
                ×
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

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
            disabled={loading}
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

            {/* New: Duration display */}
            {duration && (
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" aria-hidden />
                <span className="text-foreground">{duration}</span>
              </span>
            )}

            {/* New: Closing Time display */}
            {closingTime && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-4" aria-hidden />
                <span className="text-foreground">{formatIST(closingTime)}</span>
              </span>
            )}

            <span className="text-green-600">Applied Candidates: {proposals}</span>
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
