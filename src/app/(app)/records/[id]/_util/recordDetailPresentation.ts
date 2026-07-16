import type { THealthRecordRow } from "@/api/healthRecords/type";

import { getRecordCategoryLabel } from "@/utils/healthRecordsPresentation";

export function getRecordDetailItems(record: THealthRecordRow) {
  if (!isRecord(record.details)) {
    return [];
  }

  if (record.category === "sleep") {
    return [{ label: "기록", value: getRecordCategoryLabel(record) }];
  }

  if (record.category === "food" && Array.isArray(record.details.foods)) {
    const foods = record.details.foods.flatMap((food) => {
      if (!isRecord(food) || typeof food.name !== "string" || !food.name.trim()) {
        return [];
      }

      const amount = typeof food.amount === "string" && food.amount.trim();
      return [`${food.name.trim()}${amount ? ` · ${amount}` : ""}`];
    });

    return foods.length > 0 ? [{ label: "음식", value: foods.join("\n") }] : [];
  }

  if (record.category === "condition" && typeof record.details.note === "string") {
    return [{ label: "불편했던 점", value: record.details.note }];
  }

  if (record.category === "toilet") {
    const items = [{ label: "종류", value: getRecordCategoryLabel(record) }];
    const urgency = getUrgencyLabel(record.details.urgency);
    const wokeFromSleep = getBooleanLabel(record.details.wokeFromSleep);
    const stoolConsistency = getStoolConsistencyLabel(record.details.stoolConsistency);

    if (urgency) items.push({ label: "급한 정도", value: urgency });
    if (wokeFromSleep) items.push({ label: "잠에서 깬 뒤인지", value: wokeFromSleep });
    if (stoolConsistency) items.push({ label: "대변 상태", value: stoolConsistency });
    if (typeof record.details.note === "string" && record.details.note.trim()) {
      items.push({ label: "특이사항", value: record.details.note.trim() });
    }

    return items;
  }

  return [];
}

export function getRecordEditPath(record: THealthRecordRow) {
  if (record.category === "sleep") {
    const event = isRecord(record.details) && record.details.event === "woke" ? "wake" : "sleep";
    return `/record/${event}?edit=${record.id}`;
  }

  if (record.category === "toilet" || record.category === "food" || record.category === "condition") {
    return `/record/${record.category}?edit=${record.id}`;
  }

  return undefined;
}

function getUrgencyLabel(value: unknown) {
  if (value === "relaxed") return "여유";
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
