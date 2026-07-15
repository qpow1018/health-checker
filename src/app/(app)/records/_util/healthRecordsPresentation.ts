import type { THealthRecordRow } from "@/api/healthRecords/type";

export function getRecordCategoryLabel(record: THealthRecordRow) {
  if (record.category === "sleep") {
    return getSleepEvent(record.details) === "woke" ? "기상 시간" : "잠든 시간";
  }

  return record.category;
}

export function formatRecordDateTime(recordedAt: string) {
  const date = new Date(recordedAt);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSleepEvent(details: THealthRecordRow["details"]) {
  if (!isRecord(details) || typeof details.event !== "string") {
    return undefined;
  }

  return details.event;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
