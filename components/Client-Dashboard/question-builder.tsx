"use client"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type QuestionType = "text" | "radio" | "multi"

export type Question = {
  id: string
  type: QuestionType
  title: string
  required?: boolean
  options?: string[]
}

type BuilderProps = {
  value: Question[]
  onChange: (v: Question[]) => void
  className?: string
  onGenerateAI?: () => void
  isGenerating?: boolean
}

const PALETTE: { type: QuestionType; title: string; hint: string }[] = [
  { type: "text", title: "Text Answer", hint: "Free text" },
  { type: "radio", title: "Radio", hint: "Choose one" },
  { type: "multi", title: "Multiple Answer", hint: "Choose many" },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function QuestionBuilder({ value, onChange, className, onGenerateAI, isGenerating }: BuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const dragSrcId = useRef<string | null>(null)

  function add(type: QuestionType) {
    const q: Question = {
      id: uid(),
      type,
      title: type === "text" ? "Your answer" : type === "radio" ? "Select one" : "Select all that apply",
      options: type === "text" ? undefined : ["Option 1", "Option 2"],
      required: false,
    }
    onChange([...value, q])
    setActiveId(q.id)
  }

  function remove(id: string) {
    const next = value.filter((q) => q.id !== id)
    onChange(next)
    if (activeId === id) setActiveId(null)
  }

  function update(id: string, patch: Partial<Question>) {
    onChange(value.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function onDragStartQuestion(id: string) {
    dragSrcId.current = id
  }

  function onDropQuestionOver(targetId: string) {
    const srcId = dragSrcId.current
    if (!srcId || srcId === targetId) return
    const list = [...value]
    const from = list.findIndex((q) => q.id === srcId)
    const to = list.findIndex((q) => q.id === targetId)
    if (from < 0 || to < 0) return
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    onChange(list)
  }

  function onDropFromPalette(dataType: string) {
    const type = dataType as QuestionType
    if (!["text", "radio", "multi"].includes(type)) return
    add(type)
  }

  const active = useMemo(() => value.find((q) => q.id === activeId) || null, [value, activeId])

  return (
    <div id="tour-question-builder" className={cn("grid gap-4", className)}>
      <Card className="rounded-2xl border bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-primary">Create Form</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-3">
            {PALETTE.map((p) => (
              <button
                key={p.type}
                type="button"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("application/x-qtype", p.type)}
                onClick={() => add(p.type)}
                className="rounded-xl px-3 py-2 text-sm border bg-muted/50 hover:bg-muted transition"
                title={p.hint}
              >
                {p.title}
              </button>
            ))}

            <Button 
              variant="secondary" 
              className="ml-auto"
              onClick={onGenerateAI}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  Generating...
                </>
              ) : (
                '✨ Generate from AI'
              )}
            </Button>
          </div>

          <Separator />

          <div
            className="rounded-lg border border-dashed bg-background/50 p-3 min-h-[220px]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const type = e.dataTransfer.getData("application/x-qtype")
              if (type) onDropFromPalette(type)
            }}
          >
            {value.length === 0 ? (
              <p className="text-sm text-destructive font-medium">Please add at least one question to create the job.</p>
            ) : (
              <ul className="grid gap-3">
                {value.map((q) => (
                  <li
                    key={q.id}
                    draggable={activeId !== q.id}
                    onDragStart={() => onDragStartQuestion(q.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDropQuestionOver(q.id)}
                    onClick={() => setActiveId(q.id)}
                    className={cn(
                      "rounded-lg border bg-card p-4 cursor-pointer transition-all",
                      activeId === q.id && "ring-2 ring-primary shadow-md",
                    )}
                  >
                    {activeId === q.id ? (
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <Input
                            value={q.title}
                            onChange={(e) => update(q.id, { title: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium"
                            placeholder="Question title"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">
                              {q.type === "text" ? "Text" : q.type === "radio" ? "Radio" : "Multiple"}
                            </span>
                            <label className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={!!q.required}
                                onChange={(e) => update(q.id, { required: e.target.checked })}
                                onClick={(e) => e.stopPropagation()}
                              />
                              Required
                            </label>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); remove(q.id); }}>
                              Remove
                            </Button>
                          </div>
                        </div>

                        {q.type !== "text" && (
                          <OptionEditor
                            options={q.options || []}
                            onChange={(opts) => update(q.id, { options: opts })}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-sm">
                              {q.title}
                              {q.required && <span className="text-red-500 ml-1">*</span>}
                            </p>
                          </div>
                        </div>

                        {q.type === "text" && (
                          <Input placeholder="Your answer" disabled className="bg-muted/30" />
                        )}

                        {q.type === "radio" && q.options && (
                          <div className="grid gap-2">
                            {q.options.map((o, idx) => (
                              <label key={idx} className="flex items-center gap-2 text-sm">
                                <input type="radio" disabled className="cursor-not-allowed" />
                                {o}
                              </label>
                            ))}
                          </div>
                        )}

                        {q.type === "multi" && q.options && (
                          <div className="grid gap-2">
                            {q.options.map((o, idx) => (
                              <label key={idx} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" disabled className="cursor-not-allowed" />
                                {o}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>


        </CardContent>
      </Card>
    </div>
  )
}

function OptionEditor({ options, onChange }: { options: string[]; onChange: (opts: string[]) => void }) {
  const [input, setInput] = useState("")
  return (
    <div className="grid gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap gap-2">
        {options.map((o, idx) => (
          <div key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-sm">
            <Input
              value={o}
              onChange={(e) => onChange(options.map((opt, i) => (i === idx ? e.target.value : opt)))}
              className="h-6 px-2 py-0 border-0 bg-transparent"
            />
            <button
              onClick={() => onChange(options.filter((_, i) => i !== idx))}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const t = input.trim()
              if (t && !options.includes(t)) {
                onChange([...options, t])
                setInput("")
              }
            }
          }}
          placeholder="Add option"
          className="h-8"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const t = input.trim()
            if (t && !options.includes(t)) {
              onChange([...options, t])
              setInput("")
            }
          }}
        >
          Add
        </Button>
      </div>
    </div>
  )
}