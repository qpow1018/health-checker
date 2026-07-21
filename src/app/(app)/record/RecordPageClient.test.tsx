import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import {
  formatRecordDashboardDate,
  getRecordDashboardDateRange,
  getRecordDashboardMonthKey,
} from "./_util/recordDashboard";
import RecordPageClient from "./RecordPageClient";

const push = vi.fn();
const healthRecordMocks = vi.hoisted(() => ({
  listHealthRecords: vi.fn(),
}));
const recordFavoriteMocks = vi.hoisted(() => ({
  createHealthRecordFromFavorite: vi.fn(),
  listRecordFavorites: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record",
  useRouter: () => ({
    push,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  listHealthRecords: healthRecordMocks.listHealthRecords,
}));

vi.mock("@/api/recordFavorites", () => ({
  createHealthRecordFromFavorite: recordFavoriteMocks.createHealthRecordFromFavorite,
  listRecordFavorites: recordFavoriteMocks.listRecordFavorites,
}));

describe("RecordPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    healthRecordMocks.listHealthRecords.mockResolvedValue([]);
    recordFavoriteMocks.listRecordFavorites.mockResolvedValue([]);
  });

  test("reviews a favorite and records it at the current time", async () => {
    const user = userEvent.setup();
    recordFavoriteMocks.listRecordFavorites.mockResolvedValue([
      createFavorite("favorite-1", "아침 커피", "food", {
        source: "카페",
        foods: [{ name: "커피", amount: "1잔" }],
      }),
    ]);
    recordFavoriteMocks.createHealthRecordFromFavorite.mockResolvedValue({ id: "record-5" });

    render(<QueryProvider><RecordPageClient /></QueryProvider>);

    const section = await screen.findByRole("region", { name: "즐겨찾기" });
    const sectionTitle = within(section).getByRole("heading", { name: "즐겨찾기" });
    expect(sectionTitle.nextElementSibling).toHaveTextContent(
      "현재 시각으로 새 기록을 만들어요.",
    );
    const favoriteButton = await within(section).findByRole("button", { name: "아침 커피" });
    expect(favoriteButton).toHaveAttribute("data-color", "accent");
    expect(favoriteButton).toHaveAttribute("data-fill", "soft");
    expect(favoriteButton).toHaveTextContent(/^아침 커피$/);
    await user.click(favoriteButton);

    const dialog = screen.getByRole("dialog", { name: "아침 커피" });
    expect(within(dialog).getByText("가게·브랜드")).toBeInTheDocument();
    expect(within(dialog).getAllByText("먹은 것")).toHaveLength(1);
    await user.click(within(dialog).getByRole("button", { name: "지금 기록하기" }));

    expect(recordFavoriteMocks.createHealthRecordFromFavorite).toHaveBeenCalledWith("favorite-1");
    expect(screen.queryByRole("dialog", { name: "아침 커피" })).not.toBeInTheDocument();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("moves to the available record pages from their actions", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><RecordPageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "기상 시간" }));
    await user.click(screen.getByRole("button", { name: "먹은 것" }));
    await user.click(screen.getByRole("button", { name: "화장실" }));
    await user.click(screen.getByRole("button", { name: "운동" }));
    await user.click(screen.getByRole("button", { name: "컨디션" }));

    expect(push).toHaveBeenCalledWith("/record/wake");
    expect(push).toHaveBeenCalledWith("/record/food");
    expect(push).toHaveBeenCalledWith("/record/toilet");
    expect(push).toHaveBeenCalledWith("/record/exercise");
    expect(push).toHaveBeenCalledWith("/record/condition");
  });

  test("shows today's empty dashboard and the record action grid", async () => {
    const today = new Date();
    render(<QueryProvider><RecordPageClient /></QueryProvider>);

    expect(screen.getByRole("main", { name: "기록 화면" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "기록하기", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(formatRecordDashboardDate(today))).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "오늘" })).not.toBeInTheDocument();

    const dashboard = await screen.findByRole("region", { name: "오늘 기록" });
    expect(await within(dashboard).findByText("0건")).toBeInTheDocument();
    expect(within(dashboard).getByText("오늘 기록이 아직 없어요.")).toBeInTheDocument();
    expect(healthRecordMocks.listHealthRecords).toHaveBeenCalledWith(
      getRecordDashboardDateRange(today),
    );

    const actionSection = screen.getByRole("region", { name: "기록 버튼" });
    expect(actionSection).toBeInTheDocument();
    const actionButtons = within(actionSection).getAllByRole("button");
    expect(actionButtons.map((button) => button.textContent)).toEqual([
      "먹은 것",
      "화장실",
      "기상 시간",
      "운동",
      "컨디션",
    ]);

    expect(screen.getByRole("button", { name: "먹은 것" })).toHaveAttribute(
      "data-fill",
      "soft",
    );
    expect(screen.getByRole("button", { name: "화장실" })).toHaveAttribute(
      "data-size",
      "large",
    );
    expect(screen.getByRole("button", { name: "기상 시간" })).toHaveAttribute(
      "data-fill",
      "outline",
    );
    expect(screen.getByRole("button", { name: "운동" })).toHaveAttribute(
      "data-size",
      "medium",
    );
    expect(screen.queryByRole("button", { name: "잠든 시간" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "컨디션" })).toBeInTheDocument();

    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("href", "/records");
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
  });

  test("shows the latest three records and links them to detail", async () => {
    const today = new Date();
    const monthKey = getRecordDashboardMonthKey(today);
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      createRecord("record-1", "condition", today, { note: "두통" }, 14),
      createRecord("record-2", "food", today, { foods: [{ name: "커피", amount: "2잔" }] }, 12),
      createRecord("record-3", "sleep", today, { event: "woke" }, 7),
      createRecord(
        "record-4",
        "toilet",
        today,
        { type: "urine", urgency: "ordinary", wokeFromSleep: false },
        6,
      ),
    ]);

    render(<QueryProvider><RecordPageClient /></QueryProvider>);

    const dashboard = await screen.findByRole("region", { name: "오늘 기록" });
    expect(await within(dashboard).findByText("4건")).toBeInTheDocument();
    expect(within(dashboard).getByText("두통")).toBeInTheDocument();
    expect(within(dashboard).getByText("커피 2잔")).toBeInTheDocument();
    expect(within(dashboard).getByText("기상 시간")).toBeInTheDocument();
    expect(within(dashboard).queryByText("화장실")).not.toBeInTheDocument();
    expect(within(dashboard).getByRole("link", { name: "전체 보기" })).toHaveAttribute(
      "href",
      `/records?month=${monthKey}`,
    );
    expect(within(dashboard).getByRole("link", { name: /두통/ })).toHaveAttribute(
      "href",
      `/records/record-1?month=${monthKey}`,
    );
  });

  test("refreshes the dashboard date and query range at local midnight", async () => {
    vi.useFakeTimers();
    const beforeMidnight = new Date(2026, 6, 31, 23, 59, 59);
    const afterMidnight = new Date(2026, 7, 1, 0, 0, 0);
    vi.setSystemTime(beforeMidnight);

    render(<QueryProvider><RecordPageClient /></QueryProvider>);

    expect(screen.getByText(formatRecordDashboardDate(beforeMidnight))).toBeInTheDocument();
    expect(healthRecordMocks.listHealthRecords).toHaveBeenCalledWith(
      getRecordDashboardDateRange(beforeMidnight),
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(screen.getByText(formatRecordDashboardDate(afterMidnight))).toBeInTheDocument();
    expect(healthRecordMocks.listHealthRecords).toHaveBeenLastCalledWith(
      getRecordDashboardDateRange(afterMidnight),
    );
  });

  test("refreshes the dashboard date when the window regains focus", async () => {
    vi.useFakeTimers();
    const previousDate = new Date(2026, 6, 31, 12, 0, 0);
    const currentDate = new Date(2026, 7, 1, 12, 0, 0);
    vi.setSystemTime(previousDate);

    render(<QueryProvider><RecordPageClient /></QueryProvider>);
    expect(screen.getByText(formatRecordDashboardDate(previousDate))).toBeInTheDocument();

    await act(async () => {
      vi.setSystemTime(currentDate);
      window.dispatchEvent(new Event("focus"));
    });

    expect(screen.getByText(formatRecordDashboardDate(currentDate))).toBeInTheDocument();
    expect(healthRecordMocks.listHealthRecords).toHaveBeenLastCalledWith(
      getRecordDashboardDateRange(currentDate),
    );
  });
});

function createRecord(
  id: string,
  category: string,
  date: Date,
  details: Record<string, unknown>,
  hour: number,
) {
  const recordedAt = new Date(date);
  recordedAt.setHours(hour, 0, 0, 0);

  return {
    id,
    user_id: "user-1",
    category,
    recorded_at: recordedAt.toISOString(),
    details,
    details_version: 1,
    created_at: recordedAt.toISOString(),
    updated_at: recordedAt.toISOString(),
  };
}

function createFavorite(
  id: string,
  title: string,
  category: string,
  details: Record<string, unknown>,
) {
  return {
    id,
    user_id: "user-1",
    title,
    category,
    details,
    details_version: 1,
    sort_order: 0,
    created_at: "2026-07-20T08:00:00.000Z",
    updated_at: "2026-07-20T08:00:00.000Z",
  };
}
