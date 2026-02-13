import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  error?: string | null;
  onRetry?: () => void;
}

export function LoadingOverlay({
  isVisible,
  message = "Processing your request...",
  error,
  onRetry,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        {error ? (
          <>
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4 text-left whitespace-pre-wrap text-sm max-h-96 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-3 rounded">
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            )}
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              {message}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Please wait while we process your data...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
