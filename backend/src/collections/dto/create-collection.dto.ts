import { IsString, IsOptional, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCollectionDto {
  @ApiProperty({ description: "Collection name" })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: "Collection description" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class AddArticleDto {
  @ApiProperty({ description: "PubMed ID of article to add" })
  @IsString()
  pmid: string;
}
