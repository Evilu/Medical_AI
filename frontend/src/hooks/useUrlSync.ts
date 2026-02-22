import { useEffect, useRef } from "react";
import { useSearchStore } from "@/stores/searchStore";

export function useUrlSync() {
  const query = useSearchStore((s) => s.query);
  const page = useSearchStore((s) => s.page);
  const filters = useSearchStore((s) => s.filters);
  const setQuery = useSearchStore((s) => s.setQuery);
  const setPage = useSearchStore((s) => s.setPage);
  const setFilters = useSearchStore((s) => s.setFilters);

  const initialized = useRef(false);

  // Read URL on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const p = params.get("page");
    const year = params.get("year");
    const journal = params.get("journal");

    if (q) setQuery(q);
    if (p) setPage(parseInt(p, 10));
    if (year) setFilters({ year: parseInt(year, 10) });
    if (journal) setFilters({ journal });
  }, [setQuery, setPage, setFilters]);

  // Write URL on state change
  useEffect(() => {
    if (!initialized.current) return;

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (page > 1) params.set("page", String(page));
    if (filters.year) params.set("year", String(filters.year));
    if (filters.journal) params.set("journal", filters.journal);

    const url = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, page, filters]);
}
