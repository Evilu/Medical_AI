import axios from "axios";
import type { SearchParams, SearchResponse, Article, FiltersResponse } from "@/types/article";

const api = axios.create({ baseURL: "/api", timeout: 10000 });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || "An error occurred";
    return Promise.reject(new Error(message));
  },
);

export async function searchArticles(params: SearchParams): Promise<SearchResponse> {
  const { data } = await api.get("/articles/search", { params });
  return data;
}

export async function getArticle(pmid: string): Promise<{ data: Article }> {
  const { data } = await api.get(`/articles/${pmid}`);
  return data;
}

export async function getFilters(): Promise<FiltersResponse> {
  const { data } = await api.get("/articles/filters");
  return data;
}
