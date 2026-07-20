import type { THealthRecordRow } from "@/api/healthRecords/type";

export function getRecordCategoryLabel(record: THealthRecordRow) {
  if (record.category === "sleep") {
    return "기상 시간";
  }

  if (record.category === "toilet") {
    return "화장실";
  }

  if (record.category === "food") {
    return "먹은 것";
  }

  if (record.category === "exercise") {
    return "운동";
  }

  if (record.category === "condition") {
    return "컨디션";
  }

  return record.category;
}

export function getRecordDescription(record: THealthRecordRow) {
  if (!isRecord(record.details)) {
    return undefined;
  }

  if (record.category === "toilet") {
    if (record.details.type === "urine") {
      return "소변";
    }

    if (record.details.type === "bowel") {
      return "대변";
    }

    return undefined;
  }

  if (record.category === "condition" && typeof record.details.note === "string") {
    return record.details.note.split("\n")[0].trim() || undefined;
  }

  if (record.category === "food" && Array.isArray(record.details.foods)) {
    const source = typeof record.details.source === "string" && record.details.source.trim();
    const foodNames = record.details.foods.flatMap((food) => {
      if (!isRecord(food) || typeof food.name !== "string" || !food.name.trim()) {
        return [];
      }

      const amount = typeof food.amount === "string" && food.amount.trim();
      return [`${food.name.trim()}${amount ? ` ${amount}` : ""}`];
    });

    return [source, foodNames.join(", ")].filter(Boolean).join(" · ") || undefined;
  }

  if (record.category === "exercise" && Array.isArray(record.details.exercises)) {
    const exerciseNames = record.details.exercises.flatMap((exercise) => {
      if (!isRecord(exercise) || typeof exercise.name !== "string" || !exercise.name.trim()) {
        return [];
      }

      const amount = typeof exercise.amount === "string" && exercise.amount.trim();
      return [`${exercise.name.trim()}${amount ? ` ${amount}` : ""}`];
    });

    return exerciseNames.join(", ") || undefined;
  }

  return undefined;
}

export function formatRecordTime(recordedAt: string) {
  const date = new Date(recordedAt);

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
