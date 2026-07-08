import type { Database } from "@/types/supabase";

export type TBathroomLogRow = Database["public"]["Tables"]["bathroom_logs"]["Row"];
export type TBathroomLogInsert = Database["public"]["Tables"]["bathroom_logs"]["Insert"];
export type TBathroomLogUpdate = Database["public"]["Tables"]["bathroom_logs"]["Update"];

export type TReqCreateBathroomLog = {
  kind: TBathroomLogRow["kind"];
  loggedAt?: string;
};

export type TReqUpdateBathroomLogDetails = Pick<
  TBathroomLogUpdate,
  | "urgency"
  | "woke_from_sleep"
  | "note"
  | "urine_pain"
  | "urine_color_unusual"
  | "stool_state"
  | "bowel_pain"
  | "possible_blood"
>;

export type TReqListBathroomLogs = {
  limit?: number;
};
