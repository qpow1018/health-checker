"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteFoodRecommendation,
  listAllFoodRecommendations,
  listFoodRecommendations,
} from "@/api/foodRecommendations";

export const FOOD_RECOMMENDATIONS_QUERY_KEY = ["food-recommendations"] as const;

export function useFoodRecommendations(search: string) {
  return useQuery({
    queryKey: [...FOOD_RECOMMENDATIONS_QUERY_KEY, "recent", search],
    queryFn: () => listFoodRecommendations({ search }),
  });
}

export function useAllFoodRecommendations() {
  return useQuery({
    queryKey: [...FOOD_RECOMMENDATIONS_QUERY_KEY, "all"],
    queryFn: listAllFoodRecommendations,
  });
}

export function useDeleteFoodRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFoodRecommendation(id),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: FOOD_RECOMMENDATIONS_QUERY_KEY });
    },
  });
}
