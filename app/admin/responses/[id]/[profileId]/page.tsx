"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Phone, Calendar, FileText } from "lucide-react";
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
  resume_url?: string;
};

function formatIST(dateString: string | null | undefined) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
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

export default function AdminCandidateResponsePage() {
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

        // Fetch job, response, and profile in parallel
        const [
          { data: job },
          { data: responseData, error },
          { data: profile },
        ] = await Promise.all([
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
          supabase
            .from("profiles")
            .select("full_name, email, phone, resume_url")
            .eq("id", profileId)
            .maybeSingle(),
        ]);

        setJobTitle(job?.Job_Name || job?.Job_Description || "Untitled Job");

        if (error) {
          console.error("Error fetching response:", error);
          setResponse(null);
          return;
        }

        if (!responseData) {
          setResponse(null);
          return;
        }

        setResponse({
          ...responseData,
          full_name: profile?.full_name || responseData.full_name,
          email: profile?.email || responseData.email,
          phone: profile?.phone || responseData.phone,
          resume_url: profile?.resume_url || responseData.resume_url,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };

    if (id && profileId) {
      fetchResponse();
    }
  }, [id, profileId, supabase]);

  const handleBack = () => {
    router.push(`/admin/evaluate/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Evaluations
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No response found for this candidate.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const answers = parseAnswers(response.answers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="size-4 mr-2" />
              Back to Evaluations
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{jobTitle}</h1>
              <p className="text-sm text-muted-foreground">Candidate Response</p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Candidate Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-sm">{response.full_name || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{response.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm">{response.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Submitted:</span>
                    <span className="text-sm">{formatIST(response.created_at)}</span>
                  </div>
                </div>
                {response.resume_url && (
                  <Separator />
                )}
                {response.resume_url && (
                  <div className="flex items-center gap-2">
                    <a
                      href={response.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary
                      transition hover:gap-2 hover:underline"
                    >
                      View Resume <FileText className="size-4" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Responses */}
            <Card>
              <CardHeader>
                <CardTitle>Form Responses</CardTitle>
                <CardDescription>
                  Answers provided by the candidate during application
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(answers).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No form responses available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(answers).map(([question, answer], index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <h4 className="font-medium text-slate-900">{question}</h4>
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {typeof answer === "string" ? answer : JSON.stringify(answer, null, 2)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}