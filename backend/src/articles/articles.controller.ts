import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
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
