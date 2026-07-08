import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  TBathroomLogInsert,
  TReqCreateBathroomLog,
  TReqListBathroomLogs,
  TReqUpdateBathroomLogDetails,
} from "./type";

export async function createBathroomLog({ kind, loggedAt }: TReqCreateBathroomLog) {
  const supabase = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("로그인한 사용자만 기록을 저장할 수 있습니다.");
  }

  const insertPayload: TBathroomLogInsert = {
    user_id: userData.user.id,
    kind,
    logged_at: loggedAt ?? new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("bathroom_logs")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBathroomLogDetails(
  id: string,
  details: TReqUpdateBathroomLogDetails,
) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("bathroom_logs").update(details).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteBathroomLog(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("bathroom_logs").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function listBathroomLogs({ limit = 50 }: TReqListBathroomLogs = {}) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("bathroom_logs")
    .select("*")
    .order("logged_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}
