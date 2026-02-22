import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Article, ArticleDocument } from "./schemas/article.schema";
import { SearchArticlesDto } from "./dto/search-articles.dto";

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async search(dto: SearchArticlesDto) {
    const { q, page = 1, limit = 20, year, journal, quartile } = dto;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (q) {
      filter.$text = { $search: q };
    }
    if (year) filter.year = year;
    if (journal) filter.journal = { $regex: journal, $options: "i" };
    if (quartile) filter.sjr_quartile = quartile;

    const projection = q ? { score: { $meta: "textScore" } } : {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = q
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
    const article = await this.articleModel.findOne({ pmid }).lean().exec();

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
