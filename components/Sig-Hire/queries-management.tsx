'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { removeQuery } from '@/lib/ranking-api';
import { createClient } from '@/utils/supabase/client';
import { showError } from '@/lib/swal';

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
  const [isOpen, setIsOpen] = useState(false);
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
        
        // Parse if it's a string
        if (typeof queriesList === 'string') {
          try {
            queriesList = JSON.parse(queriesList);
          } catch (e) {
            console.error('Failed to parse queries:', e);
            queriesList = [];
          }
        }
        
        // Ensure it's an array
        if (Array.isArray(queriesList)) {
          setQueries(queriesList);
          console.log('🔍 Fetched queries:', queriesList.length, queriesList);
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

  // Fetch queries on mount, when sessionId changes, or when ratings refresh
  useEffect(() => {
    if (sessionId) {
      fetchQueries();
    }
  }, [sessionId, refreshTrigger, fetchQueries]);

  const handleRemoveQuery = async (queryId: string, queryText: string) => {
    if (!sessionId) return;

    try {
      setRemovingQueryId(queryId);
      console.log('🗑️ Removing query:', queryId, queryText);
      
      await removeQuery(sessionId as string, queryId);
      
      // Remove from local state
      setQueries((prev) => prev.filter((q) => q.id !== queryId));
      
      console.log('✅ Query removed successfully');
      
      // Trigger refresh of rankings
      if (onQueryRemoved) {
        onQueryRemoved();
      }
    } catch (error) {
      console.error('Failed to remove query:', error);
      await showError(`Failed to remove query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRemovingQueryId(null);
    }
  };

  if (!sessionId) {
    return null;
  }

  const hasQueries = queries && queries.length > 0;

  return (
    <div className="mb-6">
      <div className="relative inline-block w-full max-w-md">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading || isLoadingQueries}
          className="w-full px-4 py-2 rounded-lg flex items-center justify-between text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !isLoadingQueries) {
              e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            e.currentTarget.style.background = "rgba(0,0,0,0.25)";
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/60">Queries:</span>
            {hasQueries && (
              <span 
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                style={{
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "var(--color-lavender)"
                }}
              >
                {queries.length}
              </span>
            )}
            {!hasQueries && (
              <span className="text-sm text-white/40">No queries applied</span>
            )}
          </div>
          <ChevronDown
            size={18}
            className="transition-transform"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'rgba(255,255,255,0.5)'
            }}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && hasQueries && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto backdrop-blur-xl"
            style={{
              background: "rgba(10,1,24,0.95)",
              border: "1px solid rgba(124,58,237,0.2)",
              boxShadow: "0 8px 32px rgba(124,58,237,0.15)"
            }}
          >
            <div className="space-y-2 p-3">
              {queries.map((query) => {
                const isRemoving = removingQueryId === query.id;

                return (
                  <div
                    key={query.id}
                    className="relative flex items-center gap-3 p-4 rounded-lg transition-all group overflow-hidden"
                    style={{
                      background: "rgba(124,58,237,0.08)",
                      border: "1px solid rgba(124,58,237,0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(124,58,237,0.12)";
                      e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                      e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)";
                    }}
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-lavender)]/5 to-transparent pointer-events-none" />
                    
                    <div className="relative flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 mb-1">
                        {query.text}
                      </p>
                      {query.intent && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Intent:</span>
                          <span 
                            className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
                            style={{
                              background: "rgba(124,58,237,0.2)",
                              border: "1px solid rgba(124,58,237,0.3)",
                              color: "var(--color-lavender)"
                            }}
                          >
                            {query.intent}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveQuery(query.id, query.text)}
                      disabled={isRemoving}
                      className="relative p-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isRemoving) {
                          e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                          e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                        e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
                      }}
                      title="Remove this query"
                      aria-label="Remove query"
                    >
                      {isRemoving ? (
                        <div className="animate-spin">
                          <X size={16} style={{ color: "rgb(252,165,165)" }} />
                        </div>
                      ) : (
                        <X size={16} className="cursor-pointer" style={{ color: "rgb(252,165,165)" }} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!hasQueries && (
        <p className="text-xs text-white/40 mt-2">
          Submit queries using the Ranking Bot to see them here
        </p>
      )}
    </div>
  );
}
