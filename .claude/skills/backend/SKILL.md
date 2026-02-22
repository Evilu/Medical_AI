---
name: backend
description: Build the NestJS backend API for the Medical Literature Search application with MongoDB, Vitest testing, Swagger docs, and production best practices. Use when creating API endpoints, NestJS modules, MongoDB queries, DTOs, validation, error handling, or search implementation.
user-invocable: true
argument-hint: "[module or endpoint to build]"
---

# Medical Search Backend Skill

Build a clean, well-structured NestJS API for the medical literature search. Backend is only 10% of the evaluation, so keep it functional and well-organized without over-engineering.

## Project Setup

```bash
npx @nestjs/cli new backend --package-manager npm
cd backend
npm install @nestjs/mongoose mongoose @nestjs/config @nestjs/swagger class-validator class-transformer
npm install -D vitest @vitest/coverage-v8 unplugin-swc @swc/core
```

### Replace Jest with Vitest

Remove Jest dependencies and configure Vitest. See `references/vitest-patterns.md` for complete setup.

## Architecture

```
backend/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── vitest.config.ts
├── src/
│   ├── main.ts                      # Bootstrap: CORS, validation pipe, Swagger
│   ├── app.module.ts                # Root module
│   ├── articles/
│   │   ├── articles.module.ts
│   │   ├── articles.controller.ts   # GET /articles/search, GET /articles/:pmid, GET /articles/filters
│   │   ├── articles.service.ts      # Business logic + MongoDB queries
│   │   ├── articles.controller.spec.ts
│   │   ├── articles.service.spec.ts
│   │   ├── dto/
│   │   │   ├── search-articles.dto.ts
│   │   │   └── article-response.dto.ts
│   │   └── schemas/
│   │       └── article.schema.ts
│   └── collections/                 # If time permits
│       ├── collections.module.ts
│       ├── collections.controller.ts
│       ├── collections.service.ts
│       ├── dto/
│       │   └── create-collection.dto.ts
│       └── schemas/
│           └── collection.schema.ts
└── test/
    └── app.e2e-spec.ts
```

## Ports & URLs

- Backend listens on **port 3000**
- API prefix: `/api`
- Swagger docs: `/api/docs`
- Frontend (Vite) on port 5173, proxies `/api` → `http://localhost:3000`

## Main Bootstrap

```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("Medical Literature Search API")
    .setDescription("Search ~25,000 PubMed articles")
    .setVersion("1.0")
    .build();
  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config));

  await app.listen(3000);
}
bootstrap();
```

## App Module

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ArticlesModule } from "./articles/articles.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || "mongodb://localhost:27017/medical_search",
    ),
    ArticlesModule,
  ],
})
export class AppModule {}
```

## Article Schema (Must Match Actual Data)

The data loader (`load_data.py`) already creates text indexes on `title` + `abstract`, plus indexes on `year`, `journal`, and `pmid`. Do **NOT** create a conflicting text index in the schema — MongoDB allows only one text index per collection.

```typescript
// articles/schemas/article.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ collection: "pubmed_articles" })
export class Article {
  @Prop({ required: true })
  pmid: string;

  @Prop({ required: true })
  title: string;

  @Prop({ default: "" })
  abstract: string;

  @Prop({ default: "" })
  authors: string;       // Comma-separated: "Smith J, Jones A, Wang L"

  @Prop({ default: "" })
  journal: string;

  @Prop()
  year: number;

  @Prop({ default: "" })
  doi: string;

  @Prop({ type: Number, default: null })
  sjr_quartile: number | null;

  @Prop({ type: Number, default: null })
  sjr_rank: number | null;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
// NOTE: Do NOT add a text index here — it's already created by load_data.py
```

## DTOs

```typescript
// articles/dto/search-articles.dto.ts
import { IsOptional, IsString, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SearchArticlesDto {
  @ApiProperty({ description: "Search query for full-text search" })
  @IsString()
  q: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: "Filter by publication year" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ description: "Filter by journal name (partial match)" })
  @IsOptional()
  @IsString()
  journal?: string;

