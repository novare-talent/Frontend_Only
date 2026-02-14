"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { bulkCreateAssignments } from "@/app/actions/assignments";
import { createCandidateMappings } from "@/app/actions/candidates";
import { fetchRankings, type Candidate } from "@/lib/ranking-api";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface SectionCardsProps {
  sessionId?: string;
  candidateIds?: string[];
}

export function SectionCards({ sessionId, candidateIds }: SectionCardsProps) {
  const router = useRouter();
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [assignmentPrompt, setAssignmentPrompt] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string>('');
  const [assignmentId, setAssignmentId] = useState<string>('');
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [showSentOverlay, setShowSentOverlay] = useState(false);
  const [submissionLinks, setSubmissionLinks] = useState<Array<{candidateId: string; name: string; email: string; link: string}>>([]);

  // Fetch job and candidate details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!sessionId || !candidateIds || candidateIds.length === 0) return;

      try {
        const supabase = createClient();

        // Get job_id from the jobs table using form_id = sessionId
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('job_id')
          .eq('form_id', sessionId)
          .single();

        if (jobError) {
          console.error('Job fetch error:', jobError);
          return;
        }

        if (!jobData) {
          console.error('Job not found for session:', sessionId);
          return;
        }

        setJobId(jobData.job_id);

        // Fetch candidates from rankings using the same method as rankings display
        const rankingsResponse = await fetchRankings(sessionId);
        
        if (rankingsResponse.candidates && rankingsResponse.candidates.length > 0) {
          // Filter to only selected candidate IDs
          const selectedCandidates = rankingsResponse.candidates.filter(c => 
            candidateIds.includes(c.cid)
          );
          
          if (selectedCandidates.length > 0) {
            setCandidates(selectedCandidates);
          } else {
            // Fallback if no matches found
            console.warn('No selected candidates found in rankings');
            setCandidates(
              candidateIds.map((id) => ({
                cid: id,
                name: `Candidate ${id.substring(0, 8)}`,
                email: 'email@example.com',
                jd_score: 0,
                total_score: 0,
              } as Candidate))
            );
          }
        } else {
          console.warn('No candidates found in rankings response');
          setCandidates(
            candidateIds.map((id) => ({
              cid: id,
              name: `Candidate ${id.substring(0, 8)}`,
              email: 'email@example.com',
              jd_score: 0,
              total_score: 0,
            } as Candidate))
          );
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        // Fallback: create basic candidate data with IDs
        if (candidateIds) {
          setCandidates(
            candidateIds.map((id) => ({
              cid: id,
              name: `Candidate ${id.substring(0, 8)}`,
              email: 'email@example.com',
              jd_score: 0,
              total_score: 0,
            } as Candidate))
          );
        }
      }
    };

    fetchDetails();
  }, [sessionId, candidateIds]);

  // Fetch assignment template from Supabase if it exists
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!jobId) return;

      try {
        const supabase = createClient();

        // Fetch assignment template (candidate_id = 00000000-0000-0000-0000-000000000000)
        const { data, error } = await supabase
          .from('assignments')
          .select('assignment_json, assignment_pdf_url, job_id')
          .eq('job_id', jobId)
          .eq('candidate_id', '00000000-0000-0000-0000-000000000000')
          .single();

        if (!error && data) {
          // Parse assignment_json if it's a string
          const assignmentData = typeof data.assignment_json === 'string'
            ? JSON.parse(data.assignment_json)
            : data.assignment_json;

          setAssignmentData(assignmentData);
          setAssignmentId(jobId);
          console.log('Assignment loaded from Supabase');
        } else {
          console.log('No assignment found for this job');
        }
      } catch (err) {
        console.error('Error fetching assignment:', err);
      }
    };

    fetchAssignment();
  }, [jobId]);

  const handleCreateAssignment = async () => {
    if (!assignmentFile && !assignmentPrompt) {
      setError('Please upload a file or enter a prompt');
      return;
    }

    if (!jobId) {
      setError('Job not found');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Call the Python API to create assignment
      const response = await fetch(`http://3.110.106.253:8000/assignment/create/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create assignment');
      }

      const data = await response.json();
      setAssignmentData(data);
      setAssignmentId(jobId);
      setSuccess('Assignment created successfully!');
      setError(null);
      
      // Auto send if candidates are selected and we have assignment
      if (candidates.length > 0) {
        setTimeout(() => handleSendAssignments(), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
      setIsCreating(false);
    }
  };

  const handleGenerateAssignment = async () => {
    if (!jobId) {
      setError('Job not found');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call the Next.js API proxy to generate assignment from job description
      const response = await fetch(`/api/assignment/create/${jobId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate assignment');
      }

      const data = await response.json();
      setAssignmentData(data);
      setAssignmentId(jobId);
      setSuccess('Assignment generated successfully from job description!');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate assignment');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendAssignments = async () => {
    if (!jobId || candidates.length === 0) {
      setError('Job or candidates not found');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Step 1: Create candidate mappings (generates UUIDs for candidates)
      const mappingResult = await createCandidateMappings({
        job_id: jobId,
        session_id: sessionId || '',
        candidates: candidates.map(c => ({
          cid: c.cid,
          name: c.name || `Candidate`,
          email: c.email || 'unknown@example.com',
        })),
      });

      if (!mappingResult.success) {
        setError(mappingResult.error || 'Failed to create candidate mappings');
        setIsSending(false);
        return;
      }

      // Step 2: Get the generated UUIDs from mappings
      const candidateUUIDs = mappingResult.mappings.map((m: any) => m.candidate_id);

      // Step 3: Create assignments with the UUID-mapped candidates
      const result = await bulkCreateAssignments({
        job_id: jobId,
        session_id: sessionId || '',
        candidate_ids: candidateUUIDs,
      });

      if (!result.success) {
        setError(result.error || 'Failed to send assignments');
        setIsSending(false);
        return;
      }

      // Step 4: Generate submission links for candidates using their UUIDs
      const links = mappingResult.mappings.map((mapping: any) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const submissionLink = `${baseUrl}/submission?job_id=${jobId}&candidate_id=${mapping.candidate_id}`;
        
        return {
          candidateId: mapping.candidate_id,
          rankingCid: mapping.ranking_cid,
          name: mapping.name || `Candidate`,
          email: mapping.email || 'unknown@example.com',
          link: submissionLink
        };
      });

      setSubmissionLinks(links);
      setShowSentOverlay(true);
      setSuccess(`Successfully sent assignments to ${candidateUUIDs.length} candidate(s)!`);
      
      // Redirect to evaluations page after 4 seconds
      setTimeout(() => {
        router.push(`/sig-hire/evaluations?assignment_id=${jobId}&session_id=${sessionId}`);
      }, 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send assignments');
      setIsSending(false);
    }
  };
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:h-fit-content *:data-[slot=card]:shadow-s lg:px-6 @xl/main:grid-cols-2 @4xl/main:grid-cols-3">
      
      {/* Error Message */}
      {error && (
        <Card className="col-span-full border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <CardTitle className="text-red-900">{error}</CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card className="col-span-full border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <CardTitle className="text-green-900">{success}</CardTitle>
          </CardHeader>
        </Card>
      )}
      
      {/* Card 1: Assignment Creation */}
<Card className="@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
">
  <CardHeader>
    <CardTitle className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl">
      Assignment
    </CardTitle>
    <CardDescription>Upload or generate your assignment below</CardDescription>
  </CardHeader>

  <div className="flex flex-col gap-4">

    {/* Document Upload Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-md font-medium text-primary">Upload Document or PDF</label>
      <input
        type="file"
        className="w-full rounded-md border border-primary/30 bg-card p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white cursor-pointer"
        onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
      />
    </div>

                <div className="p-3 text-muted-foreground font-thin text-center">OR</div>

    {/* Text Box Section */}
    <div className="flex flex-col gap-2 w-full px-6">
      <label className="text-m font-medium text-primary">Enter prompt </label>
      <textarea
        className="w-full min-h-40 rounded-md border border-primary/30 bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Type the job description here..."
        value={assignmentPrompt}
        onChange={(e) => setAssignmentPrompt(e.target.value)}
      />
    </div> 
    <div className="flex gap-2 justify-center">
        {!assignmentData ? (
          <>
            <Button
              variant="default"
              size="lg"
              className="gap-2 transition-all duration-300 cursor-pointer"
              onClick={handleGenerateAssignment}
              disabled={isGenerating || !jobId}
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Assignment'
              )}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 transition-all duration-300 cursor-pointer"
              onClick={handleCreateAssignment}
              disabled={isCreating || isSending}
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Custom'
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="mx-auto block gap-2 transition-all duration-300 cursor-pointer"
            onClick={handleSendAssignments}
            disabled={isSending || candidates.length === 0}
          >
            {isSending ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              `Send to ${candidates.length} Candidate${candidates.length !== 1 ? 's' : ''}`
            )}
          </Button>
        )}
    </div>   
 </div>
