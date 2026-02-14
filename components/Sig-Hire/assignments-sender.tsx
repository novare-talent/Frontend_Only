'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AssignmentsSenderProps {
  sessionId: string;
  candidateIds: string[];
}

export function AssignmentsSender({ sessionId, candidateIds }: AssignmentsSenderProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to assignments page with session_id and candidate IDs
    const candidatesParam = candidateIds.join(',');
    router.push(`/sig-hire/assignments?session_id=${sessionId}&candidates=${candidatesParam}`);
  }, [sessionId, candidateIds, router]);

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Redirecting to assignments page...</p>
        </div>
      </div>
    </div>
  );
}
