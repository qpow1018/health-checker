import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import RecordDetailPageClient from "./RecordDetailPageClient";

const navigationMocks = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  searchParams: "month=2026-06",
}));
const healthRecordMocks = vi.hoisted(() => ({
  deleteHealthRecord: vi.fn(),
  getHealthRecord: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationMocks,
  useSearchParams: () => new URLSearchParams(navigationMocks.searchParams),
}));

vi.mock("@/api/healthRecords", () => ({
  deleteHealthRecord: healthRecordMocks.deleteHealthRecord,
  getHealthRecord: healthRecordMocks.getHealthRecord,
}));

vi.mock("@/utils/toast", () => ({
  default: {
    success: toastMocks.success,
  },
}));

describe("RecordDetailPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigationMocks.searchParams = "month=2026-06";
    healthRecordMocks.getHealthRecord.mockResolvedValue({
      id: "record-4",
      user_id: "user-1",
      category: "food",
      recorded_at: "2026-06-15T08:30:00.000Z",
      details: { foods: [{ name: "커피", amount: "2잔" }] },
      details_version: 1,
      created_at: "2026-06-15T08:30:00.000Z",
      updated_at: "2026-06-15T08:30:00.000Z",
    });
  });

  test("keeps the selected month when opening the edit page", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    expect(await screen.findByRole("heading", { name: "기록 상세" })).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "수정" }));

    expect(navigationMocks.push).toHaveBeenCalledWith(
      "/record/food?edit=record-4&month=2026-06",
    );
  });

  test("returns to the selected month after deleting the record", async () => {
    const user = userEvent.setup();
    healthRecordMocks.deleteHealthRecord.mockResolvedValue(undefined);
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    await user.click(await screen.findByRole("button", { name: "삭제" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "이 기록을 삭제할까요?" })).getByRole(
        "button",
        { name: "삭제" },
      ),
    );

    expect(healthRecordMocks.deleteHealthRecord).toHaveBeenCalledWith("record-4");
    expect(toastMocks.success).toHaveBeenCalledWith("기록을 삭제했습니다.");
    expect(navigationMocks.replace).toHaveBeenCalledWith("/records?month=2026-06");
  });

  test("keeps the selected category while editing and deleting", async () => {
    const user = userEvent.setup();
    navigationMocks.searchParams = "month=2026-06&category=food";
    healthRecordMocks.deleteHealthRecord.mockResolvedValue(undefined);
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    await user.click(await screen.findByRole("button", { name: "수정" }));
    expect(navigationMocks.push).toHaveBeenCalledWith(
      "/record/food?edit=record-4&month=2026-06&category=food",
    );

    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "이 기록을 삭제할까요?" })).getByRole(
        "button",
        { name: "삭제" },
      ),
    );

    expect(navigationMocks.replace).toHaveBeenCalledWith(
      "/records?month=2026-06&category=food",
    );
  });
});
