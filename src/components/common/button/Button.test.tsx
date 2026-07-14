import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  test("renders a clickable button with the requested color and size", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button color="primary" size="large" onClick={handleClick}>
        저장
      </Button>,
    );

    const button = screen.getByRole("button", { name: "저장" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-color", "primary");
    expect(button).toHaveAttribute("data-size", "large");

    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("separates the color from the visual fill", () => {
    render(
      <Button color="accent" fill="outline">
        나중에
      </Button>,
    );

    const button = screen.getByRole("button", { name: "나중에" });

    expect(button).toHaveAttribute("data-color", "accent");
    expect(button).toHaveAttribute("data-fill", "outline");
  });

  test("passes custom class names to the button element", () => {
    render(<Button className="custom-button">오늘</Button>);

    expect(screen.getByRole("button", { name: "오늘" })).toHaveClass(
      "custom-button",
    );
  });

  test("marks full-width buttons and blocks clicks while loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button isFullWidth isLoading onClick={handleClick}>
        로그인
      </Button>,
    );

    const button = screen.getByRole("button", { name: "로그인" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("data-full-width", "true");
    expect(button).toHaveAttribute("aria-busy", "true");

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
