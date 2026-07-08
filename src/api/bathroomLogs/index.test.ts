import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createBathroomLog,
  deleteBathroomLog,
  listBathroomLogs,
  updateBathroomLogDetails,
} from "./index";

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

describe("bathroomLogs API", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    supabaseMocks.getUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      error: null,
    });
  });

  test("creates a bathroom log owned by the current user", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-07T02:30:00.000Z"));

    const single = vi.fn().mockResolvedValue({
      data: {
        id: "log-1",
        user_id: "user-1",
        kind: "urine",
        logged_at: "2026-07-07T02:30:00.000Z",
        urgency: null,
        woke_from_sleep: null,
        note: null,
        urine_pain: null,
        urine_color_unusual: null,
        stool_state: null,
        bowel_pain: null,
        possible_blood: null,
        created_at: "2026-07-07T02:30:00.000Z",
        updated_at: "2026-07-07T02:30:00.000Z",
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    supabaseMocks.from.mockReturnValue({ insert });

    const result = await createBathroomLog({ kind: "urine" });

    expect(supabaseMocks.from).toHaveBeenCalledWith("bathroom_logs");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-1",
      kind: "urine",
      logged_at: "2026-07-07T02:30:00.000Z",
    });
    expect(select).toHaveBeenCalledWith("*");
    expect(result.id).toBe("log-1");
  });

  test("updates details for a bathroom log", async () => {
    const eq = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const update = vi.fn(() => ({ eq }));
    supabaseMocks.from.mockReturnValue({ update });

    await updateBathroomLogDetails("log-1", {
      urgency: "urgent",
      woke_from_sleep: false,
      note: "저녁 이후",
      urine_pain: true,
      urine_color_unusual: false,
      stool_state: null,
      bowel_pain: null,
      possible_blood: null,
    });

    expect(supabaseMocks.from).toHaveBeenCalledWith("bathroom_logs");
    expect(update).toHaveBeenCalledWith({
      urgency: "urgent",
      woke_from_sleep: false,
      note: "저녁 이후",
      urine_pain: true,
      urine_color_unusual: false,
      stool_state: null,
      bowel_pain: null,
      possible_blood: null,
    });
    expect(eq).toHaveBeenCalledWith("id", "log-1");
  });

  test("deletes a bathroom log by id", async () => {
    const eq = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const deleteQuery = vi.fn(() => ({ eq }));
    supabaseMocks.from.mockReturnValue({ delete: deleteQuery });

    await deleteBathroomLog("log-1");

    expect(supabaseMocks.from).toHaveBeenCalledWith("bathroom_logs");
    expect(deleteQuery).toHaveBeenCalledWith();
    expect(eq).toHaveBeenCalledWith("id", "log-1");
  });

  test("lists bathroom logs from newest to oldest with a limit", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: "log-2",
          user_id: "user-1",
          kind: "bowel",
          logged_at: "2026-07-08T09:00:00.000Z",
          urgency: null,
          woke_from_sleep: null,
          note: null,
          urine_pain: null,
          urine_color_unusual: null,
          stool_state: null,
          bowel_pain: null,
          possible_blood: null,
          created_at: "2026-07-08T09:00:00.000Z",
          updated_at: "2026-07-08T09:00:00.000Z",
        },
      ],
      error: null,
    });
    const order = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ order }));
    supabaseMocks.from.mockReturnValue({ select });

    const result = await listBathroomLogs({ limit: 30 });

    expect(supabaseMocks.from).toHaveBeenCalledWith("bathroom_logs");
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("logged_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(30);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("log-2");
  });

  test("throws when there is no authenticated user for create", async () => {
    supabaseMocks.getUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: null,
    });

    await expect(createBathroomLog({ kind: "bowel" })).rejects.toThrow(
      "로그인한 사용자만 기록을 저장할 수 있습니다.",
    );
  });
});
