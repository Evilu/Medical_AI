import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface CollectionUIState {
  // Save-to-collection dialog
  isSaveDialogOpen: boolean;
  activeArticlePmid: string | null;

  // Create collection dialog
  isCreateDialogOpen: boolean;

  // Collection panel
  isPanelOpen: boolean;
  activeCollectionId: string | null;

  openSaveDialog: (pmid: string) => void;
  closeSaveDialog: () => void;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  togglePanel: () => void;
  setActiveCollection: (id: string | null) => void;
}

export const useCollectionStore = create<CollectionUIState>()(
  devtools(
    (set) => ({
      isSaveDialogOpen: false,
      activeArticlePmid: null,
      isCreateDialogOpen: false,
      isPanelOpen: false,
      activeCollectionId: null,

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
    }),
    { name: "collection-store" },
  ),
);
