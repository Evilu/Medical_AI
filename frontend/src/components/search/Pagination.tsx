interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex items-center justify-center gap-0.5 sm:gap-1 py-6 sm:py-8"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg px-3 py-2.5 sm:py-2 text-sm text-text-secondary
                   hover:bg-surface-secondary active:bg-surface-tertiary
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                   min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <span className="hidden sm:inline">Previous</span>
        <svg
          className="sm:hidden h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {getPageRange(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-1 sm:px-2 text-text-tertiary text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`rounded-lg px-2.5 sm:px-3 py-2.5 sm:py-2 text-sm font-medium transition-colors
                        min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center ${
              p === page
                ? "bg-surface-inverse text-text-inverse"
                : "text-text-secondary hover:bg-surface-secondary active:bg-surface-tertiary"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg px-3 py-2.5 sm:py-2 text-sm text-text-secondary
                   hover:bg-surface-secondary active:bg-surface-tertiary
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                   min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <span className="hidden sm:inline">Next</span>
        <svg
          className="sm:hidden h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
    </nav>
  );
}

function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3, "...", total];
  if (current >= total - 1) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
