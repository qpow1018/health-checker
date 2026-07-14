import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import AppHeader from "./AppHeader";

const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back,
  }),
}));

describe("AppHeader", () => {
  test("shows the back title and moves back", async () => {
    const user = userEvent.setup();

    render(<AppHeader title="기록" />);

    expect(screen.getByRole("button", { name: "뒤로가기" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "기록", level: 2 })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalled();
  });
});
