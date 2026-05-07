"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  User,
  FileText,
  Mail,
  Phone,
  Eye,
  Send,
  CheckSquare,
  Square,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { toast } from "sonner";

type Candidate = {
  full_name?: string;
  profile_id?: string;
  resume_url?: string;
  skills_match?: number;
  experience_relevance?: number;
  communication_clarity?: number;
  final_score?: number;
  justification?: string;
  email?: string;
  phone?: string;
};

export default function EvaluationPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [evaluation, setEvaluation] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState<string>("Untitled Job");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [rejectionSent, setRejectionSent] = useState(false);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);

        const { data: evalRow } = await supabase
          .from("evaluations")
          .select("job_id, results")
          .eq("job_id", id)
          .maybeSingle();

        if (!evalRow) {
          setEvaluation(null);
          return;
        }

        setEvaluation(evalRow);

        const baseCandidates: Candidate[] =
          evalRow?.results?.candidates ?? [];

        const profileIds = baseCandidates
          .filter((c) => c.profile_id)
          .map((c) => c.profile_id as string);

        const [{ data: job }, { data: profileRows }, { data: jobStatus }] =
          await Promise.all([
            supabase
              .from("jobs")
              .select("Job_Name, Job_Description")
              .eq("job_id", evalRow.job_id)
              .maybeSingle(),
            profileIds.length > 0
              ? supabase
                  .from("profiles")
                  .select("id, email, phone")
                  .in("id", profileIds)
              : Promise.resolve({ data: [] }),
            supabase
              .from("jobs")
              .select("rejection_emails_sent")
              .eq("job_id", evalRow.job_id)
              .maybeSingle(),
          ]);

        setJobTitle(job?.Job_Name || job?.Job_Description || "Untitled Job");
        setRejectionSent(!!(jobStatus as any)?.rejection_emails_sent);

        const profileMap = Object.fromEntries(
          (profileRows ?? []).map((p: any) => [p.id, p])
        );

        const enriched = baseCandidates.map((c) => ({
          ...c,
          email: c.profile_id ? profileMap[c.profile_id]?.email : undefined,
          phone: c.profile_id ? profileMap[c.profile_id]?.phone : undefined,
        }));

        setCandidates(enriched);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvaluation();
  }, [id, supabase]);

  const toggleCandidate = (profileId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  };

  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)
  );

  const selectableCandidates = sortedCandidates.filter((c) => c.profile_id);
  const allSelected =
    selectableCandidates.length > 0 &&
    selectedIds.size === selectableCandidates.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(selectableCandidates.map((c) => c.profile_id as string))
      );
    }
  };

  const handleSendRejections = async () => {
    if (selectedIds.size === 0) return;

    setSending(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      const res = await fetch("/api/send-rejection-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          jobId: id,
          candidateIds: Array.from(selectedIds),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send rejection emails");
        return;
      }

      const successCount =
        data.results?.filter((r: any) => r.success).length ?? 0;
      const total = data.results?.length ?? 0;

      toast.success(`${successCount}/${total} rejection emails sent`);

      if (successCount > 0) {
        setRejectionSent(true);
        setSelectedIds(new Set());
      }

      data.results
        ?.filter((r: any) => !r.success)
        .forEach((r: any) => {
          toast.error(`Failed for ${r.name} (${r.email}): ${r.error}`);
        });
    } catch (err: any) {
      toast.error(err?.message || "Unexpected error sending emails");
    } finally {
      setSending(false);
    }
  };

  const handleViewResponse = (profileId: string) => {
    router.push(`/client/responses/${id}/${profileId}`);
  };

  if (loading)
    return <p className="text-center mt-10">Loading evaluation...</p>;

  if (!evaluation)
    return <p className="text-center mt-10">No evaluation found.</p>;

  return (
    <div className="container mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 bg-transparent">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Candidate Evaluations
                </CardTitle>
                <CardDescription>
                  Job:{" "}
                  <span className="font-semibold text-primary">
                    {jobTitle}
                  </span>
                </CardDescription>
              </div>

              {rejectionSent && (
                <Badge className="gap-1.5 bg-green-500/15 text-green-600 border border-green-500/30 hover:bg-green-500/20">
                  <CheckCircle2 className="size-4" />
                  Rejection emails sent
                </Badge>
              )}
            </div>

            {sortedCandidates.length > 0 && (
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                  className="gap-2"
                >
                  {allSelected ? (
                    <CheckSquare className="size-4" />
                  ) : (
                    <Square className="size-4" />
                  )}
                  {allSelected ? "Deselect All" : "Select All"}
                </Button>

                {selectedIds.size > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleSendRejections}
                    disabled={sending}
                    className="gap-2"
                  >
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    {sending
                      ? "Sending..."
                      : `Send Rejection Email${selectedIds.size > 1 ? "s" : ""} (${selectedIds.size})`}
                  </Button>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-8">
            {sortedCandidates.length === 0 ? (
              <p className="text-muted-foreground">
                No candidates evaluated yet.
              </p>
            ) : (
              sortedCandidates.map((c, i) => {
                const isSelected = c.profile_id
                  ? selectedIds.has(c.profile_id)
                  : false;

                return (
                  <motion.div
                    key={c.profile_id || i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`relative rounded-xl border p-5 transition-all
                      ${
                        isSelected
                          ? "border-destructive/60 bg-destructive/5 shadow-[0_0_0_1px_hsl(var(--destructive)/0.4)]"
                          : "border-border bg-muted/20 hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_12px_40px_-12px_hsl(var(--primary)/0.4)]"
                      }`}
                  >
                    {/* Checkbox */}
                    {c.profile_id && (
                      <div className="absolute top-4 right-4 z-10">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            toggleCandidate(c.profile_id!)
                          }
                          aria-label={`Select ${c.full_name || "candidate"} for rejection`}
                        />
                      </div>
                    )}

                    {/* Candidate Header */}
                    <div className="mb-3 space-y-1 pr-8">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="size-4 text-primary" />
                        {c.full_name || "Unnamed Candidate"}
                        <span className="text-sm text-muted-foreground">
                          (Rank #{i + 1})
                        </span>
                        {isSelected && (
                          <Badge
                            variant="destructive"
                            className="text-xs ml-1"
                          >
                            Selected for rejection
                          </Badge>
                        )}
                      </h3>

                      {c.email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="size-4" /> {c.email}
                        </p>
                      )}

                      {c.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="size-4" /> {c.phone}
                        </p>
                      )}

                      {c.resume_url && (
                        <div className="flex items-center gap-2">
                          <a
                            href={c.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary
                                       transition hover:gap-2 hover:underline"
                          >
                            View Resume <FileText className="size-4" />
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewResponse(c.profile_id || "")
                            }
                            className="gap-1 h-7 text-xs"
                          >
                            <Eye className="size-3" />
                            Form Response
                          </Button>
                        </div>
                      )}
                    </div>

                    <Separator className="mb-3" />

                    {/* Scores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>Skills Match: {c.skills_match ?? "—"}</div>
                      <div>
                        Experience Relevance:{" "}
                        {c.experience_relevance ?? "—"}
                      </div>
                      <div>
                        Communication Clarity:{" "}
                        {c.communication_clarity ?? "—"}
                      </div>
                    </div>

                    {/* Justification */}
                    <div className="mt-4">
                      <p className="font-medium">Justification:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {c.justification || "—"}
                      </p>
                    </div>

                    {/* Final Score */}
                    <div className="mt-4">
                      <Badge
                        variant="outline"
                        className="text-base transition hover:bg-primary/10 hover:border-primary"
                      >
                        Final Score:
                        <span className="ml-1 font-semibold">
                          {c.final_score ?? "N/A"}
                        </span>
                        / 100
                      </Badge>
                    </div>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
