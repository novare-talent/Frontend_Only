"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client";
export type JobMeta = {
  title: string
  level: string
  stipend: string
  location: string
  duration: string
  closingTime: string
  tags: string[]
  description: string
  jdFileName?: string
  jdFile?: File | null
}

export function JobCreateForm({
  value,
  onChange,
  className,
}: {
  value: JobMeta
  onChange: (v: JobMeta) => void
  className?: string
}) {
  const [tagInput, setTagInput] = useState("")

  function set<K extends keyof JobMeta>(key: K, v: JobMeta[K]) {
    onChange({ ...value, [key]: v })
  }

  function addTag() {
    const t = tagInput.trim()
    if (!t) return
    if (!value.tags.includes(t)) onChange({ ...value, tags: [...value.tags, t] })
    setTagInput("")
  }

  function removeTag(t: string) {
    onChange({ ...value, tags: value.tags.filter((x) => x !== t) })
  }

  return (
    <Card className={cn("rounded-2xl border bg-card/60 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl text-primary">Create Job Form</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" value={value.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="level">Level</Label>
            <Input id="level" value={value.level} onChange={(e) => set("level", e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stipend">Stipend</Label>
            <Input id="stipend" value={value.stipend} onChange={(e) => set("stipend", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={value.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration</Label>
            <Input id="duration" value={value.duration} onChange={(e) => set("duration", e.target.value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="closing">Job Closing Time</Label>
            <Input
              id="closing"
              type="datetime-local"
              value={value.closingTime}
              onChange={(e) => set("closingTime", e.target.value)}
            />
          </div>

          {/* Skills / Tags - Moved to JD Upload's original position */}
          <div className="grid gap-2">
            <Label>Skills / Tags</Label>
            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type a skill and press Add"
              />
              <Button variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {value.tags.map((t) => (
                <button
                  key={t}
                  className="px-2.5 py-1 rounded-full text-xs bg-muted hover:bg-muted/80"
                  onClick={() => removeTag(t)}
                  type="button"
                  aria-label={`Remove ${t}`}
                >
                  {t} ×
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="desc">Short Description</Label>
          <Textarea
            id="desc"
            className="min-h-[96px]"
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Write a concise summary of the role..."
          />
        </div>

        {/* JD Upload - Moved to Skills/Tags original position */}
        <div className="space-y-2">
          <Label htmlFor="jd-file">JD Upload (PDF, DOC, DOCX, TXT)</Label>
          <label
            htmlFor="jd-file"
            className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-dashed border-primary/40 bg-card/60 px-4 py-6 transition hover:border-primary hover:bg-primary/5"
          >
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                Drag & drop or click to upload
              </span>
              <span className="text-xs text-muted-foreground">Max 5MB</span>
            </div>
            <Button type="button" variant="outline">
              Choose file
            </Button>
          </label>
          <input
            id="jd-file"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              onChange({ ...value, jdFile: f, jdFileName: f?.name })
            }}
          />
          {value.jdFileName && (
            <p className="text-sm text-primary">Selected: {value.jdFileName}</p>
          )}
        </div>

        <Separator className="my-1" />
        <p className="text-xs text-muted-foreground">Tip: Add screening questions in the section below.</p>
      </CardContent>
    </Card>
  )
}