import type { Article } from "@/types/article";
import { formatAuthors } from "@/lib/utils";
import { useCollectionStore } from "@/stores/collectionStore";

const QUARTILE_STYLES: Record<number, string> = {
  1: "bg-emerald-50 text-emerald-700",
  2: "bg-blue-50 text-blue-700",
  3: "bg-amber-50 text-amber-700",
  4: "bg-red-50 text-red-700",
};

export function FocusedArticle({ article }: { article: Article }) {
  const clear = useCollectionStore((s) => s.clearFocusedArticle);
  const openSaveDialog = useCollectionStore((s) => s.openSaveDialog);

  return (
    <div className="py-6 sm:py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={clear}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary
                   hover:text-text-primary active:text-text-primary min-h-[44px] mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Article */}
      <article className="space-y-5">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary leading-snug">
          {article.title}
        </h2>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-text-secondary">
          <span>{formatAuthors(article.authors)}</span>
          <span className="text-border-default">&middot;</span>
          <span className="font-medium text-text-primary/70">{article.journal}</span>
          <span className="text-border-default">&middot;</span>
          <span>{article.year}</span>
          {article.sjr_quartile !== null && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                QUARTILE_STYLES[article.sjr_quartile] ?? "bg-surface-secondary text-text-secondary"
              }`}
            >
              Q{article.sjr_quartile}
            </span>
          )}
        </div>

        {/* Abstract */}
        {article.abstract && (
          <div className="rounded-xl bg-surface-secondary p-4 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-2">
              Abstract
            </h3>
            <p className="text-sm sm:text-[15px] text-text-primary/80 leading-relaxed">
              {article.abstract}
            </p>
          </div>
        )}

        {/* Full authors */}
        <div className="text-sm text-text-secondary break-words">
          <span className="text-text-tertiary font-medium">Authors:</span>{" "}
          {article.authors}
        </div>

        {/* Details + links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="font-mono text-xs text-text-secondary">
            <span className="text-text-tertiary">PMID:</span> {article.pmid}
          </span>
          {article.sjr_rank !== null && (
            <span className="text-text-secondary">
              <span className="text-text-tertiary">SJR:</span> {article.sjr_rank}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl
                       bg-accent text-white text-sm font-medium
                       hover:bg-accent-hover active:bg-accent-hover/90 transition-colors"
          >
            View on PubMed
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          {article.doi && (
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl
                         border border-border-default text-sm font-medium text-text-primary
                         hover:bg-surface-secondary active:bg-surface-tertiary transition-colors"
            >
              View DOI
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <button
            onClick={() => openSaveDialog(article.pmid)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl
                       border border-border-default text-sm font-medium text-text-primary
                       hover:bg-surface-secondary active:bg-surface-tertiary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save to Collection
          </button>
        </div>
      </article>
    </div>
  );
}
