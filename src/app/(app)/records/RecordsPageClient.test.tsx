import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { RecordsPageClient } from "./RecordsPageClient";

const healthRecordMocks = vi.hoisted(() => ({
  listHealthRecords: vi.fn(),
}));

vi.mock("@/api/healthRecords", () => ({
  listHealthRecords: healthRecordMocks.listHealthRecords,
}));

describe("RecordsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows an empty state when there are no records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([]);
    render(<RecordsPageClient />);

    expect(screen.getByRole("main", { name: "기록 보기 화면" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "기록 보기" })).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "빈 기록" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록하러 가기" })).toHaveAttribute(
      "href",
      "/record",
    );
  });

  test("shows recent sleep records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-1",
        user_id: "user-1",
        category: "sleep",
        recorded_at: "2026-07-15T14:30:00.000Z",
        details: { event: "slept" },
        details_version: 1,
        created_at: "2026-07-15T14:30:00.000Z",
        updated_at: "2026-07-15T14:30:00.000Z",
      },
    ]);
    render(<RecordsPageClient />);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "잠든 시간",
    );
  });

  test("shows the toilet record type", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-2",
        user_id: "user-1",
        category: "toilet",
        recorded_at: "2026-07-15T06:30:00.000Z",
        details: { type: "bowel", stoolConsistency: "loose" },
        details_version: 1,
        created_at: "2026-07-15T06:30:00.000Z",
        updated_at: "2026-07-15T06:30:00.000Z",
      },
    ]);
    render(<RecordsPageClient />);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "대변 기록",
    );
  });

  test("shows food records", async () => {
    healthRecordMocks.listHealthRecords.mockResolvedValue([
      {
        id: "record-3",
        user_id: "user-1",
        category: "food",
        recorded_at: "2026-07-15T08:30:00.000Z",
        details: { foods: [{ name: "커피", amount: "2잔" }] },
        details_version: 1,
        created_at: "2026-07-15T08:30:00.000Z",
        updated_at: "2026-07-15T08:30:00.000Z",
      },
    ]);
    render(<RecordsPageClient />);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "음식 기록",
    );
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
    render(<RecordsPageClient />);

    expect(await screen.findByRole("region", { name: "최근 기록 목록" })).toHaveTextContent(
      "컨디션 기록",
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
        details: { event: "slept" },
        details_version: 1,
        created_at: "2026-07-15T14:30:00.000Z",
        updated_at: "2026-07-15T14:30:00.000Z",
      },
    ]);
    render(<RecordsPageClient />);

    expect(await screen.findByText("커피 2잔")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });
});
