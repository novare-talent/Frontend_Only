"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EvaluationRow {
  evaluation_id: string;
  job_id: string;
  results: any;
  job_title?: string;
}

export default function AllEvaluations() {
  const [evaluations, setEvaluations] = useState<EvaluationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchResults() {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("evaluations")
        .select("evaluation_id, job_id, results")
        .order("evaluation_id", { ascending: false });

      if (error) {
        console.error("Error fetching data:", error);
        setEvaluations([]);
      } else {
        const evals: EvaluationRow[] = data || [];

        // Fetch job titles
        const enriched = await Promise.all(
          evals.map(async (eval_row) => {
            const { data: job } = await supabase
              .from("jobs")
              .select("Job_Name")
              .eq("job_id", eval_row.job_id)
              .maybeSingle();

            return {
              ...eval_row,
              job_title: job?.Job_Name || "Untitled Job",
            };
          })
        );

        setEvaluations(enriched);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) return <p className="p-4">Loading evaluation results...</p>;
  if (!evaluations || evaluations.length === 0)
    return (
      <div className="p-6 space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-lg text-gray-900 dark:text-gray-100">No evaluations found.</p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Evaluation Results</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        {evaluations.map((evaluation) => {
          const candidates = Array.isArray(evaluation.results)
            ? evaluation.results
            : evaluation.results?.candidates ?? [];

          return (
            <Card
              key={evaluation.evaluation_id}
              className="shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() =>
                router.push(`/admin/evaluate/${evaluation.job_id}`)
              }
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {evaluation.job_title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Evaluation ID: {evaluation.evaluation_id}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    {candidates.length} Candidates
                  </span>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Top Score
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {candidates.length > 0
                        ? Math.max(
                            ...candidates.map(
                              (c: any) => c.final_score ?? 0
                            )
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Avg Score
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {candidates.length > 0
                        ? (
                            candidates.reduce(
                              (sum: number, c: any) =>
                                sum + (c.final_score ?? 0),
                              0
                            ) / candidates.length
                          ).toFixed(1)
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Candidates
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{candidates.length}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      View Details
                    </p>
                    <p className="text-lg font-semibold text-primary">→</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
