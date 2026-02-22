interface ErrorStateProps {
  error: Error | null;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-fade-in">
      <div className="rounded-full bg-red-50 p-5 sm:p-6 mb-5 sm:mb-6">
        <svg
          className="h-7 w-7 sm:h-8 sm:w-8 text-error"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary">
        Something went wrong
      </h3>
      <p className="mt-2 text-sm text-text-secondary max-w-sm px-4">
        {error?.message || "Failed to load search results. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 rounded-xl bg-surface-inverse text-text-inverse px-5 py-2.5
                     text-sm font-medium hover:bg-surface-inverse/90 active:bg-surface-inverse/80
                     transition-colors min-h-[44px]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
