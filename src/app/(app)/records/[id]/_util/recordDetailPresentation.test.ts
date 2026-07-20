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
      details: { source: "카페", foods: [{ name: "커피", amount: "2잔" }, { name: "토스트" }] },
    });

    expect(getRecordDetailItems(record)).toEqual([
      { label: "가게·브랜드", value: "카페" },
      { label: "먹은 것", value: "커피 · 2잔\n토스트" },
    ]);
    expect(getRecordEditPath(record)).toBe("/record/food?edit=record-1");
  });

  test("shows optional toilet details only when recorded", () => {
    const record = createRecord({
      category: "toilet",
      details: {
        type: "bowel",
        urgency: "urgent",
        wokeFromSleep: false,
        stoolConsistency: "loose",
        note: "복통",
      },
    });

    expect(getRecordDetailItems(record)).toEqual([
      { label: "종류", value: "대변" },
      { label: "급한 정도", value: "급함" },
      { label: "자다가 깸", value: "아니오" },
      { label: "대변 상태", value: "묽음" },
      { label: "특이사항", value: "복통" },
    ]);
    expect(getRecordEditPath(record)).toBe("/record/toilet?edit=record-1");
  });

  test("shows every exercise item and opens its edit form", () => {
    const record = createRecord({
      category: "exercise",
      details: {
        exercises: [
          { name: "산책", amount: "30분" },
          { name: "팔굽혀펴기", amount: "20회" },
        ],
      },
    });

    expect(getRecordDetailItems(record)).toEqual([
      { label: "운동", value: "산책 · 30분\n팔굽혀펴기 · 20회" },
    ]);
    expect(getRecordEditPath(record)).toBe("/record/exercise?edit=record-1");
  });

  test("edits wake records but keeps legacy slept records read-only", () => {
    const wakeRecord = createRecord({
      category: "sleep",
      details: { event: "woke" },
    });
    const sleptRecord = createRecord({
      category: "sleep",
      details: { event: "slept" },
    });

    expect(getRecordDetailItems(wakeRecord)).toEqual([
      { label: "기록 종류", value: "기상" },
    ]);
    expect(getRecordEditPath(wakeRecord)).toBe("/record/wake?edit=record-1");
    expect(getRecordDetailItems(sleptRecord)).toEqual([
      { label: "기록 종류", value: "취침" },
    ]);
    expect(getRecordEditPath(sleptRecord)).toBeUndefined();
  });
});
