"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const supabase = createClient();

interface Job {
  id: number;
  Job_Name: string;
  Job_Description: string;
  JD_pdf: string | null;
  form_link: string | null;
}

export default function JobTable() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("id, Job_Name, Job_Description, JD_pdf, form_link")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error.message);
    } else {
      setJobs(data || []);
    }
  };

  const handleApply = async (jobId: number) => {
    // TODO: integrate apply logic (save into Applied_Candidates)
    console.log("Applying to job:", jobId);
    alert(`You have applied to job #${jobId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Available Jobs</h1>

      <div className="border rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/5">Job Name</TableHead>
              <TableHead className="w-2/5">Description</TableHead>
              <TableHead className="w-1/5">Job PDF</TableHead>
              <TableHead className="w-1/5">Form Link</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.Job_Name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {job.Job_Description}
                  </TableCell>
                  <TableCell>
                    {job.JD_pdf ? (
                      <a
                        href={job.JD_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-sm"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.form_link ? (
                      <a
                        href={job.form_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-sm"
                      >
                        Open Form
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleApply(job.id)}
                    >
                      Apply
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No jobs available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
