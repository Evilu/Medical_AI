import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SearchFilters {
  year?: number;
  journal?: string;
  quartile?: number;
}

interface SearchState {
  query: string;
  page: number;
  filters: SearchFilters;
  expandedArticleId: string | null;

  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setExpandedArticle: (id: string | null) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      query: "",
      page: 1,
      filters: {},
      expandedArticleId: null,

      setQuery: (query) =>
        set({ query, page: 1, expandedArticleId: null }, false, "setQuery"),

      setPage: (page) =>
        set({ page, expandedArticleId: null }, false, "setPage"),

      setFilters: (filters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...filters },
            page: 1,
            expandedArticleId: null,
          }),
          false,
          "setFilters",
        ),

      resetFilters: () =>
        set({ filters: {}, page: 1, expandedArticleId: null }, false, "resetFilters"),

      setExpandedArticle: (id) =>
        set({ expandedArticleId: id }, false, "setExpandedArticle"),

      reset: () =>
        set(
          { query: "", page: 1, filters: {}, expandedArticleId: null },
          false,
          "reset",
        ),
    }),
    { name: "search-store" },
  ),
);
