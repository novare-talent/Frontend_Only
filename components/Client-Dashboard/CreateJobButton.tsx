"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type FetchSuccess = { ok: true; jobs_remaining: number };
type FetchFailure = { ok: false; reason?: string };
type FetchResult = FetchSuccess | FetchFailure;

export default function CreateJobButtonServerChecked({ text = "Create Job" }: { text?: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Safely read browser access token from supabase client
  async function getAccessToken(): Promise<string | null> {
    try {
      const s: any = await supabase.auth.getSession?.();
      const session = s?.data?.session ?? null;
      return session?.access_token ?? null;
    } catch (err) {
      // Show toast and return null
      toast.error("Authentication Error", { description: "Unable to verify your login. Please sign in and try again." });
      return null;
    }
  }

  // Call server endpoint to get jobs_remaining (server uses service role)
  async function fetchJobsRemainingFromServer(): Promise<FetchResult> {
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error("Authentication Required", { description: "Please sign in to continue." });
        return { ok: false, reason: "no_token" };
      }

      const res = await fetch("/api/credits", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        // Try to read server body for a friendlier message (but don't rely on it)
        let bodyText = "";
        try {
          bodyText = await res.text();
        } catch {}
        toast.error("Server Error", { description: "Unable to verify credits. Try again later." });
        return { ok: false, reason: `status_${res.status}`, };
      }

      if (!contentType.includes("application/json")) {
        toast.error("Unexpected Response", { description: "Received invalid response from server." });
        return { ok: false, reason: "non_json" };
      }

      const json = await res.json();

      if (json?.error) {
        // Show server-provided message if present
        const msg = typeof json.error === "string" ? json.error : json.error?.message ?? "Unknown error";
        toast.error("Error", { description: String(msg) });
        return { ok: false, reason: "api_error" };
      }

      const jobs = Number(json?.jobs_remaining ?? 0);
      const final = Number.isFinite(jobs) ? jobs : 0;

      return { ok: true, jobs_remaining: final };
    } catch (err) {
      toast.error("Network Error", { description: "Please check your connection and try again." });
      return { ok: false, reason: "network" };
    }
  }

  async function handleCreateJob() {
    if (loading) return;
    setLoading(true);

    try {
      const result = await fetchJobsRemainingFromServer();

      if (result.ok === true) {
        const jobs = result.jobs_remaining ?? 0;

        if (jobs <= 0) {
          // Notify user then redirect to billing
          toast("No Jobs Remaining", { description: "Redirecting to billing..." });
          router.push("/client/billing");
          return;
        }

        // Has jobs -> go to create job
        router.push("/client/create-job");
        return;
      }

      // If failed, we've already shown a toast in fetchJobsRemainingFromServer
      // Do not redirect on failure.
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleCreateJob} disabled={loading}>
      {loading ? "Checking..." : text}
    </Button>
  );
}
