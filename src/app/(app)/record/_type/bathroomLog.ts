import type { TBathroomLogRow } from "@/api/bathroomLogs/type";

export type TBathroomLogKind = TBathroomLogRow["kind"];
export type TUrgency = NonNullable<TBathroomLogRow["urgency"]>;
export type TStoolState = NonNullable<TBathroomLogRow["stool_state"]>;

export type TRecordDetailFormState = {
  urgency: "" | TUrgency;
  wokeFromSleep: "" | "yes" | "no";
  note: string;
  urinePain: boolean;
  urineColorUnusual: boolean;
  stoolState: "" | TStoolState;
  bowelPain: boolean;
  possibleBlood: boolean;
};

export type TJustSavedBathroomLog = Pick<TBathroomLogRow, "id" | "kind" | "logged_at">;
