import { describe, expect, test } from "vitest";

import {
  formatRecordMonth,
  getAdjacentRecordMonth,
  getRecordMonthKey,
  getRecordMonthRange,
  isRecordMonthKey,
} from "./recordsMonth";

describe("recordsMonth", () => {
  test("creates a zero-padded month key", () => {
    expect(getRecordMonthKey(new Date(2026, 0, 15))).toBe("2026-01");
  });

  test("moves across year boundaries", () => {
    expect(getAdjacentRecordMonth("2026-01", -1)).toBe("2025-12");
    expect(getAdjacentRecordMonth("2026-12", 1)).toBe("2027-01");
  });

  test("creates an inclusive start and exclusive end for the local month", () => {
    expect(getRecordMonthRange("2026-07")).toEqual({
      from: new Date(2026, 6, 1).toISOString(),
      to: new Date(2026, 7, 1).toISOString(),
    });
  });

  test("formats a Korean month label", () => {
    expect(formatRecordMonth("2026-07")).toBe("2026년 7월");
  });

  test("accepts only valid month query values", () => {
    expect(isRecordMonthKey("2026-07")).toBe(true);
    expect(isRecordMonthKey("2026-13")).toBe(false);
    expect(isRecordMonthKey("2026-7")).toBe(false);
    expect(isRecordMonthKey(null)).toBe(false);
  });
});
