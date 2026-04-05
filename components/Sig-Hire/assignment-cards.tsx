"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { bulkCreateAssignments } from "@/app/actions/assignments";
import { createCandidateMappings } from "@/app/actions/candidates";
import { fetchRankings, type Candidate } from "@/lib/ranking-api";
import { AlertCircle, CheckCircle, Loader, FileText, Users, Upload, ClipboardList, History, ExternalLink, X } from "lucide-react";
import { useDriverGuide } from "@/hooks/useDriverGuide";
import { assignmentsGuide } from "@/lib/driver-config";
import { PageHeader } from "@/components/Sig-Hire/PageHeader";
import ChromeButton from "@/components/Sig-Hire/ChromeButton";
import { showSuccess } from "@/lib/swal";

interface SectionCardsProps {
  sessionId?: string;
  candidateIds?: string[];
}

interface PreviousAssignment {
  job_id: string;
  candidate_id: string;
  assignment_json: any;
  assignment_pdf_url: string;
  submission_file_url?: string;
  evaluation_report?: string;
  created_at?: string;
  candidate_name?: string;
  candidate_email?: string;
}

// ─── Reusable dark glass card shell ──────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export function SectionCards({ sessionId, candidateIds }: SectionCardsProps) {
  const router = useRouter();
  const supabase = createClient();
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSentOverlay, setShowSentOverlay] = useState(false);
  const [submissionLinks, setSubmissionLinks] = useState<Array<{candidateId: string; name: string; email: string; link: string}>>([]);
  const [previousAssignments, setPreviousAssignments] = useState<PreviousAssignment[]>([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const { startTour } = useDriverGuide("assignments", assignmentsGuide, false);

  useEffect(() => {
    const fetchJobId = async () => {
      if (!sessionId) return;
      try {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs').select('job_id').eq('form_id', sessionId).single();
        if (jobError || !jobData) { console.error('Job fetch error:', jobError); return; }
        setJobId(jobData.job_id);
      } catch (err) { console.error('Error fetching job ID:', err); }
    };
    fetchJobId();
  }, [sessionId]);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!sessionId || !candidateIds || candidateIds.length === 0) return;
      try {
        const rankingsResponse = await fetchRankings(sessionId);
        if (rankingsResponse.candidates?.length > 0) {
          const selected = rankingsResponse.candidates.filter(c => candidateIds.includes(c.cid));
          setCandidates(selected.length > 0 ? selected : candidateIds.map(id => ({ cid: id, name: `Candidate ${id.substring(0, 8)}`, email: 'email@example.com', jd_score: 0, total_score: 0 } as Candidate)));
        } else {
          setCandidates(candidateIds.map(id => ({ cid: id, name: `Candidate ${id.substring(0, 8)}`, email: 'email@example.com', jd_score: 0, total_score: 0 } as Candidate)));
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        if (candidateIds) setCandidates(candidateIds.map(id => ({ cid: id, name: `Candidate ${id.substring(0, 8)}`, email: 'email@example.com', jd_score: 0, total_score: 0 } as Candidate)));
      }
    };
    fetchCandidates();
  }, [sessionId, candidateIds]);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!jobId) return;
      try {
        const { data, error } = await supabase.from('assignments').select('assignment_json, assignment_pdf_url, job_id')
          .eq('job_id', jobId).eq('candidate_id', '00000000-0000-0000-0000-000000000000').single();
        if (!error && data) {
          setAssignmentData(typeof data.assignment_json === 'string' ? JSON.parse(data.assignment_json) : data.assignment_json);
          setAssignmentId(jobId);
        }
      } catch (err) { console.error('Error fetching assignment:', err); }
    };
    fetchAssignment();
  }, [jobId]);

  useEffect(() => {
    const fetchPreviousAssignments = async () => {
      if (!jobId) return;
      setIsLoadingPrevious(true);
      try {
        const { data, error } = await supabase.from('assignments').select('*')
          .eq('job_id', jobId).neq('candidate_id', '00000000-0000-0000-0000-000000000000').order('created_at', { ascending: false });
        if (error) { console.error('Error fetching previous assignments:', error); setPreviousAssignments([]); return; }
        setPreviousAssignments(data || []);
      } catch (err) { console.error('Error loading previous assignments:', err); setPreviousAssignments([]); }
      finally { setIsLoadingPrevious(false); }
    };
    fetchPreviousAssignments();
  }, [jobId]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setAssignmentFile(file);
  };

  const handleCreateAssignment = async () => {
    if (!assignmentFile && !assignmentPrompt) { setError('Please upload a file or enter a prompt'); return; }
    if (!jobId) { setError('Job not found'); return; }
    setIsCreating(true); setError(null);
    try {
      const response = await fetch(`http://3.111.81.83:8000/assignment/create/${jobId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) { const d = await response.json(); throw new Error(d.detail || 'Failed to create assignment'); }
      const data = await response.json();
      setAssignmentData(data); setAssignmentId(jobId); setSuccess('Assignment created successfully!'); setError(null);
      if (candidates.length > 0) setTimeout(() => handleSendAssignments(), 1500);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to create assignment'); setIsCreating(false); }
  };

  const handleGenerateAssignment = async () => {
    if (!jobId) { setError('Job not found'); return; }
    setIsGenerating(true); setError(null);
    try {
      const response = await fetch(`/api/assignment/create/${jobId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Failed to generate assignment'); }
      const data = await response.json();
      setAssignmentData(data); setAssignmentId(jobId); setSuccess('Assignment generated from job description!'); setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to generate assignment'); }
    finally { setIsGenerating(false); }
  };

  const handleSendAssignments = async () => {
    if (!jobId || candidates.length === 0) { setError('Job or candidates not found'); return; }
    setIsSending(true); setError(null);
    try {
      const mappingResult = await createCandidateMappings({ job_id: jobId, session_id: sessionId || '', candidates: candidates.map(c => ({ cid: c.cid, name: c.name || 'Candidate', email: c.email || 'unknown@example.com' })) });
      if (!mappingResult.success) { setError(mappingResult.error || 'Failed to create candidate mappings'); setIsSending(false); return; }
      const candidateUUIDs = mappingResult.mappings.map((m: any) => m.candidate_id);
      const result = await bulkCreateAssignments({ job_id: jobId, session_id: sessionId || '', candidate_ids: candidateUUIDs });
      if (!result.success) { setError(result.error || 'Failed to send assignments'); setIsSending(false); return; }
      const links = mappingResult.mappings.map((mapping: any) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        return { candidateId: mapping.candidate_id, rankingCid: mapping.ranking_cid, name: mapping.name || 'Candidate', email: mapping.email || 'unknown@example.com', link: `${baseUrl}/submission?job_id=${jobId}&candidate_id=${mapping.candidate_id}` };
      });
      setSubmissionLinks(links); setShowSentOverlay(true); setSuccess(`Sent assignments to ${candidateUUIDs.length} candidate(s)!`);
      setTimeout(() => { router.push(`/sig-hire/evaluations?assignment_id=${jobId}&session_id=${sessionId}`); }, 4000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to send assignments'); setIsSending(false); }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Create Assignment"
        description="Generate and send assignments to selected candidates"
        onHelpClick={startTour}
      />

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-md border border-red-500/20 bg-red-500/10 text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-md border border-green-500/20 bg-green-500/10 text-green-300">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Card 1: Assignment Creation ──────────────────────────────────── */}
        <GlassCard data-tour="assignment-form" className="lg:col-span-2">
          {/* Header */}
          <div className="relative z-10 px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
                <ClipboardList className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />
              </div>

                   <div>
                <h3 className="text-base font-semibold text-white leading-tight">Create Assignment</h3>
                <p className="text-xs text-white/40 mt-0.5">Upload a document or describe it with a prompt</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative z-10 flex flex-col lg:flex-row min-h-[220px]">

            {/* Left — upload zone */}
            {assignmentFile ? (
              <div
                className="relative flex flex-col items-center justify-center gap-3 lg:w-[38%] p-8"
                style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="absolute inset-4 rounded-xl pointer-events-none" style={{ border: "1.5px dashed rgba(124,58,237,0.4)" }} />
                <div className="relative w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
                  <FileText className="w-6 h-6" style={{ color: "var(--color-lavender)" }} />
                </div>
                <div className="relative text-center max-w-[180px]">
                  <p className="text-sm font-semibold text-white/80 truncate">{assignmentFile.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {assignmentFile.size < 1024 * 1024
                      ? `${(assignmentFile.size / 1024).toFixed(1)} KB`
                      : `${(assignmentFile.size / (1024 * 1024)).toFixed(1)} MB`}
                  </p>
                </div>
                <button
                  onClick={() => setAssignmentFile(null)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <label
                className="relative flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 lg:w-[38%] p-8 group"
                style={{
                  background: isDragOver ? "rgba(124,58,237,0.07)" : "transparent",
                  borderRight: "1px solid rgba(255,255,255,0.05)",
                  borderBottom: "1px solid transparent",
                }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
                onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
                onDrop={handleFileDrop}
              >
                {/* Dashed border inset */}
                <div
                  className="absolute inset-4 rounded-xl transition-all duration-200 pointer-events-none"
                  style={{
                    border: `1.5px dashed ${isDragOver ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)"}`,
                  }}
                />
                <div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isDragOver ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isDragOver ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <Upload className="w-5 h-5 transition-colors" style={{ color: isDragOver ? "var(--color-lavender)" : "rgba(255,255,255,0.25)" }} />
                </div>
                <div className="relative text-center">
                  <p className="text-sm font-medium" style={{ color: isDragOver ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.4)" }}>
                    {isDragOver ? "Release to upload" : "Drop your file here"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                    PDF, DOCX, TXT — or <span style={{ color: "rgba(167,139,250,0.6)" }}>browse</span>
                  </p>
                </div>
                <input type="file" className="hidden" onChange={e => setAssignmentFile(e.target.files?.[0] || null)} />
              </label>
            )}

            {/* Right — prompt + actions */}
            <div className="flex flex-col gap-4 p-6 flex-1">
              <p className="text-sm text-white/60">Enter prompt</p>
              <textarea
                className="flex-1 w-full rounded-lg p-4 text-sm text-white/80 placeholder-white/20 outline-none resize-none transition-colors leading-relaxed"
                style={{
                  minHeight: "120px",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                placeholder="Describe the assignment — topics, difficulty level, expected deliverables..."
                value={assignmentPrompt}
                onChange={e => setAssignmentPrompt(e.target.value)}
              />
              <div className="flex items-center gap-3">
                {!assignmentData || isEditMode ? (
                  <>
                    <ChromeButton onClick={handleGenerateAssignment} disabled={isGenerating || !jobId} className="flex items-center gap-2">
                      {isGenerating ? <><Loader className="w-4 h-4 animate-spin" />Generating...</> : "Generate Assignment"}
                    </ChromeButton>
                    <button
                      onClick={handleCreateAssignment}
                      disabled={isCreating || isSending}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white/50 border border-white/8 transition-colors hover:border-white/15 hover:text-white/80 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.03)" }}
                    >
                      {isCreating ? <><Loader className="w-4 h-4 animate-spin" />Submitting...</> : "Submit Custom"}
                    </button>
                    {isEditMode && (
                      <button
                        onClick={() => setIsEditMode(false)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white/50 border border-white/8 transition-colors hover:border-white/15 hover:text-white/80 cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        Cancel
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium text-white/70 border border-white/10 transition-colors hover:border-white/20 hover:text-white cursor-pointer"
                    style={{ background: "rgba(124,58,237,0.15)" }}
                  >
                    Edit Assignment
                  </button>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ── Card 2: Selected Candidates ───────────────────────────────────── */}
        <GlassCard data-tour="candidate-select" className="lg:col-span-1 flex flex-col">
          <CardHead
            icon={<Users className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />}
            title={`Selected Candidates (${candidates.length})`}
            description={candidates.length > 0 ? "Ready to receive assignment" : "No candidates selected"}
          />
          {candidates.length > 0 ? (
            <>
              <div className="relative z-10 flex-1 overflow-y-auto p-6 pb-3" style={{ maxHeight: "195px" }}>
                <div className="flex flex-col gap-2">
                  {candidates.map(candidate => (
                    <div
                      key={candidate.cid}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{candidate.name}</p>
                        <p className="text-xs text-white/35 truncate">{candidate.email || 'No email'}</p>
                      </div>
                      {candidate.total_score > 0 && (
                        <div className="ml-4 text-right shrink-0">
                          <p className="text-xs font-semibold" style={{ color: "var(--color-lavender)" }}>{candidate.total_score.toFixed(1)}</p>
                          <p className="text-[10px] text-white/30">Score</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center relative z-10 p-3 border-t border-white/5">
                <ChromeButton 
                  onClick={handleSendAssignments} 
                  disabled={isSending || !assignmentData || isEditMode} 
                >
                  {isSending ? (
                    <><Loader className="w-4 h-4 animate-spin" />Sending...</>
                  ) : (
                    `Send to ${candidates.length} Candidate${candidates.length !== 1 ? 's' : ''}`
                  )}
                </ChromeButton>
              </div>
            </>
          ) : (
            <div className="relative z-10 text-center py-8 flex-1 flex flex-col items-center justify-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-white/15" />
              <p className="text-sm text-white/40 mb-1">No candidates selected</p>
              <p className="text-xs text-white/25">Go to the Ranking page to select candidates</p>
            </div>
          )}
        </GlassCard>

        {/* ── Card 3: Assignment Preview ────────────────────────────────────── */}
        <GlassCard className="lg:col-span-3">
          <div className="relative z-10 p-6 pb-4 flex items-center justify-between gap-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)" }}>
                <FileText className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white leading-tight">Assignment Preview</h3>
                <p className="text-xs text-white/40 mt-0.5">{assignmentData ? "Generated & Ready" : "Pending Generation"}</p>
              </div>
            </div>
            {assignmentData?.assignment_pdf_url && (
              <a href={assignmentData.assignment_pdf_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white/70 border border-white/10 transition-colors hover:border-white/20 hover:text-white"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <ExternalLink className="w-3 h-3" /> Download PDF
              </a>
            )}
          </div>

          <div className="relative z-10 p-6">
            {assignmentData ? (
              <div className="flex flex-col gap-6">
                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {assignmentData.title && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Title</p>
                      <p className="text-base font-semibold text-white/80 truncate">{assignmentData.title}</p>
                    </div>
                  )}
                  {assignmentData.difficulty !== undefined && (
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Difficulty</p>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-white/80">{assignmentData.difficulty}/10</span>
                        <div className="flex gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: i < assignmentData.difficulty ? "var(--color-lavender)" : "rgba(255,255,255,0.1)" }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Required Skills */}
                {assignmentData.required_skills?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {assignmentData.required_skills.map((skill: string) => (
                        <span key={skill} className="px-3 py-1.5 text-sm rounded-full" style={{ background: "rgba(124,58,237,0.15)", color: "var(--color-lavender)", border: "1px solid rgba(124,58,237,0.25)" }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Problem Statement */}
                {assignmentData.problem_statement && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Problem Statement</p>
                    <p className="text-base text-white/60 leading-relaxed line-clamp-4">{assignmentData.problem_statement}</p>
                  </div>
                )}

                {/* Requirements */}
                {assignmentData.requirements?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Requirements</p>
                    <ul className="space-y-2">
                      {assignmentData.requirements.slice(0, 3).map((req: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-base text-white/60">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-lavender)" }} />
                          {req}
                        </li>
                      ))}
                      {assignmentData.requirements.length > 3 && (
                        <li className="text-sm text-white/30 italic pl-3">+{assignmentData.requirements.length - 3} more requirements</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Evaluation Criteria */}
                {assignmentData.evaluation_criteria?.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Evaluation Criteria</p>
                    <ul className="space-y-2">
                      {assignmentData.evaluation_criteria.map((criteria: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-base text-white/60">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgba(16,185,129,0.8)" }} />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Input/Output */}
                {assignmentData.input_output && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-2">Input / Output</p>
                    <div className="rounded-lg p-3 text-sm font-mono text-white/60 overflow-auto max-h-24" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {assignmentData.input_output}
                    </div>
                  </div>
                )}

                {/* PDF iframe */}
                {assignmentData.assignment_pdf_url && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-2">PDF Preview</p>
                    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                      <iframe src={assignmentData.assignment_pdf_url} className="w-full h-96 border-0" title="Assignment PDF" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClipboardList className="w-10 h-10 mx-auto mb-3 text-white/15" />
                <p className="text-sm text-white/30">No assignment created yet. Generate or submit one above.</p>
              </div>
            )}
          </div>

          {assignmentId && (
            <div className="relative z-10 px-6 py-3 border-t border-white/5">
              <p className="text-[11px] text-white/25">Assignment ID: <span className="font-mono text-white/40">{assignmentId}</span></p>
            </div>
          )}
        </GlassCard>

        {/* ── Card 4: Previous Assignments ─────────────────────────────────── */}
        {previousAssignments.length > 0 && (
          <GlassCard className="lg:col-span-3">
            <CardHead
              icon={<History className="w-4 h-4" style={{ color: "var(--color-lavender)" }} />}
              title={`Previous Assignments (${previousAssignments.length})`}
              description="View and manage assignments sent to candidates"
            />
            <div className="relative z-10 p-6">
              {isLoadingPrevious ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <Loader className="w-5 h-5 animate-spin text-white/40" />
                  <p className="text-sm text-white/40">Loading assignments...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {previousAssignments.map((assignment, idx) => {
                    const hasSubmission = !!assignment.submission_file_url;
                    const hasEvaluation = !!assignment.evaluation_report;
                    return (
                      <div key={`${assignment.candidate_id}-${idx}`} className="flex items-start justify-between gap-4 px-4 py-3 rounded-lg transition-colors"
                        style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/70">Assignment #{idx + 1}</p>
                          <p className="text-xs text-white/30 font-mono mt-0.5">{assignment.candidate_id.substring(0, 12)}...</p>
                          {assignment.created_at && (
                            <p className="text-xs text-white/25 mt-0.5">{new Date(assignment.created_at).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex gap-1.5">
                            {hasSubmission && <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/15 text-green-400 border border-green-500/20">✓ Submitted</span>}
                            {hasEvaluation && <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">✓ Evaluated</span>}
                            {!hasSubmission && <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">⏳ Pending</span>}
                          </div>
                          {assignment.assignment_pdf_url && (
                            <a href={assignment.assignment_pdf_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded transition-colors text-white/40 border border-white/8 hover:text-white/70 hover:border-white/15"
                              style={{ background: "rgba(255,255,255,0.04)" }}
                            >
                              <ExternalLink className="w-3 h-3" /> View PDF
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassCard>
        )}
      </div>

      {/* ── Assignment Sent Overlay ────────────────────────────────────────── */}
      {showSentOverlay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="absolute inset-0 bg-linear-to-t from-lavender/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 p-8">
              {/* Success header */}
              <div className="flex flex-col items-center text-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Assignments Sent!</h2>
                  <p className="text-sm text-white/50">{submissionLinks.length} assignment{submissionLinks.length !== 1 ? 's' : ''} sent successfully.</p>
                  <p className="text-xs text-white/35 mt-1">Share the links below with candidates.</p>
                </div>
              </div>

              {/* Submission links */}
              <div className="space-y-3 mb-6">
                {submissionLinks.map((item, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between gap-2 px-4 py-3" style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div>
                        <p className="text-sm font-medium text-white/80">{item.name}</p>
                        <p className="text-xs text-white/35">{item.email}</p>
                      </div>
                      <button onClick={async () => { await navigator.clipboard.writeText(item.link); await showSuccess('Copied!'); }}
                        className="px-3 py-1 text-xs rounded-md font-medium text-white/70 border border-white/10 transition-colors hover:border-white/20 hover:text-white shrink-0"
                        style={{ background: "rgba(124,58,237,0.15)" }}
                      >
                        Copy Link
                      </button>
                    </div>
                    <div className="px-4 py-2.5 text-xs font-mono text-white/30 break-all cursor-pointer hover:text-white/50 transition-colors"
                      style={{ background: "rgba(0,0,0,0.15)" }}
                      onClick={async () => { await navigator.clipboard.writeText(item.link); await showSuccess('Copied!'); }}
                    >
                      {item.link}
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="rounded-lg px-4 py-3 mb-6" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                <p className="text-xs font-medium text-white/60 mb-1.5">How to share</p>
                <ul className="text-xs text-white/40 space-y-1">
                  <li>• Click &quot;Copy Link&quot; and send via email, SMS, or messaging</li>
                  <li>• Candidates submit their solutions from the link</li>
                  <li>• Submissions are automatically evaluated</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">Redirecting to Evaluations...</p>
                <button
                  onClick={() => router.push(`/sig-hire/evaluations?assignment_id=${jobId}&session_id=${sessionId}`)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
                  style={{ background: "rgba(124,58,237,0.25)", border: "1px solid rgba(124,58,237,0.35)" }}
                >
                  Go to Evaluations →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
