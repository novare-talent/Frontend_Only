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
import { useParams } from "next/navigation";
import { User, FileText } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Candidate = {
  full_name?: string;
  profile_id?: string;
  resume_url?: string;
  skills_match?: number;
  experience_relevance?: number;
  communication_clarity?: number;
  final_score?: number;
  justification?: string;
};

export default function EvaluationPage() {
  const { id } = useParams();
  const supabase = createClient();

  const [evaluation, setEvaluation] = useState<any>(null);
  const [jobTitle, setJobTitle] = useState<string>("Untitled Job");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch evaluation row
        const { data, error } = await supabase
          .from("evaluations")
          .select("*")
          .eq("job_id", id)
          .maybeSingle();

        console.log("[EvaluationPage] evaluation row:", data);

        if (error || !data) {
          setEvaluation(null);
          return;
        }

        setEvaluation(data);

        // 2️⃣ Fetch job title
        const { data: job } = await supabase
          .from("jobs")
          .select("Job_Name, Job_Description")
          .eq("job_id", data.job_id)
          .maybeSingle();

        setJobTitle(
          job?.Job_Name || job?.Job_Description || "Untitled Job"
        );
      } catch (err) {
        console.error("[EvaluationPage] fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvaluation();
  }, [id, supabase]);

  if (loading)
    return <p className="text-center mt-10">Loading evaluation...</p>;

  if (!evaluation)
    return <p className="text-center mt-10">No evaluation found.</p>;

  // ✅ CORRECT DATA ACCESS
  const candidates: Candidate[] =
    evaluation?.results?.candidates ?? [];

  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)
  );

  return (
    <div className="container mx-auto py-10 px-6">
      <Card className="border border-primary/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
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
              <div
                key={c.profile_id || i}
                className="rounded-lg border p-4 bg-muted/20"
              >
                {/* Candidate header */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    {c.full_name || "Unnamed Candidate"}
                    <span className="text-sm text-muted-foreground">
                      (Rank #{i + 1})
                    </span>
                  </h3>

                  {c.resume_url && (
                    <a
                      href={c.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-sm mt-1"
                    >
                      View Resume <FileText className="size-4" />
                    </a>
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

                {/* Final score */}
                <div className="mt-4">
                  <Badge variant="outline" className="text-base">
                    Final Score:{" "}
                    <span className="ml-1 font-semibold">
                      {c.final_score ?? "N/A"}
                    </span>{" "}
                    / 100
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
