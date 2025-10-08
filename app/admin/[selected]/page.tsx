"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const supabase = createClient();

interface CandidateResult {
  results: {
    final_score: number;
    overall_fit: number;
    skills_match: number;
    experience_relevance: number;
    communication_clarity: number;
    justification: string;
  };
  profile_id: string;
}

export default function EvaluationResults() {
  const [evaluations, setEvaluations] = useState<CandidateResult[][]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchResults() {
    const { data, error } = await supabase.from("evaluations").select("results");

    if (error) {
      console.error("Error fetching data:", error);
      setEvaluations([]);
    } else {
      // results is an array of candidates for each evaluation row
      const parsed = data.map((row) =>
        typeof row.results === "string" ? JSON.parse(row.results) : row.results
      );
      setEvaluations(parsed);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) return <p className="p-4">Loading evaluation results...</p>;
  if (!evaluations || evaluations.length === 0)
    return <p className="p-4">No results found.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Evaluation Results</h1>

      {evaluations.map((candidates, evalIdx) => (
        <Card key={evalIdx} className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Evaluation #{evalIdx + 1}
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4 space-y-6">
            {candidates.map((c, idx) => (
              <div key={idx} className="space-y-2 border-b pb-4 last:border-none">
                <p className="font-medium">Candidate #{idx + 1}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Final Score</p>
                    <p className="text-muted-foreground">{c.results.final_score}</p>
                  </div>
                  <div>
                    <p className="font-medium">Overall Fit</p>
                    <p className="text-muted-foreground">{c.results.overall_fit}</p>
                  </div>
                  <div>
                    <p className="font-medium">Skills Match</p>
                    <p className="text-muted-foreground">{c.results.skills_match}</p>
                  </div>
                  <div>
                    <p className="font-medium">Experience Relevance</p>
                    <p className="text-muted-foreground">
                      {c.results.experience_relevance}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Communication Clarity</p>
                    <p className="text-muted-foreground">
                      {c.results.communication_clarity}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Justification</p>
                  <p className="text-muted-foreground whitespace-pre-line text-sm">
                    {c.results.justification}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Profile ID</p>
                  <p className="text-muted-foreground text-sm">{c.profile_id}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
