import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import RecordPageClient from "./RecordPageClient";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/record",
  useRouter: () => ({
    push,
  }),
}));

describe("RecordPageClient", () => {
  test("moves to the wake and sleep record pages from their actions", async () => {
    const user = userEvent.setup();
    render(<RecordPageClient />);

    await user.click(screen.getByRole("button", { name: "기상 시간" }));
    await user.click(screen.getByRole("button", { name: "잠든 시간" }));

    expect(push).toHaveBeenCalledWith("/record/wake");
    expect(push).toHaveBeenCalledWith("/record/sleep");
  });

  test("shows the new record UI sections and bottom tabs", () => {
    render(<RecordPageClient />);

    expect(screen.getByRole("main", { name: "기록 화면" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "기록하기", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "오늘" })).toBeInTheDocument();

    const summarySection = screen.getByRole("region", {
      name: "오늘 기록 요약",
    });
    expect(summarySection).toBeInTheDocument();
    expect(within(summarySection).getByText("수면")).toBeInTheDocument();
    expect(within(summarySection).getByText("07:20 기상")).toBeInTheDocument();
    expect(within(summarySection).getByText("화장실")).toBeInTheDocument();
    expect(within(summarySection).getByText("2회")).toBeInTheDocument();
    expect(within(summarySection).getByText("컨디션")).toBeInTheDocument();

    const actionSection = screen.getByRole("region", { name: "기록 버튼" });
    expect(actionSection).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "기상 시간" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "잠든 시간" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "먹은 음식" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "화장실" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "운동" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "컨디션" })).toBeInTheDocument();

    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("href", "/records");
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
  });
});
