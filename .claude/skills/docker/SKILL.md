---
name: docker
description: Docker and containerization for the Medical Literature Search project. Use when working with Docker Compose, MongoDB containers, data loading, container networking, Dockerizing services, or troubleshooting Docker issues.
user-invocable: true
argument-hint: "[operation like up, down, status, or dockerize]"
---

# Docker Skill for Medical Search

## Provided Docker Setup

The project includes a `docker-compose.yml` that runs:

| Service | Container Name | Port | Purpose |
|---------|---------------|------|---------|
| `mongodb` | medical-search-mongodb | 27017 | MongoDB 7.0 database |
| `mongo-express` | medical-search-mongo-express | 8081 | Web DB admin (admin/admin) |
| `data-loader` | medical-search-data-loader | — | Loads JSONL data + creates indexes, then exits |

### Actual docker-compose.yml

```yaml
services:
  mongodb:
    image: mongo:7.0
    container_name: medical-search-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: medical_search
    tmpfs:
      - /data/db        # Ephemeral — data is wiped on docker compose down
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  mongo-express:
    image: mongo-express:latest
    container_name: medical-search-mongo-express
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin
    depends_on:
      mongodb:
        condition: service_healthy

  data-loader:
    image: python:3.12-slim
    container_name: medical-search-data-loader
    working_dir: /app
    volumes:
      - ./scripts:/app
      - ./data:/data:ro
    environment:
      MONGO_URI: mongodb://mongodb:27017/
    command: >
      sh -c "
        pip install --quiet pymongo &&
        python load_data.py
      "
    depends_on:
      mongodb:
        condition: service_healthy
```

### Key Facts
- **Storage: `tmpfs`** — all data is ephemeral. `docker compose down` wipes everything. Data reloads fresh on `docker compose up`.
- **Database:** `medical_search`
- **Collections:** `sample_articles` (50 docs), `pubmed_articles` (~25K docs)
- **Data loader** (`scripts/load_data.py`) runs once, loads both JSONL files, creates indexes, then exits
- **Pre-created indexes:** text index on `title` + `abstract`, plus indexes on `year`, `journal`, `pmid`

## Quick Start

```bash
# Start everything (MongoDB + Mongo Express + data loader)
docker compose up -d

# Watch data loading progress
docker compose logs -f data-loader

# Check all services are running
docker compose ps

# Stop everything (WIPES ALL DATA due to tmpfs)
docker compose down

# Fresh restart (reload data from scratch)
docker compose down && docker compose up -d
```

## Verify Data Loaded

```bash
# Check document counts
docker exec medical-search-mongodb mongosh medical_search --eval "
  print('sample_articles:', db.sample_articles.countDocuments());
  print('pubmed_articles:', db.pubmed_articles.countDocuments());
"
# Expected: sample_articles: 50, pubmed_articles: ~25000

# Check indexes exist
docker exec medical-search-mongodb mongosh medical_search --eval "
  printjson(db.pubmed_articles.getIndexes());
"

# Test a search query
docker exec medical-search-mongodb mongosh medical_search --eval "
  const results = db.pubmed_articles.find(
    { \$text: { \$search: 'diabetes' } },
    { score: { \$meta: 'textScore' }, title: 1 }
  ).sort({ score: { \$meta: 'textScore' } }).limit(3);
  results.forEach(r => print(r.score.toFixed(2), r.title));
"
```

## MongoDB Connection

### From your app (running on the host machine)
```
mongodb://localhost:27017/medical_search
```

### From another Docker container (same compose network)
```
mongodb://mongodb:27017/medical_search
```

### Mongo Express UI
`http://localhost:8081` — login: `admin` / `admin`

## Dockerizing Backend & Frontend (Optional)

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
RUN addgroup -S app && adduser -S app -G app
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
USER app
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/articles/filters || exit 1
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile (Vite build → Nginx)

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Adding to docker-compose.yml

```yaml
  backend:
    build: ./backend
    container_name: medical-search-backend
    ports:
      - "3000:3000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/medical_search
      FRONTEND_URL: http://localhost:5173
    depends_on:
      mongodb:
        condition: service_healthy
      data-loader:
        condition: service_completed_successfully
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: medical-search-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### .dockerignore (for both frontend/ and backend/)

```
node_modules
.git
*.md
.env*
.vscode
.idea
coverage
dist
*.spec.ts
*.test.ts
Dockerfile
.dockerignore
```

## Docker Best Practices Checklist

- [x] Pinned image versions (`mongo:7.0`, `node:20-alpine` — no `:latest`)
- [x] Health checks on services that accept connections
- [x] `depends_on` with `condition: service_healthy`
- [x] Multi-stage builds (build → production)
- [x] Non-root user in production stage
- [x] `dumb-init` for proper PID 1 signal handling
- [x] `COPY package*.json` before `COPY . .` for layer caching
- [x] `.dockerignore` excluding node_modules, .git, tests
- [x] `npm ci --omit=dev` in production (no devDependencies)
- [x] No secrets in build args or layers

## Troubleshooting

| Issue | Fix |
|-------|-----|
| MongoDB won't start | Check port 27017 not in use: `lsof -i :27017` |
| Data loader fails | Check logs: `docker compose logs data-loader` |
| Data is empty | Expected after `down` (tmpfs). Run: `docker compose down && docker compose up -d` |
| Connection refused from app | Use `localhost:27017` from host, `mongodb:27017` from containers |
| Mongo Express won't load | Wait for MongoDB health check, then try: `docker compose restart mongo-express` |
| Slow first search | Normal — MongoDB builds index on first query. Run a warm-up query. |
| Port conflict | Change port mapping in docker-compose.yml: `"27018:27017"` |
