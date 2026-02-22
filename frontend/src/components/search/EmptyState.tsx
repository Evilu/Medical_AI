import { useSearchStore } from "@/stores/searchStore";

const DEMO_QUERIES = [
  "GLP-1 receptor agonists versus SGLT2 inhibitors",
  "lecanemab anti-amyloid Alzheimer's disease",
  "anticoagulation atrial fibrillation bleeding risk",
  "cardiovascular safety immunotherapy cancer",
  "GLP-1 agonists weight loss non-diabetic obese",
];

export function EmptyState({ query }: { query?: string }) {
  const setQuery = useSearchStore((s) => s.setQuery);

  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center animate-fade-in">
      <div className="rounded-full bg-surface-secondary p-5 sm:p-6 mb-5 sm:mb-6">
        <svg
          className="h-7 w-7 sm:h-8 sm:w-8 text-text-tertiary"
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
      </div>
      {query ? (
        <>
          <h3 className="text-lg font-medium text-text-primary">
            No results found
          </h3>
          <p className="mt-2 text-sm text-text-secondary max-w-sm px-4">
            No articles matching &ldquo;{query}&rdquo;. Try adjusting your
            search terms.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-text-primary">
            Search medical literature
          </h3>
          <p className="mt-2 text-sm text-text-secondary max-w-sm px-4">
            Search across 25,000+ PubMed articles by title or abstract.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg px-4">
            {DEMO_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="rounded-full border border-border-default px-3 py-1.5 text-xs text-text-secondary
                           hover:bg-surface-secondary hover:border-border-strong transition-colors
                           active:bg-surface-tertiary min-h-[36px]"
              >
                {q}
              </button>
            ))}
          </div>
          <p className="mt-6 text-xs text-text-tertiary hidden sm:block">
            Press{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-secondary text-text-secondary font-mono text-[11px]">
              /
            </kbd>{" "}
            to focus search
          </p>
        </>
      )}
    </div>
  );
}
