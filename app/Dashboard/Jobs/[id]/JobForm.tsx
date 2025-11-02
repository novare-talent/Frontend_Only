// app/Jobs/[id]/JobForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type MaybeResumeSource = string[] | string | null | undefined;

function normalizeResumeUrls(src: MaybeResumeSource): string[] {
  if (!src) return [];

  if (Array.isArray(src)) return src.filter(Boolean);

  const s = String(src).trim();

  if (s.startsWith("[") && s.endsWith("]")) {
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {}
  }

  if (s.startsWith("{") && s.endsWith("}")) {
    const inner = s.slice(1, -1);
    return inner
      .split(",")
      .map((p) => p.trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
  }

  if (s.includes(",")) {
    return s.split(",").map((p) => p.trim()).filter(Boolean);
  }

  return [s];
}

export default function JobForm({
  formData,
  formId,
  jobId,
}: {
  formData: any;
  formId?: string;
  jobId?: string;
}) {
  const supabaseClient = createClient();
  const router = useRouter();

  const [resumes, setResumes] = useState<string[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      try {
        const { data: userResp } = await supabaseClient.auth.getUser();
        const user = userResp?.user;
        if (!user) {
          if (mounted) {
            setNotLoggedIn(true);
            setLoadingProfile(false);
          }
          return;
        }

        const { data: profileRow } = await supabaseClient
          .from("profiles")
          .select("id, resume_url")
          .eq("id", user.id)
          .single();

        if (mounted && profileRow) {
          setProfileId(profileRow.id);
          setResumes(normalizeResumeUrls(profileRow.resume_url));

          // check if already applied
          if (formId) {
            const { data: existing } = await supabaseClient
              .from("responses")
              .select("id")
              .eq("form_id", formId)
              .eq("profile_id", profileRow.id)
              .maybeSingle();

            if (existing) setAlreadySubmitted(true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    }

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [supabaseClient, formId]);

  const hasResumes = useMemo(() => resumes.length > 0, [resumes]);

  const handleMultiSelectChange = (questionIndex: number, option: string, checked: boolean) => {
    const questionKey = `question-${questionIndex}`;
    setMultiSelectValues(prev => {
      const currentValues = prev[questionKey] || [];
      
      if (checked) {
        return {
          ...prev,
          [questionKey]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionKey]: currentValues.filter(val => val !== option)
        };
      }
    });
  };

  if (!formData) {
    return <div className="p-6 text-center text-muted-foreground">No form found</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (alreadySubmitted) {
      toast("Alert", {
        description: "You have already submitted this application.",
      })
      return;
    }

    setSubmitting(true);

    try {
      const formEl = e.currentTarget;
      const answers: Record<string, any> = {};

      (formData.questions ?? []).forEach((q: any, idx: number) => {
        const name = `question-${idx}`;
        let value = "";

        if (q.type === "MULTI") {
          // Get values from multiSelectValues state and convert to JSON string
          value = JSON.stringify(multiSelectValues[name] || []);
        } else {
          const el = (formEl.elements as any)[name];
          
          if (el && typeof el.value === "string") {
            value = el.value ?? "";
          } else if (el && "length" in el) {
            for (let i = 0; i < el.length; i++) {
              if (el[i].checked) {
                value = el[i].value;
                break;
              }
            }
          }
        }

        answers[q.title ?? name] = value;
      });

      answers["selected_resume"] = selectedResume ?? null;

      // Use the jobId prop here
      const { error } = await supabaseClient.from("responses").insert([
        {
          form_id: formId,
          profile_id: profileId,
          job_id: jobId,
          answers,
        },
      ]);

      if (error) {
        toast.error("Error", {
          description: "Failed to submit application.",
        })
        setSubmitting(false);
        return;
      }

      router.push("/Dashboard/Jobs");
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadySubmitted) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        You have already submitted this application.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 flex flex-col gap-8 rounded-2xl border bg-card shadow-md"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{formData.title}</h1>
        <p className="text-sm text-muted-foreground">
          Fill out the application form below
        </p>
      </div>

      {/* Resume Selector */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume
            </CardTitle>
            <CardDescription>
              Select a resume to attach to this application.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loadingProfile ? (
              <p className="text-sm text-muted-foreground">Loading resumes…</p>
            ) : notLoggedIn ? (
              <p className="text-sm text-muted-foreground">You must be logged in to select a resume.</p>
            ) : hasResumes ? (
              <div className="space-y-3">
                {resumes.map((url, idx) => {
                  const fileName = url.split("/").pop() ?? url;
                  const isSelected = selectedResume === url;
                  const toggle = () => setSelectedResume((prev) => (prev === url ? null : url));

                  return (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={toggle}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          toggle();
                        }
                      }}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                        isSelected ? "bg-accent/10 border-accent" : "hover:bg-accent"
                      }`}
                      title={fileName}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-4 w-4 rounded-full border flex-shrink-0 ${
                            isSelected ? "bg-primary border-accent" : "bg-transparent"
                          }`}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{fileName}</div>
                          <div className="text-xs text-muted-foreground">Resume</div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground truncate max-w-[40%]">
                        <a className="underline" href={url} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No resumes found in your profile. You can add resumes in your <Link href="/Dashboard/Account" about="View Profile" className="underline-offset-2 underline text-primary">profile</Link></p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* questions */}
      <div className="flex flex-col gap-6">
        {formData.questions?.map((q: any, idx: number) => {
          const name = `question-${idx}`;
          
          if (q.type === "TEXT") {
            return (
              <div key={idx} className="flex flex-col gap-2">
                <Label htmlFor={name}>{q.title}</Label>
                <Input id={name} name={name} placeholder={q.title} />
              </div>
            );
          }
          
          if (q.type === "RADIO") {
            return (
              <div key={idx} className="flex flex-col gap-3">
                <Label>{q.title}</Label>
                <RadioGroup name={name}>
                  {q.options.map((option: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 border p-3 rounded-lg">
                      <RadioGroupItem value={option} id={`${name}-${i}`} />
                      <Label htmlFor={`${name}-${i}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            );
          }
          
          if (q.type === "MULTI") {
            return (
              <div key={idx} className="flex flex-col gap-3">
                <Label>{q.title}</Label>
                <div className="space-y-2">
                  {q.options.map((option: string, i: number) => {
                    const optionId = `${name}-${i}`;
                    const isChecked = (multiSelectValues[name] || []).includes(option);
                    
                    return (
                      <div key={i} className="flex items-center gap-2 border p-3 rounded-lg">
                        <Checkbox
                          id={optionId}
                          checked={isChecked}
                          onCheckedChange={(checked) => 
                            handleMultiSelectChange(idx, option, checked as boolean)
                          }
                        />
                        <Label htmlFor={optionId}>{option}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          
          return null;
        })}
      </div>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={loadingProfile || submitting}>
          {submitting ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
    </form>
  );
}