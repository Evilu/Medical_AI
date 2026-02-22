import { useCollections, useAddArticle } from "@/hooks/useCollections";
import { useCollectionStore } from "@/stores/collectionStore";
import { useEffect, useRef } from "react";

export function SaveToCollectionDialog() {
  const isOpen = useCollectionStore((s) => s.isSaveDialogOpen);
  const pmid = useCollectionStore((s) => s.activeArticlePmid);
  const close = useCollectionStore((s) => s.closeSaveDialog);
  const openCreate = useCollectionStore((s) => s.openCreateDialog);

  const { data, isLoading } = useCollections();
  const addArticle = useAddArticle();
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !pmid) return null;

  const collections = data?.data ?? [];

  const handleSave = (collectionId: string) => {
    addArticle.mutate(
      { collectionId, pmid },
      { onSuccess: () => close() },
    );
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === backdropRef.current) close();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-fade-in" />

      {/* Dialog — bottom sheet on mobile, centered modal on desktop */}
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl
                   shadow-float animate-slide-up max-h-[70vh] flex flex-col
                   safe-area-inset-bottom"
        role="dialog"
        aria-modal="true"
        aria-label="Save to collection"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-subtle">
          <h2 className="text-base font-semibold text-text-primary">
            Save to Collection
          </h2>
          <button
            onClick={close}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center
                       rounded-lg text-text-tertiary hover:text-text-primary
                       active:bg-surface-secondary transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Collection list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-text-tertiary">
              Loading collections...
            </div>
          ) : collections.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-text-secondary mb-3">
                No collections yet
              </p>
              <button
                onClick={openCreate}
                className="text-sm font-medium text-accent hover:text-accent-hover
                           active:text-accent-hover/80 min-h-[44px] px-4"
              >
                Create your first collection
              </button>
            </div>
          ) : (
            <ul className="space-y-1">
              {collections.map((col) => {
                const alreadySaved = col.articlePmids.includes(pmid);
                return (
                  <li key={col._id}>
                    <button
                      onClick={() => !alreadySaved && handleSave(col._id)}
                      disabled={alreadySaved || addArticle.isPending}
                      className={`w-full text-left px-4 py-3 rounded-xl min-h-[44px]
                                  flex items-center justify-between gap-3
                                  transition-colors ${
                                    alreadySaved
                                      ? "bg-accent-light/50 text-text-secondary cursor-default"
                                      : "hover:bg-surface-secondary active:bg-surface-tertiary"
                                  }`}
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
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-xs text-text-tertiary">
                          {col.articlePmids.length}
                        </span>
                        {alreadySaved && (
                          <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — Create new */}
        <div className="border-t border-border-subtle px-5 py-3">
          <button
            onClick={openCreate}
            className="w-full flex items-center justify-center gap-2 min-h-[44px]
                       rounded-xl bg-surface-secondary text-sm font-medium text-text-primary
                       hover:bg-surface-tertiary active:bg-border-default transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Collection
          </button>
        </div>
      </div>
    </div>
  );
}
