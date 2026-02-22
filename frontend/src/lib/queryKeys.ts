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
