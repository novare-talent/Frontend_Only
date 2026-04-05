'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, Check } from 'lucide-react';

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

export function RankingsTable({ 
  candidates, 
  isLoading = false,
  selectedCandidates = new Set(),
  onSelectionChange
}: RankingsTableProps) {
  const [sortedCandidates, setSortedCandidates] = useState<Candidate[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());
  const [internalSelected, setInternalSelected] = useState<Set<string>>(selectedCandidates);

  const toggleExpanded = (index: number) => {
    const newSet = new Set(expandedIndexes);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedIndexes(newSet);
  };

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

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (internalSelected.size === candidates.length && candidates.length > 0) {
      const newSelected = new Set<string>();
      setInternalSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      const newSelected = new Set(candidates.map(c => c.cid));
      setInternalSelected(newSelected);
      onSelectionChange?.(newSelected);
    }
  };

  useEffect(() => {
    // Sort candidates by total_score (descending), then by jd_score (descending)
    const sorted = [...candidates].sort((a, b) => {
      const aTotal = a.total_score || a.jd_score || 0;
      const bTotal = b.total_score || b.jd_score || 0;
      return bTotal - aTotal;
    });
    setSortedCandidates(sorted);
  }, [candidates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sortedCandidates.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No candidates to display</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-md border border-glass-border bg-glass-bg backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-lavender)]/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead className="w-12">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center justify-center w-5 h-5 rounded border transition"
                  style={{
                    borderColor: internalSelected.size === candidates.length && candidates.length > 0 ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.2)',
                    background: internalSelected.size === candidates.length && candidates.length > 0 ? 'rgba(124,58,237,0.1)' : 'transparent'
                  }}
                  title={internalSelected.size === candidates.length ? "Deselect all" : "Select all"}
                >
                  {internalSelected.size === candidates.length && candidates.length > 0 && (
                    <Check className="w-4 h-4" style={{ color: 'var(--color-lavender)' }} />
                  )}
                </button>
              </TableHead>
              <TableHead className="w-12 text-white/60 text-xs font-medium uppercase tracking-wider">Rank</TableHead>
              <TableHead className="w-40 text-white/60 text-xs font-medium uppercase tracking-wider">Candidate Name</TableHead>
              <TableHead className="w-32 text-white/60 text-xs font-medium uppercase tracking-wider">Email</TableHead>
              <TableHead className="w-20 text-right text-white/60 text-xs font-medium uppercase tracking-wider">JD Score</TableHead>
              <TableHead className="w-20 text-right text-white/60 text-xs font-medium uppercase tracking-wider">Total Score</TableHead>
              <TableHead className="flex-1 text-white/60 text-xs font-medium uppercase tracking-wider">Evaluation Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCandidates.map((candidate, index) => {
              const totalScore = candidate.total_score ?? candidate.jd_score ?? 0;
              const scoreColor = 
                totalScore > 75 ? 'rgba(34,197,94,0.15)' :
                totalScore > 50 ? 'rgba(59,130,246,0.15)' :
                totalScore > 25 ? 'rgba(234,179,8,0.15)' :
                'rgba(239,68,68,0.15)';
              const scoreBorder = 
                totalScore > 75 ? 'rgba(34,197,94,0.3)' :
                totalScore > 50 ? 'rgba(59,130,246,0.3)' :
                totalScore > 25 ? 'rgba(234,179,8,0.3)' :
                'rgba(239,68,68,0.3)';
              const scoreText = 
                totalScore > 75 ? 'rgb(134,239,172)' :
                totalScore > 50 ? 'rgb(147,197,253)' :
                totalScore > 25 ? 'rgb(253,224,71)' :
                'rgb(252,165,165)';
              
              const isExpanded = expandedIndexes.has(index);
              const isSelected = internalSelected.has(candidate.cid);
              const evaluationText = candidate.evaluation_reason || candidate.jd_reason || 'No details available';

              return [
                <TableRow
                  key={`candidate-${candidate.cid}-${index}`}
                  className="border-b border-white/5 transition-all cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(124,58,237,0.08)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                  onClick={() => toggleExpanded(index)}
                >
                  <TableCell>
                    <button
                      onClick={(e) => handleSelectCandidate(candidate.cid, e)}
                      className="flex items-center justify-center w-5 h-5 rounded border transition"
                      style={{
                        borderColor: isSelected ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.2)',
                        background: isSelected ? 'rgba(124,58,237,0.1)' : 'transparent'
                      }}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4" style={{ color: 'var(--color-lavender)' }} />
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="font-semibold text-lg text-white">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-white/80">
                    {candidate.name}
                  </TableCell>
                  <TableCell className="text-sm text-white/50">
                    {candidate.email || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <span 
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                      style={{
                        background: scoreColor,
                        border: `1px solid ${scoreBorder}`,
                        color: scoreText
                      }}
                    >
                      {(candidate.jd_score ?? 0).toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span 
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-bold"
                      style={{
                        background: scoreColor,
                        border: `1px solid ${scoreBorder}`,
                        color: scoreText
                      }}
                    >
                      {totalScore.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/50 flex-1">
                    <div className="flex items-center justify-center">
                      <ChevronDown 
                        size={18} 
                        className={`flex-shrink-0 transition-transform cursor-pointer`}
                        style={{ color: isExpanded ? 'var(--color-lavender)' : 'rgba(255,255,255,0.5)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-lavender)'}
                        onMouseLeave={(e) => {
                          if (!isExpanded) e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                        }}
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          color: isExpanded ? 'var(--color-lavender)' : 'rgba(255,255,255,0.5)'
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>,
                isExpanded && (
                  <TableRow
                    key={`expanded-${candidate.cid}-${index}`}
                    className="border-b border-white/5"
                    style={{ background: 'rgba(0,0,0,0.2)' }}
                  >
                    <TableCell colSpan={7} className="py-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-white/80">Evaluation Details:</p>
                        <p className="text-sm text-white/60 whitespace-pre-wrap">
                          {evaluationText}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              ].filter(Boolean);
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
