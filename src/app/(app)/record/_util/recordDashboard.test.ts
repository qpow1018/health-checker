import { describe, expect, test } from "vitest";

import {
  formatRecordDashboardDate,
  getRecordDashboardDateRange,
  getRecordDashboardMonthKey,
} from "./recordDashboard";

describe("recordDashboard", () => {
  const date = new Date(2026, 6, 16, 14, 20);

  test("creates the local range for the selected day", () => {
    expect(getRecordDashboardDateRange(date)).toEqual({
      from: new Date(2026, 6, 16).toISOString(),
      to: new Date(2026, 6, 17).toISOString(),
    });
  });

  test("formats the dashboard date and month key", () => {
    expect(formatRecordDashboardDate(date)).toBe("7월 16일 목요일");
    expect(getRecordDashboardMonthKey(date)).toBe("2026-07");
  });
});
