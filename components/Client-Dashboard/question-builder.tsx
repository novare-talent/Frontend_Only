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
}

const PALETTE: { type: QuestionType; title: string; hint: string }[] = [
  { type: "text", title: "Text Answer", hint: "Free text" },
  { type: "radio", title: "Radio", hint: "Choose one" },
  { type: "multi", title: "Multiple Answer", hint: "Choose many" },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function QuestionBuilder({ value, onChange, className }: BuilderProps) {
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
    <div className={cn("grid gap-4", className)}>
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

            <Button variant="secondary" className="ml-auto">
              Generate from AI
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
              <p className="text-sm text-muted-foreground">Drag question types here or click a type above to add.</p>
            ) : (
              <ul className="grid gap-3">
                {value.map((q) => (
                  <li
                    key={q.id}
                    draggable
                    onDragStart={() => onDragStartQuestion(q.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDropQuestionOver(q.id)}
                    onClick={() => setActiveId(q.id)}
                    className={cn(
                      "rounded-lg border bg-card p-3 cursor-move",
                      activeId === q.id && "ring-2 ring-primary",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium">
                        {q.title}{" "}
                        <span className="text-xs text-muted-foreground">
                          {q.type === "text" ? "(Text)" : q.type === "radio" ? "(Radio)" : "(Multiple)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={(e) => update(q.id, { required: e.target.checked })}
                          />
                          Required
                        </label>
                        <Button variant="ghost" size="sm" onClick={() => remove(q.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>

                    {q.type !== "text" && q.options && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.options.map((o, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                            {o}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {active && (
            <>
              <Separator />
              <div className="grid gap-3">
                <h4 className="text-sm font-medium text-primary">Edit Selected Question</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="qtitle">Question</Label>
                    <Input
                      id="qtitle"
                      value={active.title}
                      onChange={(e) =>
                        onChange(value.map((q) => (q.id === active.id ? { ...q, title: e.target.value } : q)))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Input value={active.type} disabled />
                  </div>
                </div>

                {active.type !== "text" && (
                  <div className="grid gap-2">
                    <Label>Options</Label>
                    <OptionEditor
                      options={active.options || []}
                      onChange={(opts) =>
                        onChange(value.map((q) => (q.id === active.id ? { ...q, options: opts } : q)))
                      }
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OptionEditor({ options, onChange }: { options: string[]; onChange: (opts: string[]) => void }) {
  const [input, setInput] = useState("")
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add an option" />
        <Button
          variant="secondary"
          onClick={() => {
            const t = input.trim()
            if (!t) return
            if (!options.includes(t)) onChange([...options, t])
            setInput("")
          }}
        >
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            className="px-2.5 py-1 rounded-full text-xs bg-muted hover:bg-muted/80"
            onClick={() => onChange(options.filter((x) => x !== o))}
            type="button"
            aria-label={`Remove ${o}`}
          >
            {o} ×
          </button>
        ))}
      </div>
    </div>
  )
}
