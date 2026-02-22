import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchArticles, getArticle, getFilters } from "@/api/articles";
import { articleKeys } from "@/lib/queryKeys";
import type { SearchParams } from "@/types/article";

export function useSearchArticles(params: SearchParams) {
  return useQuery({
    queryKey: articleKeys.search(params),
    queryFn: () => searchArticles(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    enabled: !!params.q && params.q.length >= 2,
  });
}

export function useArticle(pmid: string) {
  return useQuery({
    queryKey: articleKeys.detail(pmid),
    queryFn: () => getArticle(pmid),
    staleTime: 30 * 60 * 1000,
    enabled: !!pmid,
  });
}

export function useFilters() {
  return useQuery({
    queryKey: articleKeys.filters(),
    queryFn: getFilters,
    staleTime: 30 * 60 * 1000,
  });
}
