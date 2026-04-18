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
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import { User, FileText, Mail, Phone, ArrowLeft, Eye } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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

export default function AdminEvaluationPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [evaluation, setEvaluation] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState<string>("Untitled Job");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Parallelize job title + batch profile fetch
        const [{ data: job }, { data: profileRows }] = await Promise.all([
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
        ]);

        setJobTitle(job?.Job_Name || job?.Job_Description || "Untitled Job");

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

  if (loading)
    return (
      <div className="p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-center mt-10">Loading evaluation...</p>
      </div>
    );

  if (!evaluation)
    return (
      <div className="p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-center mt-10">No evaluation found.</p>
      </div>
    );

  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)
  );

  const handleViewResponse = (profileId: string) => {
    router.push(`/admin/responses/${id}/${profileId}`);
  };

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/evaluate")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Evaluations
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Candidate Evaluations
            </CardTitle>
            <CardDescription>
              Job:{" "}
              <span className="font-semibold text-primary">
                {jobTitle}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {sortedCandidates.length === 0 ? (
              <p className="text-muted-foreground">
                No candidates evaluated yet.
              </p>
            ) : (
              sortedCandidates.map((c, i) => (
                <motion.div
                  key={c.profile_id || i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                  }}
                  className="relative rounded-xl border border-border bg-muted/20 p-5 transition-all
                  hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_12px_40px_-12px_hsl(var(--primary)/0.4)]"
                >
                  {/* Candidate Header */}
                  <div className="mb-3 space-y-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <User className="size-4 text-primary" />
                      {c.full_name || "Unnamed Candidate"}
                      <span className="text-sm text-muted-foreground">
                        (Rank #{i + 1})
                      </span>
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
                          onClick={() => handleViewResponse(c.profile_id || "")}
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
                      className="text-base transition hover:bg-primary/10 hover:
border-primary"
                    >
                      Final Score:
                      <span className="ml-1 font-semibold">
                        {c.final_score ?? "N/A"}
                      </span>
                      / 100
                    </Badge>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
