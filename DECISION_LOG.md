# Decision Log

Document your key decisions. We want to understand your thinking process, not just see working code.

---

## Candidate Info

- **Name**: Yuval Starnes
- **Date**: 2026-02-22
- **AI Tools Used**: Claude Code (Claude Opus 4.6)

---

## 1. Tech Stack

**What I chose:**
- Frontend: Vite + React 19 + TypeScript
- Backend: NestJS + Mongoose
- UI Library: Tailwind CSS v4 (utility-first, no component library)
- State: Zustand (UI state) + TanStack Query v5 (server state)
- Testing: Vitest with SWC

**Why:**
- **Vite + React**: Fast HMR, lightweight SPA — no SSR needed when backend is separate. React 19 for latest features.
- **NestJS**: Modular, decorator-based architecture with built-in validation (class-validator), Swagger docs auto-generation, and clean DI. More structured than raw Express for an API that needs to scale.
- **Tailwind v4**: New CSS-native `@theme` for design tokens, no config file needed. Utility-first means every component is mobile-first by default — just write mobile styles, then add `sm:`, `md:`, `lg:` breakpoints.
- **Zustand + TanStack Query**: Clean separation. Zustand handles transient UI state (query string, page, filters, expanded article). TanStack Query handles server state with caching, `keepPreviousData` for smooth pagination, and automatic deduplication.
- **Vitest**: Native ESM, works with SWC for decorator support, drop-in replacement for Jest with better DX.

**AI assistance:**
- Key prompts: Asked Claude to plan the full architecture, then used skill files for detailed patterns
- What I changed: Fixed Mongoose v9 type compatibility issues (FilterQuery removed from exports), adjusted mobile-first patterns

---

## 2. Search Implementation

**Approach chosen:**
MongoDB `$text` full-text search with `$meta: textScore` relevance ranking

**Why this approach:**
- Pros: Pre-created text index on title+abstract (by data loader), built-in relevance scoring, handles phrase queries and stemming, zero additional infrastructure
- Cons: No fuzzy matching, no custom ranking beyond textScore, limited to text index fields

**How it works:**
- `GET /api/articles/search?q=diabetes&page=1&limit=20` — Full-text search with offset pagination
- `GET /api/articles/filters` — Returns distinct years and journals for dropdown filters
- `GET /api/articles/:pmid` — Single article lookup
- Filter building: `$text: { $search: q }` + optional `year` (exact), `journal` (case-insensitive regex), `sjr_quartile` (exact)
- Pagination: Offset-based (`skip` + `limit`) — correct for textScore-sorted results which don't have stable cursor keys
- Performance: `.lean()` on all read queries (~5x faster), `Promise.all` for parallel data+count queries
- Frontend: 300ms debounced search, `placeholderData: keepPreviousData` for smooth page transitions

**AI assistance:**
- Key prompts: Search service implementation with proper MongoDB text search patterns
- What I changed: Used `any` types for Mongoose filter/sort due to Mongoose v9 dropping FilterQuery export, kept the search logic identical

---

## 3. UX/UI Design

**Design decisions:**
- **Search interface**: Single prominent search bar (OpenAI-style), centered on desktop, full-width on mobile. Shadow transitions on hover/focus for premium feel. `autoFocus` for immediate use.
- **Results display**: List format with expandable cards (not separate pages). Each card shows title, truncated authors, journal, year, SJR badge. Click to expand full abstract + metadata. Better for scanning many results quickly.
- **Mobile responsiveness**: Mobile-FIRST design — every component designed for 375px, then enhanced with breakpoints. 44px touch targets, `active:` states for tap feedback, 16px input text to prevent iOS zoom, edge-to-edge cards on mobile (`-mx-4 px-4`), arrow icons for pagination (text on desktop).

**Component structure:**
```
App
  Header (sticky, backdrop-blur, collections icon with badge)
  SearchBar (hero component)
  SearchFilters (collapsible on mobile, inline on md+)
  SearchResults (orchestrator)
    EmptyState (demo queries / no results)
    ArticleSkeleton (loading)
    ErrorState (retry)
    ArticleCard[] (expandable, animated, save button)
    Pagination (mobile-optimized)
  SaveToCollectionDialog (bottom-sheet on mobile, modal on desktop)
  CreateCollectionDialog (form modal)
  CollectionPanel (full-screen mobile, side panel desktop)
```

