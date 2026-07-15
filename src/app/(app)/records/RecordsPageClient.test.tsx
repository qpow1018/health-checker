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
    expect(screen.getByRole("heading", { name: "저장한 기록을 확인해요" })).toBeInTheDocument();
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
});
