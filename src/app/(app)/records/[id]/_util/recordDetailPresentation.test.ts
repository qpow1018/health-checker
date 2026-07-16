import { describe, expect, test } from "vitest";

import type { THealthRecordRow } from "@/api/healthRecords/type";

import { getRecordDetailItems, getRecordEditPath } from "./recordDetailPresentation";

function createRecord(overrides: Partial<THealthRecordRow>): THealthRecordRow {
  return {
    id: "record-1",
    user_id: "user-1",
    category: "food",
    recorded_at: "2026-07-16T08:30:00.000Z",
    details: {},
    details_version: 1,
    created_at: "2026-07-16T08:30:00.000Z",
    updated_at: "2026-07-16T08:30:00.000Z",
    ...overrides,
  };
}

describe("recordDetailPresentation", () => {
  test("shows every recorded food item and opens its edit form", () => {
    const record = createRecord({
      details: { foods: [{ name: "커피", amount: "2잔" }, { name: "토스트" }] },
    });

    expect(getRecordDetailItems(record)).toEqual([
      { label: "음식", value: "커피 · 2잔\n토스트" },
    ]);
    expect(getRecordEditPath(record)).toBe("/record/food?edit=record-1");
  });

  test("shows optional toilet details only when recorded", () => {
    const record = createRecord({
      category: "toilet",
      details: { type: "bowel", urgency: "urgent", wokeFromSleep: false, note: "복통" },
    });

    expect(getRecordDetailItems(record)).toEqual([
      { label: "종류", value: "대변 기록" },
      { label: "급한 정도", value: "급함" },
      { label: "잠에서 깬 뒤인지", value: "아니오" },
      { label: "특이사항", value: "복통" },
    ]);
    expect(getRecordEditPath(record)).toBe("/record/toilet?edit=record-1");
  });
});
