# Decision Log

Document your key decisions. We want to understand your thinking process, not just see working code.

---

## Candidate Info

- **Name**: Yuval Starnes
- **Date**: 2026-02-22
- **AI Tools Used**: Claude Opus 4.6 via web chat (skill authoring) + Claude Opus 4.6 via Claude Code CLI (implementation)

---

## 0. Pre-Work: Skill Authoring Strategy

**Decision:** Before writing any application code, I used a separate Claude Opus 4.6 extended web chat session to generate a complete `.claude/skills/` directory — standalone architecture reference documents for each layer of the system.

**Why a separate session (not Claude Code):**
- **Clean context separation** — the skill authoring prompt was a dense, multi-file generation task (~11 files). Running it in a separate web chat kept the Claude Code implementation session's context window entirely free for actual coding.
- **Skills as durable artifacts** — by generating them outside the codebase, I could review, edit, and curate the output before feeding it into Claude Code. The skills became a contract, not throwaway chat context.
- **Reusability** — the skills can be reused across sessions. If Claude Code runs out of context (which it did), a new session reads the skills and is immediately productive.

**Skills created and their rationale:**

| Skill | What it encodes | Why it exists |
|-------|----------------|---------------|
| `project-orchestrator` (became `CLAUDE.md`) | Master entry point: architecture overview, development phases, evaluation weights, article schema, port map, slash commands | Gives Claude Code full project context on session start — no cold-start exploration needed |
| `frontend/SKILL.md` | React 19 + Vite + Zustand + TanStack Query + Tailwind v4 patterns, component code examples, mobile-first rules | Frontend is 45% of the grade — this skill encodes the OpenAI aesthetic, state management boundaries, and mobile-first patterns so every generated component is consistent |
| `openai-design` | Full Tailwind v4 design system: color tokens, typography, shadows, animations, spacing | Ensures visual consistency without a component library — the design system IS the skill file |
| `zustand-patterns` | Store structure, selector patterns, anti-patterns, what belongs in Zustand vs TanStack Query | Prevents the common mistake of duplicating server state in Zustand |
| `tanstack-query-patterns` | Query key factories, pagination hooks, mutation patterns, `keepPreviousData` | Encodes the exact caching/pagination strategy so generated hooks are correct first time |
| `backend/SKILL.md` | NestJS modules, MongoDB search service, DTOs, Swagger, API endpoints | Ensures controller → service layering, proper validation, and consistent response shapes |
| `nestjs-patterns` | NestJS architecture reference: DI, validation pipes, exception filters | Quick-reference for NestJS conventions without Claude having to infer them |
| `vitest-patterns` | Vitest config, SWC plugin for decorators, Mongoose model mocking | Vitest with NestJS decorators requires specific SWC setup — this skill captures it |
| `docker/SKILL.md` | Docker Compose management, data loading, troubleshooting | Documents the existing infrastructure so Claude never tries to modify the provided Docker setup |

**Manual proofreading and editing:**

After Claude generated the 9 skill files, I manually reviewed and edited every one before importing them into the project. This wasn't a "generate and ship" workflow — it was "generate a first draft, then apply my own engineering judgment." Specific edits I made:

- **Adapted Next.js SSR → Vite + React SPA** — the original prompt specified Next.js App Router with SSR, but for a 3h assessment with a separate backend, a client SPA is faster to build and simpler to reason about. No SSR needed when the API is on a different port. I rewrote the frontend skill accordingly.
- **Changed cursor-based → offset-based pagination** — the generated backend skill specified cursor-based pagination, but MongoDB `$text` search results sorted by `$meta: textScore` don't have a stable cursor key. Offset pagination is correct here. I caught this because I understand how text search scoring works.
- **Rewrote mobile-first patterns** — during implementation, the generated frontend patterns were desktop-first (setting `max-w-2xl` as base, then adjusting down). I heavily rewrote the mobile responsiveness section to be genuinely mobile-first: base styles target 375px, then scale UP with `sm:`, `md:`, `lg:`.
- **Fixed Tailwind v4 syntax** — the generated design skill used Tailwind v3 config patterns (`tailwind.config.js`). Tailwind v4 uses CSS-native `@theme` blocks. I updated the skill to match.

