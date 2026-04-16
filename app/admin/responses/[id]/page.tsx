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

type FormResponse = {
  id: string;
  profile_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  answers?: Record<string, any>;
  created_at?: string;
};

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
  const { id } = useParams();
  const supabase = createClient();

  const [jobTitle, setJobTitle] = useState<string>("Untitled Job");
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);

        // Fetch job title
        const { data: job } = await supabase
          .from("jobs")
          .select("Job_Name, Job_Description")
          .eq("job_id", id)
          .maybeSingle();

        setJobTitle(job?.Job_Name || job?.Job_Description || "Untitled Job");

        // Fetch all responses for the job
        const { data: responseRows, error } = await supabase
          .from("responses")
          .select("*")
          .eq("job_id", id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching responses:", error);
          setResponses([]);
          return;
        }

        if (!responseRows || responseRows.length === 0) {
          setResponses([]);
          return;
        }

        // Get all unique profile IDs
        const profileIds = Array.from(
          new Set(
            responseRows
              .map((r) => r.profile_id)
              .filter((id): id is string => Boolean(id))
          )
        );

        // Fetch profile data for all candidates
        let profileMap: Record<string, any> = {};
        if (profileIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, email, phone")
            .in("id", profileIds);

          if (profiles) {
            profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
          }
        }

        // Enrich responses with profile data
        const enrichedResponses: FormResponse[] = responseRows.map((r) => {
          const profile = profileMap[r.profile_id] || {};
          const parsedAnswers = parseAnswers(r.answers);

          return {
            id: r.id,
            profile_id: r.profile_id,
            full_name: profile.first_name || parsedAnswers["Full Name"] || "Unknown",
            email: profile.email || parsedAnswers["Email Address"],
            phone: profile.phone || parsedAnswers["Phone Number"],
            answers: parsedAnswers,
            created_at: r.created_at,
          };
        });

        setResponses(enrichedResponses);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResponses();
  }, [id, supabase]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-muted-foreground">
        Loading responses...
      </p>
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
              Job:{" "}
              <span className="font-semibold text-primary">
                {jobTitle}
              </span>
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
              Job:{" "}
              <span className="font-semibold text-primary">
                {jobTitle}
              </span>{" "}
              • {responses.length} response{responses.length !== 1 ? "s" : ""}
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
              whileHover={{
                y: -4,
                scale: 1.01,
              }}
              className="relative rounded-xl border border-border bg-muted/20 p-6 transition-all
                         hover:border-primary/40 hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_12px_40px_-12px_hsl(var(--primary)/0.4)]"
            >
              {/* Candidate Header */}
              <div className="mb-4 space-y-1">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  {response.full_name || "Unknown Candidate"}
                  <span className="text-sm text-muted-foreground">
                    (#{index + 1})
                  </span>
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

              {/* Form Answers */}
              <div className="space-y-3">
                {Object.entries(response.answers || {}).map(([key, value]) => {
                  // Skip if value is selected_resume (file URL), just show badge
                  if (key === "selected_resume" && typeof value === "string") {
                    return (
                      <div key={key}>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Resume:
                        </p>
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

                  // Skip empty values
                  if (!value) return null;

                  const displayValue =
                    typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value);

                  return (
                    <div key={key} className="text-sm">
                      <p className="font-medium text-foreground mb-1">
                        {key}:
                      </p>
                      <p className="text-muted-foreground pl-3 border-l-2 border-primary/30 py-1">
                        {displayValue}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Badge with response ID */}
              <div className="mt-4 pt-4 border-t border-border">
                <Badge variant="outline" className="text-xs">
                  Response ID: {response.id.slice(0, 8)}...
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
