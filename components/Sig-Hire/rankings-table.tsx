'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, User } from 'lucide-react';

interface Candidate {
  cid: string;
  name: string;
  email: string | null;
  jd_score: number;
  jd_reason: string;
  query_score?: number;
  total_score?: number;
  evaluation_reason?: string;
}

interface RankingsTableProps {
  candidates: Candidate[];
  isLoading?: boolean;
  selectedCandidates?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAvatarGradient(index: number) {
  const gradients = [
    'linear-gradient(135deg, #7C3AED, #C4B5FD)',
    'linear-gradient(135deg, #4F46E5, #7C3AED)',
    'linear-gradient(135deg, #6d28d9, #818cf8)',
    'linear-gradient(135deg, #7C3AED, #4F46E5)',
    'linear-gradient(135deg, #818cf8, #C4B5FD)',
    'linear-gradient(135deg, #4F46E5, #6d28d9)',
  ];
  return gradients[index % gradients.length];
}



// Four visually distinct colors that all pop on a dark purple background
function getScoreColor(score: number) {
  if (score > 75) return '#4ade80'; // green-400   — excellent, warm contrast vs purple
  if (score > 50) return '#38bdf8'; // sky-400     — good, cool blue distinct from bg
  if (score > 25) return '#fb923c'; // orange-400  — mid, warm and eye-catching
  return '#f472b6';                 // pink-400    — low, soft but visible
}


function CandidateRow({
  candidate,
  index,
  isSelected,
  onSelect,
}: {
  candidate: Candidate;
  index: number;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const jdScore = candidate.jd_score ?? 0;
  const queryScore = candidate.query_score ?? null;
  // Only treat total as distinct when a query_score actually contributed to it
  const totalScore = queryScore !== null
    ? (candidate.total_score ?? jdScore)
    : jdScore;
  const scoreColor = getScoreColor(totalScore);
  const evaluationText = candidate.evaluation_reason || candidate.jd_reason || 'No details available';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group relative"
    >
      <div
        className="relative rounded-md border transition-all duration-200 overflow-hidden"
        style={{
          borderColor: isSelected ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.07)',
          background: isSelected ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
          boxShadow: isSelected ? '0 0 16px rgba(124,58,237,0.15)' : 'none',
        }}
      >

        {/* Main row */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
          onClick={() => setExpanded((p) => !p)}
        >
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(e); }}
            className="shrink-0 flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-150 hover:scale-110 cursor-pointer"
            style={{
              borderColor: isSelected ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.18)',
              background: isSelected ? 'rgba(124,58,237,0.18)' : 'transparent',
            }}
          >
            {isSelected && <Check className="w-3 h-3" style={{ color: '#a78bfa' }} />}
          </button>

          {/* Rank badge */}
          <div
            className="shrink-0 flex items-center justify-center rounded-lg text-xs font-bold tabular-nums"
            style={{
              width: '2rem',
              height: '2rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            {index + 1}
          </div>

          {/* Avatar */}
          {/* <div
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
            style={{ background: getAvatarGradient(index) }}
          >
            {getInitials(candidate.name)}
          </div> */}

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{candidate.name}</p>
          </div>

          {/* Email */}
          <div className="w-44 shrink-0 min-w-0">
            <p className="text-xs text-white/40 truncate">{candidate.email || '—'}</p>
          </div>

          {/* JD Score */}
          <div className="w-28 shrink-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black tabular-nums leading-none" style={{ color: getScoreColor(jdScore) }}>
              {jdScore.toFixed(0)}
            </span>
          </div>

          {/* Total Score */}
          <div className="w-28 shrink-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black tabular-nums leading-none" style={{ color: getScoreColor(totalScore) }}>
              {totalScore.toFixed(0)}
            </span>
          </div>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown
              size={16}
              className="transition-colors"
              style={{ color: expanded ? '#a78bfa' : 'rgba(255,255,255,0.25)' }}
            />
          </motion.div>
        </div>

        {/* Expanded details */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div
                className="px-4 pb-4 pt-1"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* Score breakdown — only show Total when query_score makes it distinct */}
                <div className="flex gap-3 mb-4 mt-3">
                  {[
                    { label: 'JD Match', value: jdScore, color: getScoreColor(jdScore) },
                    ...(queryScore !== null ? [
                      { label: 'Query Score', value: queryScore, color: getScoreColor(queryScore) },
                      { label: 'Total Score', value: totalScore, color: scoreColor },
                    ] : []),
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex-1 rounded-lg px-3 py-2.5 text-center"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}
                    >
                      <p className="text-lg font-black tabular-nums" style={{ color: item.color }}>
                        {item.value.toFixed(1)}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5 uppercase tracking-wider font-medium">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Evaluation text */}
                <div
                  className="rounded-lg p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">
                    Evaluation Summary
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                    {evaluationText}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function RankingsTable({
  candidates,
  isLoading = false,
  selectedCandidates = new Set(),
  onSelectionChange,
}: RankingsTableProps) {
  const [sortedCandidates, setSortedCandidates] = useState<Candidate[]>([]);
  const [internalSelected, setInternalSelected] = useState<Set<string>>(selectedCandidates);

  const handleSelectCandidate = (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(internalSelected);
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId);
    } else {
      newSelected.add(candidateId);
    }
    setInternalSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const allSelected = candidates.length > 0 && internalSelected.size === candidates.length;

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = allSelected ? new Set<string>() : new Set(candidates.map((c) => c.cid));
    setInternalSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  useEffect(() => {
    const sorted = [...candidates].sort((a, b) => {
      const aTotal = a.total_score ?? a.jd_score ?? 0;
      const bTotal = b.total_score ?? b.jd_score ?? 0;
      return bTotal - aTotal;
    });
    setSortedCandidates(sorted);
  }, [candidates]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl animate-pulse"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (sortedCandidates.length === 0) {
    return (
      <div
        className="rounded-xl py-16 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <User className="w-10 h-10 mx-auto mb-3 text-white/20" />
        <p className="text-white/40 text-sm">No candidates to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 pb-1.5">
        <button
          onClick={handleSelectAll}
          className="shrink-0 flex items-center justify-center w-5 h-5 rounded-md border transition-all duration-150 cursor-pointer hover:scale-110"
          style={{
            borderColor: allSelected ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.12)',
            background: allSelected ? 'rgba(124,58,237,0.18)' : 'transparent',
          }}
          title={allSelected ? 'Deselect all' : 'Select all'}
        >
          {allSelected && <Check className="w-3 h-3" style={{ color: '#a78bfa' }} />}
        </button>
        <div className="w-8 shrink-0 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/75">Rank</span>
        </div>
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/75">Name</span>
        </div>
        <div className="w-44 shrink-0">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/75">Email</span>
        </div>
        <div className="w-28 shrink-0 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/75">JD Score</span>
        </div>
        <div className="w-28 shrink-0 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/75">Total Score</span>
        </div>
        <div className="w-4 shrink-0" />
      </div>

      {/* Candidate rows */}
      {sortedCandidates.map((candidate, index) => (
        <CandidateRow
          key={candidate.cid}
          candidate={candidate}
          index={index}
          isSelected={internalSelected.has(candidate.cid)}
          onSelect={(e) => handleSelectCandidate(candidate.cid, e)}
        />
      ))}

      {/* Footer count */}
      {internalSelected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2 text-center"
        >
          <span className="text-xs text-white/40">
            {internalSelected.size} of {candidates.length} selected
          </span>
        </motion.div>
      )}
    </div>
  );
}
