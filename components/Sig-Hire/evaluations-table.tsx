"use client"

import { useState, useEffect, useCallback } from 'react';
import { Loader, AlertCircle, CheckCircle, AlertTriangle, X, FileText, Users, Award } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Progress } from '@/components/ui/progress';
import ChromeButton from '@/components/Sig-Hire/ChromeButton';

interface EvaluationTableProps {
  jobId?: string;
  sessionId?: string;
}

interface Candidate {
  candidate_id: string;
  ranking_cid: string;
  name: string;
  email: string;
}

interface SubmissionData {
  candidate_id: string;
  submission_file_url: string | null;
  evaluation_report: any;
  evaluation_pdf_url: string | null;
  assignment_json: any;
  assignment_pdf_url: string | null;
}

interface AIReport {
  score: number;
  strengths: string[];
  weaknesses: string[];
  issues: string[];
  final_verdict: string;
}

interface AIPlagiarismReport {
  ai_plagiarism_score: number;
  is_ai_generated: boolean;
  red_flags: string[];
  confidence: string;
  explanation: string;
}

// Reusable GlassCard component
function GlassCard({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-linear-to-t from-lavender/10 via-transparent to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

function CardHead({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative z-10 p-6 pb-4 flex items-center gap-3 border-b border-white/5">
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
        style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold text-white leading-tight">{title}</h3>
        <p className="text-xs text-white/40 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export function AssignmentEvaluationScreen({ jobId }: EvaluationTableProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, SubmissionData>>(new Map());
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportModalTitle, setReportModalTitle] = useState('Report');
  const [progress, setProgress] = useState(0);
  const [evaluatingAllCandidates, setEvaluatingAllCandidates] = useState(false);
  const [allEvaluated, setAllEvaluated] = useState(false);
  const [evaluatedCount, setEvaluatedCount] = useState(0);

  const loadCandidatesAndSubmissions = useCallback(async () => {
    if (!jobId) return;

    try {
      setIsLoading(true);
      const supabase = createClient();

      // Fetch candidates from candidate_mappings
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidate_mappings')
        .select('*')
        .eq('job_id', jobId);

      if (candidatesError) throw candidatesError;
      setCandidates(candidatesData || []);

      // Fetch submissions for all candidates
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('assignments')
        .select('candidate_id, submission_file_url, evaluation_report, evaluation_pdf_url, assignment_pdf_url, assignment_json')
        .eq('job_id', jobId)
        .neq('candidate_id', '00000000-0000-0000-0000-000000000000');

      if (submissionsError) throw submissionsError;

      const submissionMap = new Map<string, SubmissionData>();
      submissionsData?.forEach(sub => {
        submissionMap.set(sub.candidate_id, {
          ...sub,
          evaluation_report: typeof sub.evaluation_report === 'string' 
            ? JSON.parse(sub.evaluation_report) 
            : sub.evaluation_report,
          assignment_pdf_url: sub.assignment_pdf_url || null,
          evaluation_pdf_url: sub.evaluation_pdf_url || null
        });
        console.log(`Candidate ${sub.candidate_id}:`, {
          assignment_pdf_url: sub.assignment_pdf_url,
          evaluation_pdf_url: sub.evaluation_pdf_url
        });
      });

      setSubmissions(submissionMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadCandidatesAndSubmissions();
  }, [loadCandidatesAndSubmissions]);

  useEffect(() => {
    if (candidates.length > 0 && !selectedCandidate) {
      setSelectedCandidate(candidates[0].candidate_id);
    }
  }, [candidates, selectedCandidate]);

  useEffect(() => {
    // Check if all candidates have been evaluated
    if (candidates.length > 0 && submissions.size > 0) {
      const evaluatedCandidates = candidates.filter(
        candidate => submissions.get(candidate.candidate_id)?.evaluation_report
      );
      setEvaluatedCount(evaluatedCandidates.length);
      setAllEvaluated(evaluatedCandidates.length === candidates.length);
    }
  }, [candidates, submissions]);

  const handleEvaluate = async (candidateId: string) => {
    if (!jobId) return;

    try {
      setEvaluatingId(candidateId);
      const supabase = createClient();

      // Get access token for consuming evaluation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Unable to authenticate. Please log in again.');
      }

      // Consume one evaluation
      const consumeResponse = await fetch('/api/consume-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!consumeResponse.ok) {
        const consumeError = await consumeResponse.json();
        throw new Error(consumeError.error || 'Failed to consume evaluation');
      }

      // Proceed with evaluation
      const response = await fetch(`/api/evaluate/${jobId}/${candidateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Evaluation failed');
      }

      // Refresh submissions data
      await loadCandidatesAndSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleEvaluateAll = async () => {
    if (!jobId) return;

    try {
      setEvaluatingAllCandidates(true);
      setError(null);

      const supabase = createClient();

      // Get access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.access_token) {
        throw new Error('Unable to authenticate. Please log in again.');
      }

      // Start progress animation
      let progressValue = 10;
      setProgress(progressValue);

      const progressInterval = setInterval(() => {
        progressValue = Math.min(progressValue + Math.random() * 15, 95);
        setProgress(progressValue);
      }, 500);

      // Consume one evaluation credit
      const consumeResponse = await fetch('/api/consume-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!consumeResponse.ok) {
        const consumeError = await consumeResponse.json();
        throw new Error(consumeError.error || 'Failed to consume evaluation credit');
      }

      // Fetch the job's form_id
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("form_id")
        .eq("job_id", jobId)
        .single();

      if (jobError || !job?.form_id) {
        throw new Error('Form ID not found for this job.');
      }

      // Call the evaluate-proxy endpoint (same as client)
      const formId = job.form_id;
      const url = `/api/evaluate-proxy/evaluate/${jobId}/${formId}`;
      const res = await fetch(url, { method: "POST" });
      const body = await res.text();

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        throw new Error(body || 'Evaluation failed');
      }

      // Refresh submissions data
      await loadCandidatesAndSubmissions();
      setAllEvaluated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
      setProgress(0);
    } finally {
      setEvaluatingAllCandidates(false);
    }
  };

  const selectedSubmission = selectedCandidate ? submissions.get(selectedCandidate) : null;
  const selectedCandidateData = candidates.find(c => c.candidate_id === selectedCandidate);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <GlassCard>
          <div className="relative z-10 p-6 space-y-4">
            <div className="h-8 bg-white/5 rounded animate-pulse" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="relative z-10 p-6 space-y-4">
            <div className="h-32 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
          </div>
        </GlassCard>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <GlassCard>
        <div className="relative z-10 p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
          <p className="text-white/70">No candidates found for this job.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Evaluate All Button */}
      <GlassCard>
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <Award className="w-5 h-5" style={{ color: "var(--color-lavender)" }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Job Evaluations</h2>
              <p className="text-xs text-white/40 mt-0.5">
                {evaluatedCount}/{candidates.length} evaluated
              </p>
            </div>
            {allEvaluated && (
              <span className="ml-3 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(16,185,129,0.15)", color: "rgb(16,185,129)", border: "1px solid rgba(16,185,129,0.3)" }}>
                ✓ ALL EVALUATED
              </span>
            )}
          </div>
          <ChromeButton
            onClick={handleEvaluateAll}
            disabled={evaluatingAllCandidates}
            className="flex items-center gap-2"
          >
            {evaluatingAllCandidates ? (
              <><Loader className="w-4 h-4 animate-spin" />Evaluating...</>
            ) : (
              allEvaluated ? "Re-Evaluate All" : "Evaluate All Candidates"
            )}
          </ChromeButton>
        </div>

        {/* Progress bar */}
        {evaluatingAllCandidates && (
          <div className="relative z-10 px-6 pb-6">
            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
              <span>Evaluating all candidates…</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </GlassCard>

      {/* Error Banner */}
      {error && (
        <GlassCard>
          <div className="relative z-10 p-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Error</p>
              <p className="text-sm text-white/60">{error}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* LEFT: Candidates List */}
        <GlassCard className="flex flex-col">
          <CardHead
            icon={<Users className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />}
            title="Submissions"
            description={`${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} | ${submissions.size} submitted | ${evaluatedCount} evaluated`}
          />

          <div className="relative z-10 p-6 space-y-2 flex-1 overflow-y-auto" style={{ maxHeight: "600px" }}>
            {candidates.map(candidate => {
              const submission = submissions.get(candidate.candidate_id);
              const hasSubmission = !!submission?.submission_file_url;
              const hasEvaluation = !!submission?.evaluation_report;
              const isSelected = selectedCandidate === candidate.candidate_id;

              return (
                <button
                  key={candidate.candidate_id}
                  onClick={() => setSelectedCandidate(candidate.candidate_id)}
                  className={`w-full text-left p-4 rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 border-2'
                      : 'bg-white/5 border-2 border-transparent hover:border-white/10'
                  }`}
                  style={{
                    borderColor: isSelected ? "var(--color-lavender)" : undefined
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{candidate.name}</p>
                      {candidate.email && candidate.email !== 'unknown@example.com' && (
                        <p className="text-xs text-white/40 mt-0.5">{candidate.email}</p>
                      )}
                      {hasEvaluation && (
                        <p className="text-xs font-medium mt-1" style={{ color: "rgb(16,185,129)" }}>✓ Evaluated</p>
                      )}
                    </div>
                    {hasEvaluation ? (
                      <CheckCircle className="w-5 h-5 shrink-0" style={{ color: "rgb(16,185,129)" }} />
                    ) : hasSubmission ? (
                      <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: "var(--color-lavender)" }} />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* RIGHT: Evaluation Details */}
        <div className="space-y-4">
          {selectedCandidateData && (
            <GlassCard className="flex flex-col">
              <CardHead
                icon={<FileText className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />}
                title={selectedCandidateData.name}
                description={selectedCandidateData.email && selectedCandidateData.email !== 'unknown@example.com' ? selectedCandidateData.email : 'Evaluation Details'}
              />
              <div className="relative z-10 p-6 space-y-4">
                {selectedSubmission?.submission_file_url ? (
                  selectedSubmission?.evaluation_report ? (
                  // Display evaluation results
                  (() => {
                    const report = selectedSubmission.evaluation_report;
                    const aiReport: AIReport = report.ai_report || {};
                    const plagiarismReport: AIPlagiarismReport = report.ai_plagiarism_report || {};

                    return (
                      <div className="space-y-4">
                        {/* Score */}
                        <div className="text-center p-6 rounded-lg" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)" }}>
                          <div className={`text-5xl font-bold ${
                            aiReport.score >= 70 ? 'text-green-400' : 
                            aiReport.score >= 40 ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {aiReport.score}
                          </div>
                          <p className="text-sm text-white/40 mt-2">Overall Score</p>
                        </div>

                        {/* Verdict */}
                        <div className={`px-4 py-3 rounded-lg text-center font-semibold text-sm ${
                          aiReport.final_verdict === 'Hire' 
                            ? 'bg-green-500/15 text-green-400 border border-green-500/30' 
                            : aiReport.final_verdict === 'Weak'
                            ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                            : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}>
                          {aiReport.final_verdict}
                        </div>

                        {/* AI Plagiarism */}
                        {plagiarismReport.ai_plagiarism_score !== undefined && (
                          <div className={`p-4 rounded-lg border ${
                            plagiarismReport.is_ai_generated
                              ? 'border-red-500/30 bg-red-500/10'
                              : 'border-green-500/30 bg-green-500/10'
                          }`}>
                            <p className="text-xs font-semibold text-white/40 mb-2">AI Plagiarism Detection</p>
                            <p className={`text-sm font-bold ${
                              plagiarismReport.is_ai_generated ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {plagiarismReport.ai_plagiarism_score}% {plagiarismReport.is_ai_generated ? '(AI Generated)' : '(Original)'}
                            </p>
                            <p className="text-xs text-white/50 mt-2">{plagiarismReport.explanation}</p>
                          </div>
                        )}

                        {/* Strengths */}
                        {aiReport.strengths && aiReport.strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-400 mb-2">Strengths</p>
                            <ul className="space-y-1">
                              {aiReport.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-green-400/80">+ {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Weaknesses */}
                        {aiReport.weaknesses && aiReport.weaknesses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-yellow-400 mb-2">Weaknesses</p>
                            <ul className="space-y-1">
                              {aiReport.weaknesses.map((w, i) => (
                                <li key={i} className="text-xs text-yellow-400/80">- {w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Issues */}
                        {aiReport.issues && aiReport.issues.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-400 mb-2">Issues</p>
                            <ul className="space-y-1">
                              {aiReport.issues.map((issue, i) => (
                                <li key={i} className="text-xs text-red-400/80">! {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="space-y-2">
                          {selectedSubmission.evaluation_report && (
                            <button
                              onClick={() => {
                                setSelectedReport(selectedSubmission.evaluation_report);
                                setReportModalTitle('Evaluation Report');
                                setShowReportModal(true);
                              }}
                              className="w-full px-4 py-2.5 rounded-md text-sm font-medium text-white/70 border border-white/10 transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                              style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                              View Evaluation Report
                            </button>
                          )}
                          {selectedSubmission.assignment_json && (
                            <button
                              onClick={() => {
                                setSelectedReport(selectedSubmission.assignment_json);
                                setReportModalTitle('Assignment Details');
                                setShowReportModal(true);
                              }}
                              className="w-full px-4 py-2.5 rounded-md text-sm font-medium text-white/70 border border-white/10 transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                              style={{ background: "rgba(255,255,255,0.05)" }}
                            >
                              View Assignment
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // Evaluate button
                  <ChromeButton
                    onClick={() => handleEvaluate(selectedCandidate || '')}
                    disabled={evaluatingId === selectedCandidate}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {evaluatingId === selectedCandidate ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : selectedSubmission?.evaluation_report ? (
                      "Re-Evaluate"
                    ) : (
                      "Evaluate Submission"
                    )}
                  </ChromeButton>
                )
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-yellow-400" />
                  <p className="text-sm text-white/60">No submission received yet.</p>
                  <p className="text-xs text-white/40 mt-1">Waiting for candidate to submit code.</p>
                </div>
              )}
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative overflow-hidden rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="absolute inset-0 bg-linear-to-t from-lavender/10 via-transparent to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">{reportModalTitle}</h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReport(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Report Content */}
            <div className="relative z-10 flex-1 overflow-auto p-6">
              {reportModalTitle === 'Evaluation Report' ? (
                // Evaluation Report Display
                <div className="space-y-6">
                  {/* AI Report */}
                  {selectedReport.ai_report && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-white">AI Evaluation</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border ${
                          selectedReport.ai_report.score >= 70 ? 'bg-green-500/15 border-green-500/30' :
                          selectedReport.ai_report.score >= 40 ? 'bg-yellow-500/15 border-yellow-500/30' :
                          'bg-red-500/15 border-red-500/30'
                        }`}>
                          <p className="text-sm text-white/60">Score</p>
                          <p className={`text-3xl font-bold ${
                            selectedReport.ai_report.score >= 70 ? 'text-green-400' :
                            selectedReport.ai_report.score >= 40 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>{selectedReport.ai_report.score}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${
                          selectedReport.ai_report.final_verdict === 'Hire' ? 'bg-green-500/15 border-green-500/30' :
                          selectedReport.ai_report.final_verdict === 'Weak' ? 'bg-yellow-500/15 border-yellow-500/30' :
                          'bg-red-500/15 border-red-500/30'
                        }`}>
                          <p className="text-sm text-white/60">Verdict</p>
                          <p className={`text-2xl font-bold ${
                            selectedReport.ai_report.final_verdict === 'Hire' ? 'text-green-400' :
                            selectedReport.ai_report.final_verdict === 'Weak' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>{selectedReport.ai_report.final_verdict}</p>
                        </div>
                      </div>

                      {selectedReport.ai_report.strengths && selectedReport.ai_report.strengths.length > 0 && (
                        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
                          <p className="font-semibold text-green-400 mb-2">Strengths</p>
                          <ul className="space-y-1 pl-4">
                            {selectedReport.ai_report.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-green-400/80">✓ {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedReport.ai_report.weaknesses && selectedReport.ai_report.weaknesses.length > 0 && (
                        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
                          <p className="font-semibold text-yellow-400 mb-2">Weaknesses</p>
                          <ul className="space-y-1 pl-4">
                            {selectedReport.ai_report.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="text-sm text-yellow-400/80">⚠ {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedReport.ai_report.issues && selectedReport.ai_report.issues.length > 0 && (
                        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                          <p className="font-semibold text-red-400 mb-2">Issues</p>
                          <ul className="space-y-1 pl-4">
                            {selectedReport.ai_report.issues.map((issue: string, i: number) => (
                              <li key={i} className="text-sm text-red-400/80">✕ {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Plagiarism Report */}
                  {selectedReport.ai_plagiarism_report && (
                    <div className={`p-4 rounded-lg border ${
                      selectedReport.ai_plagiarism_report.is_ai_generated
                        ? 'border-red-500/30 bg-red-500/10'
                        : 'border-green-500/30 bg-green-500/10'
                    }`}>
                      <h3 className={`font-semibold mb-2 ${
                        selectedReport.ai_plagiarism_report.is_ai_generated ? 'text-red-400' : 'text-green-400'
                      }`}>AI Plagiarism Detection</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-white/70"><span className="font-semibold">Score:</span> {selectedReport.ai_plagiarism_report.ai_plagiarism_score}%</p>
                        <p className="text-white/70"><span className="font-semibold">Status:</span> {selectedReport.ai_plagiarism_report.is_ai_generated ? 'AI Generated' : 'Original'}</p>
                        <p className="text-white/70"><span className="font-semibold">Confidence:</span> {selectedReport.ai_plagiarism_report.confidence}</p>
                        {selectedReport.ai_plagiarism_report.red_flags && selectedReport.ai_plagiarism_report.red_flags.length > 0 && (
                          <div>
                            <p className="font-semibold text-white/70">Red Flags:</p>
                            <ul className="pl-4 space-y-1">
                              {selectedReport.ai_plagiarism_report.red_flags.map((flag: string, i: number) => (
                                <li key={i} className="text-white/60">• {flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="italic mt-2 text-white/60">{selectedReport.ai_plagiarism_report.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Syntax Report */}
                  {selectedReport.syntax_report && (
                    <div className={`p-4 rounded-lg border ${
                      selectedReport.syntax_report.syntax_ok
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-red-500/30 bg-red-500/10'
                    }`}>
                      <h3 className={`font-semibold mb-2 ${
                        selectedReport.syntax_report.syntax_ok ? 'text-green-400' : 'text-red-400'
                      }`}>Syntax Report</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-white/70"><span className="font-semibold">Status:</span> {selectedReport.syntax_report.syntax_ok ? '✓ Valid' : '✕ Errors Found'}</p>
                        {selectedReport.syntax_report.languages_detected && selectedReport.syntax_report.languages_detected.length > 0 && (
                          <p className="text-white/70"><span className="font-semibold">Languages:</span> {selectedReport.syntax_report.languages_detected.join(', ')}</p>
                        )}
                        {selectedReport.syntax_report.errors && selectedReport.syntax_report.errors.length > 0 && (
                          <div>
                            <p className="font-semibold text-white/70">Errors:</p>
                            <ul className="pl-4 space-y-1">
                              {selectedReport.syntax_report.errors.map((error: string, i: number) => (
                                <li key={i} className="text-xs text-white/60">• {error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Assignment Details Display
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-white">Assignment Details</h3>
                  <pre className="bg-black/40 p-4 rounded-lg border border-white/10 overflow-auto text-xs text-green-400" style={{ maxHeight: '500px' }}>
                    {JSON.stringify(selectedReport, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
