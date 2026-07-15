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
  test("shows the slept time record UI", () => {
    render(<SleepPageClient />);

    expect(
      screen.getByRole("main", { name: "잠든 시간 기록 화면" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "잠든 시간을 남겨요", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "언제 잠들었나요?", level: 2 })).toBeInTheDocument();
    expect(screen.getByLabelText("잠든 시간")).toHaveValue("");
    expect(screen.getByText("아직 입력 전")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "잠든 시간 저장" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
  });

  test("updates the slept time preview", async () => {
    const user = userEvent.setup();
    render(<SleepPageClient />);

    await user.type(screen.getByLabelText("잠든 시간"), "23:30");

    expect(screen.getByText("23:30에 잠든 것으로 기록됩니다.")).toBeInTheDocument();
  });

  test("moves back to the record page", async () => {
    const user = userEvent.setup();
    render(<SleepPageClient />);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalled();
  });
});
