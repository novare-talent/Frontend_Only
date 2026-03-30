'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/context/SessionContext';
import { RankingsTable } from './rankings-table';
import { QueriesManagement } from './queries-management';
import { fetchRankings, type Candidate } from '@/lib/ranking-api';
import { RotateCw, AlertCircle, X, RotateCcw, Send, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDriverGuide } from '@/hooks/useDriverGuide';
import { rankingsGuide } from '@/lib/driver-config';

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
  const [showError, setShowError] = useState(false);
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
      setShowError(false);
      
      const response = await fetchRankings(sessionId as string);
      
      if (response.candidates && response.candidates.length > 0) {
        // Replace candidates completely (not append)
        setCandidates(response.candidates);
        console.log('✅ Rankings loaded:', response.candidates.length, 'candidates');
      } else if (candidates.length === 0) {
        // Only show empty state if we didn't have data before
        setCandidates([]);
        console.log('⚠️ No candidates found');
      }
      // If we had data before and got empty results, keep the existing data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load rankings';
      setError(message);
      setShowError(true);
      console.error('❌ Rankings load error:', message);
      
      // If this is a refresh and we have existing data, keep showing it
      // Only clear data if this is initial load (hasInitialized = false)
      if (!hasInitialized && candidates.length === 0) {
        setCandidates([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [sessionId, hasInitialized, candidates.length]);

  // Initial load on mount - only once
  useEffect(() => {
    if (sessionId && !hasInitialized) {
      loadRankings(false);
      setHasInitialized(true);
    }
  }, [sessionId, hasInitialized, loadRankings]);

  // Refresh when explicitly triggered (e.g., after query submission)
  useEffect(() => {
    if (refreshTrigger > 0 && sessionId) {
      loadRankings(true);
    }
  }, [refreshTrigger, sessionId, loadRankings]);

  // Refresh when query is removed
  useEffect(() => {
    if (removalRefreshTrigger > 0 && sessionId) {
      loadRankings(true);
    }
  }, [removalRefreshTrigger, sessionId, loadRankings]);

  const handleQueryRemoved = useCallback(() => {
    // Trigger rankings refresh
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

  const handleSendAssignments = useCallback(() => {
    if (selectedCandidates.size === 0) {
      alert('Please select at least one candidate');
      return;
    }
    // Redirect to assignments page with selected candidate IDs
    const selectedIds = Array.from(selectedCandidates).join(',');
    router.push(`/sig-hire/assignments?session_id=${sessionId}&candidates=${selectedIds}`);
  }, [selectedCandidates, sessionId, router]);

  if (!sessionId) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No Active Session</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Please upload your candidates and job description to start ranking.
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/sig-hire/uploads')}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RotateCcw className="h-4 w-4" />
          Start New Session
        </button>
      </div>
    );
  }

  // Show full loading state only on initial load with no data
  if (isLoading && candidates.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
        <h3 className="mb-2 font-semibold text-foreground">Loading Rankings</h3>
        <p className="text-sm text-muted-foreground">
          Fetching candidate rankings...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Error Banner - Non-blocking, dismissible */}
      {showError && error && (
        <div className="mb-6 flex items-start justify-between rounded-xl border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <h4 className="mb-1 text-sm font-semibold text-foreground">Error Loading Latest Rankings</h4>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setShowError(false)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header with refresh and restart buttons */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Candidate Rankings</h2>
          <p className="text-muted-foreground">
            {candidates.length} candidates ranked by job description match and query scores
            {selectedCandidates.size > 0 && (
              <span className="ml-2 font-semibold text-primary">
                • {selectedCandidates.size} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={startTour}
            className="rounded-lg border border-border bg-card p-2 transition-colors hover:border-primary/50 hover:bg-accent"
            title="Start Guide"
          >
            <HelpCircle className="h-5 w-5 text-primary" />
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh rankings"
          >
            <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          {selectedCandidates.size > 0 && (
            <button
              onClick={handleSendAssignments}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              aria-label="Send assignments"
            >
              <Send className="h-4 w-4" />
              Send Assignment ({selectedCandidates.size})
            </button>
          )}
          
          <button
            onClick={() => setShowRestartConfirm(true)}
            className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-card px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            aria-label="Restart session"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Restart Session?
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              This will clear all rankings and queries. You&apos;ll need to upload new candidates and job description to continue.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="rounded-lg border border-border bg-card px-4 py-2 transition-colors hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleRestartSession}
                className="rounded-lg bg-destructive px-4 py-2 text-destructive-foreground transition-colors hover:bg-destructive/90"
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
      
      {/* Always show table if we have data, even if there's an error */}
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
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <h3 className="mb-2 font-semibold text-foreground">No Rankings Yet</h3>
          <p className="text-sm text-muted-foreground">
            Submit a query using the ranking bot to see candidate rankings.
          </p>
        </div>
      )}
    </div>
  );
}
