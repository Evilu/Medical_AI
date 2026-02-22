---
name: vitest
description: Vitest testing patterns for NestJS backend. Use when writing unit tests, integration tests, e2e tests, mocking Mongoose models, creating test factories, or configuring Vitest with SWC.
user-invocable: true
---
# Vitest Patterns for NestJS

## Table of Contents
1. [Setup](#setup)
2. [Configuration](#configuration)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [Testing Patterns](#testing-patterns)

---

## Setup

### Install Dependencies

```bash
npm install -D vitest @vitest/coverage-v8 unplugin-swc @swc/core
```

### Remove Jest

```bash
npm uninstall jest @types/jest ts-jest
```

Remove from `package.json`: the `jest` config section and jest-related scripts.

Keep `@nestjs/testing` — it's framework-agnostic and works with Vitest.

## Configuration

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
    include: ["**/*.spec.ts", "**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/main.ts", "src/**/*.module.ts", "src/**/*.schema.ts"],
    },
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    swc.vite({ module: { type: "es6" } }),
  ],
});
```

### Package.json scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "vitest run --config vitest.e2e.config.ts"
  }
}
```

### tsconfig.json addition

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

## Unit Tests

### Service Unit Test Pattern

```typescript
// articles/articles.service.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { Article } from "./schemas/article.schema";

describe("ArticlesService", () => {
  let service: ArticlesService;
  let mockArticleModel: Record<string, unknown>;

  const mockArticle = {
    _id: "507f1f77bcf86cd799439011",
    pmid: "31852920",
    title: "Efficacy and safety of GLP-1 receptor agonists",
    abstract: "GLP-1 receptor agonists and SGLT2 inhibitors have been associated...",
    authors: "Castellana M, Cignarelli A, Brescia F, Perrini S",
    journal: "Scientific reports",
    year: 2019,
    doi: "10.1038/s41598-019-55524-w",
    sjr_quartile: null,
    sjr_rank: null,
  };

  beforeEach(async () => {
    const createChainMock = (resolvedValue: unknown) => {
      const chain: Record<string, unknown> = {};
      chain.find = vi.fn().mockReturnValue(chain);
      chain.findOne = vi.fn().mockReturnValue(chain);
      chain.sort = vi.fn().mockReturnValue(chain);
      chain.skip = vi.fn().mockReturnValue(chain);
      chain.limit = vi.fn().mockReturnValue(chain);
      chain.lean = vi.fn().mockReturnValue(chain);
      chain.exec = vi.fn().mockResolvedValue(resolvedValue);
      return chain;
    };

    mockArticleModel = {
      find: vi.fn().mockReturnValue(createChainMock([mockArticle])),
      findOne: vi.fn().mockReturnValue(createChainMock(mockArticle)),
      countDocuments: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(1),
      }),
      distinct: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        { provide: getModelToken(Article.name), useValue: mockArticleModel },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe("search", () => {
    it("should search articles with text query", async () => {
      const result = await service.search({ q: "diabetes", page: 1, limit: 20 });

      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ $text: { $search: "diabetes" } }),
        expect.objectContaining({ score: { $meta: "textScore" } }),
      );
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("meta");
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it("should apply year filter", async () => {
      await service.search({ q: "test", year: 2020 });

      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2020 }),
        expect.any(Object),
      );
    });

    it("should apply journal filter with case-insensitive regex", async () => {
      await service.search({ q: "test", journal: "Nature" });

      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          journal: { $regex: "Nature", $options: "i" },
        }),
        expect.any(Object),
      );
    });

    it("should apply quartile filter", async () => {
      await service.search({ q: "test", quartile: 1 });

      expect(mockArticleModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ sjr_quartile: 1 }),
        expect.any(Object),
      );
    });

    it("should calculate correct pagination meta", async () => {
      mockArticleModel.countDocuments = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(100),
      });

      const result = await service.search({ q: "test", page: 3, limit: 20 });
      expect(result.meta).toEqual({
        total: 100,
        page: 3,
        limit: 20,
        totalPages: 5,
      });
    });
  });

  describe("findByPmid", () => {
    it("should return an article by PMID", async () => {
      const result = await service.findByPmid("31852920");
      expect(result.data.title).toContain("GLP-1");
    });

    it("should throw NotFoundException for unknown PMID", async () => {
      const chain: Record<string, unknown> = {};
      chain.lean = vi.fn().mockReturnValue(chain);
      chain.exec = vi.fn().mockResolvedValue(null);
      mockArticleModel.findOne = vi.fn().mockReturnValue(chain);

      await expect(service.findByPmid("99999999")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getFilters", () => {
    it("should return years and journals", async () => {
      mockArticleModel.distinct = vi.fn()
        .mockReturnValueOnce({ exec: vi.fn().mockResolvedValue([2019, 2020, 2021]) })
        .mockReturnValueOnce({ exec: vi.fn().mockResolvedValue(["Nature", "Science"]) });

      const result = await service.getFilters();
      expect(result.data).toHaveProperty("years");
      expect(result.data).toHaveProperty("journals");
    });
  });
});
```

