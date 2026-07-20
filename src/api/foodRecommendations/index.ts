import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type { TFoodItemV1 } from "@/api/healthRecords/type";
import type {
  TFoodRecommendation,
  TFoodRecommendationRow,
  TReqListFoodRecommendations,
} from "./type";

const DEFAULT_RECOMMENDATION_LIMIT = 5;

export async function listFoodRecommendations({
  search = "",
  limit = DEFAULT_RECOMMENDATION_LIMIT,
}: TReqListFoodRecommendations = {}) {
  const supabase = getSupabaseBrowserClient();
  let query = supabase
    .from("food_recommendations")
    .select("id, source, foods")
    .order("last_used_at", { ascending: false })
    .limit(limit);

  for (const term of getSearchTerms(search)) {
    query = query.ilike("search_text", `%${escapeLikePattern(term)}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.flatMap(toFoodRecommendation);
}

export async function listAllFoodRecommendations() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("food_recommendations")
    .select("id, source, foods")
    .order("last_used_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.flatMap(toFoodRecommendation);
}

export async function deleteFoodRecommendation(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("food_recommendations").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

function getSearchTerms(search: string) {
  return search.trim().split(/\s+/).filter(Boolean);
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function toFoodRecommendation(row: TFoodRecommendationRow): TFoodRecommendation[] {
  if (!Array.isArray(row.foods)) {
    return [];
  }

  const foods = row.foods.flatMap(toFoodItem);

  if (foods.length === 0) {
    return [];
  }

  return [{
    id: row.id,
    ...(row.source && { source: row.source }),
    foods,
  }];
}

function toFoodItem(value: unknown): TFoodItemV1[] {
  if (!isRecord(value) || typeof value.name !== "string" || !value.name.trim()) {
    return [];
  }

  const amount = typeof value.amount === "string" && value.amount.trim();
  return [{
    name: value.name.trim(),
    ...(amount && { amount }),
  }];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
