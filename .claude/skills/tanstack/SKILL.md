---
name: tanstack
description: TanStack Query v5 patterns for the medical search app. Use when setting up query hooks, pagination, mutations, optimistic updates, query key factories, or configuring the QueryClient.
user-invocable: true
---
# TanStack Query Patterns for Medical Search

## Table of Contents
1. [Setup](#setup)
2. [Query Key Factory](#query-key-factory)
3. [Search Hook with Pagination](#search-hook)
4. [Single Article Hook](#single-article-hook)
5. [Collection Hooks with Mutations](#collection-hooks)
6. [Optimistic Updates](#optimistic-updates)
7. [Error Handling](#error-handling)

---

## Setup

### QueryProvider

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,      // 5 minutes
            gcTime: 30 * 60 * 1000,         // 30 minutes (was cacheTime)
            retry: 2,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SearchPage />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
```

## Query Key Factory

Centralize all query keys to prevent collisions and enable targeted invalidation.

```typescript
// lib/queryKeys.ts
import type { SearchParams } from "@/types/article";

export const articleKeys = {
  all: ["articles"] as const,
  searches: () => [...articleKeys.all, "search"] as const,
  search: (params: SearchParams) => [...articleKeys.searches(), params] as const,
  details: () => [...articleKeys.all, "detail"] as const,
  detail: (pmid: string) => [...articleKeys.details(), pmid] as const,
  filters: () => [...articleKeys.all, "filters"] as const,
};

export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
};
```

## Search Hook

Use `useQuery` with offset-based pagination (page + limit). NOT `useInfiniteQuery` — offset pagination is correct for text search with relevance scoring, and it supports URL-shareable page numbers.

```typescript
// hooks/useArticles.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { articleKeys } from "@/lib/queryKeys";
import { searchArticles, getArticle, getFilters } from "@/api/articles";
import type { SearchParams } from "@/types/article";

export function useSearchArticles(params: SearchParams) {
  return useQuery({
    queryKey: articleKeys.search(params),
    queryFn: () => searchArticles(params),
    placeholderData: keepPreviousData, // Keep previous page visible while loading next
    staleTime: 5 * 60 * 1000,
    enabled: !!params.q && params.q.length >= 2,
  });
}
```

### Debounced Search Integration

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

### Usage in Component

```tsx
function SearchPage() {
  const query = useSearchStore((s) => s.query);
  const page = useSearchStore((s) => s.page);
  const filters = useSearchStore((s) => s.filters);
  const setPage = useSearchStore((s) => s.setPage);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, isError, error, isPlaceholderData } = useSearchArticles({
    q: debouncedQuery,
    page,
    limit: 20,
    ...filters,
  });

  if (!debouncedQuery) return <EmptyState />;
  if (isLoading) return <ArticleSkeleton />;
  if (isError) return <ErrorState error={error} />;
  if (!data || data.data.length === 0) return <EmptyState query={debouncedQuery} />;

  return (
    <div className={isPlaceholderData ? "opacity-70 transition-opacity" : ""}>
      <ResultsHeader total={data.meta.total} />
      {data.data.map((article) => (
        <ArticleCard key={article._id} article={article} />
      ))}
      <Pagination
        page={data.meta.page}
        totalPages={data.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

## Single Article Hook

```typescript
// hooks/useArticles.ts (continued)
export function useArticle(pmid: string | null) {
  return useQuery({
    queryKey: articleKeys.detail(pmid!),
    queryFn: () => getArticle(pmid!),
    enabled: !!pmid,
    staleTime: 30 * 60 * 1000, // Articles don't change — cache 30min
  });
}

export function useFilters() {
  return useQuery({
    queryKey: articleKeys.filters(),
    queryFn: getFilters,
    staleTime: 60 * 60 * 1000, // Filters rarely change — cache 1 hour
  });
}
```

## Collection Hooks

```typescript
// hooks/useCollections.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/lib/queryKeys";
import { api } from "@/api/articles";

export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get("/collections");
      return data;
    },
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; description?: string }) => {
      const { data } = await api.post("/collections", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useAddToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, pmid }: { collectionId: string; pmid: string }) => {
      const { data } = await api.post(`/collections/${collectionId}/articles`, { pmid });
      return data;
    },
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
    },
  });
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ collectionId, pmid }: { collectionId: string; pmid: string }) => {
      await api.delete(`/collections/${collectionId}/articles/${pmid}`);
    },
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
    },
  });
}
```

## Optimistic Updates

For instant-feeling collection operations:

```typescript
export function useAddToCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ collectionId, pmid }: { collectionId: string; pmid: string }) => {
      const { data } = await api.post(`/collections/${collectionId}/articles`, { pmid });
      return data;
    },
    onMutate: async ({ collectionId, pmid }) => {
      await queryClient.cancelQueries({ queryKey: collectionKeys.detail(collectionId) });
      const previous = queryClient.getQueryData(collectionKeys.detail(collectionId));

      queryClient.setQueryData(
        collectionKeys.detail(collectionId),
        (old: { data: { articlePmids: string[] } } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              articlePmids: [...old.data.articlePmids, pmid],
            },
          };
        },
      );

      return { previous, collectionId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          collectionKeys.detail(context.collectionId),
          context.previous,
        );
      }
    },
    onSettled: (_, __, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
    },
  });
}
```

## Error Handling

### Global Retry Logic

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry 4xx errors (client errors)
        if (error instanceof Error && error.message.includes("4")) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
```

### Error State Component

```tsx
function ErrorState({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-red-50 p-4 mb-4">
        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-base font-medium text-gray-900">Something went wrong</h3>
      <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}
```

## API Client

```typescript
// api/articles.ts (or lib/api.ts)
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",       // Vite proxy forwards to http://localhost:3000
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(new Error(message));
  },
);
```

## Types

```typescript
// types/article.ts
export interface Article {
  _id: string;
  pmid: string;
  title: string;
  abstract: string;
  authors: string;             // Comma-separated string
  journal: string;
  year: number;
  doi: string;
  sjr_quartile: number | null;
  sjr_rank: number | null;
  score?: number;              // textScore (search results only)
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  year?: number;
  journal?: string;
  quartile?: number;
}

export interface SearchResponse {
  data: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Collection {
  _id: string;
  name: string;
  description: string;
  articlePmids: string[];
  createdAt: string;
  updatedAt: string;
}
```
