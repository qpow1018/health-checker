import type { Database } from "@/types/supabase";

export type THealthRecordRow = Database["public"]["Tables"]["health_records"]["Row"];

export type TSleepEvent = "slept" | "woke";

export type TSleepDetailsV1 = {
  event: TSleepEvent;
};

export type TReqCreateSleepRecord = {
  date: string;
  time: string;
  event: TSleepEvent;
};

export type TReqListHealthRecords = {
  limit?: number;
};
