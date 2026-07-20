import type { TRecordCategoryFilter } from "@/app/(app)/records/_type/recordCategoryFilter";

export const RECORD_CATEGORY_FILTERS = [
  { label: "전체", value: "all" },
  { label: "기상", value: "sleep" },
  { label: "화장실", value: "toilet" },
  { label: "먹은 것", value: "food" },
  { label: "운동", value: "exercise" },
  { label: "컨디션", value: "condition" },
] as const satisfies ReadonlyArray<{
  label: string;
  value: TRecordCategoryFilter;
}>;
