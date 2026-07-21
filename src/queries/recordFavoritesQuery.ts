"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHealthRecordFromFavorite,
  createRecordFavorite,
  deleteRecordFavorite,
  listRecordFavorites,
  reorderRecordFavorites,
  updateRecordFavoriteTitle,
} from "@/api/recordFavorites";
import type {
  TReqCreateRecordFavorite,
  TReqUpdateRecordFavoriteTitle,
} from "@/api/recordFavorites/type";
import { HEALTH_RECORDS_QUERY_KEY } from "@/queries/healthRecordsQuery";

export const RECORD_FAVORITES_QUERY_KEY = ["record-favorites"] as const;

export function useRecordFavorites() {
  return useQuery({
    queryKey: RECORD_FAVORITES_QUERY_KEY,
    queryFn: listRecordFavorites,
    staleTime: 30 * 1000,
  });
}

function useRecordFavoriteMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => mutationFn(variables),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: RECORD_FAVORITES_QUERY_KEY });
    },
  });
}

export function useCreateRecordFavorite() {
  return useRecordFavoriteMutation<
    TReqCreateRecordFavorite,
    Awaited<ReturnType<typeof createRecordFavorite>>
  >(createRecordFavorite);
}

export function useCreateHealthRecordFromFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => createHealthRecordFromFavorite(id),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: HEALTH_RECORDS_QUERY_KEY });
    },
  });
}

export function useUpdateRecordFavoriteTitle() {
  return useRecordFavoriteMutation<
    TReqUpdateRecordFavoriteTitle,
    Awaited<ReturnType<typeof updateRecordFavoriteTitle>>
  >(updateRecordFavoriteTitle);
}

export function useDeleteRecordFavorite() {
  return useRecordFavoriteMutation<
    string,
    Awaited<ReturnType<typeof deleteRecordFavorite>>
  >(deleteRecordFavorite);
}

export function useReorderRecordFavorites() {
  return useRecordFavoriteMutation<
    string[],
    Awaited<ReturnType<typeof reorderRecordFavorites>>
  >(reorderRecordFavorites);
}
