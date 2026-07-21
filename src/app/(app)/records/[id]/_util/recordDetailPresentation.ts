import type { THealthRecordRow } from "@/api/healthRecords/type";
import { isRecordCategoryFilter } from "@/app/(app)/records/_util/recordCategoryFilter";
import {
  getRecordMonthKey,
  isRecordMonthKey,
} from "@/app/(app)/records/_util/recordsMonth";

export { getRecordDetailItems } from "@/utils/healthRecordsPresentation";

type TRecordEditHrefOptions = {
  category: string | null;
  month: string | null;
};

export function getRecordEditHref(
  record: THealthRecordRow,
  { category, month }: TRecordEditHrefOptions,
) {
  const editPath = getRecordEditPath(record);

  if (!editPath) {
    return undefined;
  }

  const returnMonth = isRecordMonthKey(month)
    ? month
    : getRecordMonthKey(new Date(record.recorded_at));
  const returnCategory =
    isRecordCategoryFilter(category) && category !== "all" ? category : undefined;

  return `${editPath}&month=${returnMonth}${returnCategory ? `&category=${returnCategory}` : ""}`;
}

export function getRecordEditPath(record: THealthRecordRow) {
  if (record.category === "sleep") {
    if (isRecord(record.details) && record.details.event === "woke") {
      return `/record/wake?edit=${record.id}`;
    }

    return undefined;
  }

  if (
    record.category === "toilet" ||
    record.category === "food" ||
    record.category === "exercise" ||
    record.category === "condition"
  ) {
    return `/record/${record.category}?edit=${record.id}`;
  }

  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
