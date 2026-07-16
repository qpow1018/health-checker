import type { Database } from "@/types/supabase";

export type THealthRecordRow = Database["public"]["Tables"]["health_records"]["Row"];

export type TSleepEvent = "slept" | "woke";

export type TSleepDetailsV1 = {
  event: TSleepEvent;
};

export type TToiletType = "urine" | "bowel" | "both";

export type TToiletUrgency = "relaxed" | "ordinary" | "urgent";

export type TToiletStoolConsistency = "hard" | "formed" | "loose" | "watery";

type TToiletDetailsBase = {
  urgency?: TToiletUrgency;
  wokeFromSleep?: boolean;
};

export type TToiletDetailsV1 =
  | (TToiletDetailsBase & {
      type: "urine";
      note?: string;
    })
  | (TToiletDetailsBase & {
      type: "bowel";
      stoolConsistency?: TToiletStoolConsistency;
      note?: string;
    })
  | (TToiletDetailsBase & {
      type: "both";
      stoolConsistency?: TToiletStoolConsistency;
      note?: string;
    });

export type TFoodItemV1 = {
  name: string;
  amount?: string;
};

export type TFoodDetailsV1 = {
  foods: TFoodItemV1[];
};

export type TReqCreateSleepRecord = {
  date: string;
  time: string;
  event: TSleepEvent;
};

export type TReqCreateToiletRecord = {
  date: string;
  time: string;
  details: TToiletDetailsV1;
};

export type TReqCreateFoodRecord = {
  date: string;
  time: string;
  foods: TFoodItemV1[];
};

export type TReqListHealthRecords = {
  limit?: number;
};
