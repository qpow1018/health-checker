import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { RecordHome } from "./RecordHome";

describe("RecordHome", () => {
  test("shows the signed-in email and disabled quick record buttons", () => {
    render(<RecordHome email="me@example.com" onSignOut={vi.fn()} />);

    expect(screen.getByText("me@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "소변" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "대변" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "둘 다" })).toBeDisabled();
    expect(screen.getByText("다음 단계에서 원탭 저장을 연결합니다.")).toBeInTheDocument();
  });

  test("calls onSignOut when the sign out button is pressed", async () => {
    const user = userEvent.setup();
    const onSignOut = vi.fn();

    render(<RecordHome email="me@example.com" onSignOut={onSignOut} />);
    await user.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
