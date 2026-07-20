import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import {
  formatRecordMonth,
  getAdjacentRecordMonth,
  getRecordMonthKey,
  getRecordMonthRange,
} from "./_util/recordsMonth";
import { RecordsPageClient } from "./RecordsPageClient";

const healthRecordMocks = vi.hoisted(() => ({
  listHealthRecords: vi.fn(),
}));
const navigationMocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/records",
  useRouter: () => ({ replace: navigationMocks.replace }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

vi.mock("@/api/healthRecords", () => ({
  listHealthRecords: healthRecordMocks.listHealthRecords,
}));

describe("RecordsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/records");
    navigationMocks.replace.mockImplementation((href: string) => {
      window.history.replaceState({}, "", href);
    });
  });

  test("shows an empty state when there are no records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([]);
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(screen.getByRole("main", { name: "기록 보기 화면" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "기록 보기" })).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "빈 기록" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록하러 가기" })).toHaveAttribute(
      "href",
      "/record",
    );
  });

  test("loads the selected month and prevents moving beyond the current month", async () => {
    const user = userEvent.setup();
    const currentMonthKey = getRecordMonthKey();
    const previousMonthKey = getAdjacentRecordMonth(currentMonthKey, -1);
    healthRecordMocks.listHealthRecords.mockResolvedValue([]);

    const { rerender } = render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    await waitFor(() => {
      expect(healthRecordMocks.listHealthRecords).toHaveBeenCalledWith(
        getRecordMonthRange(currentMonthKey),
      );
    });
    expect(screen.getByText(formatRecordMonth(currentMonthKey))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 달" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "이전 달" }));
    expect(navigationMocks.replace).toHaveBeenCalledWith(
      `/records?month=${previousMonthKey}`,
      { scroll: false },
    );

    rerender(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(screen.getByText(formatRecordMonth(previousMonthKey))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다음 달" })).toBeEnabled();
    await waitFor(() => {
      expect(healthRecordMocks.listHealthRecords).toHaveBeenLastCalledWith(
        getRecordMonthRange(previousMonthKey),
      );
    });
  });

  test("keeps the selected month in record detail links", async () => {
    window.history.replaceState({}, "", "/records?month=2026-06");
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-1",
        user_id: "user-1",
        category: "sleep",
        recorded_at: "2026-06-15T14:30:00.000Z",
        details: { event: "woke" },
        details_version: 1,
        created_at: "2026-06-15T14:30:00.000Z",
        updated_at: "2026-06-15T14:30:00.000Z",
      },
    ]);

    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(await screen.findByRole("link", { name: /기상 시간/ })).toHaveAttribute(
      "href",
      "/records/record-1?month=2026-06",
    );
  });

  test("shows preview records without loading saved records", () => {
    window.history.replaceState({}, "", "/records?preview=1");
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(screen.getByText("커피 2잔, 토스트")).toBeInTheDocument();
    expect(healthRecordMocks.listHealthRecords).not.toHaveBeenCalled();
  });

  test("shows a loading indicator while records are loading", () => {
    healthRecordMocks.listHealthRecords.mockReturnValue(new Promise(() => {}));
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(screen.getByRole("status", { name: "기록을 불러오는 중" })).toBeInTheDocument();
  });

  test("shows recent wake records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-1",
        user_id: "user-1",
        category: "sleep",
        recorded_at: "2026-07-15T14:30:00.000Z",
        details: { event: "woke" },
        details_version: 1,
        created_at: "2026-07-15T14:30:00.000Z",
        updated_at: "2026-07-15T14:30:00.000Z",
      },
    ]);
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "기상 시간",
    );
  });

  test("shows the toilet record type", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-2",
        user_id: "user-1",
        category: "toilet",
        recorded_at: "2026-07-15T06:30:00.000Z",
        details: {
          type: "bowel",
          urgency: "ordinary",
          wokeFromSleep: false,
          stoolConsistency: "loose",
        },
        details_version: 1,
        created_at: "2026-07-15T06:30:00.000Z",
        updated_at: "2026-07-15T06:30:00.000Z",
      },
    ]);
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    const recordList = await screen.findByRole("region", { name: "최근 기록 목록" });
    expect(recordList).toHaveTextContent("화장실");
    expect(recordList).toHaveTextContent("대변");
  });

  test("shows food records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-3",
        user_id: "user-1",
        category: "food",
        recorded_at: "2026-07-15T08:30:00.000Z",
        details: { source: "카페", foods: [{ name: "커피", amount: "2잔" }] },
        details_version: 1,
        created_at: "2026-07-15T08:30:00.000Z",
        updated_at: "2026-07-15T08:30:00.000Z",
      },
    ]);
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "먹은 것",
    );
    expect(screen.getByText("카페 · 커피 2잔")).toBeInTheDocument();
  });

  test("shows exercise records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-5",
        user_id: "user-1",
        category: "exercise",
        recorded_at: "2026-07-16T10:30:00.000Z",
        details: {
          exercises: [
            { name: "산책", amount: "30분" },
            { name: "팔굽혀펴기", amount: "20회" },
          ],
        },
        details_version: 1,
        created_at: "2026-07-16T10:30:00.000Z",
        updated_at: "2026-07-16T10:30:00.000Z",
      },
    ]);
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "운동",
    );
    expect(screen.getByText("산책 30분, 팔굽혀펴기 20회")).toBeInTheDocument();
  });

  test("shows condition notes in recent records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-4",
        user_id: "user-1",
        category: "condition",
        recorded_at: "2026-07-16T14:20:00.000Z",
        details: { note: "두통\n오후부터 시작" },
        details_version: 1,
        created_at: "2026-07-16T14:20:00.000Z",
        updated_at: "2026-07-16T14:20:00.000Z",
      },
    ]);
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "컨디션",
    );
    expect(screen.getByText("두통")).toBeInTheDocument();
  });

  test("groups records by date and shows a food description", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-5",
        user_id: "user-1",
        category: "food",
        recorded_at: "2026-07-16T08:30:00.000Z",
        details: { foods: [{ name: "커피", amount: "2잔" }] },
        details_version: 1,
        created_at: "2026-07-16T08:30:00.000Z",
        updated_at: "2026-07-16T08:30:00.000Z",
      },
      {
        id: "record-6",
        user_id: "user-1",
        category: "sleep",
        recorded_at: "2026-07-15T14:30:00.000Z",
        details: { event: "woke" },
        details_version: 1,
        created_at: "2026-07-15T14:30:00.000Z",
        updated_at: "2026-07-15T14:30:00.000Z",
      },
    ]);
    render(<QueryProvider><RecordsPageClient /></QueryProvider>);

    expect(await screen.findByText("커피 2잔")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });
});
