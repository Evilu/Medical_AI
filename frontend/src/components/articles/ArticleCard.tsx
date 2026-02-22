import type { Article } from "@/types/article";
import { formatAuthors } from "@/lib/utils";
import { useSearchStore } from "@/stores/searchStore";

const QUARTILE_STYLES: Record<number, string> = {
  1: "bg-emerald-50 text-emerald-700",
  2: "bg-blue-50 text-blue-700",
  3: "bg-amber-50 text-amber-700",
  4: "bg-red-50 text-red-700",
};

export function ArticleCard({ article }: { article: Article }) {
  const expandedId = useSearchStore((s) => s.expandedArticleId);
  const setExpanded = useSearchStore((s) => s.setExpandedArticle);
  const expanded = expandedId === article._id;

  const toggle = () => setExpanded(expanded ? null : article._id);

  return (
    <article
      className="group border-b border-border-subtle py-4 sm:py-6 cursor-pointer
                 transition-colors active:bg-surface-secondary sm:hover:bg-surface-secondary/50
                 -mx-4 px-4 sm:mx-0 sm:px-0"
      onClick={toggle}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] sm:text-base font-medium text-text-primary leading-snug line-clamp-2 group-hover:text-text-secondary">
            {article.title}
          </h3>

          <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-1 text-[13px] sm:text-sm text-text-secondary">
            <span className="truncate max-w-[200px] sm:max-w-[250px]">
              {formatAuthors(article.authors)}
            </span>
            <span className="text-border-default">&middot;</span>
            <span className="font-medium text-text-primary/70 truncate max-w-[150px] sm:max-w-none">
              {article.journal}
            </span>
            <span className="text-border-default">&middot;</span>
            <span>{article.year}</span>
            {article.sjr_quartile !== null && (
              <>
                <span className="text-border-default hidden sm:inline">
                  &middot;
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    QUARTILE_STYLES[article.sjr_quartile] ??
                    "bg-surface-secondary text-text-secondary"
                  }`}
                >
                  Q{article.sjr_quartile}
                </span>
              </>
            )}
          </div>

          {!expanded && article.abstract && (
            <p className="mt-2 sm:mt-3 text-sm text-text-secondary line-clamp-2 leading-relaxed">
              {article.abstract}
            </p>
          )}
        </div>

        <span className="hidden sm:block shrink-0 text-xs font-mono text-text-tertiary mt-1">
          {article.pmid}
        </span>
      </div>

      {/* Expanded detail */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="mt-3 sm:mt-4 space-y-3 animate-fade-in">
            {article.abstract && (
              <div className="rounded-lg sm:rounded-xl bg-surface-secondary p-3 sm:p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-1.5 sm:mb-2">
                  Abstract
                </h4>
                <p className="text-sm text-text-primary/80 leading-relaxed">
                  {article.abstract}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-sm text-text-secondary">
              <span className="font-mono text-xs">
                <span className="text-text-tertiary">PMID:</span>{" "}
                {article.pmid}
              </span>
              {article.doi && (
                <a
                  href={`https://doi.org/${article.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-accent hover:text-accent-hover active:text-accent-hover/80 font-medium
                             py-1 min-h-[44px] inline-flex items-center"
                >
                  View DOI &rarr;
                </a>
              )}
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-accent hover:text-accent-hover active:text-accent-hover/80 font-medium
                           py-1 min-h-[44px] inline-flex items-center"
              >
                PubMed &rarr;
              </a>
              {article.sjr_rank !== null && (
                <span>
                  <span className="text-text-tertiary">SJR:</span>{" "}
                  {article.sjr_rank}
                </span>
              )}
            </div>

            <p className="text-sm text-text-secondary break-words">
              <span className="text-text-tertiary">Authors:</span>{" "}
              {article.authors}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
