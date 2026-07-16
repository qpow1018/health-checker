import { describe, expect, test, vi } from "vitest";

import { formatDateString, getCurrentTimeString, getTodayDateString } from "./date";

describe("date utilities", () => {
  test("formats a date as YYYY-MM-DD", () => {
    expect(formatDateString(new Date(2026, 6, 5))).toBe("2026-07-05");
  });

  test("returns today's local date as YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 9, 30));

    expect(getTodayDateString()).toBe("2026-07-15");

    vi.useRealTimers();
  });

  test("returns the current local time as HH:mm", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 9, 5));

    expect(getCurrentTimeString()).toBe("09:05");

    vi.useRealTimers();
  });
});
