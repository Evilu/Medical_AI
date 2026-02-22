import { useState } from "react";
import { useSearchStore } from "@/stores/searchStore";
import { useFilters } from "@/hooks/useArticles";

export function SearchFilters() {
  const query = useSearchStore((s) => s.query);
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const resetFilters = useSearchStore((s) => s.resetFilters);
  const [open, setOpen] = useState(false);

  const { data: filtersData } = useFilters();

  const activeCount = [filters.year, filters.journal, filters.quartile].filter(
    Boolean,
  ).length;

  // Don't show filters if no query yet
  if (!query || query.length < 2) return null;

  return (
    <div className="mb-4">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden flex items-center gap-2 text-sm text-text-secondary
                   hover:text-text-primary active:text-text-primary transition-colors
                   min-h-[44px] px-1"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
          />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-accent text-white text-xs font-medium">
            {activeCount}
          </span>
        )}
      </button>

      {/* Filter row — always visible on md+, toggled on mobile */}
      <div
        className={`${
          open ? "block" : "hidden"
        } md:flex flex-wrap items-center gap-2 sm:gap-3 mt-2 md:mt-0`}
      >
        {/* Year filter */}
        <select
          value={filters.year ?? ""}
          onChange={(e) =>
            setFilters({
              year: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg border border-border-default bg-surface-primary px-3 py-2
                     text-sm text-text-primary min-h-[44px] min-w-[100px]
                     focus:outline-none focus:border-border-strong"
        >
          <option value="">All years</option>
          {filtersData?.data.years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Quartile filter */}
        <select
          value={filters.quartile ?? ""}
          onChange={(e) =>
            setFilters({
              quartile: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="rounded-lg border border-border-default bg-surface-primary px-3 py-2
                     text-sm text-text-primary min-h-[44px] min-w-[100px]
                     focus:outline-none focus:border-border-strong"
        >
          <option value="">All quartiles</option>
          <option value="1">Q1 - Top</option>
          <option value="2">Q2</option>
          <option value="3">Q3</option>
          <option value="4">Q4</option>
        </select>

        {/* Clear filters */}
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-sm text-accent hover:text-accent-hover active:text-accent-hover/80
                       font-medium min-h-[44px] px-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
