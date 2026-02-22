# Medical Search — Claude Code Skills

A set of 4 interconnected Claude Code skills for building the Medical Literature Search assessment project.

## Skills Overview

```
skl/
├── SKILL.md                           # Master orchestrator — read first
├── openai-design-system.md            # Full Tailwind v4 design system
├── zustand-patterns.md                # State management patterns
├── tanstack-query-patterns.md         # Data fetching, caching, pagination
├── nestjs-patterns.md                 # Backend architecture best practices
├── vitest-patterns.md                 # Testing setup & patterns
├── decision-log-template.md           # Pre-filled DECISION_LOG template
└── mnt/user-data/outputs/medical-search-skills/
    ├── frontend/SKILL.md              # Frontend skill (React + Vite + Tailwind)
    ├── backend/SKILL.md               # Backend skill (NestJS + MongoDB)
    └── docker/SKILL.md                # Docker skill (Compose + MongoDB)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19, Zustand, TanStack Query v5, Tailwind CSS v4 |
| Backend | NestJS, Mongoose, class-validator, Swagger |
| Database | MongoDB 7.0 (Docker) |
| Testing | Vitest |
| Design | OpenAI-inspired (clean, minimal, generous whitespace) |

## Article Schema (Ground Truth)

All skills use this exact schema matching `data/sample_articles.jsonl`:

```typescript
interface Article {
  _id: string;
  pmid: string;             // "31852920"
  title: string;
  abstract: string;         // may be empty
  authors: string;          // comma-separated: "Smith J, Jones A"
  journal: string;
  year: number;             // 2019
  doi: string;              // may be empty
  sjr_quartile: number | null;  // 1-4 or null
  sjr_rank: number | null;      // float or null
}
```

## Key Design Decisions

- **Vite + React** (NOT Next.js) — separate SPA, NestJS handles the backend
- **Offset pagination** (NOT cursor-based) — textScore sorting isn't compatible with cursors
- **Mobile-first** — every component starts at 375px, scales up
- **OpenAI aesthetic** — near-black text, white backgrounds, subtle borders, single accent
- **Zustand for UI state, TanStack Query for server state** — clear separation
- **MongoDB text search** with pre-created indexes — sufficient for 25K articles
- **Vitest over Jest** — faster, ESM-native, single runner for FE and BE

## Ports

| Service | Port |
|---------|------|
| MongoDB | 27017 |
| Mongo Express | 8081 |
| NestJS Backend | 3000 |
| Vite Frontend | 5173 |
