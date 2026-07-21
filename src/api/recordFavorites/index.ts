import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type {
  TReqCreateRecordFavorite,
  TReqUpdateRecordFavoriteTitle,
} from "./type";

export async function listRecordFavorites() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("record_favorites")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createRecordFavorite({
  recordId,
  title,
}: TReqCreateRecordFavorite) {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new Error("즐겨찾기 이름을 입력해 주세요.");
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc("create_record_favorite", {
    favorite_title_value: normalizedTitle,
    record_id_value: recordId,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function createHealthRecordFromFavorite(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.rpc(
    "create_health_record_from_favorite",
    { favorite_id_value: id },
  );

  if (error) {
    throw error;
  }

  return data;
}

export async function updateRecordFavoriteTitle({
  id,
  title,
}: TReqUpdateRecordFavoriteTitle) {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    throw new Error("즐겨찾기 이름을 입력해 주세요.");
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("record_favorites")
    .update({ title: normalizedTitle })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("즐겨찾기를 찾을 수 없습니다.");
  }

  return data;
}

export async function deleteRecordFavorite(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("record_favorites").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function reorderRecordFavorites(ids: string[]) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.rpc("reorder_record_favorites", {
    favorite_ids: ids,
  });

  if (error) {
    throw error;
  }
}
