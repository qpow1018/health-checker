import type { Database } from "@/types/supabase";

export type THealthRecordRow = Database["public"]["Tables"]["health_records"]["Row"];

export type TSleepEvent = "slept" | "woke";

export type TSleepDetailsV1 = {
  event: TSleepEvent;
};

export type TToiletType = "urine" | "bowel";

export type TToiletUrgency = "ordinary" | "urgent";

export type TToiletStoolConsistency = "hard" | "formed" | "loose" | "watery";

type TToiletDetailsBase = {
  urgency: TToiletUrgency;
  wokeFromSleep: boolean;
};

export type TToiletDetailsV1 =
  | (TToiletDetailsBase & {
      type: "urine";
      note?: string;
    })
  | (TToiletDetailsBase & {
      type: "bowel";
      stoolConsistency: TToiletStoolConsistency;
      note?: string;
    });

export type TFoodItemV1 = {
  name: string;
  amount?: string;
};

export type TFoodDetailsV1 = {
  source?: string;
  foods: TFoodItemV1[];
};

export type TExerciseItemV1 = {
  name: string;
  amount?: string;
};

export type TExerciseDetailsV1 = {
  exercises: TExerciseItemV1[];
};

export type TConditionDetailsV1 = {
  note: string;
};

export type TReqCreateWakeRecord = {
  date: string;
  time: string;
};

export type TReqCreateToiletRecord = {
  date: string;
  time: string;
  details: TToiletDetailsV1;
};

export type TReqCreateFoodRecord = {
  date: string;
  time: string;
  source?: string;
  foods: TFoodItemV1[];
};

export type TReqCreateExerciseRecord = {
  date: string;
  time: string;
  exercises: TExerciseItemV1[];
};

export type TReqCreateConditionRecord = {
  date: string;
  time: string;
  note: string;
};

export type TReqListHealthRecords = {
  from: string;
  to: string;
};

export type TReqUpdateHealthRecord = {
  id: string;
  date: string;
  time: string;
  details:
    | TSleepDetailsV1
    | TToiletDetailsV1
    | TFoodDetailsV1
    | TExerciseDetailsV1
    | TConditionDetailsV1;
};
