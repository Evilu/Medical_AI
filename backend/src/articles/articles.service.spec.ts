import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { ArticlesService } from "./articles.service";
import { Article } from "./schemas/article.schema";

const mockArticle = {
  _id: "507f1f77bcf86cd799439011",
  pmid: "31852920",
  title: "Efficacy and safety of GLP-1 receptor agonists",
  abstract: "GLP-1 receptor agonists and SGLT2 inhibitors...",
  authors: "Castellana M, Cignarelli A, Brescia F",
  journal: "Scientific reports",
  year: 2019,
  doi: "10.1038/s41598-019-55524-w",
  sjr_quartile: null,
  sjr_rank: null,
};

function createChainMock(resolvedValue: unknown) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.find = vi.fn().mockReturnValue(chain);
  chain.findOne = vi.fn().mockReturnValue(chain);
  chain.sort = vi.fn().mockReturnValue(chain);
  chain.skip = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.lean = vi.fn().mockReturnValue(chain);
  chain.exec = vi.fn().mockResolvedValue(resolvedValue);
  return chain;
}

describe("ArticlesService", () => {
  let service: ArticlesService;
  let mockModel: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    const chain = createChainMock([mockArticle]);

    mockModel = {
      find: vi.fn().mockReturnValue(chain),
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
        { provide: getModelToken(Article.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  describe("search", () => {
    it("should search articles with text query", async () => {
      const result = await service.search({ q: "diabetes", page: 1, limit: 20 });

      expect(mockModel.find).toHaveBeenCalledWith(
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

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2020 }),
        expect.any(Object),
      );
    });

    it("should apply journal filter with case-insensitive regex", async () => {
      await service.search({ q: "test", journal: "Nature" });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          journal: { $regex: "Nature", $options: "i" },
        }),
        expect.any(Object),
      );
    });

    it("should apply quartile filter", async () => {
      await service.search({ q: "test", quartile: 1 });

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ sjr_quartile: 1 }),
        expect.any(Object),
      );
    });

    it("should calculate totalPages correctly", async () => {
      mockModel.countDocuments = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(45),
      });

      const result = await service.search({ q: "test", page: 1, limit: 20 });
      expect(result.meta.totalPages).toBe(3);
    });

    it("should use year descending sort when no query", async () => {
      const chain = createChainMock([mockArticle]);
      mockModel.find = vi.fn().mockReturnValue(chain);

      await service.search({ q: "" });

      // When q is empty, no $text filter should be applied
      expect(mockModel.find).toHaveBeenCalledWith({}, {});
    });
  });

  describe("findByPmid", () => {
    it("should return article when found", async () => {
      const result = await service.findByPmid("31852920");
      expect(result.data).toEqual(mockArticle);
    });

    it("should throw NotFoundException when not found", async () => {
      mockModel.findOne = vi.fn().mockReturnValue(createChainMock(null));

      await expect(service.findByPmid("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getFilters", () => {
    it("should return years and journals", async () => {
      mockModel.distinct = vi
        .fn()
        .mockReturnValueOnce({ exec: vi.fn().mockResolvedValue([2020, 2019, 2021]) })
        .mockReturnValueOnce({ exec: vi.fn().mockResolvedValue(["Nature", "BMJ"]) });

      const result = await service.getFilters();
      expect(result.data.years).toEqual([2021, 2020, 2019]); // sorted desc
      expect(result.data.journals).toEqual(["BMJ", "Nature"]); // sorted asc
    });
  });
});
