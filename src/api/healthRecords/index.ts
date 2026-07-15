import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type {
  TReqCreateSleepRecord,
  TReqListHealthRecords,
  TSleepDetailsV1,
} from "./type";

export async function createSleepRecord({
  date,
  time,
  event,
}: TReqCreateSleepRecord) {
  const supabase = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("로그인한 사용자만 기록을 저장할 수 있습니다.");
  }

  const details: TSleepDetailsV1 = { event };
  const { data, error } = await supabase
    .from("health_records")
    .insert({
      category: "sleep",
      recorded_at: createRecordedAt(date, time),
      details,
      details_version: 1,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listHealthRecords({ limit = 50 }: TReqListHealthRecords = {}) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

function createRecordedAt(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("날짜와 시간을 올바르게 입력해 주세요.");
  }

  const recordedAt = new Date(`${date}T${time}:00`);
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(recordedAt.getTime()) ||
    recordedAt.getFullYear() !== year ||
    recordedAt.getMonth() !== month - 1 ||
    recordedAt.getDate() !== day ||
    recordedAt.getHours() !== hours ||
    recordedAt.getMinutes() !== minutes
  ) {
    throw new Error("날짜와 시간을 올바르게 입력해 주세요.");
  }

  return recordedAt.toISOString();
}
