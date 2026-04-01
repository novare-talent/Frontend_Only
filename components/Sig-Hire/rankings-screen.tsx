'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/context/SessionContext';
import { RankingsTable } from './rankings-table';
import { QueriesManagement } from './queries-management';
import { fetchRankings, type Candidate } from '@/lib/ranking-api';
import { RotateCw, AlertCircle, X, RotateCcw, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDriverGuide } from '@/hooks/useDriverGuide';
import { rankingsGuide } from '@/lib/driver-config';
import { PageHeader } from '@/components/Sig-Hire/PageHeader';
import { showError } from '@/lib/swal';

interface RankingsScreenProps {
  sessionId?: string | null;
  refreshTrigger?: number;
}

export function RankingsScreen({ sessionId, refreshTrigger = 0 }: RankingsScreenProps) {
  const { clearSession } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [removalRefreshTrigger, setRemovalRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const { startTour } = useDriverGuide("rankings", rankingsGuide, false);

  const loadRankings = useCallback(async (isRefresh = false) => {
    if (!sessionId) {
      setError('No session ID provided');
      if (!isRefresh) setIsLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      setShowErrorBanner(false);
      
      const response = await fetchRankings(sessionId as string);
      
      if (response.candidates && response.candidates.length > 0) {
        setCandidates(response.candidates);
        console.log('✅ Rankings loaded:', response.candidates.length, 'candidates');
      } else if (candidates.length === 0) {
        setCandidates([]);
        console.log('⚠️ No candidates found');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load rankings';
      setError(message);
      setShowErrorBanner(true);
      console.error('❌ Rankings load error:', message);
      
      if (!hasInitialized && candidates.length === 0) {
        setCandidates([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [sessionId, hasInitialized, candidates.length]);

  useEffect(() => {
    if (sessionId && !hasInitialized) {
      loadRankings(false);
      setHasInitialized(true);
    }
  }, [sessionId, hasInitialized, loadRankings]);

  useEffect(() => {
    if (refreshTrigger > 0 && sessionId) {
      loadRankings(true);
    }
  }, [refreshTrigger, sessionId, loadRankings]);

  useEffect(() => {
    if (removalRefreshTrigger > 0 && sessionId) {
      loadRankings(true);
    }
  }, [removalRefreshTrigger, sessionId, loadRankings]);

  const handleQueryRemoved = useCallback(() => {
    setRemovalRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleManualRefresh = useCallback(() => {
    loadRankings(true);
  }, [loadRankings]);

  const handleRestartSession = useCallback(() => {
    clearSession();
    setCandidates([]);
    setError(null);
    setHasInitialized(false);
    setShowRestartConfirm(false);
    setSelectedCandidates(new Set());
    router.push('/sig-hire/uploads');
  }, [clearSession, router]);

  const handleSendAssignments = useCallback(async () => {
    if (selectedCandidates.size === 0) {
      await showError('Please select at least one candidate');
      return;
    }
    const selectedIds = Array.from(selectedCandidates).join(',');
    router.push(`/sig-hire/assignments?session_id=${sessionId}&candidates=${selectedIds}`);
  }, [selectedCandidates, sessionId, router]);

  if (!sessionId) {
    return (
      <div className="rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-white">No Active Session</h3>
            <p className="mb-4 text-sm text-white/70">
              Please upload your candidates and job description to start ranking.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/sig-hire/uploads')}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-lavender)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-lavender)]/90"
        >
          <RotateCcw className="h-4 w-4" />
          Start New Session
        </button>
      </div>
    );
  }

  if (isLoading && candidates.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl p-8 text-center shadow-sm">
        <div className="mb-4 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-lavender)]"></div>
        </div>
        <h3 className="mb-2 font-semibold text-white">Loading Rankings</h3>
        <p className="text-sm text-white/70">
          Fetching candidate rankings...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Error Banner */}
      {showErrorBanner && error && (
        <div className="mb-6 flex items-start justify-between rounded-xl border border-red-500/50 bg-red-500/10 p-4 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-300" />
            <div>
              <h4 className="mb-1 text-sm font-semibold text-white">Error Loading Latest Rankings</h4>
              <p className="whitespace-pre-wrap text-sm text-white/70">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setShowErrorBanner(false)}
            className="flex-shrink-0 text-white/70 hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Candidate Rankings"
        description={`${candidates.length} candidates ranked by job description match and query scores${
          selectedCandidates.size > 0 ? ` • ${selectedCandidates.size} selected` : ''
        }`}
        onHelpClick={startTour}
        actions={
          <>
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-3 py-2 text-white transition-colors hover:border-[var(--color-lavender)]/50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh rankings"
            >
              <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            
            {selectedCandidates.size > 0 && (
              <button
                onClick={handleSendAssignments}
                className="flex items-center gap-2 rounded-lg bg-[var(--color-lavender)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-lavender)]/90"
                aria-label="Send assignments"
              >
                <Send className="h-4 w-4" />
                Send Assignment ({selectedCandidates.size})
              </button>
            )}
            
            <button
              onClick={() => setShowRestartConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-[var(--color-glass-bg)] px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
              aria-label="Restart session"
            >
              <RotateCcw className="h-4 w-4" />
              Restart
            </button>
          </>
        }
      />

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Restart Session?
            </h3>
            <p className="mb-6 text-sm text-white/70">
              This will clear all rankings and queries. You&apos;ll need to upload new candidates and job description to continue.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="rounded-lg border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] px-4 py-2 text-white transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleRestartSession}
                className="rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-500/90"
              >
                Restart Session
              </button>
            </div>
          </div>
        </div>
      )}
      
      <QueriesManagement 
        sessionId={sessionId} 
        onQueryRemoved={handleQueryRemoved}
        isLoading={isRefreshing}
        refreshTrigger={refreshTrigger + removalRefreshTrigger}
      />
      
      {candidates.length > 0 ? (
        <div data-tour="rankings-list">
          <RankingsTable 
            candidates={candidates} 
            isLoading={isRefreshing}
            selectedCandidates={selectedCandidates}
            onSelectionChange={setSelectedCandidates}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] backdrop-blur-xl p-12 text-center shadow-sm">
          <h3 className="mb-2 font-semibold text-white">No Rankings Yet</h3>
          <p className="text-sm text-white/70">
            Submit a query using the ranking bot to see candidate rankings.
          </p>
        </div>
      )}
    </>
  );
}
