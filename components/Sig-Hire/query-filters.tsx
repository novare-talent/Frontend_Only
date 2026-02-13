'use client';

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Query {
  id: string;
  text: string;
  intent?: string;
}

interface QueryFiltersProps {
  queries: Query[];
  onRemoveQuery?: (queryId: string) => void;
  isLoading?: boolean;
}

export function QueryFilters({
  queries,
  onRemoveQuery,
  isLoading = false,
}: QueryFiltersProps) {
  if (!queries || queries.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p className="text-sm">No active filters. Ask the chatbot to apply filters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Active Filters ({queries.length})
      </div>
      
      <div className="flex flex-wrap gap-2">
        {queries.map((query) => (
          <Badge
            key={query.id}
            variant="secondary"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs group ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            <span className="max-w-[120px] truncate" title={query.text}>
              {query.text}
            </span>
            {onRemoveQuery && (
              <button
                onClick={() => onRemoveQuery(query.id)}
                disabled={isLoading}
                className="ml-1 inline-flex hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Remove "${query.text}" filter`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}
