import { beforeEach, describe, expect, test, vi } from "vitest";

import { createSleepRecord, listHealthRecords } from "./index";

const supabaseMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: supabaseMocks.getUser,
    },
    from: supabaseMocks.from,
  }),
}));

describe("healthRecords API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("stores a sleep event using the selected local date and time", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "record-1" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    supabaseMocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    supabaseMocks.from.mockReturnValue({ insert });

    await createSleepRecord({ date: "2026-07-15", time: "23:30", event: "slept" });

    expect(supabaseMocks.from).toHaveBeenCalledWith("health_records");
    expect(insert).toHaveBeenCalledWith({
      category: "sleep",
      recorded_at: new Date("2026-07-15T23:30:00").toISOString(),
      details: { event: "slept" },
      details_version: 1,
    });
  });

  test("lists recent records in reverse chronological order", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [], error: null });
    const order = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ order });

    supabaseMocks.from.mockReturnValue({ select });

    await listHealthRecords({ limit: 20 });

    expect(supabaseMocks.from).toHaveBeenCalledWith("health_records");
    expect(order).toHaveBeenCalledWith("recorded_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(20);
  });

  test("rejects saving without an authenticated user", async () => {
    supabaseMocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(
      createSleepRecord({ date: "2026-07-15", time: "23:30", event: "slept" }),
    ).rejects.toThrow("로그인한 사용자만 기록을 저장할 수 있습니다.");
  });

  test("rejects an invalid date before creating a record", async () => {
    supabaseMocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    await expect(
      createSleepRecord({ date: "2026-02-31", time: "23:30", event: "slept" }),
    ).rejects.toThrow("날짜와 시간을 올바르게 입력해 주세요.");
  });
});
