import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type {
  TConditionDetailsV1,
  TReqCreateConditionRecord,
  TFoodDetailsV1,
  TFoodItemV1,
  TReqCreateFoodRecord,
  TReqCreateSleepRecord,
  TReqCreateToiletRecord,
  TReqListHealthRecords,
  TSleepDetailsV1,
  TToiletDetailsV1,
} from "./type";

export async function createSleepRecord({
  date,
  time,
  event,
}: TReqCreateSleepRecord) {
  const details: TSleepDetailsV1 = { event };
  return createHealthRecord({ category: "sleep", date, time, details });
}

export async function createToiletRecord({
  date,
  time,
  details,
}: TReqCreateToiletRecord) {
  return createHealthRecord({ category: "toilet", date, time, details });
}

export async function createFoodRecord({ date, time, foods }: TReqCreateFoodRecord) {
  const normalizedFoods = normalizeFoodItems(foods);

  if (normalizedFoods.length === 0) {
    throw new Error("음식을 하나 이상 입력해 주세요.");
  }

  const details: TFoodDetailsV1 = { foods: normalizedFoods };
  return createHealthRecord({ category: "food", date, time, details });
}

export async function createConditionRecord({
  date,
  time,
  note,
}: TReqCreateConditionRecord) {
  const normalizedNote = note.trim();

  if (!normalizedNote) {
    throw new Error("불편했던 점을 입력해 주세요.");
  }

  const details: TConditionDetailsV1 = { note: normalizedNote };
  return createHealthRecord({ category: "condition", date, time, details });
}

async function createHealthRecord({
  category,
  date,
  time,
  details,
}: {
  category: "sleep" | "toilet" | "food" | "condition";
  date: string;
  time: string;
  details: TSleepDetailsV1 | TToiletDetailsV1 | TFoodDetailsV1 | TConditionDetailsV1;
}) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_records")
    .insert({
      category,
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

function normalizeFoodItems(foods: TFoodItemV1[]) {
  return foods.reduce<TFoodItemV1[]>((items, food) => {
    const name = food.name.trim();
    const amount = food.amount?.trim();

    if (!name) {
      return items;
    }

    items.push({ name, ...(amount && { amount }) });
    return items;
  }, []);
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
