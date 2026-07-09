import { describe, expect, test } from "vitest";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import {
  createCalendarDays,
  createMonthKey,
  createMonthRange,
  filterLogsByDateKey,
  formatRecordDateKey,
} from "./recordsCalendar";

function createLog(
  id: string,
  kind: TBathroomLogRow["kind"],
  loggedAt: string,
): TBathroomLogRow {
  return {
    id,
    user_id: "user-1",
    kind,
    logged_at: loggedAt,
    urgency: null,
    woke_from_sleep: null,
    note: null,
    urine_pain: null,
    urine_color_unusual: null,
    stool_state: null,
    bowel_pain: null,
    possible_blood: null,
    created_at: loggedAt,
    updated_at: loggedAt,
  };
}

const LOGS = [
  createLog("urine", "urine", "2026-07-07T15:30:00.000Z"),
  createLog("bowel", "bowel", "2026-07-08T01:00:00.000Z"),
  createLog("both", "both", "2026-07-08T02:00:00.000Z"),
];

describe("recordsCalendar", () => {
  test("creates a zero-padded month key", () => {
    expect(createMonthKey(2026, 6)).toBe("2026-07");
  });

  test("creates a half-open July range using the Seoul date boundary", () => {
    expect(createMonthRange(2026, 6)).toEqual({
      from: "2026-06-30T15:00:00.000Z",
      to: "2026-07-31T15:00:00.000Z",
    });
  });

  test("formats record timestamps as Seoul date keys", () => {
    expect(formatRecordDateKey("2026-07-07T15:30:00.000Z")).toBe(
      "2026-07-08",
    );
  });

  test("creates 42 cells and aggregates record kinds on Seoul dates", () => {
    const days = createCalendarDays(2026, 6, LOGS);
    const julyEighth = days.find((day) => day.dateKey === "2026-07-08");

    expect(days).toHaveLength(42);
    expect(days[0]).toMatchObject({
      dateKey: "2026-06-28",
      isCurrentMonth: false,
    });
    expect(julyEighth).toMatchObject({
      dayOfMonth: 8,
      isCurrentMonth: true,
      urineCount: 2,
      bowelCount: 2,
      hasRecords: true,
    });
  });

  test("filters all records that belong to a Seoul date key", () => {
    expect(filterLogsByDateKey(LOGS, "2026-07-08")).toEqual(LOGS);
  });
});
