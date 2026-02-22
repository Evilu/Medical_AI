import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Collection, CollectionDocument } from "./schemas/collection.schema";
import { CreateCollectionDto } from "./dto/create-collection.dto";
import { ArticlesService } from "../articles/articles.service";

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name)
    private collectionModel: Model<CollectionDocument>,
    private articlesService: ArticlesService,
  ) {}

  async create(dto: CreateCollectionDto) {
    const collection = await this.collectionModel.create(dto);
    return { data: collection.toObject() };
  }

  async findAll() {
    const collections = await this.collectionModel
      .find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return { data: collections };
  }

  async findOne(id: string) {
    const collection = await this.collectionModel.findById(id).lean().exec();
    if (!collection) {
      throw new NotFoundException(`Collection "${id}" not found`);
    }

    // Fetch the actual articles for the PMIDs in this collection
    const articles =
      collection.articlePmids.length > 0
        ? await this.collectionModel.db
            .collection("pubmed_articles")
            .find({ pmid: { $in: collection.articlePmids } })
            .toArray()
        : [];

    return { data: { ...collection, articles } };
  }

  async remove(id: string) {
    const result = await this.collectionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Collection "${id}" not found`);
    }
    return { data: { deleted: true } };
  }

  async addArticle(id: string, pmid: string) {
    // Verify article exists
    await this.articlesService.findByPmid(pmid);

    const collection = await this.collectionModel.findById(id).exec();
    if (!collection) {
      throw new NotFoundException(`Collection "${id}" not found`);
    }

    if (collection.articlePmids.includes(pmid)) {
      throw new ConflictException("Article already in collection");
    }

    collection.articlePmids.push(pmid);
    await collection.save();

    return { data: collection.toObject() };
  }

  async removeArticle(id: string, pmid: string) {
    const collection = await this.collectionModel.findById(id).exec();
    if (!collection) {
      throw new NotFoundException(`Collection "${id}" not found`);
    }

    const idx = collection.articlePmids.indexOf(pmid);
    if (idx === -1) {
      throw new NotFoundException("Article not in collection");
    }

    collection.articlePmids.splice(idx, 1);
    await collection.save();

    return { data: collection.toObject() };
  }
}
