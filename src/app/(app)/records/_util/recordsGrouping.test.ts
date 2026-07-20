import { describe, expect, test } from "vitest";

import type { THealthRecordRow } from "@/api/healthRecords/type";

import { groupRecordsByDate } from "./recordsGrouping";

describe("groupRecordsByDate", () => {
  test("groups date-ordered records by local date", () => {
    const firstRecord = createRecord("record-1", new Date(2026, 6, 16, 14, 30));
    const secondRecord = createRecord("record-2", new Date(2026, 6, 16, 8, 30));
    const previousDateRecord = createRecord("record-3", new Date(2026, 6, 15, 22, 30));

    const groups = groupRecordsByDate([firstRecord, secondRecord, previousDateRecord]);

    expect(groups).toHaveLength(2);
    expect(groups[0].records).toEqual([firstRecord, secondRecord]);
    expect(groups[1].records).toEqual([previousDateRecord]);
  });
});

function createRecord(id: string, recordedAt: Date): THealthRecordRow {
  const timestamp = recordedAt.toISOString();

  return {
    id,
    user_id: "user-1",
    category: "condition",
    recorded_at: timestamp,
    details: { note: "두통" },
    details_version: 1,
    created_at: timestamp,
    updated_at: timestamp,
  };
}
