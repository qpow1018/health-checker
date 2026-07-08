import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ButtonGroup } from "./ButtonGroup";

const URGENCY_OPTIONS = [
  { value: "relaxed", label: "여유" },
  { value: "ordinary", label: "보통" },
  { value: "urgent", label: "급함" },
] as const;

describe("ButtonGroup", () => {
  test("renders labeled options and marks the selected value", () => {
    render(
      <ButtonGroup
        label="긴급도"
        options={URGENCY_OPTIONS}
        value="ordinary"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole("group", { name: "긴급도" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "여유" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "보통" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("emits the selected value when an option is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ButtonGroup
        label="긴급도"
        options={URGENCY_OPTIONS}
        value="relaxed"
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "급함" }));

    expect(handleChange).toHaveBeenCalledWith("urgent");
  });

  test("blocks option changes when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <ButtonGroup
        isDisabled
        label="긴급도"
        options={URGENCY_OPTIONS}
        value="relaxed"
        onChange={handleChange}
      />,
    );

    const button = screen.getByRole("button", { name: "급함" });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
