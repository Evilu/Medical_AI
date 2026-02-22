---
name: zustand
description: Zustand state management patterns for the medical search app. Use when creating stores, writing selectors, managing UI state, or deciding what belongs in Zustand vs TanStack Query.
user-invocable: true
---
# Zustand Patterns for Medical Search

## Table of Contents
1. [Store Design Philosophy](#store-design-philosophy)
2. [Search Store](#search-store)
3. [Collection Store](#collection-store)
4. [Anti-Patterns](#anti-patterns)

---

## Store Design Philosophy

Zustand handles **client/UI state only**. Server state (articles, collections data) lives in TanStack Query.

**Zustand owns:**
- Search query string, active filters, current page number
- UI toggles: expanded article ID, open modals, filter panel visibility
- Transient UI state: sidebar open, scroll position

**TanStack Query owns:**
- Article search results
- Single article details
- Collections data (list, detail, articles in collection)

Never put fetched data in Zustand. This is the #1 mistake.

## Search Store

```typescript
// stores/searchStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SearchFilters {
  year?: number;
  journal?: string;
  quartile?: number;
}

interface SearchState {
  // State
  query: string;
  page: number;
  filters: SearchFilters;
  expandedArticleId: string | null;
  isFilterPanelOpen: boolean;

  // Actions
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setExpandedArticle: (id: string | null) => void;
  toggleFilterPanel: () => void;
  reset: () => void;
}

const DEFAULT_FILTERS: SearchFilters = {};

export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      // Initial state
      query: "",
      page: 1,
      filters: DEFAULT_FILTERS,
      expandedArticleId: null,
      isFilterPanelOpen: false,

      // Actions — reset page to 1 when query or filters change
      setQuery: (query) =>
        set({ query, page: 1, expandedArticleId: null }, false, "setQuery"),
      setPage: (page) =>
        set({ page, expandedArticleId: null }, false, "setPage"),
      setFilters: (filters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...filters },
            page: 1,
          }),
          false,
          "setFilters",
        ),
      resetFilters: () =>
        set({ filters: DEFAULT_FILTERS, page: 1 }, false, "resetFilters"),
      setExpandedArticle: (id) =>
        set({ expandedArticleId: id }, false, "setExpandedArticle"),
      toggleFilterPanel: () =>
        set(
          (state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen }),
          false,
          "toggleFilterPanel",
        ),
      reset: () =>
        set(
          {
            query: "",
            page: 1,
            filters: DEFAULT_FILTERS,
            expandedArticleId: null,
          },
          false,
          "reset",
        ),
    }),
    { name: "search-store" },
  ),
);
```

### Using Selectors (Critical for Performance)

```typescript
// BAD — re-renders on ANY store change
const { query, setQuery } = useSearchStore();

// GOOD — only re-renders when query changes
const query = useSearchStore((s) => s.query);
const setQuery = useSearchStore((s) => s.setQuery);

// GOOD — grouped selector for related values
const filters = useSearchStore((s) => s.filters);
```

### Derived Selectors

```typescript
// lib/selectors.ts
import { useSearchStore } from "@/stores/searchStore";

export const useHasActiveFilters = () =>
  useSearchStore(
    (s) =>
      s.filters.year !== undefined ||
      s.filters.journal !== undefined ||
      s.filters.quartile !== undefined,
  );

export const useSearchParams = () =>
  useSearchStore((s) => ({
    q: s.query,
    page: s.page,
    ...s.filters,
  }));
```

## Collection Store

```typescript
// stores/collectionStore.ts
import { create } from "zustand";

interface CollectionUIState {
  isCreateDialogOpen: boolean;
  isSaveDialogOpen: boolean;
  activeArticlePmid: string | null;

  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  openSaveDialog: (pmid: string) => void;
  closeSaveDialog: () => void;
}

export const useCollectionStore = create<CollectionUIState>()((set) => ({
  isCreateDialogOpen: false,
  isSaveDialogOpen: false,
  activeArticlePmid: null,

  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
  openSaveDialog: (pmid) =>
    set({ isSaveDialogOpen: true, activeArticlePmid: pmid }),
  closeSaveDialog: () =>
    set({ isSaveDialogOpen: false, activeArticlePmid: null }),
}));
```

## Anti-Patterns

### Don't store fetched data
```typescript
// BAD
const useStore = create((set) => ({
  articles: [],
  fetchArticles: async () => {
    const data = await api.search("...");
    set({ articles: data }); // DON'T — this belongs in TanStack Query
  },
}));
```

### Don't use the whole store
```typescript
// BAD — component re-renders when ANY state changes
function SearchBar() {
  const store = useSearchStore();
  return <input value={store.query} />;
}

// GOOD — only re-renders when query changes
function SearchBar() {
  const query = useSearchStore((s) => s.query);
  return <input value={query} />;
}
```

### Don't put async logic in stores
```typescript
// BAD — async belongs in TanStack Query mutations
const useStore = create((set) => ({
  saveToCollection: async (pmid: string, collectionId: string) => {
    await api.addToCollection(collectionId, pmid); // DON'T
  },
}));
```

### Do use immer for complex nested updates (only if needed)
```typescript
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const useStore = create(
  immer((set) => ({
    filters: { years: [] as number[], journals: [] as string[] },
    toggleJournal: (journal: string) =>
      set((state) => {
        const idx = state.filters.journals.indexOf(journal);
        if (idx >= 0) state.filters.journals.splice(idx, 1);
        else state.filters.journals.push(journal);
      }),
  })),
);
```
