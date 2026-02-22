import { useSearchStore } from "@/stores/searchStore";
import { useSearchArticles } from "@/hooks/useArticles";
import { useDebounce } from "@/hooks/useDebounce";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleSkeleton } from "@/components/articles/ArticleSkeleton";
import { Pagination } from "./Pagination";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export function SearchResults() {
  const query = useSearchStore((s) => s.query);
  const page = useSearchStore((s) => s.page);
  const filters = useSearchStore((s) => s.filters);
  const setPage = useSearchStore((s) => s.setPage);
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading, isError, error, isPlaceholderData, refetch } =
    useSearchArticles({
      q: debouncedQuery,
      page,
      limit: 20,
      ...filters,
    });

  // No search yet
  if (!debouncedQuery || debouncedQuery.length < 2) {
    return <EmptyState />;
  }

  // Loading
  if (isLoading) {
    return <ArticleSkeleton />;
  }

  // Error
  if (isError) {
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }

  // No results
  if (!data || data.data.length === 0) {
    return <EmptyState query={debouncedQuery} />;
  }

  return (
    <div
      className={`transition-opacity duration-150 ${
        isPlaceholderData ? "opacity-60" : "opacity-100"
      }`}
    >
      {/* Results count */}
      <div className="flex items-center justify-between py-2 sm:py-3 border-b border-border-subtle mb-1">
        <span className="text-sm text-text-secondary">
          {data.meta.total.toLocaleString()} result
          {data.meta.total !== 1 ? "s" : ""}
        </span>
        {data.meta.totalPages > 1 && (
          <span className="text-xs text-text-tertiary">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
        )}
      </div>

      {/* Article list */}
      <div>
        {data.data.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        page={data.meta.page}
        totalPages={data.meta.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
