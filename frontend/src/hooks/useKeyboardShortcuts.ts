import { useEffect } from "react";
import { useSearchStore } from "@/stores/searchStore";

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      // "/" focuses the search bar (skip if already in an input)
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        document
          .querySelector<HTMLInputElement>("[data-search-input]")
          ?.focus();
      }

      // Escape: collapse expanded article, or clear search, or blur input
      if (e.key === "Escape") {
        const state = useSearchStore.getState();
        if (state.expandedArticleId) {
          state.setExpandedArticle(null);
        } else if (isInput && state.query) {
          state.setQuery("");
        } else if (isInput) {
          (target as HTMLInputElement).blur();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
