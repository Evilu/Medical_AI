import { useState, useEffect, useRef } from "react";
import { useCreateCollection } from "@/hooks/useCollections";
import { useCollectionStore } from "@/stores/collectionStore";

export function CreateCollectionDialog() {
  const isOpen = useCollectionStore((s) => s.isCreateDialogOpen);
  const close = useCollectionStore((s) => s.closeCreateDialog);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const createMutation = useCreateCollection();

  // Reset form + focus on open
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    createMutation.mutate(
      { name: trimmedName, description: description.trim() || undefined },
      {
        onSuccess: () => close(),
      },
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

      {/* Dialog */}
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl
                   shadow-float animate-slide-up safe-area-inset-bottom"
        role="dialog"
        aria-modal="true"
        aria-label="Create collection"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border-strong" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="text-base font-semibold text-text-primary">
            New Collection
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          <div>
            <label htmlFor="col-name" className="block text-sm font-medium text-text-primary mb-1.5">
              Name
            </label>
            <input
              ref={inputRef}
              id="col-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diabetes Research"
              maxLength={80}
              className="w-full rounded-xl border border-border-default px-4 py-3 text-base
                         text-text-primary placeholder:text-text-tertiary
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                         transition-shadow min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="col-desc" className="block text-sm font-medium text-text-primary mb-1.5">
              Description <span className="text-text-tertiary font-normal">(optional)</span>
            </label>
            <textarea
              id="col-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this collection about?"
              rows={2}
              maxLength={200}
              className="w-full rounded-xl border border-border-default px-4 py-3 text-base
                         text-text-primary placeholder:text-text-tertiary resize-none
                         focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                         transition-shadow"
            />
          </div>

          {createMutation.isError && (
            <p className="text-sm text-error">
              {createMutation.error?.message || "Failed to create collection"}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={close}
              className="flex-1 min-h-[44px] rounded-xl border border-border-default
                         text-sm font-medium text-text-primary
                         hover:bg-surface-secondary active:bg-surface-tertiary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || createMutation.isPending}
              className="flex-1 min-h-[44px] rounded-xl bg-accent text-white
                         text-sm font-medium
                         hover:bg-accent-hover active:bg-accent-hover/90
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
