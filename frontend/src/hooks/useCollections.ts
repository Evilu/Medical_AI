import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collectionKeys } from "@/lib/queryKeys";
import {
  fetchCollections,
  fetchCollection,
  createCollection,
  deleteCollection,
  addArticleToCollection,
  removeArticleFromCollection,
} from "@/api/collections";

export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.lists(),
    queryFn: fetchCollections,
    staleTime: 60 * 1000,
  });
}

export function useCollection(id: string) {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: () => fetchCollection(id),
    enabled: !!id,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
}

export function useAddArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, pmid }: { collectionId: string; pmid: string }) =>
      addArticleToCollection(collectionId, pmid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}

export function useRemoveArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, pmid }: { collectionId: string; pmid: string }) =>
      removeArticleFromCollection(collectionId, pmid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
}