### Controller Unit Test Pattern

```typescript
// articles/articles.controller.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";

describe("ArticlesController", () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockSearchResult = {
    data: [{ _id: "1", pmid: "123", title: "Test", authors: "Smith J", journal: "Nature", year: 2020, abstract: "", doi: "", sjr_quartile: null, sjr_rank: null }],
    meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: {
            search: vi.fn().mockResolvedValue(mockSearchResult),
            findByPmid: vi.fn().mockResolvedValue({ data: mockSearchResult.data[0] }),
            getFilters: vi.fn().mockResolvedValue({ data: { years: [], journals: [] } }),
          },
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  it("should call service.search with correct dto", async () => {
    const dto = { q: "diabetes", page: 1, limit: 20 };
    await controller.search(dto);
    expect(service.search).toHaveBeenCalledWith(dto);
  });

  it("should call service.findByPmid with correct pmid", async () => {
    await controller.findByPmid("31852920");
    expect(service.findByPmid).toHaveBeenCalledWith("31852920");
  });

  it("should call service.getFilters", async () => {
    await controller.getFilters();
    expect(service.getFilters).toHaveBeenCalled();
  });
});
```

## Integration Tests

### E2E Test with Real Database

```typescript
// test/articles.e2e.spec.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Articles (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/articles/search", () => {
    it("should return search results with meta", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/articles/search")
        .query({ q: "diabetes" })
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("meta");
      expect(response.body.meta).toHaveProperty("total");
      expect(response.body.meta).toHaveProperty("page");
      expect(response.body.meta).toHaveProperty("totalPages");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/articles/search")
        .query({ q: "cancer", limit: 5 })
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should validate limit max", async () => {
      await request(app.getHttpServer())
        .get("/api/articles/search")
        .query({ q: "test", limit: 500 })
        .expect(400);
    });
  });

  describe("GET /api/articles/:pmid", () => {
    it("should return 404 for unknown PMID", async () => {
      await request(app.getHttpServer())
        .get("/api/articles/00000000")
        .expect(404);
    });
  });

  describe("GET /api/articles/filters", () => {
    it("should return years and journals", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/articles/filters")
        .expect(200);

      expect(response.body.data).toHaveProperty("years");
      expect(response.body.data).toHaveProperty("journals");
    });
  });
});
```

## Testing Patterns

### Mock Factory

```typescript
// test/factories.ts
export const createMockArticle = (overrides: Record<string, unknown> = {}) => ({
  _id: "507f1f77bcf86cd799439011",
  pmid: "31852920",
  title: "Default Test Article",
  abstract: "Default abstract text about medical research.",
  authors: "Doe J, Smith A, Wang L",
  journal: "Test Journal",
  year: 2023,
  doi: "10.1234/test",
  sjr_quartile: 1,
  sjr_rank: 2.5,
  ...overrides,
});

export const createMockCollection = (overrides: Record<string, unknown> = {}) => ({
  _id: "507f1f77bcf86cd799439012",
  name: "Test Collection",
  description: "",
  articlePmids: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});
```

### Mongoose Model Mock Helper

```typescript
// test/helpers.ts
import { vi } from "vitest";

export function createMongooseModelMock(defaultResult: unknown = null) {
  const createChain = (result: unknown) => {
    const chain: Record<string, unknown> = {};
    ["find", "findOne", "select", "sort", "skip", "limit", "lean", "populate"].forEach((m) => {
      chain[m] = vi.fn().mockReturnValue(chain);
    });
    chain.exec = vi.fn().mockResolvedValue(result);
    return chain;
  };

  return {
    find: vi.fn().mockReturnValue(createChain(defaultResult ?? [])),
    findOne: vi.fn().mockReturnValue(createChain(defaultResult)),
    findById: vi.fn().mockReturnValue(createChain(defaultResult)),
    findByIdAndUpdate: vi.fn().mockReturnValue(createChain(defaultResult)),
    findByIdAndDelete: vi.fn().mockReturnValue(createChain(defaultResult)),
    countDocuments: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(0) }),
    distinct: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }),
    create: vi.fn().mockResolvedValue(defaultResult),
  };
}
```

### Testing Checklist

**Unit tests (always write these):**
- [ ] Service: search happy path + each filter + pagination math
- [ ] Service: findByPmid happy + not found
- [ ] Service: getFilters returns years/journals
- [ ] Controller: delegates to service correctly

**Integration tests (if time allows):**
- [ ] Search endpoint returns expected shape
- [ ] Validation rejects bad input (limit > 100, invalid quartile)
- [ ] 404 for missing PMID

**What NOT to test:**
- Mongoose schema definitions
- Module imports/exports
- NestJS framework internals
