import { render, screen, waitFor, within } from "@testing-library/react";
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
const recordFavoriteMocks = vi.hoisted(() => ({
  createRecordFavorite: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
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

vi.mock("@/api/recordFavorites", () => ({
  createRecordFavorite: recordFavoriteMocks.createRecordFavorite,
}));

vi.mock("@/utils/toast", () => ({
  default: {
    error: toastMocks.error,
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
    recordFavoriteMocks.createRecordFavorite.mockResolvedValue({ id: "favorite-1" });
  });

  test("adds the current record to favorites with a title", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    await user.click(await screen.findByRole("button", { name: "즐겨찾기 추가" }));
    const dialog = screen.getByRole("dialog", { name: "즐겨찾기에 추가" });
    await user.type(within(dialog).getByRole("textbox", { name: "즐겨찾기 이름" }), "아침 커피");
    await user.click(within(dialog).getByRole("button", { name: "추가" }));

    expect(recordFavoriteMocks.createRecordFavorite).toHaveBeenCalledWith({
      recordId: "record-4",
      title: "아침 커피",
    });
    expect(toastMocks.success).toHaveBeenCalledWith("즐겨찾기에 추가했습니다.");
    expect(screen.queryByRole("dialog", { name: "즐겨찾기에 추가" })).not.toBeInTheDocument();
  });

  test("orders the record actions as delete, edit, and add favorite", async () => {
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    const actions = within(await screen.findByRole("group", { name: "기록 작업" }))
      .getAllByRole("button");

    expect(actions.map((button) => button.getAttribute("aria-label")))
      .toEqual(["기록 삭제", "기록 수정", "즐겨찾기 추가"]);
  });

  test("keeps the selected month when opening the edit page", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    expect(await screen.findByRole("heading", { name: "기록 상세" })).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "기록 수정" }));

    expect(navigationMocks.push).toHaveBeenCalledWith(
      "/record/food?edit=record-4&month=2026-06",
    );
  });

  test("returns to the selected month after deleting the record", async () => {
    const user = userEvent.setup();
    healthRecordMocks.deleteHealthRecord.mockResolvedValue(undefined);
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    await user.click(await screen.findByRole("button", { name: "기록 삭제" }));
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

    await user.click(await screen.findByRole("button", { name: "기록 수정" }));
    expect(navigationMocks.push).toHaveBeenCalledWith(
      "/record/food?edit=record-4&month=2026-06&category=food",
    );

    await user.click(screen.getByRole("button", { name: "기록 삭제" }));
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

  test("keeps the confirmation open and shows a toast when deletion fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.deleteHealthRecord.mockRejectedValueOnce(new Error("network"));
    render(<QueryProvider><RecordDetailPageClient recordId="record-4" /></QueryProvider>);

    await user.click(await screen.findByRole("button", { name: "기록 삭제" }));
    const dialog = screen.getByRole("dialog", { name: "이 기록을 삭제할까요?" });
    await user.click(within(dialog).getByRole("button", { name: "삭제" }));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith(
        "기록을 삭제하지 못했습니다. 다시 시도해 주세요.",
      );
    });
    expect(dialog).toBeInTheDocument();
    expect(navigationMocks.replace).not.toHaveBeenCalled();
  });
});
