import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import WakePageClient from "./WakePageClient";

const back = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/wake",
  useRouter: () => ({
    back,
  }),
}));

describe("WakePageClient", () => {
  test("shows the wake time record UI", () => {
    render(<WakePageClient />);

    expect(
      screen.getByRole("main", { name: "기상 시간 기록 화면" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "기상 시간을 남겨요", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "언제 일어났나요?", level: 2 })).toBeInTheDocument();
    expect(screen.getByLabelText("기상 시간")).toHaveValue("");
    expect(screen.getByText("아직 입력 전")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "기상 시간 저장" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
  });

  test("updates the wake time preview", async () => {
    const user = userEvent.setup();
    render(<WakePageClient />);

    await user.type(screen.getByLabelText("기상 시간"), "06:30");

    expect(screen.getByText("06:30에 일어난 것으로 기록됩니다.")).toBeInTheDocument();
  });

  test("moves back to the record page", async () => {
    const user = userEvent.setup();
    render(<WakePageClient />);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalled();
  });
});
