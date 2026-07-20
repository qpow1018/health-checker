import type { Database } from "@/types/supabase";

import type { TFoodItemV1 } from "@/api/healthRecords/type";

export type TFoodRecommendationRow = Pick<
  Database["public"]["Tables"]["food_recommendations"]["Row"],
  "foods" | "id" | "source"
>;

export type TFoodRecommendation = {
  id: string;
  source?: string;
  foods: TFoodItemV1[];
};

export type TReqListFoodRecommendations = {
  search?: string;
  limit?: number;
};
