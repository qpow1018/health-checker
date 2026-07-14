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
  test("shows the sleep record UI", () => {
    render(<SleepPageClient />);

    expect(
      screen.getByRole("main", { name: "수면 시간 기록 화면" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "잠들기 전에 시작해요", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("잠들 시간")).toHaveValue("23:30");
    expect(screen.getByRole("button", { name: "잠들기" })).toBeInTheDocument();
    expect(screen.queryByLabelText("일어난 시간")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
  });

  test("moves through the sleep and wake flow", async () => {
    const user = userEvent.setup();
    render(<SleepPageClient />);

    await user.clear(screen.getByLabelText("잠들 시간"));
    await user.type(screen.getByLabelText("잠들 시간"), "22:00");
    await user.click(screen.getByRole("button", { name: "잠들기" }));

    expect(
      screen.getByRole("heading", { name: "일어났다면 기록을 마무리해요", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "22:00에 잠들었어요", level: 2 })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("일어난 시간"));
    await user.type(screen.getByLabelText("일어난 시간"), "06:00");

    expect(screen.getByText("예상 수면 시간 8시간")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "일어났어요" }));

    expect(
      screen.getByRole("heading", { name: "오늘 수면을 확인해요", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "수면 기록을 남겼어요", level: 2 })).toBeInTheDocument();
    expect(screen.getByText("8시간")).toBeInTheDocument();
  });

  test("moves back to the record page", async () => {
    const user = userEvent.setup();
    render(<SleepPageClient />);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalled();
  });
});
