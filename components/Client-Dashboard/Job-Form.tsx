"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCard, type JobCardProps } from "./Job-Card";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  rate: z.string().min(1, "Rate is required"),
  level: z.enum(["Entry level", "Intermediate", "Expert"]),
  description: z.string().min(20, "Please add a longer description"),
  tags: z.string().optional(), // comma-separated
  verified: z.boolean().default(true),
  location: z.string().min(2, "Location is required"),
  proposals: z.string().default("Less than 5"),
  jdFile: z.any().optional(), // File handled separately
});

type FormValues = z.infer<typeof schema>;

export function JobForm({ className }: { className?: string }) {
  const [jdFileName, setJdFileName] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<JobCardProps | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Front-End Development",
      rate: "Hourly: $5–$10",
      level: "Entry level",
      description:
        "Build the frontend for a viral recipe blog, delivering a production‑ready PWA and a mobile app interface. Include dashboards, image galleries, personalization, offline saves, and monetization features.",
      tags: "React, Next.js, Vercel, TypeScript, Supabase",
      verified: true,
      location: "United States",
      proposals: "Less than 5",
    },
    mode: "onChange",
  });

  function onSubmit(values: FormValues) {
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const card: JobCardProps = {
      title: values.title,
      meta: { rate: values.rate, level: values.level },
      description: values.description,
      tags,
      verified: values.verified,
      location: values.location,
      proposals: values.proposals,
    };
    console.log("[v0] Form submitted:", { ...values, tags, jdFileName });
    setPreview(card);
  }

  return (
    <div className={cn("grid gap-8 lg:grid-row-2", className)}>
      <Card className="rounded-2xl">
        <CardContent className="space-y-6">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <div className="flex flex-row justify-between gap-2">
              {/* Title */}
              <div className="space-y-2 min-w-lg">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="e.g., Front-End Developer for PWA"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>
              {/* Rate */}
              <div className="space-y-2 min-w-3xs">
                <Label htmlFor="rate">Stipend</Label>
                <Input
                  id="rate"
                  {...form.register("rate")}
                  placeholder="Monthly: 25000 - 40000 INR"
                />
                {form.formState.errors.rate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.rate.message}
                  </p>
                )}
              </div>

              {/* Level */}
              <div className="space-y-2 min-w-3xs">
                <Label>Experience Level</Label>
                <Select
                  value={form.watch("level")}
                  onValueChange={(v) =>
                    form.setValue("level", v as FormValues["level"], {
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Entry level">Entry level</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.level && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.level.message}
                  </p>
                )}
              </div>
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                {...form.register("description")}
                placeholder="Describe the work, scope, and expectations…"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Skills/Tags (comma‑separated)</Label>
              <Input
                id="tags"
                {...form.register("tags")}
                placeholder="React, Next.js, TypeScript"
              />
              {!!form.watch("tags") && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form
                    .watch("tags")!
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {t}
                      </Badge>
                    ))}
                </div>
              )}
            </div>

            {/* Verified + Location + Proposals */}
            <div className="grid gap-5 sm:grid-cols-3">
              {/* <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                <Label htmlFor="verified" className="mr-3">
                  Payment Verified
                </Label>
                <Switch
                  id="verified"
                  checked={form.watch("verified")}
                  onCheckedChange={(c) => form.setValue("verified", c)}
                />
              </div> */}

              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...form.register("location")}
                  placeholder="United States"
                />
              </div>
            </div>

            {/* JD Upload */}
            <div className="space-y-2">
              <Label htmlFor="jd-file">
                Job Description Upload (PDF, DOCX, TXT)
              </Label>
              <label
                htmlFor="jd-file"
                className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-dashed border-primary/40 bg-card/60 px-4 py-6 transition hover:border-primary hover:bg-primary/5"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Drag & drop or click to upload
                  </span>
                  <span className="text-xs text-muted-foreground">Max 5MB</span>
                </div>
                <Button type="button" variant="outline">
                  Choose file
                </Button>
              </label>
              <input
                id="jd-file"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setJdFileName(f ? f.name : null);
                  form.setValue("jdFile", f);
                }}
              />
              {jdFileName && (
                <p className="text-sm text-primary">Selected: {jdFileName}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  form.reset();
                  setPreview(null);
                  setJdFileName(null);
                }}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Preview
              </Button>
              <Button
                type="submit"
                className="text-primary-foreground hover:bg-primary/90"
              >
                Create Job
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-primary">Preview</h2>
        {preview ? (
          <JobCard {...preview} />
        ) : (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              Fill the form to preview your job card.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
