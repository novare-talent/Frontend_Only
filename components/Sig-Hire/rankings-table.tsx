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
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';

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
}

export function RankingsTable({ candidates, isLoading = false }: RankingsTableProps) {
  const [sortedCandidates, setSortedCandidates] = useState<Candidate[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newSet = new Set(expandedIndexes);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedIndexes(newSet);
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
    <div className="border rounded-lg overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">Rank</TableHead>
            <TableHead className="w-40">Candidate Name</TableHead>
            <TableHead className="w-32">Email</TableHead>
            <TableHead className="w-20 text-right">JD Score</TableHead>
            <TableHead className="w-20 text-right">Total Score</TableHead>
            <TableHead className="flex-1">Evaluation Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map((candidate, index) => {
            const totalScore = candidate.total_score ?? candidate.jd_score ?? 0;
            const scoreColor = 
              totalScore > 75 ? 'bg-green-100 text-green-900' :
              totalScore > 50 ? 'bg-blue-100 text-blue-900' :
              totalScore > 25 ? 'bg-yellow-100 text-yellow-900' :
              'bg-red-100 text-red-900';
            
            const isExpanded = expandedIndexes.has(index);
            const evaluationText = candidate.evaluation_reason || candidate.jd_reason || 'No details available';

            return [
              <TableRow
                key={`candidate-${candidate.cid}-${index}`}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleExpanded(index)}
              >
                <TableCell className="font-semibold text-lg">
                  #{index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {candidate.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {candidate.email || 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={scoreColor}>
                    {(candidate.jd_score ?? 0).toFixed(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={`${scoreColor} font-bold`}>
                    {totalScore.toFixed(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground flex-1">
                  <div className="flex items-center justify-center">
                    <ChevronDown 
                      size={18} 
                      className={`flex-shrink-0 transition-transform cursor-pointer hover:text-primary ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </TableCell>
              </TableRow>,
              isExpanded && (
                <TableRow
                  key={`expanded-${candidate.cid}-${index}`}
                  className="bg-muted/30 hover:bg-muted/30"
                >
                  <TableCell colSpan={6} className="py-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Evaluation Details:</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
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
  );
}
