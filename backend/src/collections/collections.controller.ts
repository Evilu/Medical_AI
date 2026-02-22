import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CollectionsService } from "./collections.service";
import { CreateCollectionDto, AddArticleDto } from "./dto/create-collection.dto";

@ApiTags("collections")
@Controller("collections")
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new collection" })
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all collections" })
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a collection with its articles" })
  findOne(@Param("id") id: string) {
    return this.collectionsService.findOne(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a collection" })
  remove(@Param("id") id: string) {
    return this.collectionsService.remove(id);
  }

  @Post(":id/articles")
  @ApiOperation({ summary: "Add an article to a collection" })
  addArticle(@Param("id") id: string, @Body() dto: AddArticleDto) {
    return this.collectionsService.addArticle(id, dto.pmid);
  }

  @Delete(":id/articles/:pmid")
  @ApiOperation({ summary: "Remove an article from a collection" })
  removeArticle(@Param("id") id: string, @Param("pmid") pmid: string) {
    return this.collectionsService.removeArticle(id, pmid);
  }
}
