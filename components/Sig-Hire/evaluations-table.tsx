"use client"

import { useState, useEffect, useCallback } from 'react';
import { Loader, AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

  const selectedSubmission = selectedCandidate ? submissions.get(selectedCandidate) : null;
  const selectedCandidateData = candidates.find(c => c.candidate_id === selectedCandidate);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* LEFT: Loading skeleton */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-1">Submissions</h2>
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
        {/* RIGHT: Loading skeleton */}
        <div className="space-y-4">
          <div className="h-32 bg-muted rounded-lg animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-yellow-900">No candidates found for this job.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
      {/* LEFT: Candidates List */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-1">Submissions</h2>
          <p className="text-muted-foreground text-sm">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} total | 
            {submissions.size > 0 ? ` ${submissions.size} submitted` : ' No submissions yet'}
          </p>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {candidates.map(candidate => {
            const submission = submissions.get(candidate.candidate_id);
            const hasSubmission = !!submission?.submission_file_url;
            const isSelected = selectedCandidate === candidate.candidate_id;

            return (
              <button
                key={candidate.candidate_id}
                onClick={() => setSelectedCandidate(candidate.candidate_id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${hasSubmission ? 'bg-green-50/50' : 'bg-yellow-50/50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{candidate.name}</p>
                    {candidate.email && candidate.email !== 'unknown@example.com' && (
                      <p className="text-xs text-muted-foreground">{candidate.email}</p>
                    )}
                  </div>
                  {hasSubmission ? (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Evaluation Details */}
      <div className="space-y-4">
        {selectedCandidateData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedCandidateData.name}</CardTitle>
              {selectedCandidateData.email && selectedCandidateData.email !== 'unknown@example.com' && (
                <CardDescription>{selectedCandidateData.email}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                          <div className={`text-4xl font-bold ${
                            aiReport.score >= 70 ? 'text-green-600' : 
                            aiReport.score >= 40 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {aiReport.score}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                        </div>

                        {/* Verdict */}
                        <div className={`px-3 py-2 rounded-lg text-center font-semibold text-sm ${
                          aiReport.final_verdict === 'Hire' 
                            ? 'bg-green-100 text-green-800' 
                            : aiReport.final_verdict === 'Weak'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {aiReport.final_verdict}
                        </div>

                        {/* AI Plagiarism */}
                        {plagiarismReport.ai_plagiarism_score !== undefined && (
                          <div className={`p-3 rounded-lg border ${
                            plagiarismReport.is_ai_generated
                              ? 'border-red-200 bg-red-50'
                              : 'border-green-200 bg-green-50'
                          }`}>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">AI Plagiarism Detection</p>
                            <p className={`text-sm font-bold ${
                              plagiarismReport.is_ai_generated ? 'text-red-700' : 'text-green-700'
                            }`}>
                              {plagiarismReport.ai_plagiarism_score}% {plagiarismReport.is_ai_generated ? '(AI Generated)' : '(Original)'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">{plagiarismReport.explanation}</p>
                          </div>
                        )}

                        {/* Strengths */}
                        {aiReport.strengths && aiReport.strengths.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-700 mb-2">Strengths</p>
                            <ul className="space-y-1">
                              {aiReport.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-green-700">+ {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Weaknesses */}
                        {aiReport.weaknesses && aiReport.weaknesses.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-yellow-700 mb-2">Weaknesses</p>
                            <ul className="space-y-1">
                              {aiReport.weaknesses.map((w, i) => (
                                <li key={i} className="text-xs text-yellow-700">- {w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Issues */}
                        {aiReport.issues && aiReport.issues.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-700 mb-2">Issues</p>
                            <ul className="space-y-1">
                              {aiReport.issues.map((issue, i) => (
                                <li key={i} className="text-xs text-red-700">! {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Evaluation Report */}
                        {selectedSubmission.evaluation_report && (
                          <Button
                            onClick={() => {
                              console.log('View Evaluation Report clicked');
                              setSelectedReport(selectedSubmission.evaluation_report);
                              setReportModalTitle('Evaluation Report');
                              setShowReportModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Evaluation Report
                          </Button>
                        )}

                        {/* Assignment Details */}
                        {selectedSubmission.assignment_json && (
                          <Button
                            onClick={() => {
                              console.log('View Assignment clicked');
                              setSelectedReport(selectedSubmission.assignment_json);
                              setReportModalTitle('Assignment Details');
                              setShowReportModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Assignment
                          </Button>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  // Evaluate button
                  <Button
                    onClick={() => handleEvaluate(selectedCandidate || '')}
                    disabled={evaluatingId === selectedCandidate}
                    className="w-full"
                    size="sm"
                  >
                    {evaluatingId === selectedCandidate ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      'Evaluate Submission'
                    )}
                  </Button>
                )
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <p className="text-sm">No submission received yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Waiting for candidate to submit code.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-purple-700">{reportModalTitle}</h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedReport(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Content */}
            <div className="flex-1 overflow-auto p-6 bg-purple-50">
              {reportModalTitle === 'Evaluation Report' ? (
                // Evaluation Report Display
                <div className="space-y-6">
                  {/* AI Report */}
                  {selectedReport.ai_report && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg text-primary">AI Evaluation</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg border-2 ${
                          selectedReport.ai_report.score >= 70 ? 'bg-green-100 border-green-500' :
                          selectedReport.ai_report.score >= 40 ? 'bg-yellow-100 border-yellow-500' :
                          'bg-red-100 border-red-500'
                        }`}>
                          <p className="text-sm text-gray-700">Score</p>
                          <p className={`text-3xl font-bold ${
                            selectedReport.ai_report.score >= 70 ? 'text-green-800' :
                            selectedReport.ai_report.score >= 40 ? 'text-yellow-800' :
                            'text-red-800'
                          }`}>{selectedReport.ai_report.score}</p>
                        </div>
                        <div className={`p-4 rounded-lg border-2 ${
                          selectedReport.ai_report.final_verdict === 'Hire' ? 'bg-green-100 border-green-500' :
                          selectedReport.ai_report.final_verdict === 'Weak' ? 'bg-yellow-100 border-yellow-500' :
                          'bg-red-100 border-red-500'
                        }`}>
                          <p className="text-sm text-gray-700">Verdict</p>
                          <p className={`text-2xl font-bold ${
                            selectedReport.ai_report.final_verdict === 'Hire' ? 'text-green-800' :
                            selectedReport.ai_report.final_verdict === 'Weak' ? 'text-yellow-800' :
                            'text-red-800'
                          }`}>{selectedReport.ai_report.final_verdict}</p>
                        </div>
                      </div>

                      {selectedReport.ai_report.strengths && selectedReport.ai_report.strengths.length > 0 && (
                        <div className="bg-green-100 p-4 rounded-lg border border-green-500">
                          <p className="font-semibold text-green-900 mb-2">Strengths</p>
                          <ul className="space-y-1 pl-4">
                            {selectedReport.ai_report.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-green-900">✓ {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedReport.ai_report.weaknesses && selectedReport.ai_report.weaknesses.length > 0 && (
                        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-500">
                          <p className="font-semibold text-yellow-900 mb-2">Weaknesses</p>
                          <ul className="space-y-1 pl-4">
                            {selectedReport.ai_report.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="text-sm text-yellow-900">⚠ {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedReport.ai_report.issues && selectedReport.ai_report.issues.length > 0 && (
                        <div className="bg-red-100 p-4 rounded-lg border border-red-500">
                          <p className="font-semibold text-red-900 mb-2">Issues</p>
                          <ul className="space-y-1 pl-4">
                            {selectedReport.ai_report.issues.map((issue: string, i: number) => (
                              <li key={i} className="text-sm text-red-900">✕ {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Plagiarism Report */}
                  {selectedReport.ai_plagiarism_report && (
                    <div className={`p-4 rounded-lg border-2 ${
                      selectedReport.ai_plagiarism_report.is_ai_generated
                        ? 'border-red-500 bg-red-100'
                        : 'border-green-500 bg-green-100'
                    }`}>
                      <h3 className={`font-semibold mb-2 ${
                        selectedReport.ai_plagiarism_report.is_ai_generated ? 'text-red-900' : 'text-green-900'
                      }`}>AI Plagiarism Detection</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-800"><span className="font-semibold">Score:</span> {selectedReport.ai_plagiarism_report.ai_plagiarism_score}%</p>
                        <p className="text-gray-800"><span className="font-semibold">Status:</span> {selectedReport.ai_plagiarism_report.is_ai_generated ? 'AI Generated' : 'Original'}</p>
                        <p className="text-gray-800"><span className="font-semibold">Confidence:</span> {selectedReport.ai_plagiarism_report.confidence}</p>
                        {selectedReport.ai_plagiarism_report.red_flags && selectedReport.ai_plagiarism_report.red_flags.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-800">Red Flags:</p>
                            <ul className="pl-4 space-y-1">
                              {selectedReport.ai_plagiarism_report.red_flags.map((flag: string, i: number) => (
                                <li key={i} className="text-gray-800">• {flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <p className="italic mt-2 text-gray-800">{selectedReport.ai_plagiarism_report.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Syntax Report */}
                  {selectedReport.syntax_report && (
                    <div className={`p-4 rounded-lg border-2 ${
                      selectedReport.syntax_report.syntax_ok
                        ? 'border-green-500 bg-green-100'
                        : 'border-red-500 bg-red-100'
                    }`}>
                      <h3 className={`font-semibold mb-2 ${
                        selectedReport.syntax_report.syntax_ok ? 'text-green-900' : 'text-red-900'
                      }`}>Syntax Report</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-800"><span className="font-semibold">Status:</span> {selectedReport.syntax_report.syntax_ok ? '✓ Valid' : '✕ Errors Found'}</p>
                        {selectedReport.syntax_report.languages_detected && selectedReport.syntax_report.languages_detected.length > 0 && (
                          <p className="text-gray-800"><span className="font-semibold">Languages:</span> {selectedReport.syntax_report.languages_detected.join(', ')}</p>
                        )}
                        {selectedReport.syntax_report.errors && selectedReport.syntax_report.errors.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-800">Errors:</p>
                            <ul className="pl-4 space-y-1">
                              {selectedReport.syntax_report.errors.map((error: string, i: number) => (
                                <li key={i} className="text-xs text-gray-800">• {error}</li>
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
                  <h3 className="font-semibold text-lg text-primary">Assignment Details</h3>
                  <pre className="bg-gray-900 p-4 rounded-lg border border-gray-700 overflow-auto text-xs text-green-400" style={{ maxHeight: '500px' }}>
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
