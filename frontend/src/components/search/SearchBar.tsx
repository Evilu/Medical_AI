import { useSearchStore } from "@/stores/searchStore";

export function SearchBar() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);

  return (
    <div className="relative w-full sm:max-w-xl md:max-w-2xl sm:mx-auto">
      <div className="relative flex items-center">
        <svg
          className="absolute left-3 sm:left-4 h-5 w-5 text-text-tertiary pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medical literature..."
          data-search-input
          className="w-full rounded-xl sm:rounded-2xl border border-border-default bg-surface-primary
                     py-3.5 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12
                     text-base text-text-primary placeholder:text-text-tertiary
                     shadow-search transition-shadow duration-200
                     focus:border-border-strong focus:outline-none focus:ring-0 focus:shadow-search-focus
                     hover:shadow-search-focus"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 sm:right-3 rounded-full p-2 text-text-tertiary
                       hover:text-text-secondary hover:bg-surface-secondary transition-colors
                       active:bg-surface-tertiary min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Clear search"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
