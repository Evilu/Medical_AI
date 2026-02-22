---
name: frontend
description: Build the React frontend for the Medical Literature Search application using Vite + React 19, Zustand for state management, TanStack Query for server state, and Tailwind CSS v4 styled after OpenAI's website aesthetic. Use when creating React components, implementing search UI, styling with Tailwind, setting up stores, configuring hooks, building responsive layouts, or creating loading/empty/error states.
user-invocable: true
argument-hint: "[component or feature to build]"
---

# Medical Search Frontend Skill

Build a production-quality React frontend for the medical literature search app. The frontend accounts for **65% of the evaluation** (45% UX/UI + 20% code quality), so this is where you invest the most effort.

## CRITICAL: Mobile-First Design Philosophy

**Design for mobile FIRST, then enhance for desktop.** Responsiveness is the #1 priority.

- Write base styles for mobile (375px), then add `sm:`, `md:`, `lg:` breakpoints to scale up
- Every component MUST be tested at 375px before adding desktop enhancements
- Touch targets: **minimum 44px** on all interactive elements (buttons, links, cards)
- No horizontal scroll at any viewport width
- Safe area padding: `env(safe-area-inset-bottom)` for bottom-nav devices
- Font sizes: minimum `text-sm` (14px), prefer `text-base` (16px) for body text on mobile to prevent iOS zoom
- Inputs must be `text-base` (16px) minimum to prevent iOS auto-zoom on focus
- Scrollable containers need `-webkit-overflow-scrolling: touch`
- Use `dvh` (dynamic viewport height) instead of `vh` where possible for mobile browser chrome handling

## Tech Stack Setup

### Vite + React Project Initialization

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install zustand @tanstack/react-query @tanstack/react-query-devtools axios clsx tailwind-merge
npm install -D tailwindcss @tailwindcss/vite @types/node
```

### Vite Configuration

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

### Tailwind CSS v4 Setup

In `src/index.css`:
```css
@import "tailwindcss";
```

The design system is documented in `references/openai-design-system.md` — read it before writing any styles.

### TypeScript Configuration

Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### Project Structure

```
src/
├── main.tsx                    # Entry — QueryClientProvider + App
├── App.tsx                     # Root layout
├── index.css                   # @import "tailwindcss" + custom CSS vars
├── api/
│   └── articles.ts             # Axios calls: searchArticles, getArticle, getFilters
├── hooks/
│   ├── useArticles.ts          # TanStack Query hooks wrapping api/articles.ts
│   └── useDebounce.ts          # Debounce utility hook
├── stores/
│   ├── searchStore.ts          # Zustand: query, filters, page
│   └── collectionStore.ts      # Zustand: collection UI state (if time permits)
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   ├── search/
│   │   ├── SearchBar.tsx       # Large prominent search input
│   │   ├── SearchResults.tsx   # Results list container
│   │   └── SearchFilters.tsx   # Year, journal, quartile filters
│   ├── articles/
│   │   ├── ArticleCard.tsx     # Single result card
│   │   ├── ArticleDetail.tsx   # Expanded article view
│   │   └── ArticleSkeleton.tsx # Skeleton loader
│   └── collections/
│       ├── CollectionList.tsx
│       └── CollectionDetail.tsx
├── types/
│   └── article.ts              # Article interface, API response types
└── lib/
    └── utils.ts                # cn() helper, formatters
```

## Article Type (Must Match Actual MongoDB Schema)

```typescript
// types/article.ts
export interface Article {
  _id: string;
  pmid: string;
  title: string;
  abstract: string;
  authors: string;             // Comma-separated string: "Smith J, Jones A, Wang L"
  journal: string;
  year: number;                // e.g. 2019
  doi: string;                 // may be empty string
  sjr_quartile: number | null; // 1-4 or null
  sjr_rank: number | null;     // float or null
  score?: number;              // textScore from MongoDB (only on search results)
}

export interface SearchResponse {
  data: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  year?: number;
  journal?: string;
  quartile?: number;
}
```

**Critical**: `authors` is a plain comma-separated string, NOT an array of objects. Parse it for display:
```typescript
function formatAuthors(authors: string, max = 3): string {
  const list = authors.split(", ");
  if (list.length <= max) return authors;
  return list.slice(0, max).join(", ") + " et al.";
}
```

## Core Design Principle: OpenAI Aesthetic + Mobile-First

Read `references/openai-design-system.md` for the full design system. Key points:

- **Colors**: Near-black text (#0d0d0d), white backgrounds, subtle gray borders, single accent (#10a37f)
- **Typography**: Inter or system sans-serif, generous line-height
- **Spacing**: Breathing room — `py-4 sm:py-6 lg:py-8` (scales up), `p-4 sm:p-6` cards
- **Borders**: Hairline borders (`border-gray-200`), rounded corners (`rounded-xl`)
- **Animations**: Subtle `transition-all duration-200`, no flashy effects. Reduce on `prefers-reduced-motion`
- **Mobile-first layout**: Full-width edge-to-edge on mobile, contained `max-w-4xl` on desktop
- **Touch-first interaction**: 44px touch targets, tap-to-expand cards, swipe-friendly spacing

## Component Patterns

### SearchBar — The Hero Component (Mobile-First)

```tsx
import { useSearchStore } from "@/stores/searchStore";

