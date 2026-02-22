import { Test, TestingModule } from "@nestjs/testing";
import { ArticlesController } from "./articles.controller";
import { ArticlesService } from "./articles.service";

const mockSearchResult = {
  data: [{ _id: "1", pmid: "123", title: "Test" }],
  meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

const mockArticle = { _id: "1", pmid: "123", title: "Test" };

describe("ArticlesController", () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: {
            search: vi.fn().mockResolvedValue(mockSearchResult),
            findByPmid: vi.fn().mockResolvedValue({ data: mockArticle }),
            getFilters: vi
              .fn()
              .mockResolvedValue({ data: { years: [], journals: [] } }),
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

  it("should call service.findByPmid", async () => {
    await controller.findByPmid("123");
    expect(service.findByPmid).toHaveBeenCalledWith("123");
  });

  it("should call service.getFilters", async () => {
    await controller.getFilters();
    expect(service.getFilters).toHaveBeenCalled();
  });
});
