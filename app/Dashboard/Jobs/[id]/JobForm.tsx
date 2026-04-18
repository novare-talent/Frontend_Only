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
import { FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

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
  formId?: string | null;
  jobId?: string;
}) {
  const supabaseClient = createClient();
  const router = useRouter();

  const [resumes, setResumes] = useState<string[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState<Record<string, string[]>>({});

  const [isDragging, setIsDragging] = useState(false);
  const [newResumeFile, setNewResumeFile] = useState<File | null>(null);

  // NEW: JOB DETAILS
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [loadingJob, setLoadingJob] = useState(true);



  useEffect(() => {
    let mounted = true;

    async function fetchAllData() {
      try {
        // === FETCH USER PROFILE ===
        const { data: userResp } = await supabaseClient.auth.getUser();
        const user = userResp?.user;
        if (!user) {
          if (mounted) {
            setNotLoggedIn(true);
            setLoadingProfile(false);
          }
          return;
        }

        // Fetch profile and job details in parallel
        const [{ data: profileRow }, { data: jobRow, error: jobError }] =
          await Promise.all([
            supabaseClient
              .from("profiles")
              .select("id, resume_url, first_name, last_name, phone, email")
              .eq("id", user.id)
              .single(),
            jobId
              ? supabaseClient
                  .from("jobs")
                  .select("Job_Name, closingTime, duration, level, stipend, location, tags")
                  .eq("job_id", jobId)
                  .single()
              : Promise.resolve({ data: null, error: null }),
          ]);

        if (mounted && profileRow) {
          setProfileId(profileRow.id);
          const fullName = `${profileRow.first_name || ""} ${profileRow.last_name || ""}`.trim();
          setProfileData({
            name: fullName,
            phone: profileRow.phone || "",
            email: profileRow.email || user.email || "",
          });
          setResumes(normalizeResumeUrls(profileRow.resume_url));

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

        setLoadingProfile(false);

        if (mounted && jobId) {
          if (!jobError && jobRow) {
            setJobDetails(jobRow);
          }
          setLoadingJob(false);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchAllData();

    return () => {
      mounted = false;
    };
  }, [supabaseClient, formId, jobId]);

  // If user has no resumes (and is logged in), auto-open profile page so they can upload one.
  // useEffect(() => {
  //   if (
  //     !loadingProfile &&
  //     !notLoggedIn &&
  //     resumes.length === 0 &&
  //     !autoOpenedProfile
  //   ) {
  //     // Only run in browser
  //     if (typeof window !== "undefined") {
  //       try {
  //         // open profile page in a new tab
  //         window.open("/Dashboard/Account", "_blank");
  //       } catch (err) {
  //         // fallback to in-app navigation if popup blocked
  //         router.push("/Dashboard/Account");
  //       }

  //       toast(
  //         "No resume found",
  //         {
  //           description:
  //             "We've opened your profile in a new tab so you can upload a resume. Please add one and come back to submit your application.",
  //         }
  //       );

  //       setAutoOpenedProfile(true);
  //     }
  //   }
  // }, [loadingProfile, notLoggedIn, resumes, autoOpenedProfile, router]);

  const hasResumes = useMemo(() => resumes.length > 0 || newResumeFile !== null, [resumes, newResumeFile]);

  function formatISTDate(dateString: string) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const handleMultiSelectChange = (questionIndex: number, option: string, checked: boolean) => {
    const questionKey = `question-${questionIndex}`;
    setMultiSelectValues((prev) => {
      const currentValues = prev[questionKey] || [];

      if (checked) {
        return {
          ...prev,
          [questionKey]: [...currentValues, option],
        };
      } else {
        return {
          ...prev,
          [questionKey]: currentValues.filter((val) => val !== option),
        };
      }
    });
  };

  if (!formData) {
    return <div className="p-6 text-center text-muted-foreground">No form found</div>;
  }

  // Client-side validation helper
  const validateFormBeforeSubmit = (formEl: HTMLFormElement) => {
    // Resume is absolutely required
    if (!selectedResume && !newResumeFile) {
      toast.error("Resume required", { description: "Please select or upload a resume before submitting." });
      const resumeLink = formEl.querySelector("a[href]") as HTMLElement | null;
      if (resumeLink) resumeLink.focus();
      return false;
    }

    // Validate all required questions only if form exists
    if (!formData?.questions) return true;

    for (let idx = 0; idx < formData.questions.length; idx++) {
      const q = formData.questions[idx];
      if (!q?.required) continue;

      const name = `question-${idx}`;

      if (q.type === "TEXT") {
        const el = (formEl.elements as any)[name] as HTMLInputElement | undefined;
        const val = el?.value?.trim?.() ?? "";
        if (!val) {
          toast.error("Required", { description: "Please answer: " + (q.title || "Required question") });
          if (el && typeof el.focus === "function") el.focus();
          return false;
        }
      } else if (q.type === "RADIO") {
        const el = (formEl.elements as any)[name];
        let found = false;
        if (el) {
          if (typeof el.value === "string" && el.value) {
            found = true;
          } else if ("length" in el) {
            for (let i = 0; i < el.length; i++) {
              if (el[i].checked) {
                found = true;
                break;
              }
            }
          }
        }
        if (!found) {
          toast.error("Required", { description: "Please select an option for: " + (q.title || "Required question") });
          // try focusing first radio input
          if (el && el.length && el[0] && typeof el[0].focus === "function") el[0].focus();
          return false;
        }
      } else if (q.type === "MULTI") {
        const key = `question-${idx}`;
        const vals = multiSelectValues[key] || [];
        if (!vals || vals.length === 0) {
          toast.error("Required", { description: "Please select at least one option for: " + (q.title || "Required question") });
          // can't reliably focus checkbox, so focus the form
          formEl.focus();
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (alreadySubmitted) {
      toast("Alert", {
        description: "You have already submitted this application.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formEl = e.currentTarget;

      // client-side validation
      const ok = validateFormBeforeSubmit(formEl);
      if (!ok) {
        setSubmitting(false);
        return;
      }

      // Upload new resume if provided
      let finalResumeUrl = selectedResume;
      if (newResumeFile && profileId) {
        try {
          const filePath = `${profileId}/${Date.now()}_${newResumeFile.name}`;
          const { error: uploadError } = await supabaseClient.storage
            .from("resumes")
            .upload(filePath, newResumeFile, { upsert: true });

          if (uploadError) {
            toast.error("Upload Failed", {
              description: "Failed to upload new resume. Please try again.",
            });
            setSubmitting(false);
            return;
          }

          const { data: { publicUrl } } = supabaseClient.storage
            .from("resumes")
            .getPublicUrl(filePath);

          finalResumeUrl = publicUrl;

          // Update profile with new resume
          const updatedResumes = [...resumes, publicUrl];
          await supabaseClient
            .from("profiles")
            .update({ resume_url: updatedResumes })
            .eq("id", profileId);
        } catch {
          toast.error("Upload Error", {
            description: "Failed to upload resume. Please try again.",
          });
          setSubmitting(false);
          return;
        }
      }

      const answers: Record<string, any> = {};

      if (profileData) {
        answers["Full Name"] = profileData.name || "";
        answers["Phone Number"] = profileData.phone || "";
        answers["Email Address"] = profileData.email || "";
      }

      if (formData?.questions) {
        formData.questions.forEach((q: any, idx: number) => {
          const name = `question-${idx}`;
          let value: any = "";

          if (q.type === "MULTI") {
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
      }

      answers["selected_resume"] = finalResumeUrl ?? null;

      if (!profileId) {
        toast.error("Error", {
          description: "Profile not loaded. Please refresh the page.",
        });
        setSubmitting(false);
        return;
      }

      const { error: responseError } = await supabaseClient.from("responses").insert([
        {
          form_id: formId,
          profile_id: profileId,
          job_id: jobId,
          answers,
        },
      ]);

      if (responseError) {
        toast.error("Error", {
          description: "Failed to submit application.",
        });
        setSubmitting(false);
        return;
      }

      // === UPDATE Applied_Candidates ===
      if (jobId && profileId) {
        const { data: jobData } = await supabaseClient
          .from("jobs")
          .select("Applied_Candidates")
          .eq("job_id", jobId)
          .single();

        let currentCandidates: string[] = [];

        if (jobData?.Applied_Candidates) {
          if (Array.isArray(jobData.Applied_Candidates)) {
            currentCandidates = jobData.Applied_Candidates;
          } else {
            try {
              currentCandidates = JSON.parse(jobData.Applied_Candidates);
            } catch {
              currentCandidates = [];
            }
          }
        }

        if (!currentCandidates.includes(profileId)) {
          currentCandidates.push(profileId);

          await supabaseClient
            .from("jobs")
            .update({ Applied_Candidates: JSON.stringify(currentCandidates) })
            .eq("job_id", jobId);
        }
      }

      toast.success("Success", {
        description: "Application submitted successfully!",
      });

      router.push("/Dashboard/Jobs");
    } catch (err: any) {
      console.error(err);
      toast.error("Error", {
        description: err?.message ?? "Failed to submit.",
      });
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

  const hasForm = formData && formData.questions && formData.questions.length > 0;

  return (
    <form
  onSubmit={handleSubmit}
  className="max-w-4xl mx-auto p-8 flex flex-col gap-8 rounded-2xl border bg-card shadow-md"
>
  <fieldset
    disabled={loadingProfile || notLoggedIn || !hasResumes}
    className="contents"
  >

      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">{formData?.title || "Job Application"}</h1>
        </div>

        {/* JOB DETAILS DISPLAY */}
        {loadingJob ? (
          <p className="text-sm text-muted-foreground text-center">Loading job details…</p>
        ) : jobDetails ? (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p>
                <span className="font-medium">Closing Time:</span>{" "}
                {formatISTDate(jobDetails.closingTime)}
              </p>
              <p>
                <span className="font-medium">Duration:</span>{" "}
                {jobDetails.duration || "—"}
              </p>

              <p>
                <span className="font-medium">Level:</span>{" "}
                {jobDetails.level || "—"}
              </p>
              <p>
                <span className="font-medium">Stipend:</span>{" "}
                {jobDetails.stipend || "—"}
              </p>

              <p>
                <span className="font-medium">Location:</span>{" "}
                {jobDetails.location || "—"}
              </p>

              <p>
                <span className="font-medium">Skills / Tags:</span>{" "}
                {Array.isArray(jobDetails.tags)
                  ? jobDetails.tags.join(", ")
                  : jobDetails.tags || "NULL"}
              </p>
            </div>
          </Card>
        ) : null}
      </div>

      {/* Resume Selector */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume <span className="text-destructive ml-2">*</span>
            </CardTitle>
            <CardDescription>Select a resume to attach to this application. This is required.</CardDescription>
          </CardHeader>

          <CardContent>
            {loadingProfile ? (
              <p className="text-sm text-muted-foreground">Loading resumes…</p>
            ) : notLoggedIn ? (
              <p className="text-sm text-muted-foreground">
                You must be logged in to select a resume.
              </p>
            ) : (
              <div className="space-y-4">
                {/* Upload New Resume Section */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Upload New Resume</Label>
                  {newResumeFile ? (
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm flex-1 truncate">{newResumeFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewResumeFile(null);
                          if (!selectedResume && resumes.length > 0) {
                            setSelectedResume(resumes[0]);
                          }
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        if (file && file.type === "application/pdf" && file.size <= 2 * 1024 * 1024) {
                          setNewResumeFile(file);
                          setSelectedResume(null);
                        } else {
                          toast.error("Invalid File", {
                            description: "Please upload a PDF file under 2MB",
                          });
                        }
                      }}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".pdf";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file && file.type === "application/pdf" && file.size <= 2 * 1024 * 1024) {
                            setNewResumeFile(file);
                            setSelectedResume(null);
                          } else {
                            toast.error("Invalid File", {
                              description: "Please upload a PDF file under 2MB",
                            });
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload or drag & drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF (up to 2MB)</p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                {resumes.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or select from below</span>
                    </div>
                  </div>
                )}

                {/* Existing Resumes Section */}
                {resumes.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Previously Uploaded Resumes</Label>
                    {resumes.map((url, idx) => {
                      const fileName = url.split("/").pop() ?? url;
                      const isSelected = selectedResume === url && !newResumeFile;
                      const toggle = () => {
                        if (newResumeFile) {
                          setNewResumeFile(null);
                        }
                        setSelectedResume((prev) => (prev === url ? null : url));
                      };

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
                            isSelected
                              ? "bg-accent/10 border-accent"
                              : "hover:bg-accent"
                          }`}
                          title={fileName}
                          aria-pressed={isSelected}
                          aria-label={`Select resume ${fileName}`}
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
                            <a className="underline" href={url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              View
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No previously uploaded resumes found.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questions */}
      {hasForm && (
        <div className="flex flex-col gap-6">
          {formData.questions.map((q: any, idx: number) => {
          const name = `question-${idx}`;

          if (q.type === "TEXT") {
            return (
              <div key={idx} className="flex flex-col gap-2">
                <Label htmlFor={name}>
                  {q.title} {q.required ? <span className="text-destructive">*</span> : null}
                </Label>
                <Input
                  id={name}
                  name={name}
                  placeholder={q.title}
                  required={!!q.required}
                  aria-required={!!q.required}
                />
              </div>
            );
          }

          if (q.type === "RADIO") {
            return (
              <div key={idx} className="flex flex-col gap-3">
                <Label>
                  {q.title} {q.required ? <span className="text-destructive">*</span> : null}
                </Label>
                <RadioGroup name={name} aria-required={!!q.required}>
                  {q.options.map((option: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 border p-3 rounded-lg">
                      <RadioGroupItem value={option} id={`${name}-${i}`} aria-required={!!q.required} />
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
                <Label>
                  {q.title} {q.required ? <span className="text-destructive">*</span> : null}
                </Label>
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
                          aria-required={!!q.required}
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
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={loadingProfile || submitting || notLoggedIn || !hasResumes}
          title={
            !hasResumes
              ? "Please upload a resume in your profile before submitting."
              : undefined
          }
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </Button>
      </div>
      </fieldset>
    </form>
  );
}
