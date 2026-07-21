import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import type {
  TConditionDetailsV1,
  TReqCreateConditionRecord,
  TExerciseDetailsV1,
  TExerciseItemV1,
  TReqCreateExerciseRecord,
  TFoodDetailsV1,
  TFoodItemV1,
  TReqCreateFoodRecord,
  TReqCreateWakeRecord,
  TReqCreateToiletRecord,
  TReqListHealthRecords,
  TReqUpdateHealthRecord,
  TSleepDetailsV1,
  TToiletDetailsV1,
} from "./type";

export async function createWakeRecord({
  date,
  time,
}: TReqCreateWakeRecord) {
  const details: TSleepDetailsV1 = { event: "woke" };
  return createHealthRecord({ category: "sleep", date, time, details });
}

export async function createToiletRecord({
  date,
  time,
  details,
}: TReqCreateToiletRecord) {
  return createHealthRecord({ category: "toilet", date, time, details });
}

export async function createFoodRecord({ date, time, source, foods }: TReqCreateFoodRecord) {
  const normalizedSource = source?.trim();
  const normalizedFoods = normalizeFoodItems(foods);

  if (normalizedFoods.length === 0) {
    throw new Error("먹은 것을 하나 이상 입력해 주세요.");
  }

  const details: TFoodDetailsV1 = {
    ...(normalizedSource && { source: normalizedSource }),
    foods: normalizedFoods,
  };
  return createHealthRecord({ category: "food", date, time, details });
}

export async function createExerciseRecord({
  date,
  time,
  exercises,
}: TReqCreateExerciseRecord) {
  const normalizedExercises = normalizeExerciseItems(exercises);

  if (normalizedExercises.length === 0) {
    throw new Error("운동을 하나 이상 입력해 주세요.");
  }

  const details: TExerciseDetailsV1 = { exercises: normalizedExercises };
  return createHealthRecord({ category: "exercise", date, time, details });
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
  category: "sleep" | "toilet" | "food" | "exercise" | "condition";
  date: string;
  time: string;
  details:
    | TSleepDetailsV1
    | TToiletDetailsV1
    | TFoodDetailsV1
    | TExerciseDetailsV1
    | TConditionDetailsV1;
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

function normalizeExerciseItems(exercises: TExerciseItemV1[]) {
  return exercises.reduce<TExerciseItemV1[]>((items, exercise) => {
    const name = exercise.name.trim();
    const amount = exercise.amount?.trim();

    if (!name) {
      return items;
    }

    items.push({ name, ...(amount && { amount }) });
    return items;
  }, []);
}

export async function listHealthRecords({ from, to }: TReqListHealthRecords) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .gte("recorded_at", from)
    .lt("recorded_at", to)
    .order("recorded_at", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getHealthRecord(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateHealthRecord({
  id,
  date,
  time,
  details,
}: TReqUpdateHealthRecord) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("health_records")
    .update({ recorded_at: createRecordedAt(date, time), details })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("기록을 찾을 수 없습니다.");
  }

  return data;
}

export async function deleteHealthRecord(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("health_records").delete().eq("id", id);

  if (error) {
    throw error;
  }
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
