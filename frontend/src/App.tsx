import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { FocusedArticle } from "@/components/articles/FocusedArticle";
import { SaveToCollectionDialog } from "@/components/collections/SaveToCollectionDialog";
import { CreateCollectionDialog } from "@/components/collections/CreateCollectionDialog";
import { CollectionPanel } from "@/components/collections/CollectionPanel";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUrlSync } from "@/hooks/useUrlSync";
import { useCollectionStore } from "@/stores/collectionStore";
import { useCollections } from "@/hooks/useCollections";

function App() {
  useKeyboardShortcuts();
  useUrlSync();

  const togglePanel = useCollectionStore((s) => s.togglePanel);
  const focusedArticle = useCollectionStore((s) => s.focusedArticle);
  const { data: collectionsData } = useCollections();
  const collectionCount = collectionsData?.data?.length ?? 0;

  return (
    <div className="min-h-[100dvh] bg-surface-primary font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border-default">
        <div className="px-4 py-3 sm:px-6 sm:py-4 lg:mx-auto lg:max-w-4xl flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
            MedSearch
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-text-tertiary hidden sm:block">
              25,000+ PubMed Articles
            </span>
            <button
              onClick={togglePanel}
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center
                         rounded-xl text-text-secondary hover:text-text-primary
                         hover:bg-surface-secondary active:bg-surface-tertiary transition-colors"
              aria-label="Open collections"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                />
              </svg>
              {collectionCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center
                                 justify-center rounded-full bg-accent text-white text-[10px] font-bold px-1">
                  {collectionCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 sm:px-6 lg:mx-auto lg:max-w-4xl">
        {focusedArticle ? (
          <FocusedArticle article={focusedArticle} />
        ) : (
          <>
            {/* Search */}
            <div className="py-6 sm:py-8">
              <SearchBar />
            </div>

            {/* Filters */}
            <SearchFilters />

            {/* Results */}
            <SearchResults />
          </>
        )}
      </main>

      {/* Collection dialogs (portals) */}
      <SaveToCollectionDialog />
      <CreateCollectionDialog />
      <CollectionPanel />
    </div>
  );
}

export default App;
