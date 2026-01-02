import { useState } from 'react';
import { AlertTriangle, Send, Filter } from 'lucide-react';

export interface CandidateRankingScreenProps {
  onSubmitUploads: (candidates: string[]) => void;
}

interface Candidate {
  id: string;
  name: string;
  matchScore: number;
  skillFit: number;
  experienceFit: number;
  redFlags: string[];
}

const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    matchScore: 94,
    skillFit: 96,
    experienceFit: 92,
    redFlags: [],
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    matchScore: 89,
    skillFit: 91,
    experienceFit: 87,
    redFlags: [],
  },
  {
    id: '3',
    name: 'Emily Thompson',
    matchScore: 86,
    skillFit: 88,
    experienceFit: 84,
    redFlags: ['Gap in employment (6 months)'],
  },
  {
    id: '4',
    name: 'srtsrg Kim',
    matchScore: 83,
    skillFit: 85,
    experienceFit: 81,
    redFlags: [],
  },
  {
    id: '5',
    name: 'Jessica Williams',
    matchScore: 78,
    skillFit: 89,
    experienceFit: 74,
    redFlags: ['Frequent job changes'],
  },
];

export function CandidateRankingScreen({ onSubmitUploads }: CandidateRankingScreenProps) {
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minExperience, setMinExperience] = useState(0);
  const [minSkillMatch, setMinSkillMatch] = useState(0);
  const [sortBy, setSortBy] = useState<'matchScore' | 'skillFit' | 'experienceFit'>('matchScore');

  const toggleCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedCandidates.length === candidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(candidates.map((c) => c.id));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-primary';
    if (score >= 60) return 'text-secondary';
    return 'text-destructive';
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-primary font-semibold tabular-nums @[250px]/card:text-2xl py-2">Candidate Ranking</h2>
          <p className="text-muted-foreground text-sm">
            {candidates.length} candidates analyzed and ranked
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
              showFilters ? 'bg-primary text-white border-primary' : 'border-border hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {/*Filter and Send are pre defined in lucide-react.d.ts */}
          {selectedCandidates.length > 0 && (
            <button
              onClick={() => onSubmitUploads(selectedCandidates)}
              className="px-5 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Assignments ({selectedCandidates.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      {showFilters && (
        <div className="mb-6 p-4 bg-card border border-border rounded-xl shadow-card">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="block text-xs mb-2 text-muted-foreground">Min. Years Experience</label>
              <input
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                placeholder="0"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs mb-2 text-muted-foreground">Min. Skill Match %</label>
              <input
                type="number"
                value={minSkillMatch}
                onChange={(e) => setMinSkillMatch(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                placeholder="0"
                max="100"
              />
            </div>

            <div className="flex-1">
              <label className="block text-xs mb-2 text-muted-foreground">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background appearance-none text-sm"
              >
                <option value="matchScore">Match Score</option>
                <option value="skillFit">Skill Fit</option>
                <option value="experienceFit">Experience Fit</option>
              </select>
            </div>

            <button 
              onClick={() => {
                setMinExperience(0);
                setMinSkillMatch(0);
                setSortBy('matchScore');
              }}
              className="text-sm text-primary hover:opacity-80 mt-6"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Candidates Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card shadow-sm bg-gradient-to-t">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedCandidates.length === candidates.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
              </th>
              <th className="text-left p-4 font-semibold">Name</th>
              <th className="text-left p-4 font-semibold">Match Score</th>
              <th className="text-left p-4 font-semibold">Skill Fit</th>
              <th className="text-left p-4 font-semibold">Experience Fit</th>
              <th className="text-left p-4 font-semibold">Areas of Concern</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr
                key={candidate.id}
                className={`border-b border-border hover:bg-muted/30 transition-colors ${
                  index === candidates.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => toggleCandidate(candidate.id)}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      {candidate.name.charAt(0)}
                    </div>
                    <span>{candidate.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg bg-muted ${getScoreColor(candidate.matchScore)}`}>
                      {candidate.matchScore}
                    </span>
                    <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${candidate.matchScore}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{candidate.skillFit}%</span>
                    <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden max-w-[100px]">
                      <div
                        className="h-full bg-secondary"
                        style={{ width: `${candidate.skillFit}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{candidate.experienceFit}%</span>
                    <div className="flex-1 h-1.5 bg-accent rounded-full overflow-hidden max-w-[100px]">
                      <div
                        className="h-full bg-secondary"
                        style={{ width: `${candidate.experienceFit}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {candidate.redFlags.length > 0 ? (
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">{candidate.redFlags[0]}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
