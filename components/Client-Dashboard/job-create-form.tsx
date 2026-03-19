"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client";
export type JobMeta = {
  title: string
  type: "Internship" | "Job"
  experience?: string
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
  const [isDragOver, setIsDragOver] = useState(false)

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

  const handleFileSelect = (file: File | null) => {
    onChange({ ...value, jdFile: file, jdFileName: file?.name })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
      
      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      
      if (isValidType) {
        handleFileSelect(file)
      } else {
        alert('Please select a valid file type (PDF, DOC, DOCX, or TXT)')
      }
    }
  }

  return (
    <Card className={cn("rounded-2xl border bg-card/60 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl md:text-2xl text-primary">Create Job Form</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="title">Job Title</Label>
          <Input id="title" value={value.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={value.type} onValueChange={(v) => set("type", v as "Internship" | "Job")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Job">Job</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {value.type === "Job" && (
              <div className="grid gap-2">
                <Label htmlFor="experience">Experience Required</Label>
                <Input 
                  id="experience" 
                  value={value.experience || ""} 
                  onChange={(e) => set("experience", e.target.value)}
                  placeholder="e.g., 2-3 years"
                />
              </div>
            )}
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

        {/* JD Upload */}
        <div className="space-y-2">
          <Label htmlFor="jd-file">JD Upload (PDF, DOC, DOCX, TXT)</Label>
          <div className="relative">
            <label
              htmlFor="jd-file"
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border-2 border-dashed px-4 py-6 transition-all duration-200",
                isDragOver
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-primary/40 bg-card/60 hover:border-primary hover:bg-primary/5 hover:shadow-sm"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {value.jdFileName ? value.jdFileName : isDragOver ? "Drop file here" : "Drag & drop or click to upload"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {value.jdFileName ? "Click to change file" : "Supports PDF, DOC, DOCX, TXT (Max 5MB)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {value.jdFileName && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFileSelect(null);
                    }}
                  >
                    ×
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" className="pointer-events-none">
                  {value.jdFileName ? "Change" : "Choose file"}
                </Button>
              </div>
            </label>
            <input
              id="jd-file"
              type="file"
              accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                if (f) {
                  // Check file size (5MB limit)
                  if (f.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB')
                    e.target.value = '' // Reset input
                    return
                  }
                }
                handleFileSelect(f)
              }}
            />
          </div>
        </div>

        <Separator className="my-1" />
        <p className="text-xs text-muted-foreground">Tip: Add screening questions in the section below.</p>
      </CardContent>
    </Card>
  )
}