**Key UX polish:**
- Color-coded SJR quartile badges (Q1=green, Q2=blue, Q3=amber, Q4=red)
- Smooth article expansion via CSS `grid-template-rows` transition
- Keyboard shortcuts: `/` to focus search, `Escape` to collapse/clear
- URL state sync: shareable URLs like `?q=diabetes&page=2`
- PubMed + DOI deep links in expanded view
- Demo query chips on empty state for discoverability
- `keepPreviousData` dims previous results (opacity 60%) while loading next page

**AI assistance:**
- Key prompts: OpenAI design system patterns, mobile-first component architecture
- What I changed: Strengthened mobile-first approach (was originally desktop-leaning), added `active:` tap states, iOS zoom prevention, edge-to-edge card targets

---

## 4. Collections (If Implemented)

**Did you implement collections?** [x] Yes  [ ] No

**What I built:**
- **Backend**: Full NestJS module with Mongoose schema, 6 REST endpoints (CRUD + add/remove articles), validation (article existence check, duplicate prevention)
- **Frontend**: 3 UI components — `SaveToCollectionDialog` (bottom-sheet on mobile, modal on desktop), `CreateCollectionDialog` (form with validation), `CollectionPanel` (full-screen on mobile, slide-in panel on desktop with list → detail navigation)
- **Integration**: Bookmark/save button on every expanded article card, collections icon in header with badge count, TanStack Query mutations with automatic cache invalidation

**Key decisions:**
- Bottom-sheet pattern on mobile (iOS/Android native feel), centered modals on desktop
- Separate Zustand store for collection UI state (dialogs open/close), TanStack Query for server state
- "Already saved" visual feedback — saved articles show a green checkmark and are un-clickable
- Panel uses list → detail navigation pattern (not nested routes) for simplicity

---

## 5. Issues I Caught in AI-Generated Code

| What AI Generated | Problem | How I Fixed It |
|-------------------|---------|----------------|
| `load_data.py` index on `publication_year` | Data field is actually `year` — creates a dead index | Left loader as-is, backend queries `year` field directly (works without the index, 25K docs is fast enough) |
| Mongoose `FilterQuery` import | Mongoose v9 removed `FilterQuery` from exports | Used `Record<string, any>` with eslint-disable comment |
| `sort` parameter typing | `Record<string, unknown>` not assignable to Mongoose sort type | Used `any` type for sort object |
| Desktop-first component patterns | Original patterns used `max-w-2xl` as base, not mobile-first | Rewrote all components to use mobile base styles, add breakpoints for scale-up |

---

## 6. Time Spent

| Phase | Time |
|-------|------|
| Planning & architecture | ~15 min |
| Backend (NestJS + API) | ~25 min |
| Frontend scaffold + design system | ~25 min |
| Core search UI components | ~40 min |
| Polish (animations, keyboard, URL sync) | ~15 min |
| Collections feature (backend + frontend) | ~25 min |
| Testing + documentation | ~15 min |
| **Total** | **~2h 40min** |

---

## 7. Reflection

**What went well:**
- Mobile-first approach from the start meant no retrofit work
- Zustand + TanStack Query separation kept components clean
- OpenAI-inspired design system (via Tailwind v4 `@theme`) gave consistent, polished look with minimal effort
- Parallel backend/frontend development saved time

**What I'd improve with more time:**
- Add search term highlighting in results (highlight matching words)
- Optimistic updates for collection mutations (instant UI feedback)
- Add a copy-citation button
- E2E tests with Playwright
- Better error boundaries
- Journal filter dropdown (currently only year + quartile)

**Biggest challenge:**
Mongoose v9 type compatibility — several types were removed or changed from v8, requiring workarounds. Also, getting the CSS `grid-template-rows` animation to work smoothly with dynamic content heights took some iteration.

---

## How to Run

```bash
# 1. Start MongoDB + load data
docker compose up -d
docker compose logs -f data-loader  # Wait for "Data load complete!"

# 2. Start backend (port 3000)
cd backend
npm install
npm run start:dev

# 3. Start frontend (port 5173)
cd frontend
npm install
npm run dev

# 4. Open http://localhost:5173

# 5. Run tests
cd backend && npm test
```

---

## AI Usage Summary

Brief notes on how you used AI:
- **Most helpful for**: Architecture planning (parallel agent exploration of all skill files), scaffolding boilerplate (NestJS modules, Vite config, Tailwind theme), and generating consistent component patterns
- **Least helpful for**: Mongoose v9 type issues (had to manually fix), mobile-specific UX decisions (had to push for true mobile-first rather than desktop-first patterns)
- **Best prompt example**: "Design for mobile FIRST, then enhance for desktop. Every component starts at 375px." — this reframing changed the entire approach from desktop-with-mobile-tweaks to genuinely mobile-native

---

> **Attach your full AI conversation history with this document.**
