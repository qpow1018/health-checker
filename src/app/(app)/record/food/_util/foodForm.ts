import type {
  TFoodFormItem,
  TFoodFormValue,
} from "@/app/(app)/record/food/_type/foodForm";
import type {
  TFoodItemV1,
  THealthRecordRow,
} from "@/api/healthRecords/type";
import { formatDateString, getCurrentRecordDateTime } from "@/utils/date";

export function createEmptyFoodFormValue(): TFoodFormValue {
  const defaultRecordDateTime = getCurrentRecordDateTime();

  return {
    recordedOn: defaultRecordDateTime.date,
    recordedAt: defaultRecordDateTime.time,
    source: "",
    foods: [createFoodFormItem()],
  };
}

export function getFoodRecordFormValue(
  record: THealthRecordRow,
): TFoodFormValue | null {
  if (
    record.category !== "food" ||
    !isRecord(record.details) ||
    !Array.isArray(record.details.foods)
  ) {
    return null;
  }

  const date = new Date(record.recorded_at);
  const foods = record.details.foods.flatMap((food, index) => {
    if (!isRecord(food) || typeof food.name !== "string") {
      return [];
    }

    return [
      createFoodFormItem(
        {
          name: food.name,
          amount: typeof food.amount === "string" ? food.amount : undefined,
        },
        index + 1,
      ),
    ];
  });

  return {
    recordedOn: formatDateString(date),
    recordedAt: formatTimeString(date),
    source: typeof record.details.source === "string" ? record.details.source : "",
    foods: foods.length > 0 ? foods : [createFoodFormItem()],
  };
}

export function createFoodFormItem(
  food?: TFoodItemV1,
  id = 1,
): TFoodFormItem {
  return {
    id,
    name: food?.name ?? "",
    amount: food?.amount ?? "",
  };
}

function formatTimeString(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
