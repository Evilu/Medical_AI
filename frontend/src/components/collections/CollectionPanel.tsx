import { useEffect, useRef } from "react";
import {
  useCollections,
  useCollection,
  useDeleteCollection,
  useRemoveArticle,
} from "@/hooks/useCollections";
import { useCollectionStore } from "@/stores/collectionStore";

export function CollectionPanel() {
  const isOpen = useCollectionStore((s) => s.isPanelOpen);
  const toggle = useCollectionStore((s) => s.togglePanel);
  const activeId = useCollectionStore((s) => s.activeCollectionId);
  const setActiveId = useCollectionStore((s) => s.setActiveCollection);
  const backdropRef = useRef<HTMLDivElement>(null);

  const { data: collectionsData, isLoading } = useCollections();
  const { data: detailData } = useCollection(activeId ?? "");
  const deleteMutation = useDeleteCollection();
  const removeArticle = useRemoveArticle();

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggle();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, toggle]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const collections = collectionsData?.data ?? [];
  const detail = detailData?.data;

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (activeId === id) setActiveId(null);
      },
    });
  };

  const handleRemoveArticle = (pmid: string) => {
    if (!activeId) return;
    removeArticle.mutate({ collectionId: activeId, pmid });
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-40"
      onClick={(e) => {
        if (e.target === backdropRef.current) toggle();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 animate-fade-in" />

      {/* Panel — full-screen on mobile, side panel on desktop */}
      <div
        className="absolute inset-y-0 right-0 w-full sm:max-w-sm bg-white shadow-float
                   animate-slide-up sm:animate-none flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Collections panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          {activeId ? (
            <button
              onClick={() => setActiveId(null)}
              className="min-h-[44px] min-w-[44px] flex items-center gap-2
                         text-sm font-medium text-text-secondary
                         hover:text-text-primary active:text-text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <h2 className="text-base font-semibold text-text-primary">
              Collections
            </h2>
          )}
          <button
            onClick={toggle}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center
                       rounded-lg text-text-tertiary hover:text-text-primary
                       active:bg-surface-secondary transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeId && detail ? (
            /* Collection detail view */
            <div className="px-5 py-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {detail.name}
                </h3>
                {detail.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {detail.description}
                  </p>
                )}
                <p className="text-xs text-text-tertiary mt-2">
                  {detail.articlePmids.length} article
                  {detail.articlePmids.length !== 1 ? "s" : ""}
                </p>
              </div>

              {detail.articles && (detail.articles as Array<{ pmid: string; title: string; journal: string; year: number }>).length > 0 ? (
                <ul className="space-y-2">
                  {(detail.articles as Array<{ pmid: string; title: string; journal: string; year: number }>).map(
                    (article) => (
                      <li
                        key={article.pmid}
                        className="rounded-xl bg-surface-secondary p-3 group/item"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug">
                              {article.title}
                            </p>
                            <p className="text-xs text-text-tertiary mt-1 truncate">
                              {article.journal} &middot; {article.year}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveArticle(article.pmid)}
                            className="shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center
                                       rounded-lg text-text-tertiary hover:text-error
                                       active:bg-red-50 transition-colors
                                       opacity-0 group-hover/item:opacity-100 focus:opacity-100"
                            aria-label={`Remove ${article.title}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="text-sm text-text-tertiary text-center py-8">
                  No articles in this collection yet.
                  <br />
                  Save articles from search results.
                </p>
              )}

              <button
                onClick={() => handleDelete(activeId)}
                disabled={deleteMutation.isPending}
                className="w-full min-h-[44px] rounded-xl border border-error/30 text-error
                           text-sm font-medium hover:bg-red-50 active:bg-red-100
                           disabled:opacity-40 transition-colors mt-4"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Collection"}
              </button>
            </div>
          ) : (
            /* Collection list view */
            <div className="px-3 py-2">
              {isLoading ? (
                <div className="py-12 text-center text-sm text-text-tertiary">
                  Loading...
                </div>
              ) : collections.length === 0 ? (
                <div className="py-12 text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-text-tertiary/50 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                    />
                  </svg>
                  <p className="text-sm text-text-secondary">No collections yet</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    Save articles from search results to organize them
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {collections.map((col) => (
                    <li key={col._id}>
                      <button
                        onClick={() => setActiveId(col._id)}
                        className="w-full text-left px-4 py-3 rounded-xl min-h-[44px]
                                   hover:bg-surface-secondary active:bg-surface-tertiary
                                   transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-text-primary block truncate">
                            {col.name}
                          </span>
                          {col.description && (
                            <span className="text-xs text-text-tertiary block truncate mt-0.5">
                              {col.description}
                            </span>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-1">
                          <span className="text-xs text-text-tertiary tabular-nums">
                            {col.articlePmids.length}
                          </span>
                          <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
