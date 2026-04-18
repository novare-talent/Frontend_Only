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
import { useParams, useRouter } from "next/navigation";
import { User, Mail, Phone, Calendar, ArrowLeft, FileText } from "lucide-react";
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

export default function CandidateResponsePage() {
  const { id, profileId } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [jobTitle, setJobTitle] = useState<string>("Untitled Job");
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        setLoading(true);

        // Parallelize job title + response fetch
        const [{ data: job }, { data: responseRow, error }] = await Promise.all([
          supabase
            .from("jobs")
            .select("Job_Name, Job_Description")
            .eq("job_id", id)
            .maybeSingle(),
          supabase
            .from("responses")
            .select("id, profile_id, full_name, email, phone, answers, created_at, resume_url, job_id")
            .eq("job_id", id)
            .eq("profile_id", profileId)
            .maybeSingle(),
        ]);

        setJobTitle(job?.Job_Name || job?.Job_Description || "Untitled Job");

        if (error) {
          console.error("Error fetching response:", error);
          setResponse(null);
          return;
        }

        if (!responseRow) {
          setResponse(null);
          return;
        }

        // Fetch profile data for the candidate
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone")
          .eq("id", responseRow.profile_id)
          .maybeSingle();

        const parsedAnswers = parseAnswers(responseRow.answers);

        const enrichedResponse: FormResponse = {
          id: responseRow.id,
          profile_id: responseRow.profile_id,
          full_name: profile?.first_name || parsedAnswers["Full Name"] || "Unknown",
          email: profile?.email || parsedAnswers["Email Address"],
          phone: profile?.phone || parsedAnswers["Phone Number"],
          answers: parsedAnswers,
          created_at: responseRow.created_at,
        };

        setResponse(enrichedResponse);
      } finally {
        setLoading(false);
      }
    };

    if (id && profileId) fetchResponse();
  }, [id, profileId, supabase]);

  const handleBack = () => {
    router.push(`/client/evaluate/${id}`);
  };

  if (loading) {
    return (
      <p className="text-center mt-10 text-muted-foreground">
        Loading response...
      </p>
    );
  }

  if (!response) {
    return (
      <div className="container mx-auto px-6 py-10">
        <Card className="border-0 bg-transparent">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Form Response
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
              No form response found for this candidate.
            </p>
            <div className="flex justify-center">
              <Button onClick={handleBack} variant="outline" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Evaluations
              </Button>
            </div>
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
        <div className="mb-6">
          <Button onClick={handleBack} variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="size-4" />
            Back to Evaluations
          </Button>

          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Form Response
              </CardTitle>
              <CardDescription>
                Job:{" "}
                <span className="font-semibold text-primary">
                  {jobTitle}
                </span>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-xl border border-border bg-muted/20 p-6 transition-all"
        >
          {/* Candidate Header */}
          <div className="mb-4 space-y-1">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <User className="size-4 text-primary" />
              {response.full_name || "Unknown Candidate"}
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
                      View Resume <FileText className="size-4" />
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
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
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
      </motion.div>
    </div>
  );
}