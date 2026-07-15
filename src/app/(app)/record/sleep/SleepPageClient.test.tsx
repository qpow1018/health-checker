import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import SleepPageClient from "./SleepPageClient";

const back = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/sleep",
  useRouter: () => ({
    back,
  }),
}));

describe("SleepPageClient", () => {
  test("shows the slept time form", () => {
    render(<SleepPageClient />);

    expect(
      screen.getByRole("main", { name: "잠든 시간 기록 화면" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
  });

  test("enables saving after selecting a time", async () => {
    const user = userEvent.setup();
    render(<SleepPageClient />);

    await user.click(screen.getByLabelText("시간"));
    await user.click(screen.getAllByRole("option", { name: "23" })[0]);
    await user.click(screen.getAllByRole("option", { name: "30" })[0]);
    await user.click(screen.getByRole("button", { name: "적용하기" }));

    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
  });

  test("moves back to the record page", async () => {
    const user = userEvent.setup();
    render(<SleepPageClient />);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalled();
  });
});
