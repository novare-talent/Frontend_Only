'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/context/SessionContext';
import { RankingsTable } from './rankings-table';
import { QueriesManagement } from './queries-management';
import { fetchRankings, type Candidate } from '@/lib/ranking-api';
import { RotateCw, AlertCircle, X, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    router.push('/sig-hire/uploads');
  }, [clearSession, router]);

  if (!sessionId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-amber-900 font-semibold mb-2">No Active Session</h3>
            <p className="text-amber-800 text-sm mb-4">
              Please upload your candidates and job description to start ranking.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/sig-hire/uploads')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  // Show full loading state only on initial load with no data
  if (isLoading && candidates.length === 0) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h3 className="text-blue-900 font-semibold mb-2">Loading Rankings</h3>
        <p className="text-blue-700 text-sm">
          Fetching candidate rankings from Supabase...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Error Banner - Non-blocking, dismissible */}
      {showError && error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-amber-900 font-semibold text-sm mb-1">Error Loading Latest Rankings</h4>
              <p className="text-amber-800 text-sm whitespace-pre-wrap">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setShowError(false)}
            className="text-amber-600 hover:text-amber-700 flex-shrink-0"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with refresh and restart buttons */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-2">Candidate Rankings</h2>
          <p className="text-muted-foreground">
            {candidates.length} candidates ranked by job description match and query scores
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Refresh rankings"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          
          <button
            onClick={() => setShowRestartConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition text-sm"
            aria-label="Restart session"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>
        </div>
      </div>

      {/* Restart Confirmation Dialog */}
      {showRestartConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Restart Session?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              This will clear all rankings and queries. You&apos;ll need to upload new candidates and job description to continue.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRestartSession}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
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
        <RankingsTable candidates={candidates} isLoading={isRefreshing} />
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <h3 className="text-gray-700 font-semibold mb-2">No Rankings Yet</h3>
          <p className="text-gray-600 text-sm">
            Submit a query using the ranking bot to see candidate rankings.
          </p>
        </div>
      )}
    </div>
  );
}
