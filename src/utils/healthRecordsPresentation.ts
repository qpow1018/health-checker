import type { THealthRecordRow } from "@/api/healthRecords/type";

type TRecordPresentationSource = Pick<THealthRecordRow, "category" | "details">;

export function getRecordCategoryLabel(record: TRecordPresentationSource) {
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

export function getRecordDescription(record: TRecordPresentationSource) {
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

export function getRecordDetailItems(record: TRecordPresentationSource) {
  if (!isRecord(record.details)) {
    return [];
  }

  if (record.category === "sleep") {
    return [{ label: "기록 종류", value: getSleepEventValue(record.details.event) }];
  }

  if (record.category === "food" && Array.isArray(record.details.foods)) {
    const source = typeof record.details.source === "string" && record.details.source.trim();
    const foods = record.details.foods.flatMap((food) => {
      if (!isRecord(food) || typeof food.name !== "string" || !food.name.trim()) {
        return [];
      }

      const amount = typeof food.amount === "string" && food.amount.trim();
      return [`${food.name.trim()}${amount ? ` · ${amount}` : ""}`];
    });

    const items = foods.length > 0 ? [{ label: "먹은 것", value: foods.join("\n") }] : [];

    if (source) {
      items.unshift({ label: "가게·브랜드", value: source });
    }

    return items;
  }

  if (record.category === "exercise" && Array.isArray(record.details.exercises)) {
    const exercises = record.details.exercises.flatMap((exercise) => {
      if (!isRecord(exercise) || typeof exercise.name !== "string" || !exercise.name.trim()) {
        return [];
      }

      const amount = typeof exercise.amount === "string" && exercise.amount.trim();
      return [`${exercise.name.trim()}${amount ? ` · ${amount}` : ""}`];
    });

    return exercises.length > 0 ? [{ label: "운동", value: exercises.join("\n") }] : [];
  }

  if (record.category === "condition" && typeof record.details.note === "string") {
    return [{ label: "불편했던 점", value: record.details.note }];
  }

  if (record.category === "toilet") {
    const items = [{ label: "종류", value: getToiletTypeValue(record.details.type) }];
    const urgency = getUrgencyLabel(record.details.urgency);
    const wokeFromSleep = getBooleanLabel(record.details.wokeFromSleep);
    const stoolConsistency = getStoolConsistencyLabel(record.details.stoolConsistency);

    if (urgency) items.push({ label: "급한 정도", value: urgency });
    if (wokeFromSleep) items.push({ label: "자다가 깸", value: wokeFromSleep });
    if (stoolConsistency) items.push({ label: "대변 상태", value: stoolConsistency });
    if (typeof record.details.note === "string" && record.details.note.trim()) {
      items.push({ label: "특이사항", value: record.details.note.trim() });
    }

    return items;
  }

  return [];
}

export function formatRecordTime(recordedAt: string) {
  const date = new Date(recordedAt);

  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSleepEventValue(value: unknown) {
  if (value === "woke") return "기상";
  if (value === "slept") return "취침";
  return "수면";
}

function getToiletTypeValue(value: unknown) {
  if (value === "urine") return "소변";
  if (value === "bowel") return "대변";
  return "화장실";
}

function getUrgencyLabel(value: unknown) {
  if (value === "ordinary") return "보통";
  if (value === "urgent") return "급함";
  return undefined;
}

function getBooleanLabel(value: unknown) {
  if (value === true) return "예";
  if (value === false) return "아니오";
  return undefined;
}

function getStoolConsistencyLabel(value: unknown) {
  if (value === "hard") return "단단함";
  if (value === "formed") return "형태 있음";
  if (value === "loose") return "묽음";
  if (value === "watery") return "물처럼 묽음";
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