  @ApiPropertyOptional({ description: "Filter by SJR quartile (1-4)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  quartile?: number;
}
```

## Controller

```typescript
// articles/articles.controller.ts
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ArticlesService } from "./articles.service";
import { SearchArticlesDto } from "./dto/search-articles.dto";

@ApiTags("articles")
@Controller("articles")
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get("search")
  @ApiOperation({ summary: "Search articles by full-text query" })
  search(@Query() dto: SearchArticlesDto) {
    return this.articlesService.search(dto);
  }

  @Get("filters")
  @ApiOperation({ summary: "Get available filter values (years, journals)" })
  getFilters() {
    return this.articlesService.getFilters();
  }

  @Get(":pmid")
  @ApiOperation({ summary: "Get a single article by PMID" })
  findByPmid(@Param("pmid") pmid: string) {
    return this.articlesService.findByPmid(pmid);
  }
}
```

## Service — Search Implementation

Uses offset-based pagination (page + limit + skip). This is correct for text search results sorted by `$meta: textScore`, where cursor-based pagination doesn't work because the sort key is a computed score.

```typescript
// articles/articles.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { Article, ArticleDocument } from "./schemas/article.schema";
import { SearchArticlesDto } from "./dto/search-articles.dto";

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async search(dto: SearchArticlesDto) {
    const { q, page = 1, limit = 20, year, journal, quartile } = dto;

    const filter: FilterQuery<ArticleDocument> = {};
    if (q) {
      filter.$text = { $search: q };
    }
    if (year) filter.year = year;
    if (journal) filter.journal = { $regex: journal, $options: "i" };
    if (quartile) filter.sjr_quartile = quartile;

    const projection = q ? { score: { $meta: "textScore" } } : {};
    const sort: Record<string, unknown> = q
      ? { score: { $meta: "textScore" } }
      : { year: -1 };

    const [data, total] = await Promise.all([
      this.articleModel
        .find(filter, projection)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.articleModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByPmid(pmid: string) {
    const article = await this.articleModel
      .findOne({ pmid })
      .lean()
      .exec();

    if (!article) {
      throw new NotFoundException(`Article with PMID "${pmid}" not found`);
    }

    return { data: article };
  }

  async getFilters() {
    const [years, journals] = await Promise.all([
      this.articleModel.distinct("year").exec(),
      this.articleModel.distinct("journal").exec(),
    ]);

    return {
      data: {
        years: (years as number[]).sort((a, b) => b - a),
        journals: (journals as string[]).sort(),
      },
    };
  }
}
```

## Module

```typescript
// articles/articles.module.ts
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";
import { Article, ArticleSchema } from "./schemas/article.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles/search?q=...&page=1&limit=20` | Full-text search with filters |
| GET | `/api/articles/filters` | Available years and journals for filter dropdowns |
| GET | `/api/articles/:pmid` | Single article by PMID |

### Response Format

All endpoints return a consistent shape:

```json
{
  "data": [...],
  "meta": { "total": 150, "page": 1, "limit": 20, "totalPages": 8 }
}
```

Single item:
```json
{
  "data": { "pmid": "31852920", "title": "...", ... }
}
```

## Collections Module (If Time Permits)

```typescript
// collections/schemas/collection.schema.ts
@Schema({ timestamps: true, collection: "collections" })
export class Collection {
  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ type: [String], default: [] })
  articlePmids: string[];  // Store PMIDs, not ObjectIds
}

// Endpoints:
// POST   /api/collections              — Create collection
// GET    /api/collections              — List all collections
// GET    /api/collections/:id          — Get collection with its articles
// DELETE /api/collections/:id          — Delete collection
// POST   /api/collections/:id/articles — Add article (body: { pmid: string })
// DELETE /api/collections/:id/articles/:pmid — Remove article
```

## Error Handling

Use NestJS built-in exceptions — keep it simple:

```typescript
throw new NotFoundException(`Article with PMID "${pmid}" not found`);
throw new BadRequestException("Search query is required");
throw new ConflictException("Article already in collection");
```

## Testing with Vitest

See `references/vitest-patterns.md` for full setup. Key points:

- Install: `npm install -D vitest @vitest/coverage-v8 unplugin-swc @swc/core`
- Config: `vitest.config.ts` with SWC plugin for decorator support
- Mock Mongoose models with chainable mocks
- Test services (business logic), not framework glue
- Colocate: `articles.service.spec.ts` next to `articles.service.ts`

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage"
  }
}
```
