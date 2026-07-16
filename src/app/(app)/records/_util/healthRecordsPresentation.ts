import type { THealthRecordRow } from "@/api/healthRecords/type";

export function getRecordCategoryLabel(record: THealthRecordRow) {
  if (record.category === "sleep") {
    return getSleepEvent(record.details) === "woke" ? "기상 시간" : "잠든 시간";
  }

  if (record.category === "toilet") {
    return getToiletTypeLabel(record.details);
  }

  if (record.category === "food") {
    return "음식 기록";
  }

  if (record.category === "condition") {
    return "컨디션 기록";
  }

  return record.category;
}

export function getRecordDescription(record: THealthRecordRow) {
  if (!isRecord(record.details)) {
    return undefined;
  }

  if (record.category === "condition" && typeof record.details.note === "string") {
    return record.details.note.split("\n")[0].trim() || undefined;
  }

  if (record.category === "food" && Array.isArray(record.details.foods)) {
    const foodNames = record.details.foods.flatMap((food) => {
      if (!isRecord(food) || typeof food.name !== "string" || !food.name.trim()) {
        return [];
      }

      const amount = typeof food.amount === "string" && food.amount.trim();
      return [`${food.name.trim()}${amount ? ` ${amount}` : ""}`];
    });

    return foodNames.join(", ") || undefined;
  }

  return undefined;
}

export function groupRecordsByDate(records: THealthRecordRow[]) {
  return records.reduce<TRecordDateGroup[]>((groups, record) => {
    const date = new Date(record.recorded_at);
    const dateKey = [date.getFullYear(), date.getMonth(), date.getDate()].join("-");
    const currentGroup = groups.at(-1);

    if (currentGroup?.dateKey === dateKey) {
      currentGroup.records.push(record);
      return groups;
    }

    groups.push({
      dateKey,
      dateLabel: new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }).format(date),
      records: [record],
    });

    return groups;
  }, []);
}

function getToiletTypeLabel(details: THealthRecordRow["details"]) {
  if (!isRecord(details)) {
    return "화장실 기록";
  }

  if (details.type === "urine") {
    return "소변 기록";
  }

  if (details.type === "bowel") {
    return "대변 기록";
  }

  if (details.type === "both") {
    return "소변·대변 기록";
  }

  return "화장실 기록";
}

export function formatRecordTime(recordedAt: string) {
  const date = new Date(recordedAt);

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type TRecordDateGroup = {
  dateKey: string;
  dateLabel: string;
  records: THealthRecordRow[];
};

function getSleepEvent(details: THealthRecordRow["details"]) {
  if (!isRecord(details) || typeof details.event !== "string") {
    return undefined;
  }

  return details.event;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
