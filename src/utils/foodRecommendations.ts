import type { TFoodRecommendation } from "@/api/foodRecommendations/type";

export function getFoodRecommendationLabel(recommendation: TFoodRecommendation) {
  const foods = recommendation.foods
    .map((food) => [food.name, food.amount].filter(Boolean).join(" "))
    .join(" · ");

  return [recommendation.source, foods].filter(Boolean).join(" · ");
}
