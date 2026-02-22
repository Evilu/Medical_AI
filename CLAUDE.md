# Medical Literature Search — Project Orchestrator

You are building a medical literature search interface for ~25,000 PubMed articles. The evaluation weights are: **UX/UI & Design Polish (45%)**, AI Collaboration (25%), Frontend Code Quality (20%), Backend/Search (10%). This means the frontend experience is king — invest most effort there.

## Project Architecture Overview

```
Medical_AI/
├── docker-compose.yml          # MongoDB + Mongo Express + data loader
├── DECISION_LOG.md             # Document all architectural decisions
├── data/
│   ├── sample_articles.jsonl   # 50 sample articles for dev
│   ├── pubmed_articles.jsonl   # ~25K full dataset
│   └── demo_questions.json     # 5 test queries
├── scripts/
│   └── load_data.py            # Python data loader (runs in Docker)
├── frontend/                   # Vite + React SPA
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css           # Tailwind directives + custom styles
│       ├── api/                # Axios API client
│       ├── hooks/              # TanStack Query hooks
│       ├── stores/             # Zustand stores
│       ├── components/         # React components
│       │   ├── layout/
│       │   ├── search/
│       │   ├── articles/
│       │   └── collections/
│       ├── types/              # TypeScript interfaces
│       └── lib/                # Utilities
└── backend/                    # NestJS API
    ├── package.json
    ├── tsconfig.json
    ├── nest-cli.json
    ├── vitest.config.ts
    └── src/
        ├── main.ts
        ├── app.module.ts
        ├── articles/           # Articles module (search, detail)
        │   ├── articles.module.ts
        │   ├── articles.controller.ts
        │   ├── articles.service.ts
        │   ├── dto/
        │   └── schemas/
        └── collections/        # Collections module (if time permits)
```

## Tech Stack Decisions

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend Framework | Vite + React 19 | Fast HMR, lightweight SPA — no SSR needed with a separate backend |
| State Management | Zustand | Lightweight, TypeScript-native, no boilerplate |
| Server State | TanStack Query v5 | Caching, pagination, stale-while-revalidate |
| Styling | Tailwind CSS v4 | Utility-first, OpenAI-inspired design system |
| Backend Framework | NestJS | Modular, decorator-based, enterprise patterns |
| Database | MongoDB 7.0 | Provided via Docker, text search indexes pre-created |
| Testing | Vitest | Fast, ESM-native, works with both FE and BE |
| Containerization | Docker Compose | MongoDB + Mongo Express + data loader provided |

## Article Schema (Ground Truth)

This is the **actual** shape of documents in MongoDB. Every type, component, and query must match this exactly:

```typescript
interface Article {
  _id: string;              // MongoDB ObjectId (as string)
  pmid: string;             // PubMed unique identifier
  title: string;            // Article title
  abstract: string;         // Full abstract text (may be empty string)
  authors: string;          // Comma-separated: "LastName Initials, LastName Initials"
  journal: string;          // Full journal name
  year: number;             // Publication year (e.g. 2019)
  doi: string;              // DOI (may be empty string)
  sjr_quartile: number | null; // Scimago Journal Rank quartile (1-4, or null)
  sjr_rank: number | null;     // Scimago Journal Rank score (or null)
}
```

**Critical notes:**
- `authors` is a **plain string**, NOT an array of objects
- `year` is a **number**, NOT a date string
- There are NO `keywords`, `mesh_terms`, or `publication_types` fields
- `sjr_quartile` and `sjr_rank` can be `null`
- The data loader creates text indexes on `title` + `abstract` only

## Pre-Created Indexes (from load_data.py)

The Python data loader creates these indexes automatically:
- **Text index** on `title` + `abstract` (for `$text` / `$search` queries)
- **Index** on `year` (ascending)
- **Index** on `journal` (ascending)
- **Index** on `pmid` (ascending)

Do NOT create a conflicting text index in the backend schema — MongoDB only allows one text index per collection.

## Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| MongoDB | 27017 | `mongodb://localhost:27017/medical_search` |
| Mongo Express | 8081 | `http://localhost:8081` (admin/admin) |
| NestJS Backend | 3000 | `http://localhost:3000/api` |
| Vite Frontend | 5173 | `http://localhost:5173` |
| Swagger Docs | 3000 | `http://localhost:3000/api/docs` |

The Vite dev server proxies `/api` requests to `http://localhost:3000`.

## Development Workflow

### Phase 1: Infrastructure (30 min)
1. Start Docker: `docker compose up -d`
2. Wait for data loader to finish: `docker compose logs data-loader`
3. Scaffold NestJS backend with MongoDB connection
4. Scaffold Vite + React frontend with Tailwind
5. Verify connectivity with `sample_articles` collection (50 docs)

### Phase 2: Core Search Experience (90 min) — **Primary Focus**
1. Build the search API endpoint using MongoDB `$text` + `$meta: textScore`
2. Create the search UI with OpenAI-inspired design
3. Implement results list with offset-based pagination
4. Add article detail expansion with full abstract
5. Polish loading states (skeleton loaders), empty states, error states
6. Ensure mobile responsiveness at every step

### Phase 3: Collections Feature (30 min) — If Time Permits
1. Collections CRUD API
2. Collection management UI
3. Add/remove articles from collections

### Phase 4: Polish & Documentation (30 min)
1. Complete DECISION_LOG.md
2. Final responsive testing (375px, 768px, 1440px)
3. Performance verification with full 25K dataset

## Key Principles

1. **Mobile-first**: Every component starts at 375px, scales up
2. **OpenAI aesthetic**: Clean, minimal, generous whitespace, refined typography
3. **Performance**: Debounced search (300ms), offset pagination, `.lean()` queries
4. **Type safety**: Shared TypeScript interfaces matching actual MongoDB schema
5. **Error resilience**: Every async operation has loading, error, and empty states

## Pagination Strategy

Use **offset-based pagination** (page + limit + skip), NOT cursor-based:
- Text search results sorted by `$meta: textScore` don't have a stable sort key for cursor pagination
- At 25K documents, `skip()` is fast enough (MongoDB scans the index, not documents)
- Offset pagination allows URL-shareable page numbers and jumping to specific pages

```typescript
// Response shape
{
  data: Article[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

## Available Slash Commands

Use these to get detailed patterns and code snippets for each area:

| Command | What it provides |
|---------|-----------------|
| `/frontend` | React + Vite + Zustand + TanStack Query + Tailwind patterns, component code, mobile responsiveness |
| `/backend` | NestJS modules, MongoDB search service, DTOs, Swagger, API endpoints |
| `/docker` | Docker Compose setup, data loading, Dockerizing services, troubleshooting |
| `/openai-design` | Full Tailwind v4 design system: colors, typography, spacing, component specs |
| `/zustand` | State management patterns, store structure, selectors, anti-patterns |
| `/tanstack` | TanStack Query hooks, query keys, pagination, mutations, optimistic updates |
| `/nestjs` | NestJS architecture, DI, validation, error handling, MongoDB query patterns |
| `/vitest` | Vitest config, unit tests, e2e tests, mock factories, Mongoose mocks |
| `/decision-log` | Pre-filled DECISION_LOG.md template |

Always document decisions in DECISION_LOG.md as you go.
