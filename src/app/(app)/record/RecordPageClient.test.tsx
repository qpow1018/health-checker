import { render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import RecordPageClient from "./RecordPageClient";

vi.mock("next/navigation", () => ({
  usePathname: () => "/record",
}));

describe("RecordPageClient", () => {
  test("shows the new record UI sections and bottom tabs", () => {
    render(<RecordPageClient />);

    expect(screen.getByRole("main", { name: "기록 화면" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "기록하기", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "오늘" })).toBeInTheDocument();

    expect(
      screen.getByRole("region", { name: "오늘 기록 요약" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "요약" })).toBeInTheDocument();
    expect(screen.getByText("마지막 기록")).toBeInTheDocument();
    expect(screen.getByText("오늘 화장실")).toBeInTheDocument();
    expect(screen.getByText("오늘 컨디션")).toBeInTheDocument();

    const actionSection = screen.getByRole("region", { name: "기록 버튼" });
    expect(actionSection).toBeInTheDocument();
    expect(
      within(actionSection).getByRole("heading", { name: "기록하기" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /화장실 기록/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /음식 기록/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /컨디션 기록/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /새 기록 시작/ })).toBeInTheDocument();

    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("href", "/records");
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
  });
});
