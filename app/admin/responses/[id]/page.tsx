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
import { User, Mail, Phone, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type FormResponse = {
  id: string;
  profile_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  answers?: Record<string, any>;
  created_at?: string;
};

const ITEMS_PER_PAGE = 50;

function formatIST(dateString: string | null | undefined) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function parseAnswers(answers: any): Record<string, string> {
  if (!answers) return {};
  if (typeof answers === "string") {
    try {
      return JSON.parse(answers);
    } catch {
      return {};
    }
  }
  return answers;
}

export default function AdminFormResponsesPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const supabase = createClient();

  const [jobTitle, setJobTitle] = useState<string>("Untitled Job");
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("Job ID not available");
          setResponses([]);
          return;
        }

        // Fetch job title and form_id
        const { data: job, error: jobError } = await supabase
          .from("jobs")
          .select("Job_Name, Job_Description, form_id")
          .eq("job_id", id)
          .maybeSingle();

        if (jobError) {
          console.error("Error fetching job:", jobError);
        }

        setJobTitle(job?.Job_Name || job?.Job_Description || "Untitled Job");

        const resolvedFormId = job?.form_id ?? null;
        setFormId(resolvedFormId);

        if (!resolvedFormId) {
          setError("No form linked to this job.");
          setResponses([]);
          return;
        }

        // Get total count
        const { count: totalResponseCount, error: countError } = await supabase
          .from("responses")
          .select("*", { count: "exact", head: true })
          .eq("form_id", resolvedFormId);

        if (!countError && totalResponseCount !== null) {
          setTotalCount(totalResponseCount);
          setHasMore(totalResponseCount > ITEMS_PER_PAGE);
        }

        // Fetch responses
        const { data: responseRows, error: fetchError } = await supabase
          .from("responses")
          .select("id, profile_id, form_id, answers, created_at")
          .eq("form_id", resolvedFormId)
          .order("created_at", { ascending: false })
          .limit(ITEMS_PER_PAGE);

        if (fetchError) {
          setError(`Error fetching responses: ${fetchError.message}`);
          setResponses([]);
          return;
        }

        if (!responseRows || responseRows.length === 0) {
          setResponses([]);
          return;
        }

        const enrichedResponses = await enrichWithProfiles(responseRows);
        setResponses(enrichedResponses);
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResponses();
  }, [id]);

  const enrichWithProfiles = async (responseRows: any[]): Promise<FormResponse[]> => {
    const profileIds = Array.from(
      new Set(responseRows.map((r) => r.profile_id).filter((pid): pid is string => Boolean(pid)))
    );

    const profileMap: Record<string, any> = {};
    if (profileIds.length > 0) {
      const batchSize = 100;
      for (let i = 0; i < profileIds.length; i += batchSize) {
        const batch = profileIds.slice(i, i + batchSize);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone")
          .in("id", batch);

        if (profiles) {
          profiles.forEach((p) => { profileMap[p.id] = p; });
        }
      }
    }

    return responseRows.map((r) => {
      const profile = profileMap[r.profile_id] || {};
      const parsedAnswers = parseAnswers(r.answers);
      const fullName = profile.first_name
        ? `${profile.first_name} ${profile.last_name || ""}`.trim()
        : parsedAnswers["Full Name"] || "Unknown";

      return {
        id: r.id,
        profile_id: r.profile_id,
        full_name: fullName,
        email: profile.email || parsedAnswers["Email Address"],
        phone: profile.phone || parsedAnswers["Phone Number"],
        answers: parsedAnswers,
        created_at: r.created_at,
      };
    });
  };

  const loadMore = async () => {
    if (!formId) return;
    try {
      const { data: responseRows, error } = await supabase
        .from("responses")
        .select("id, profile_id, form_id, answers, created_at")
        .eq("form_id", formId)
        .order("created_at", { ascending: false })
        .range(responses.length, responses.length + ITEMS_PER_PAGE - 1);

      if (error || !responseRows || responseRows.length === 0) {
        setHasMore(false);
        return;
      }

      const enrichedResponses = await enrichWithProfiles(responseRows);
      setResponses((prev) => [...prev, ...enrichedResponses]);
      setHasMore(responses.length + responseRows.length < totalCount);
    } catch (err) {
      console.error("Error loading more responses:", err);
    }
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-muted-foreground">
        Loading responses...
      </p>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-10">
        <Card className="border-0 bg-transparent border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
              Error Loading Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 dark:text-red-300 font-mono text-sm break-all">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="container mx-auto px-6 py-10">
        <Card className="border-0 bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Form Responses
            </CardTitle>
            <CardDescription>
              Job: <span className="font-semibold text-primary">{jobTitle}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              No form responses yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 bg-transparent mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Form Responses
            </CardTitle>
            <CardDescription>
              Job: <span className="font-semibold text-primary">{jobTitle}</span>{" "}
              • Showing {responses.length} of {totalCount} response{totalCount !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {responses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative rounded-xl border border-border bg-muted/20 p-6 transition-all
                         hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_12px_40px_-12px_hsl(var(--primary)/0.4)]"
            >
              <div className="mb-4 space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  {response.full_name || "Unknown Candidate"}
                  <span className="text-sm text-muted-foreground">(#{index + 1})</span>
                </h3>

                <div className="flex flex-wrap gap-4 text-sm">
                  {response.email && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Mail className="size-4" /> {response.email}
                    </p>
                  )}
                  {response.phone && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Phone className="size-4" /> {response.phone}
                    </p>
                  )}
                  {response.created_at && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-4" />
                      {formatIST(response.created_at)}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="mb-4" />

              <div className="space-y-3">
                {Object.entries(response.answers || {}).map(([key, value]) => {
                  if (key === "selected_resume" && typeof value === "string") {
                    return (
                      <div key={key}>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Resume:</p>
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/30 rounded text-sm text-primary hover:bg-primary/20 transition"
                        >
                          View Resume ↗
                        </a>
                      </div>
                    );
                  }

                  if (!value) return null;

                  const displayValue =
                    typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value);

                  return (
                    <div key={key} className="text-sm">
                      <p className="font-medium text-foreground mb-1">{key}:</p>
                      <p className="text-muted-foreground pl-3 border-l-2 border-primary/30 py-1">
                        {displayValue}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Badge variant="outline" className="text-xs">
                  Response ID: {response.id.slice(0, 8)}...
                </Badge>
              </div>
            </motion.div>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button onClick={loadMore} variant="outline" className="px-8">
                Load More Responses
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
