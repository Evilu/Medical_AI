---
name: nestjs
description: NestJS architecture best practices reference. Use when structuring modules, writing controllers/services, configuring dependency injection, setting up validation, error handling, MongoDB patterns, or Swagger docs.
user-invocable: true
---
# NestJS Best Practices Reference

## Table of Contents
1. [Module Organization](#module-organization)
2. [Dependency Injection](#dependency-injection)
3. [DTO Validation](#dto-validation)
4. [Error Handling](#error-handling)
5. [MongoDB Patterns](#mongodb-patterns)
6. [Performance](#performance)
7. [Security](#security)
8. [Swagger](#swagger)

---

## Module Organization

### One module per domain entity
Each feature gets its own module with controller, service, schemas, and DTOs co-located.

```
articles/
├── articles.module.ts         # Declares all article-related providers
├── articles.controller.ts     # HTTP layer only — no business logic
├── articles.service.ts        # All business logic here
├── articles.controller.spec.ts
├── articles.service.spec.ts
├── schemas/
│   └── article.schema.ts      # Mongoose schema definition
└── dto/
    ├── search-articles.dto.ts # Input validation
    └── article-response.dto.ts # Output shaping (optional)
```

### Controller Rules
- Controllers are thin — they delegate everything to services
- No database access in controllers
- No business logic in controllers
- Only handle HTTP concerns: request parsing, response shaping, status codes

```typescript
// GOOD — controller delegates
@Get("search")
search(@Query() dto: SearchArticlesDto) {
  return this.articlesService.search(dto);
}

// BAD — controller does business logic
@Get("search")
async search(@Query() dto: SearchArticlesDto) {
  const filter = { $text: { $search: dto.q } }; // Don't build queries here
  return this.articleModel.find(filter);          // Don't access DB here
}
```

### Service Rules
- Services contain all business logic
- Services are injectable and testable
- Services can depend on other services (via DI)
- Keep methods focused — one responsibility per method

## Dependency Injection

### Constructor injection (preferred)

```typescript
@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}
}
```

### Cross-module dependencies

```typescript
// articles.module.ts — export the service
@Module({
  // ...
  exports: [ArticlesService],
})
export class ArticlesModule {}

// collections.module.ts — import the module
@Module({
  imports: [ArticlesModule], // Now can inject ArticlesService
})
export class CollectionsModule {}
```

## DTO Validation

### Always use class-validator with transform

```typescript
import { IsString, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class SearchArticlesDto {
  @ApiProperty({ description: "Full-text search query" })
  @IsString()
  q: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)    // Transform string query param to number
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;  // Default values on the property

  @ApiPropertyOptional({ description: "Filter by publication year" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
```

### Enable transform globally

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

## Error Handling

### Use NestJS built-in exceptions

```typescript
import { NotFoundException, BadRequestException } from "@nestjs/common";

// 404
throw new NotFoundException(`Article with PMID "${pmid}" not found`);

// 400
throw new BadRequestException("Search query must be at least 2 characters");
```

### Custom exception filter for unhandled errors

```typescript
import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger,
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === "string" ? res : (res as { message: string }).message;
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## MongoDB Patterns

### Schema Notes for This Project
- The data loader (`load_data.py`) creates text indexes on `title` + `abstract` and regular indexes on `year`, `journal`, `pmid`
- Do NOT create a text index in the schema — MongoDB allows only one per collection
- `authors` is a plain string, NOT an array of objects
- `year` is a number, NOT a date string
- `sjr_quartile` and `sjr_rank` can be `null`

### Query tips
- Use `.lean()` for all read-only queries (returns plain objects, ~5x faster)
- Use `Promise.all()` for independent parallel queries (e.g., data + count)
- Use `.exec()` to get a proper Promise

### Text search with scoring

```typescript
// The text index already exists on title + abstract (created by load_data.py)
const results = await this.articleModel
  .find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } },
  )
  .sort({ score: { $meta: "textScore" } })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean()
  .exec();
```

### Offset-based pagination (correct for this project)

```typescript
// Why offset (skip/limit) and NOT cursor-based:
// - Text search results are sorted by $meta:textScore (a computed score)
// - Cursor pagination requires a stable, ordered field (like _id or date)
// - textScore isn't stable across queries — same doc can have different scores
// - At 25K docs, skip() is fast enough (MongoDB scans the index)
// - Offset allows URL-shareable page numbers and jumping to any page

const skip = (page - 1) * limit;
const [data, total] = await Promise.all([
  this.articleModel
    .find(filter, projection)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean()
    .exec(),
  this.articleModel.countDocuments(filter).exec(),
]);

return {
  data,
  meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
};
```

## Performance

### Query optimization checklist
- [x] Always use `.lean()` for GET endpoints
- [x] Use existing indexes (don't create conflicting ones)
- [x] Use `Promise.all()` for data + count queries in parallel
- [x] Set reasonable defaults and maximums on limit (default 20, max 100)
- [x] Use `.exec()` to get real Promises

### Response time targets
- Search: < 200ms for most queries
- Single article: < 50ms
- Filters: < 100ms

## Security

### CORS configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
});
```

### Input sanitization
- Validation pipe strips unknown properties (`whitelist: true`)
- Forbid non-whitelisted properties (`forbidNonWhitelisted: true`)
- Type transformation with class-transformer
- MongoDB injection prevention: use DTOs, never interpolate raw input into queries

## Swagger

Set up Swagger for API documentation:

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const config = new DocumentBuilder()
  .setTitle("Medical Literature Search API")
  .setDescription("Search ~25,000 PubMed articles")
  .setVersion("1.0")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api/docs", app, document);
```

Decorate controllers:
```typescript
@ApiTags("articles")
@Controller("articles")
export class ArticlesController {
  @Get("search")
  @ApiOperation({ summary: "Full-text search articles" })
  @ApiResponse({ status: 200, description: "Search results with pagination meta" })
  search(@Query() dto: SearchArticlesDto) { ... }
}
```

Swagger UI at: `http://localhost:3000/api/docs`
