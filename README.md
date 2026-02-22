# MedSearch

A medical literature search interface for ~25,000 PubMed articles. Search, filter, and organize research papers with a clean, mobile-first UI.

## Quickstart

```bash
# 1. Start MongoDB + load data
docker compose up -d

# 2. Start backend (port 3000)
cd backend && npm install && npm run start:dev

# 3. Start frontend (port 5173) — in a new terminal
cd frontend && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for MongoDB)
- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm 9+

## Architecture

```
Medical_AI/
├── frontend/          Vite + React 19 + TypeScript + Tailwind CSS v4
├── backend/           NestJS + Mongoose + MongoDB
├── data/              PubMed article datasets (JSONL)
├── scripts/           Python data loader (runs in Docker)
└── docker-compose.yml MongoDB + Mongo Express + data loader
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4, Zustand, TanStack Query v5 |
| Backend | NestJS, Mongoose, class-validator, Swagger |
| Database | MongoDB 7.0 (via Docker) |
| Testing | Vitest |

## Features

### Search
- Full-text search across 25K PubMed articles (MongoDB `$text` with relevance scoring)
- Filter by publication year and SJR quartile
- Paginated results with smooth page transitions
- Debounced search input (300ms)
- URL state sync — shareable search URLs like `?q=diabetes&page=2`

### Article Details
- Expandable article cards with full abstract, authors, journal info
- Color-coded SJR quartile badges (Q1–Q4)
- Direct links to PubMed and DOI
- Keyboard shortcuts: `/` to focus search, `Escape` to clear

### Collections
- Create named collections to organize articles
- Save/remove articles from any collection
- Browse collection contents and view full article details
- Collection count badge in header

### Design
- Mobile-first responsive layout (375px → desktop)
- OpenAI-inspired design system: Inter font, clean typography, generous whitespace
- 44px touch targets, tap feedback, iOS zoom prevention
- Skeleton loaders, empty states, error states with retry

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | [localhost:5173](http://localhost:5173) | React SPA |
| Backend API | [localhost:3000/api](http://localhost:3000/api) | NestJS REST API |
| Swagger Docs | [localhost:3000/api/docs](http://localhost:3000/api/docs) | Interactive API docs |
| Mongo Express | [localhost:8081](http://localhost:8081) | Database admin UI (admin/admin) |
| MongoDB | localhost:27017 | Database (`medical_search`) |

## API Endpoints

### Articles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles/search?q=&page=&limit=&year=&quartile=` | Full-text search with pagination |
| GET | `/api/articles/filters` | Available years and journals for filters |
| GET | `/api/articles/:pmid` | Single article by PMID |

### Collections

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collections` | Create a collection |
| GET | `/api/collections` | List all collections |
| GET | `/api/collections/:id` | Get collection with articles |
| DELETE | `/api/collections/:id` | Delete a collection |
| POST | `/api/collections/:id/articles` | Add article to collection |
| DELETE | `/api/collections/:id/articles/:pmid` | Remove article from collection |

## Running Tests

```bash
cd backend && npm test
```

## Project Documentation

- [TASK.md](./TASK.md) — Original assessment brief
- [DECISION_LOG.md](./DECISION_LOG.md) — Architectural decisions, trade-offs, and time tracking
