"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Question } from "./question-builder"

export function JobFormPreview({ questions }: { questions: Question[] }) {
  return (
    <Card className="rounded-2xl border bg-card/60 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-primary">Form Preview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {questions.length === 0 ? (
          <p className="text-md text-muted-foreground">Questions you add in the builder will preview here.</p>
        ) : (
          <form className="grid gap-4">
            {questions.map((q) => (
              <div key={q.id} className="grid gap-2">
                <Label>
                  {q.title} {q.required && <span className="text-destructive">*</span>}
                </Label>
                {q.type === "text" && <Textarea placeholder="Type your answer…" />}
                {q.type === "radio" && (
                  <div className="grid gap-2">
                    {(q.options || []).map((o, i) => (
                      <label key={i} className="flex items-center gap-2 text-md">
                        <input type="radio" name={q.id} /> {o}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "multi" && (
                  <div className="grid gap-2">
                    {(q.options || []).map((o, i) => (
                      <label key={i} className="flex items-center gap-2 text-md">
                        <input type="checkbox" /> {o}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
