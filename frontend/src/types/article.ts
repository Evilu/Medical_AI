export interface Article {
  _id: string;
  pmid: string;
  title: string;
  abstract: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  sjr_quartile: number | null;
  sjr_rank: number | null;
  score?: number;
}

export interface SearchResponse {
  data: Article[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  year?: number;
  journal?: string;
  quartile?: number;
}

export interface FiltersResponse {
  data: {
    years: number[];
    journals: string[];
  };
}