</Card>

      {/* Card 3: Selected Candidates */}
      {candidates.length > 0 && (
        <Card className="@container/card relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
">
        <CardHeader>
            <CardTitle className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl">
            Selected Candidates ({candidates.length})
            </CardTitle>
            <CardDescription>Ready to receive assignment</CardDescription>
        </CardHeader>
        <div className="flex flex-col gap-3 px-6 pb-6">
          {candidates.map((candidate) => (
            <div key={candidate.cid} className="p-3 rounded-lg bg-muted/50 border border-muted">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{candidate.email || 'No email'}</p>
                </div>
                {candidate.total_score && (
                  <div className="text-right ml-4">
                    <p className="text-xs text-primary font-semibold">
                      {(candidate.total_score).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      )}

      {/* Card 2: Assignment Preview - Full Width at Bottom */}
      <Card className="@container/card relative overflow-hidden rounded-3xl col-span-full
  bg-gradient-to-br from-purple-50 via-white to-indigo-50
  border border-purple-100
  shadow-[0_20px_40px_-20px_rgba(124,58,237,0.50)]
  transition-all duration-500
  dark:bg-gradient-to-br dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950
  dark:border-white/10
  dark:shadow-[0_0_80px_-20px_rgba(124,58,237,0.45)]
">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-primary font-semibold">
                Assignment Preview
              </CardTitle>
              <CardDescription className="text-sm mt-2">{assignmentData ? 'Generated & Ready' : 'Pending Generation'}</CardDescription>
            </div>
            {assignmentData?.assignment_pdf_url && (
              <a
                href={assignmentData.assignment_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Download PDF
              </a>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {assignmentData ? (
            <>
              {/* Assignment Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
                  <p className="text-sm font-semibold text-foreground truncate">{assignmentData.title}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Difficulty</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{assignmentData.difficulty}/10</span>
                    <div className="flex gap-0.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${i < assignmentData.difficulty ? 'bg-primary' : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Required Skills */}
              {assignmentData.required_skills && assignmentData.required_skills.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Required Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {assignmentData.required_skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary/15 text-primary text-xs font-medium rounded-full border border-primary/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              {assignmentData.problem_statement && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Problem Statement</label>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                    {assignmentData.problem_statement}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {assignmentData.requirements && assignmentData.requirements.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Requirements</label>
                  <ul className="list-disc list-inside space-y-1">
                    {assignmentData.requirements.slice(0, 3).map((req: string, idx: number) => (
                      <li key={idx} className="text-sm text-foreground">
                        {req}
                      </li>
                    ))}
                    {assignmentData.requirements.length > 3 && (
                      <li className="text-sm text-muted-foreground italic">
                        +{assignmentData.requirements.length - 3} more requirements
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Evaluation Criteria */}
              {assignmentData.evaluation_criteria && assignmentData.evaluation_criteria.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Evaluation Criteria</label>
                  <ul className="list-disc list-inside space-y-1">
                    {assignmentData.evaluation_criteria.map((criteria: string, idx: number) => (
                      <li key={idx} className="text-sm text-foreground">
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Input/Output */}
              {assignmentData.input_output && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Input / Output</label>
                  <div className="bg-muted/50 p-3 rounded-lg text-xs font-mono text-foreground overflow-auto max-h-20">
                    {assignmentData.input_output}
                  </div>
                </div>
              )}

              {/* PDF Preview */}
              {assignmentData.assignment_pdf_url && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">PDF Preview</label>
                  <div className="border border-muted rounded-lg overflow-hidden bg-white">
                    <iframe
                      src={assignmentData.assignment_pdf_url}
                      className="w-full h-96 border-0"
                      title="Assignment PDF"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Click &quot;Generate Assignment&quot; to create an assignment from your job description</p>
            </div>
          )}
        </CardContent>
        {assignmentId && (
          <CardFooter className="border-t bg-muted/30 text-xs text-muted-foreground">
            <p>Assignment ID: <span className="font-mono font-semibold text-foreground">{assignmentId}</span></p>
          </CardFooter>
        )}
      </Card>

      {/* Assignment Sent Overlay */}
      {showSentOverlay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Assignments Sent!</h2>
                  <p className="text-muted-foreground">
                    {submissionLinks.length} assignment{submissionLinks.length !== 1 ? 's' : ''} sent successfully.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share the links below with candidates to submit their solutions.
                  </p>
                </div>
              </div>

              {/* Submission Links */}
              <div className="space-y-3 mb-6">
                {submissionLinks.map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.link);
                          // Show toast or feedback
                          alert('Link copied to clipboard!');
                        }}
                        className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                    <div className="bg-white p-2 rounded text-xs font-mono text-muted-foreground break-all hover:bg-blue-50 cursor-pointer"
                         onClick={() => {
                           navigator.clipboard.writeText(item.link);
                           alert('Link copied to clipboard!');
                         }}>
                      {item.link}
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-2">
                <p className="text-sm font-semibold text-blue-900">📋 How to share:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click &quot;Copy Link&quot; for individual candidates</li>
                  <li>• Share the link via email, SMS, or messaging app</li>
                  <li>• Candidates can submit their code from the submission page</li>
                  <li>• Submissions are automatically evaluated</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Redirecting to Evaluations in a few seconds...
                </div>
                <Button
                  onClick={() => {
                    router.push(`/sig-hire/evaluations?assignment_id=${jobId}&session_id=${sessionId}`);
                  }}
                  variant="default"
                  size="sm"
                >
                  Go to Evaluations Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}