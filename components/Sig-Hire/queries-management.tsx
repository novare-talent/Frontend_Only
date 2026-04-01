'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
          className="w-full px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">Queries:</span>
            {hasQueries && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {queries.length}
              </Badge>
            )}
            {!hasQueries && (
              <span className="text-sm text-muted-foreground">No queries applied</span>
            )}
          </div>
          <ChevronDown
            size={18}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && hasQueries && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="space-y-2 p-3">
              {queries.map((query) => {
                const isRemoving = removingQueryId === query.id;

                return (
                  <div
                    key={query.id}
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {query.text}
                      </p>
                      {query.intent && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Intent: <span className="font-semibold">{query.intent}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveQuery(query.id, query.text)}
                      disabled={isRemoving}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title="Remove this query"
                      aria-label="Remove query"
                    >
                      {isRemoving ? (
                        <div className="animate-spin">
                          <X size={16} className="text-red-600" />
                        </div>
                      ) : (
                        <X size={16} className="text-red-600 hover:text-red-700" />
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
        <p className="text-xs text-muted-foreground mt-2">
          Submit queries using the Ranking Bot to see them here
        </p>
      )}
    </div>
  );
}
