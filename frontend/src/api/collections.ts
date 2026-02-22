import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 10000 });

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || "An error occurred";
    return Promise.reject(new Error(message));
  },
);

export interface Collection {
  _id: string;
  name: string;
  description: string;
  articlePmids: string[];
  createdAt: string;
  updatedAt: string;
}

export async function fetchCollections(): Promise<{ data: Collection[] }> {
  const { data } = await api.get("/collections");
  return data;
}

export async function fetchCollection(
  id: string,
): Promise<{ data: Collection & { articles: unknown[] } }> {
  const { data } = await api.get(`/collections/${id}`);
  return data;
}

export async function createCollection(body: {
  name: string;
  description?: string;
}): Promise<{ data: Collection }> {
  const { data } = await api.post("/collections", body);
  return data;
}

export async function deleteCollection(id: string): Promise<void> {
  await api.delete(`/collections/${id}`);
}

export async function addArticleToCollection(
  collectionId: string,
  pmid: string,
): Promise<{ data: Collection }> {
  const { data } = await api.post(`/collections/${collectionId}/articles`, {
    pmid,
  });
  return data;
}

export async function removeArticleFromCollection(
  collectionId: string,
  pmid: string,
): Promise<{ data: Collection }> {
  const { data } = await api.delete(
    `/collections/${collectionId}/articles/${pmid}`,
  );
  return data;
}
