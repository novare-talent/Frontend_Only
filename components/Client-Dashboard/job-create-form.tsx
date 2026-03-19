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

export type FormErrors = {
  [K in keyof JobMeta]?: string
}

export function JobCreateForm({
  value,
  onChange,
  className,
  errors = {},
}: {
  value: JobMeta
  onChange: (v: JobMeta) => void
  className?: string
  errors?: FormErrors
}) {
  const [tagInput, setTagInput] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // const skillSuggestions = [
  //   "React", "Node.js", "Python", "JavaScript", "TypeScript", "AWS", "Docker", 
  //   "MongoDB", "PostgreSQL", "Git", "Figma", "UI/UX", "Marketing", "Sales"
  // ]

  const getFormProgress = () => {
    const fields = [value.title, value.type, value.stipend, value.location, value.duration, value.closingTime, value.description]
    const filled = fields.filter(field => field && field.toString().trim()).length
    return Math.round((filled / fields.length) * 100)
  }

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
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Only PDF files are allowed')
        return
      }
      
      handleFileSelect(file)
    }
  }

  return (
    <Card className={cn("rounded-2xl border bg-card/60 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl text-primary">Create Job Posting</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${getFormProgress()}%` }}
              />
            </div>
            {getFormProgress()}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form autoComplete="off" className="space-y-6">
        
        {/* Job Title - Full Width */}
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Job Title / Position <span className="text-destructive">*</span>
          </Label>
          <Input 
            id="title" 
            value={value.title} 
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g., Senior React Developer, Marketing Intern"
            className={errors.title ? "border-destructive" : ""}
            autoComplete="off"
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Type & Experience Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Type <span className="text-destructive">*</span>
            </Label>
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
              <Label htmlFor="experience" className="text-sm font-medium">Experience Required</Label>
              <Input 
                id="experience" 
                value={value.experience || ""} 
                onChange={(e) => set("experience", e.target.value)}
                placeholder="e.g., 2-3 years, 5+ years"
                autoComplete="off"
              />
            </div>
          )}
        </div>

        {/* Stipend, Location, Duration Row */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stipend" className="text-sm font-medium">
              Stipend / Salary <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="stipend" 
              value={value.stipend} 
              onChange={(e) => set("stipend", e.target.value)}
              placeholder="₹25,000/month or ₹5-8 LPA"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="location" 
              value={value.location} 
              onChange={(e) => set("location", e.target.value)}
              placeholder="Remote, Bangalore, Hybrid"
              autoComplete="off"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Duration <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="duration" 
              value={value.duration} 
              onChange={(e) => set("duration", e.target.value)}
              placeholder="3 months, 6 months, Full-time"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Closing Time */}
        <div className="grid gap-2">
          <Label htmlFor="closing" className="text-sm font-medium">
            Application Deadline <span className="text-destructive">*</span>
          </Label>
          <Input
            id="closing"
            type="datetime-local"
            value={value.closingTime}
            onChange={(e) => set("closingTime", e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Skills - Full Width Row */}
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Required Skills / Tags</Label>
          <div className="relative">
            <div className="flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowSuggestions(tagInput.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Type a skill (React, Python, etc.)"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button variant="secondary" onClick={addTag} type="button">
                Add
              </Button>
            </div>
            {/* {showSuggestions && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border rounded-md shadow-md max-h-32 overflow-y-auto">
                {skillSuggestions
                  .filter(skill => 
                    skill.toLowerCase().includes(tagInput.toLowerCase()) && 
                    !value.tags.includes(skill)
                  )
                  .map(skill => (
                    <button
                      key={skill}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                      onClick={() => {
                        onChange({ ...value, tags: [...value.tags, skill] })
                        setTagInput("")
                        setShowSuggestions(false)
                      }}
                    >
                      {skill}
                    </button>
                  ))
                }
              </div>
            )} */}
          </div>
          {value.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {value.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border"
                >
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    type="button"
                    className="cursor-pointer hover:bg-primary/20 rounded-full px-1 transition-colors"
                    aria-label={`Remove ${t}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Short Description */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="desc" className="text-sm font-medium">
                Short Description for Job Role / Position <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">This will be visible on the job card</p>
            </div>
            <span className={cn(
              "text-xs font-medium",
              value.description.length > 500 ? "text-destructive" : "text-muted-foreground"
            )}>
              {value.description.length}/500
            </span>
          </div>
          <Textarea
            id="desc"
            className={cn(
              "min-h-[120px] resize-none",
              value.description.length > 500 ? "border-destructive" : ""
            )}
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe the role, key responsibilities, and what makes this opportunity exciting. Keep it concise and engaging..."
            maxLength={500}
          />
          {value.description.length > 450 && value.description.length <= 500 && (
            <p className="text-xs text-amber-600">Consider keeping it concise for better readability</p>
          )}
        </div>

        {/* JD Upload */}
        <div className="space-y-2">
          <Label htmlFor="jd-file" className="text-sm font-medium">
            Upload Your Job Description (PDF Only)
          </Label>
          <p className="text-xs text-muted-foreground">Upload a detailed job description document (Max 5MB)</p>
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
                  {value.jdFileName ? value.jdFileName : isDragOver ? "Drop PDF file here" : "Drag & drop PDF or click to upload"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {value.jdFileName ? "Click to change file" : "Only PDF format supported (Max 5MB)"}
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
                  {value.jdFileName ? "Change" : "Choose PDF"}
                </Button>
              </div>
            </label>
            <input
              id="jd-file"
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                if (f) {
                  if (f.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB')
                    e.target.value = ''
                    return
                  }
                  if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                    alert('Only PDF files are allowed')
                    e.target.value = ''
                    return
                  }
                }
                handleFileSelect(f)
              }}
            />
          </div>
        </div>

        <Separator className="my-2" />
        <p className="text-xs text-muted-foreground text-center">All fields marked with <span className="text-destructive">*</span> are required</p>
        </form>
      </CardContent>
    </Card>
  )
}
