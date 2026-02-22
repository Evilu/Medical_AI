# Medical Literature Search Assessment

## Time: 3 hours

## Overview

Build a medical literature search interface for ~25,000 PubMed articles. **Focus on creating an exceptional search experience** - we want to see great UX/UI skills and thoughtful design.

---

## AI Tool Usage

**You're encouraged to use AI assistants** (Claude, ChatGPT, Copilot, Cursor, etc.) throughout this assessment.

### Submit These 3 Things:
1. Working code
2. AI conversation history (screenshots or export)
3. Completed `DECISION_LOG.md`

> We care about how you work with AI as much as the result.

---

## Requirements

### Core: Search Experience (Focus Here!)

Build a clean, intuitive search interface:

- **Search bar** with real-time or submit-based search
- **Results display** showing title, authors, journal, year, abstract
- **Article details** - expandable view with full information
- **Loading states** and empty states
- **Responsive design** - works on mobile and desktop
- **Performance** - handles the full 25K dataset smoothly

**Search implementation**: Use any approach you prefer (keyword search, MongoDB text search, full-text indexes, etc.). We care more about UX than the specific technical approach.

### If Time Permits: Collections

Add the ability to save articles to collections:

- Create/delete collections
- Add/remove articles from collections
- View collection contents
- Basic CRUD operations with smooth UX

---

## What We Evaluate

| Focus | Weight |
|-------|--------|
| UX/UI & Design Polish | 45% |
| AI Collaboration | 25% |
| Frontend Code Quality | 20% |
| Backend/Search | 10% |

We prioritize **great user experience over feature completeness**. A polished search interface beats a buggy app with all features.

---

## Tech Stack

**Suggested** (use what you're comfortable with):
- Frontend: React
- Backend: Python/FastAPI or Node/Express
- Database: MongoDB (provided)

Document your choices in `DECISION_LOG.md`.

---

## Getting Started

### 1. Install Docker
For Mac: `brew install --cask docker`

### 2. Start Docker Desktop

### 3. Start MongoDB
```bash
docker compose up
```

This starts MongoDB with ~25K articles loaded at `localhost:27017`.
- Database: `medical_search`
- Collections: `sample_articles` (50 items), `pubmed_articles` (25K items)
- Starts Mongo Express (DB admin UI) at `http://localhost:8081` (admin/admin)
  
### 4. Build Your App
Create your frontend and backend however you prefer. Start with `sample_articles` for quick testing, then switch to the full dataset.

See `data/README.md` for article schema details.

---

## What's Provided

```
├── README.md
├── DECISION_LOG.md          # Fill this in
├── docker-compose.yml       # MongoDB setup
├── data/
    ├── sample_articles.jsonl    # 50 articles
    └── pubmed_articles.jsonl    # 25K articles
```

You create the rest.

---

## Tips

- Use a UI library (Material-UI, Shadcn, etc.) to save time
- Test with sample data first, full dataset second
- Polish the search experience before adding collections
- Mobile responsiveness matters

---

## Questions?

Document assumptions in `DECISION_LOG.md` and proceed.
