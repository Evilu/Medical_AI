---
name: decision-log
description: Pre-filled DECISION_LOG.md template for the medical search assessment. Use when starting the project or documenting architectural decisions.
user-invocable: true
---
# DECISION_LOG.md Template

Use this template in the project root. Fill in decisions as you build.

```markdown
# Decision Log — Medical Literature Search

## Candidate Info

- **Name**:
- **Date**:
- **AI Tools Used**:

---

## 1. Tech Stack

**What I chose:**
- Frontend: Vite + React 19, Zustand, TanStack Query v5, Tailwind CSS v4
- Backend: NestJS, Mongoose, class-validator, Swagger
- Testing: Vitest
- Database: MongoDB 7.0 (provided via Docker)

**Why:**
- Vite + React: Fast HMR, lightweight SPA — no SSR needed with a separate NestJS backend
- Zustand: Zero boilerplate, TypeScript-native, clear separation from server state
- TanStack Query: Built-in caching, pagination support, stale-while-revalidate
- Tailwind CSS v4: Utility-first, easy to match OpenAI's design language
- NestJS: Modular architecture, decorators, built-in validation and Swagger
- Vitest: Fast, ESM-native, single runner for frontend and backend

**Alternatives considered:**
- Next.js (unnecessary SSR complexity with a separate backend)
- Redux Toolkit (too much boilerplate for this scope)
- Jest (slower, CJS-first — Vitest is faster)
- Express (less structured than NestJS)

---

## 2. Search Implementation

**Approach:** MongoDB full-text search using `$text` + `$search` with `$meta: textScore` relevance ranking

**Why:**
- Text index on `title` + `abstract` is pre-created by the data loader
- At 25K documents, MongoDB text search is fast and sufficient
- No need for Elasticsearch or a separate search engine

**How it works:**
- `GET /api/articles/search?q=...&page=1&limit=20`
- Builds `$text: { $search: query }` filter
- Projects `score: { $meta: "textScore" }` for relevance
- Offset pagination with `skip()` + `limit()` (correct for textScore sorting)
- Optional filters: `year`, `journal`, `quartile`

**Pagination choice: Offset (skip/limit) over cursor-based:**
- textScore is a computed value, not stable across queries — cursors don't work
- 25K docs is small enough that skip() is fast
- Offset allows shareable page URLs and jumping to any page

---

## 3. UX/UI Design

**Design decisions:**
- Search interface: [How did you design it?]
- Results display: [Cards? List? Why?]
- Mobile responsiveness: [Your approach]

**Component structure:**
[Brief overview of your component hierarchy]

---

## 4. Collections (If Implemented)

**Did you implement collections?** [ ] Yes  [ ] No

If yes:
- Data model: [How did you store collections?]
- UX approach: [How does adding/viewing work?]

---

## 5. Issues Caught in AI-Generated Code

| What AI Generated | Problem | How I Fixed It |
|-------------------|---------|----------------|
| | | |

---

## 6. Time Spent

| Phase | Time |
|-------|------|
| Planning & design | |
| Search implementation | |
| UI polish | |
| Collections (if done) | |
| Testing & fixes | |
| **Total** | |

---

## 7. Reflection

**What went well:**

**What I'd improve with more time:**

**Biggest challenge:**

---

## How to Run

\`\`\`bash
# 1. Start MongoDB
docker compose up -d

# 2. Start backend
cd backend && npm install && npm run start:dev

# 3. Start frontend
cd frontend && npm install && npm run dev

# 4. Open http://localhost:5173
\`\`\`

---

## AI Usage Summary

- Most helpful for:
- Least helpful for:
- Best prompt example:
```
