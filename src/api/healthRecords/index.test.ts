import { beforeEach, describe, expect, test, vi } from "vitest";

import {
  createConditionRecord,
  createExerciseRecord,
  createFoodRecord,
  createWakeRecord,
  createToiletRecord,
  deleteHealthRecord,
  listHealthRecords,
  updateHealthRecord,
} from "./index";

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    from: supabaseMocks.from,
  }),
}));

describe("healthRecords API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("stores a wake event using the selected local date and time", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "record-1" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    supabaseMocks.from.mockReturnValue({ insert });

    await createWakeRecord({ date: "2026-07-15", time: "08:30" });

    expect(supabaseMocks.from).toHaveBeenCalledWith("health_records");
    expect(insert).toHaveBeenCalledWith({
      category: "sleep",
      recorded_at: new Date("2026-07-15T08:30:00").toISOString(),
      details: { event: "woke" },
      details_version: 1,
    });
  });

  test("lists records within the selected month in reverse chronological order", async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const lt = vi.fn().mockReturnValue({ order });
    const gte = vi.fn().mockReturnValue({ lt });
    const select = vi.fn().mockReturnValue({ gte });

    supabaseMocks.from.mockReturnValue({ select });

    await listHealthRecords({
      from: "2026-06-30T15:00:00.000Z",
      to: "2026-07-31T15:00:00.000Z",
    });

    expect(supabaseMocks.from).toHaveBeenCalledWith("health_records");
    expect(gte).toHaveBeenCalledWith("recorded_at", "2026-06-30T15:00:00.000Z");
    expect(lt).toHaveBeenCalledWith("recorded_at", "2026-07-31T15:00:00.000Z");
    expect(order).toHaveBeenCalledWith("recorded_at", { ascending: false });
  });

  test("updates the selected record without changing its category", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: "record-1" }, error: null });
    const select = vi.fn().mockReturnValue({ maybeSingle });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });

    supabaseMocks.from.mockReturnValue({ update });

    await updateHealthRecord({
      id: "record-1",
      date: "2026-07-16",
      time: "08:30",
      details: { foods: [{ name: "커피" }] },
    });

    expect(update).toHaveBeenCalledWith({
      recorded_at: new Date("2026-07-16T08:30:00").toISOString(),
      details: { foods: [{ name: "커피" }] },
    });
    expect(eq).toHaveBeenCalledWith("id", "record-1");
  });

  test("deletes only the selected record", async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const deleteRecords = vi.fn().mockReturnValue({ eq });

    supabaseMocks.from.mockReturnValue({ delete: deleteRecords });

    await deleteHealthRecord("record-1");

    expect(deleteRecords).toHaveBeenCalledOnce();
    expect(eq).toHaveBeenCalledWith("id", "record-1");
  });

  test("stores a toilet record with selected details", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "record-2" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    supabaseMocks.from.mockReturnValue({ insert });

    await createToiletRecord({
      date: "2026-07-15",
      time: "06:30",
      details: {
        type: "bowel",
        urgency: "ordinary",
        wokeFromSleep: false,
        stoolConsistency: "loose",
        note: "복통 있음",
      },
    });

    expect(insert).toHaveBeenCalledWith({
      category: "toilet",
      recorded_at: new Date("2026-07-15T06:30:00").toISOString(),
      details: {
        type: "bowel",
        urgency: "ordinary",
        wokeFromSleep: false,
        stoolConsistency: "loose",
        note: "복통 있음",
      },
      details_version: 1,
    });
  });

  test("stores food items after trimming their input", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "record-3" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    supabaseMocks.from.mockReturnValue({ insert });

    await createFoodRecord({
      date: "2026-07-15",
      time: "08:30",
      source: " 카페 ",
      foods: [
        { name: " 커피 ", amount: " 2잔 " },
        { name: "" },
      ],
    });

    expect(insert).toHaveBeenCalledWith({
      category: "food",
      recorded_at: new Date("2026-07-15T08:30:00").toISOString(),
      details: { source: "카페", foods: [{ name: "커피", amount: "2잔" }] },
      details_version: 1,
    });
  });

  test("rejects a food record without a food name", async () => {
    await expect(
      createFoodRecord({ date: "2026-07-15", time: "08:30", foods: [{ name: " " }] }),
    ).rejects.toThrow("먹은 것을 하나 이상 입력해 주세요.");
  });

  test("omits an empty food source", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "record-3" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    supabaseMocks.from.mockReturnValue({ insert });

    await createFoodRecord({
      date: "2026-07-15",
      time: "08:30",
      source: " ",
      foods: [{ name: "커피" }],
    });

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      details: { foods: [{ name: "커피" }] },
    }));
  });

  test("stores exercise items after trimming their input", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "record-5" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    supabaseMocks.from.mockReturnValue({ insert });

    await createExerciseRecord({
      date: "2026-07-16",
      time: "19:30",
      exercises: [
        { name: " 산책 ", amount: " 30분 " },
        { name: "팔굽혀펴기", amount: "20회" },
        { name: " " },
      ],
    });

    expect(insert).toHaveBeenCalledWith({
      category: "exercise",
      recorded_at: new Date("2026-07-16T19:30:00").toISOString(),
      details: {
        exercises: [
          { name: "산책", amount: "30분" },
          { name: "팔굽혀펴기", amount: "20회" },
        ],
      },
      details_version: 1,
    });
  });

  test("rejects an exercise record without an exercise name", async () => {
    await expect(
      createExerciseRecord({
        date: "2026-07-16",
        time: "19:30",
        exercises: [{ name: " " }],
      }),
    ).rejects.toThrow("운동을 하나 이상 입력해 주세요.");
  });

  test("stores a condition note after trimming it", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "record-4" }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });

    supabaseMocks.from.mockReturnValue({ insert });

    await createConditionRecord({
      date: "2026-07-16",
      time: "14:20",
      note: " 두통 ",
    });

    expect(insert).toHaveBeenCalledWith({
      category: "condition",
      recorded_at: new Date("2026-07-16T14:20:00").toISOString(),
      details: { note: "두통" },
      details_version: 1,
    });
  });

  test("rejects a condition record without a note", async () => {
    await expect(
      createConditionRecord({ date: "2026-07-16", time: "14:20", note: " " }),
    ).rejects.toThrow("불편했던 점을 입력해 주세요.");
  });

  test("rejects an invalid date before creating a record", async () => {
    await expect(
      createWakeRecord({ date: "2026-02-31", time: "08:30" }),
    ).rejects.toThrow("날짜와 시간을 올바르게 입력해 주세요.");
  });
});
