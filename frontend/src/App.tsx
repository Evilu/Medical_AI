import { SearchBar } from "@/components/search/SearchBar";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUrlSync } from "@/hooks/useUrlSync";

function App() {
  useKeyboardShortcuts();
  useUrlSync();

  return (
    <div className="min-h-[100dvh] bg-surface-primary font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border-default">
        <div className="px-4 py-3 sm:px-6 sm:py-4 lg:mx-auto lg:max-w-4xl flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
            MedSearch
          </h1>
          <span className="text-xs text-text-tertiary hidden sm:block">
            25,000+ PubMed Articles
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 sm:px-6 lg:mx-auto lg:max-w-4xl">
        {/* Search */}
        <div className="py-6 sm:py-8">
          <SearchBar />
        </div>

        {/* Filters */}
        <SearchFilters />

        {/* Results */}
        <SearchResults />
      </main>
    </div>
  );
}

export default App;
