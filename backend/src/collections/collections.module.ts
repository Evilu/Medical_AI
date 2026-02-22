import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CollectionsController } from "./collections.controller";
import { CollectionsService } from "./collections.service";
import { Collection, CollectionSchema } from "./schemas/collection.schema";
import { ArticlesModule } from "../articles/articles.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
    ]),
    ArticlesModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
