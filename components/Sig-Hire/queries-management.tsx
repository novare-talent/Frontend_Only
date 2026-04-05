'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { removeQuery } from '@/lib/ranking-api';
import { createClient } from '@/utils/supabase/client';
import { showError, showConfirm } from '@/lib/swal';

interface Query {
  id: string;
  text: string;
  intent?: string;
}

interface QueriesManagementProps {
  sessionId?: string | null;
  onQueryRemoved?: () => void;
  isLoading?: boolean;
  refreshTrigger?: number;
}

export function QueriesManagement({
  sessionId,
  onQueryRemoved,
  isLoading = false,
  refreshTrigger = 0,
}: QueriesManagementProps) {
  const [queries, setQueries] = useState<Query[]>([]);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  const [removingQueryId, setRemovingQueryId] = useState<string | null>(null);

  const fetchQueries = useCallback(async () => {
    if (!sessionId) return;

    try {
      setIsLoadingQueries(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('rankings_sighire')
        .select('queries')
        .eq('id', sessionId)
        .single();

      if (error) {
        console.error('Failed to fetch queries:', error);
        setQueries([]);
        return;
      }

      if (data && data.queries) {
        let queriesList = data.queries;

        if (typeof queriesList === 'string') {
          try {
            queriesList = JSON.parse(queriesList);
          } catch (e) {
            console.error('Failed to parse queries:', e);
            queriesList = [];
          }
        }

        if (Array.isArray(queriesList)) {
          setQueries(queriesList);
        } else {
          setQueries([]);
        }
      } else {
        setQueries([]);
      }
    } catch (error) {
      console.error('Failed to fetch queries:', error);
      setQueries([]);
    } finally {
      setIsLoadingQueries(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchQueries();
    }
  }, [sessionId, refreshTrigger, fetchQueries]);

  const handleRemoveQuery = async (queryId: string, queryText: string) => {
    if (!sessionId) return;

    const confirmed = await showConfirm(
      'Remove Query?',
      `This will remove "${queryText}" and recalculate rankings.`
    );
    if (!confirmed) return;

    try {
      setRemovingQueryId(queryId);
      await removeQuery(sessionId as string, queryId);
      setQueries((prev) => prev.filter((q) => q.id !== queryId));
      if (onQueryRemoved) onQueryRemoved();
    } catch (error) {
      await showError(`Failed to remove query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRemovingQueryId(null);
    }
  };

  if (!sessionId) return null;

  const hasQueries = queries.length > 0;
  const isDisabled = isLoading || isLoadingQueries;

  if (!hasQueries && !isLoadingQueries) return null;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Active Queries
        </span>
        {hasQueries && (
          <span
            className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "var(--color-lavender)",
            }}
          >
            {queries.length}
          </span>
        )}
        {isLoadingQueries && (
          <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin" />
        )}
      </div>

      {/* Query chips */}
      <div className="flex flex-wrap gap-2">
        {queries.map((query) => {
          const isRemoving = removingQueryId === query.id;

          return (
            <div
              key={query.id}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 max-w-full"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.22)",
              }}
            >
              {/* Intent badge */}
              {query.intent && (
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide rounded px-1.5 py-0.5 shrink-0"
                  style={{
                    background: "rgba(124,58,237,0.2)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "var(--color-lavender)",
                  }}
                >
                  {query.intent}
                </span>
              )}

              {/* Query text */}
              <span className="text-sm text-white/80 leading-snug">
                {query.text}
              </span>

              {/* Remove button */}
              <button
                onClick={() => handleRemoveQuery(query.id, query.text)}
                disabled={isRemoving || isDisabled}
                className="shrink-0 flex items-center justify-center w-4 h-4 rounded-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                title="Remove query"
                aria-label="Remove query"
              >
                {isRemoving ? (
                  <div className="w-3 h-3 rounded-full border border-red-400/40 border-t-red-400 animate-spin" />
                ) : (
                  <X size={13} className="text-white/35 hover:text-red-400 transition-colors" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
