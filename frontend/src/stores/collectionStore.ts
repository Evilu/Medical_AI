import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Article } from "@/types/article";

interface CollectionUIState {
  // Save-to-collection dialog
  isSaveDialogOpen: boolean;
  activeArticlePmid: string | null;

  // Create collection dialog
  isCreateDialogOpen: boolean;

  // Collection panel
  isPanelOpen: boolean;
  activeCollectionId: string | null;

  // Focused article from collection (shown in main view)
  focusedArticle: Article | null;

  openSaveDialog: (pmid: string) => void;
  closeSaveDialog: () => void;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  togglePanel: () => void;
  setActiveCollection: (id: string | null) => void;
  viewArticle: (article: Article) => void;
  clearFocusedArticle: () => void;
}

export const useCollectionStore = create<CollectionUIState>()(
  devtools(
    (set) => ({
      isSaveDialogOpen: false,
      activeArticlePmid: null,
      isCreateDialogOpen: false,
      isPanelOpen: false,
      activeCollectionId: null,
      focusedArticle: null,

      openSaveDialog: (pmid) =>
        set(
          { isSaveDialogOpen: true, activeArticlePmid: pmid },
          false,
          "openSaveDialog",
        ),
      closeSaveDialog: () =>
        set(
          { isSaveDialogOpen: false, activeArticlePmid: null },
          false,
          "closeSaveDialog",
        ),
      openCreateDialog: () =>
        set({ isCreateDialogOpen: true }, false, "openCreateDialog"),
      closeCreateDialog: () =>
        set({ isCreateDialogOpen: false }, false, "closeCreateDialog"),
      togglePanel: () =>
        set((s) => ({ isPanelOpen: !s.isPanelOpen }), false, "togglePanel"),
      setActiveCollection: (id) =>
        set({ activeCollectionId: id }, false, "setActiveCollection"),
      viewArticle: (article) =>
        set(
          { focusedArticle: article, isPanelOpen: false },
          false,
          "viewArticle",
        ),
      clearFocusedArticle: () =>
        set({ focusedArticle: null }, false, "clearFocusedArticle"),
    }),
    { name: "collection-store" },
  ),
);
