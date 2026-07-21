import type { Database } from "@/types/supabase";

export type TRecordFavoriteRow =
  Database["public"]["Tables"]["record_favorites"]["Row"];

export type TReqCreateRecordFavorite = {
  recordId: string;
  title: string;
};

export type TReqUpdateRecordFavoriteTitle = {
  id: string;
  title: string;
};