export function SearchBar() {
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);

  return (
    <div className="relative w-full sm:max-w-xl md:max-w-2xl sm:mx-auto">
      <div className="relative flex items-center">
        <svg className="absolute left-3 sm:left-4 h-5 w-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medical literature..."
          data-search-input
          className="w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-white
                     py-3.5 sm:py-4 pl-10 sm:pl-12 pr-10 sm:pr-12
                     text-base text-gray-900 placeholder:text-gray-400
                     shadow-sm transition-shadow duration-200
                     focus:border-gray-300 focus:outline-none focus:ring-0 focus:shadow-md
                     hover:shadow-md"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2 sm:right-3 rounded-full p-2 text-gray-400
                       hover:text-gray-600 hover:bg-gray-100 transition-colors
                       active:bg-gray-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
```

**Mobile notes:**
- `py-3.5` on mobile (comfortable thumb reach), `sm:py-4` on larger screens
- `rounded-xl` on mobile (less extreme rounding on small screens), `sm:rounded-2xl` desktop
- Clear button has `min-h-[44px] min-w-[44px]` for touch target compliance
- `active:bg-gray-200` for tactile feedback on mobile tap
- `text-base` (16px) prevents iOS auto-zoom on input focus
- `autoComplete="off" autoCorrect="off" spellCheck={false}` for cleaner mobile keyboard experience

### ArticleCard — Mobile-First, Scannable, Expandable

```tsx
import { useState } from "react";
import type { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
}

function formatAuthors(authors: string, max = 3): string {
  const list = authors.split(", ");
  if (list.length <= max) return authors;
  return list.slice(0, max).join(", ") + " et al.";
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="group border-b border-gray-100 py-4 sm:py-6 cursor-pointer
                 transition-colors active:bg-gray-50 sm:hover:bg-gray-50/50
                 -mx-4 px-4 sm:mx-0 sm:px-0"
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
    >
      {/* Mobile: stack vertically. Desktop: PMID to the right */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] sm:text-base font-medium text-gray-900 leading-snug line-clamp-2 group-hover:text-gray-700">
            {article.title}
          </h3>

          {/* Meta: wraps naturally on mobile */}
          <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-1 text-[13px] sm:text-sm text-gray-500">
            <span className="truncate max-w-[200px] sm:max-w-[250px]">{formatAuthors(article.authors)}</span>
            <span className="text-gray-300">·</span>
            <span className="font-medium text-gray-600 truncate max-w-[150px] sm:max-w-none">{article.journal}</span>
            <span className="text-gray-300">·</span>
            <span>{article.year}</span>
            {article.sjr_quartile !== null && (
              <>
                <span className="text-gray-300 hidden sm:inline">·</span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Q{article.sjr_quartile}
                </span>
              </>
            )}
          </div>

          {!expanded && article.abstract && (
            <p className="mt-2 sm:mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {article.abstract}
            </p>
          )}
        </div>

        {/* PMID: below title on mobile, right-aligned on desktop */}
        <span className="hidden sm:block shrink-0 text-xs font-mono text-gray-400 mt-1">{article.pmid}</span>
      </div>

      {/* Expanded detail — full width, mobile-optimized spacing */}
      {expanded && (
        <div className="mt-3 sm:mt-4 space-y-3">
          {article.abstract && (
            <div className="rounded-lg sm:rounded-xl bg-gray-50 p-3 sm:p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 sm:mb-2">Abstract</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{article.abstract}</p>
            </div>
          )}

          {/* Action links: stack on mobile, inline on desktop */}
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-sm text-gray-500">
            <span className="font-mono text-xs"><span className="text-gray-400">PMID:</span> {article.pmid}</span>
            {article.doi && (
              <a
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#10a37f] hover:text-[#0d8c6d] active:text-[#0a7a5f] font-medium
                           py-1 min-h-[44px] inline-flex items-center"
              >
                View DOI
              </a>
            )}
            {article.sjr_rank !== null && (
              <span><span className="text-gray-400">SJR:</span> {article.sjr_rank}</span>
            )}
          </div>

          <p className="text-sm text-gray-600 break-words">
            <span className="text-gray-400">Authors:</span> {article.authors}
          </p>
        </div>
      )}
    </article>
  );
}
```

**Mobile-first notes:**
- `-mx-4 px-4 sm:mx-0 sm:px-0` — edge-to-edge tap target on mobile, contained on desktop
- `active:bg-gray-50` — tactile feedback on tap (vs `hover:` which doesn't work on touch)
- `py-4 sm:py-6` — tighter spacing on mobile for more content density
- PMID hidden on mobile (shown in expanded view), visible on desktop sidebar
- Journal name truncated with `max-w-[150px]` on mobile to prevent overflow
- DOI link has `min-h-[44px]` touch target, uses "View DOI" (shorter text for mobile)
- `break-words` on authors to handle long author lists on narrow screens
- `role="button" tabIndex={0} aria-expanded` for accessibility

### Pagination (Mobile-First, Offset-Based)

```tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-0.5 sm:gap-1 py-6 sm:py-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg px-3 py-2.5 sm:py-2 text-sm text-gray-500
                   hover:bg-gray-100 active:bg-gray-200
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                   min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <span className="hidden sm:inline">Previous</span>
        <svg className="sm:hidden h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* On mobile, show fewer page numbers */}
      {getPageRange(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-1 sm:px-2 text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`rounded-lg px-2.5 sm:px-3 py-2.5 sm:py-2 text-sm font-medium transition-colors
                        min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center ${
              p === page
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg px-3 py-2.5 sm:py-2 text-sm text-gray-500
                   hover:bg-gray-100 active:bg-gray-200
                   disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                   min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="sm:hidden h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}

function getPageRange(current: number, total: number): (number | "...")[] {
  // Show fewer pages on mobile (detected via total pages available)
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 2) return [1, 2, 3, "...", total];
  if (current >= total - 1) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
```

**Mobile notes:**
- Prev/Next use arrow icons on mobile (`sm:hidden`), text on desktop (`hidden sm:inline`)
- `min-h-[44px] min-w-[40px]` ensures every button is thumb-friendly
- `active:bg-gray-200` provides tap feedback
- Fewer pages shown in range (5 vs 7) to prevent overflow on small screens
- `gap-0.5` tighter on mobile, `sm:gap-1` on desktop

### Loading Skeletons

```tsx
export function ArticleSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="py-6 border-b border-gray-100">
          <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
          <div className="mt-2 flex gap-3">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-16" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-4 bg-gray-50 rounded w-full" />
            <div className="h-4 bg-gray-50 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Empty State with Demo Queries

```tsx
import { useSearchStore } from "@/stores/searchStore";

const DEMO_QUERIES = [
  "GLP-1 receptor agonists versus SGLT2 inhibitors",
  "lecanemab anti-amyloid Alzheimer's disease",
  "anticoagulation atrial fibrillation bleeding risk",
  "cardiovascular safety immunotherapy cancer",
  "GLP-1 agonists weight loss non-diabetic obese",
];

export function EmptyState({ query }: { query?: string }) {
  const setQuery = useSearchStore((s) => s.setQuery);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="rounded-full bg-gray-50 p-6 mb-6">
        <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      {query ? (
        <>
          <h3 className="text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            No articles matching "{query}". Try adjusting your search terms.
          </p>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900">Search medical literature</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Search across 25,000+ PubMed articles by title or abstract.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
            {DEMO_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600
                           hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

## API Client

```typescript
// api/articles.ts
import axios from "axios";
import type { SearchParams, SearchResponse, Article } from "@/types/article";

const api = axios.create({ baseURL: "/api", timeout: 10000 });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "An error occurred";
    return Promise.reject(new Error(message));
  },
);

export async function searchArticles(params: SearchParams): Promise<SearchResponse> {
  const { data } = await api.get("/articles/search", { params });
  return data;
}

export async function getArticle(pmid: string): Promise<{ data: Article }> {
  const { data } = await api.get(`/articles/${pmid}`);
  return data;
}

export async function getFilters(): Promise<{ data: { years: number[]; journals: string[] } }> {
  const { data } = await api.get("/articles/filters");
  return data;
}
```

## State Management

Read `references/zustand-patterns.md` for full patterns. Key rules:

1. **Zustand for UI state** — search query, filters, page number, expanded article
2. **TanStack Query for server state** — articles, search results, collections
3. **Never duplicate** — server data lives only in TanStack Query cache
4. **Selectors** — always use `useStore((s) => s.field)` to prevent re-renders

## Data Fetching

Read `references/tanstack-query-patterns.md` for full patterns. Key rules:

1. **useQuery** for search results with offset-based pagination (page/limit)
2. **useQuery** for single article detail
3. **useMutation** with optimistic updates for collection operations
4. **`placeholderData: keepPreviousData`** for smooth page transitions
5. **Query key factory** to organize keys and enable targeted invalidation

## Mobile Responsiveness — THE CORE PRINCIPLE

**Responsiveness is the #1 priority.** Every component is designed for mobile FIRST, then enhanced for larger screens. This is critical for the 45% UX/UI grade.

### Breakpoint Strategy (Mobile-First, Scale UP)
- `default` (base): **Mobile (375px+)** — full-width, stacked, touch-optimized. ALL base styles target this.
- `sm` (>= 640px): Large phone — minor spacing tweaks
- `md` (>= 768px): Tablet — inline filters, two-column where useful
- `lg` (>= 1024px): Desktop — `max-w-4xl` centered container, hover states

### Mobile-First CSS Pattern
```tsx
// CORRECT — mobile base, desktop enhancement:
className="px-4 py-3 text-sm   sm:px-6 sm:py-4 sm:text-base   lg:max-w-4xl"

// WRONG — desktop base, mobile override:
className="max-w-4xl px-8 py-6 text-lg   sm:px-4 sm:py-3 sm:text-sm"
```

### Mobile-First Patterns
- **Layout:** full-width edge-to-edge on mobile, `max-w-4xl mx-auto` on `lg:`
- **Search bar:** full-width `w-full` on mobile, `sm:max-w-xl md:max-w-2xl sm:mx-auto` on larger
- **Cards:** `-mx-4 px-4` edge-to-edge tap target on mobile, `sm:mx-0 sm:px-0` contained on desktop
- **Filters:** bottom sheet or collapsible on mobile, inline row on `md:`
- **Touch targets:** `min-h-[44px] min-w-[44px]` on ALL interactive elements
- **Text:** `text-base` (16px) minimum on inputs (prevents iOS zoom), `text-sm` minimum elsewhere
- **Sticky search:** `sticky top-0 z-10 bg-white/80 backdrop-blur-sm`
- **Tap feedback:** `active:bg-gray-50` on mobile (hover doesn't exist on touch)
- **Abstract:** `line-clamp-2` on mobile, `sm:line-clamp-3` on larger
- **Spacing:** `py-4` mobile → `sm:py-6` tablet → `lg:py-8` desktop
- **Safe areas:** `pb-[env(safe-area-inset-bottom)]` for bottom-notch devices

### Layout Example (Mobile-First)

```tsx
<div className="min-h-[100dvh] bg-white">
  {/* Header: compact on mobile, roomier on desktop */}
  <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100">
    <div className="px-4 py-3 sm:px-6 sm:py-4 lg:mx-auto lg:max-w-4xl">
      <SearchBar />
    </div>
  </header>

  {/* Main: full-width on mobile, contained on desktop */}
  <main className="px-4 py-4 sm:px-6 sm:py-6 lg:mx-auto lg:max-w-4xl">
    {/* Result count */}
    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 mb-1 sm:mb-2">
      <span className="text-sm text-gray-500">{total.toLocaleString()} results</span>
    </div>

    {/* Article list — cards go edge-to-edge on mobile via -mx-4 px-4 */}
    <div>
      {articles.map((a) => <ArticleCard key={a._id} article={a} />)}
    </div>

    {/* Pagination — larger touch targets on mobile */}
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
  </main>
</div>
```

### Testing Sizes (Test in this order — mobile FIRST)
1. **iPhone SE: 375px** — smallest target, test first
2. **iPhone 14: 393px** — most common mobile
3. **iPhone 14 Pro Max: 430px** — large phone
4. **iPad: 768px** — tablet breakpoint
5. **Desktop: 1280px+** — full layout

### Mobile UX Checklist
- [ ] No horizontal scroll at any viewport
- [ ] All buttons/links have 44px minimum tap area
- [ ] Input text is 16px+ (no iOS auto-zoom)
- [ ] Text is readable without pinching (14px minimum)
- [ ] Tap feedback (`active:` state) on all interactive elements
- [ ] Cards/results scroll smoothly
- [ ] Search input doesn't lose focus unexpectedly on mobile keyboards
- [ ] Expanded article detail doesn't push content off-screen
- [ ] Pagination is thumb-reachable (centered, not edge-aligned)

## cn() Utility

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

## Dependencies Summary

```bash
# Core
npm install zustand @tanstack/react-query @tanstack/react-query-devtools axios clsx tailwind-merge

# Dev
npm install -D tailwindcss @tailwindcss/vite @types/node
```