**Why custom skills matter — not generic ones from GitHub:**

1. **I made the decisions first, then encoded them.** The skills didn't decide to use Zustand over Redux, or offset pagination over cursor-based, or the OpenAI design language. I did. The skills are a delivery mechanism for decisions I already made. A generic GitHub skill doesn't know my schema has `authors` as a plain string (not an array of objects), or that MongoDB only allows one text index per collection and the data loader already creates it. Mine does — because I wrote it from my understanding of this specific problem.

3. **Generic skills produce generic output — custom skills produce opinionated output.** Anyone can grab a "NestJS starter" skill from GitHub. But it won't know that my data loader already creates text indexes (so the backend schema must NOT create a conflicting one), that my API response shape needs `{ data, meta: { total, page, limit, totalPages } }`, or that my frontend needs 44px touch targets because UX/UI is 45% of the evaluation weight. Custom skills eliminate the gap between "generically correct" and "correct for this specific system." That gap is where bugs live.

4. **I'm managing AI the way I'd manage a developer.** The skill files are a briefing packet. I'm scoping work, setting constraints, preventing known mistakes (like duplicating server state in Zustand, or creating a second text index), and establishing patterns. If someone asked "how do you work with junior developers?" this is the same answer — clear specs, guardrails on common pitfalls, and room to execute within defined boundaries.

5. **I can identify when the skills are wrong.** This is the critical differentiator. When the generated skill said to use `FilterQuery` from Mongoose, and Mongoose v9 had removed that export, I caught it because I wrote the skill from understanding — not blind trust. When the mobile patterns were desktop-first, I caught it because I know what 44px touch targets look like on a 375px screen. Someone importing a random GitHub skill wouldn't know what's outdated or mismatched. I anticipated failure modes (like the Docker troubleshooting skill) because I've hit them before.

**AI assistance:**
- Key prompt: Dense architecture specification with monorepo layout, SSR strategy, constraints, and per-skill coverage requirements (see full prompt in `CONVERSATION.md` Part 1)

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
| Pre-work: skill authoring (separate Claude web session) | ~20 min |
| Planning & architecture (Claude Code) | ~15 min |
| Backend (NestJS + API) | ~25 min |
| Frontend scaffold + design system | ~25 min |
| Core search UI components | ~40 min |
| Polish (animations, keyboard, URL sync) | ~15 min |
| Collections feature (backend + frontend) | ~25 min |
| Testing + documentation | ~15 min |
| **Total** | **~3h** |

---

## 7. Reflection

**What went well:**
- **Two-phase AI strategy** — generating skills separately then implementing with Claude Code gave the best of both worlds: curated architecture docs + hands-on coding agent. When context ran out, the new session was productive immediately because the skills persisted on disk.
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

**Two-phase AI workflow:**
1. **Skill authoring (Claude Opus 4.6 web chat)** — Generated 11 architecture reference files in a separate session with full context isolation. This gave Claude Code a "team knowledge base" to work from, rather than relying on in-context instructions that get lost as the conversation grows.
2. **Implementation (Claude Opus 4.6 via Claude Code CLI)** — Built the entire app guided by the skills. When context ran out mid-session, the new session read the skills and resumed seamlessly.

**Most helpful for:** Architecture planning (skill files eliminated ambiguity), scaffolding boilerplate (NestJS modules, Vite config, Tailwind theme), and generating consistent component patterns that matched the design system
**Best prompt example:** The dense skill-authoring prompt (see `CONVERSATION.md` Part 1) — a single prompt that produced 11 consistent reference documents covering every layer of the stack

---

> **Attach your full AI conversation history with this document.**
