"use client"

import { useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ShineBorder } from "@/components/ui/shine-border"

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
  onGenerateAI?: () => Promise<void> | void
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

function CoffeeMachine() {
  return (
    <>
      <style>{`
        .cm-container { width: 300px; height: 280px; position: relative; margin: 0 auto; }
        .cm-header { width: 100%; height: 80px; position: absolute; top: 0; left: 0; background-color: #ddcfcc; border-radius: 10px; }
        .cm-btn { width: 25px; height: 25px; position: absolute; top: 25px; background-color: #282323; border-radius: 50%; }
        .cm-btn::after { content: ""; width: 8px; height: 8px; position: absolute; bottom: -8px; left: calc(50% - 4px); background-color: #615e5e; }
        .cm-btn-one { left: 15px; }
        .cm-btn-two { left: 50px; }
        .cm-display { width: 50px; height: 50px; position: absolute; top: calc(50% - 25px); left: calc(50% - 25px); border-radius: 50%; background-color: #9acfc5; border: 5px solid #43beae; box-sizing: border-box; }
        .cm-details { width: 8px; height: 20px; position: absolute; top: 10px; right: 10px; background-color: #9b9091; box-shadow: -12px 0 0 #9b9091, -24px 0 0 #9b9091; }
        .cm-medium { width: 90%; height: 160px; position: absolute; top: 80px; left: calc(50% - 45%); background-color: #bcb0af; }
        .cm-medium::before { content: ""; width: 90%; height: 100px; background-color: #776f6e; position: absolute; bottom: 0; left: calc(50% - 45%); border-radius: 20px 20px 0 0; }
        .cm-exit { width: 60px; height: 20px; position: absolute; top: 0; left: calc(50% - 30px); background-color: #231f20; }
        .cm-exit::before { content: ""; width: 50px; height: 20px; border-radius: 0 0 50% 50%; position: absolute; bottom: -20px; left: calc(50% - 25px); background-color: #231f20; }
        .cm-exit::after { content: ""; width: 10px; height: 10px; position: absolute; bottom: -30px; left: calc(50% - 5px); background-color: #231f20; }
        .cm-arm { width: 70px; height: 20px; position: absolute; top: 15px; right: 25px; background-color: #231f20; }
        .cm-arm::before { content: ""; width: 15px; height: 5px; position: absolute; top: 7px; left: -15px; background-color: #9e9495; }
        .cm-cup { width: 80px; height: 47px; position: absolute; bottom: 0; left: calc(50% - 40px); background-color: #fff; border-radius: 0 0 70px 70px / 0 0 110px 110px; }
        .cm-cup::after { content: ""; width: 20px; height: 20px; position: absolute; top: 6px; right: -13px; border: 5px solid #fff; border-radius: 50%; }
        @keyframes cm-liquid { 0% { height: 0; opacity: 1; } 5% { height: 0; opacity: 1; } 20% { height: 62px; opacity: 1; } 95% { height: 62px; opacity: 1; } 100% { height: 62px; opacity: 0; } }
        .cm-liquid { width: 6px; height: 63px; opacity: 0; position: absolute; top: 50px; left: calc(50% - 3px); background-color: #74372b; animation: cm-liquid 4s 4s linear infinite; }
        .cm-smoke { width: 8px; height: 20px; position: absolute; border-radius: 5px; background-color: #b3aeae; }
        @keyframes cm-smokeOne { 0% { bottom: 20px; opacity: 0; } 40% { bottom: 50px; opacity: 0.5; } 80% { bottom: 80px; opacity: 0.3; } 100% { bottom: 80px; opacity: 0; } }
        @keyframes cm-smokeTwo { 0% { bottom: 40px; opacity: 0; } 40% { bottom: 70px; opacity: 0.5; } 80% { bottom: 80px; opacity: 0.3; } 100% { bottom: 80px; opacity: 0; } }
        .cm-smoke-one { opacity: 0; bottom: 50px; left: 102px; animation: cm-smokeOne 3s 4s linear infinite; }
        .cm-smoke-two { opacity: 0; bottom: 70px; left: 118px; animation: cm-smokeTwo 3s 5s linear infinite; }
        .cm-smoke-three { opacity: 0; bottom: 65px; right: 118px; animation: cm-smokeTwo 3s 6s linear infinite; }
        .cm-smoke-four { opacity: 0; bottom: 50px; right: 102px; animation: cm-smokeOne 3s 5s linear infinite; }
        .cm-footer { width: 95%; height: 15px; position: absolute; bottom: 25px; left: calc(50% - 47.5%); background-color: #41bdad; border-radius: 10px; }
        .cm-footer::after { content: ""; width: 106%; height: 26px; position: absolute; bottom: -25px; left: -8px; background-color: #000; }
      `}</style>
      <div className="cm-container">
        <div className="cm-header">
          <div className="cm-btn cm-btn-one" />
          <div className="cm-btn cm-btn-two" />
          <div className="cm-display" />
          <div className="cm-details" />
        </div>
        <div className="cm-medium">
          <div className="cm-exit" />
          <div className="cm-arm" />
          <div className="cm-liquid" />
          <div className="cm-smoke cm-smoke-one" />
          <div className="cm-smoke cm-smoke-two" />
          <div className="cm-smoke cm-smoke-three" />
          <div className="cm-smoke cm-smoke-four" />
          <div className="cm-cup" />
        </div>
        <div className="cm-footer" />
      </div>
    </>
  )
}

export function QuestionBuilder({ value, onChange, className, onGenerateAI, isGenerating }: BuilderProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [previewLoader, setPreviewLoader] = useState(false)
  const [localGenerating, setLocalGenerating] = useState(false)
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const active = useMemo(() => value.find((q) => q.id === activeId) || null, [value, activeId])

  return (
    <div id="tour-question-builder" className={cn("grid gap-4", className)}>
      <Dialog open={localGenerating || previewLoader} onOpenChange={(open) => { if (!open) setPreviewLoader(false) }}>
        <DialogContent
          className="flex flex-col items-center gap-4 py-10 overflow-hidden"
          showCloseButton={previewLoader && !localGenerating}
          onInteractOutside={(e) => { if (localGenerating) e.preventDefault() }}
          onEscapeKeyDown={(e) => { if (localGenerating) e.preventDefault() }}
        >
          <DialogTitle className="sr-only">Generating with AI</DialogTitle>
          <ShineBorder borderWidth={2} duration={10} shineColor={["#a855f7", "#3b82f6", "#10b981"]} />
          <CoffeeMachine />
          <p className="text-sm text-muted-foreground font-medium">Brewing your questions with AI...</p>
        </DialogContent>
      </Dialog>
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
              onClick={async () => { setLocalGenerating(true); try { await onGenerateAI?.() } finally { setLocalGenerating(false) } }}
              disabled={localGenerating}
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
            {value.length === 0 ? (<>
                            <p className="text-sm text-destructive font-medium">Please add at least one question to create the job.</p>
              <p className="text-sm text-muted-foreground">Drag question types here or click a type above to add.</p>
            </>
              
            )
            
            : (
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
                            <p className="font-medium text-sm text-foreground">
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