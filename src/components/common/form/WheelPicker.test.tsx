import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import WheelPicker from "./WheelPicker";

const OPTIONS = [
  { value: "00", label: "00" },
  { value: "01", label: "01" },
  { value: "02", label: "02" },
];

describe("WheelPicker", () => {
  test("selects an option when clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <WheelPicker
        ariaLabel="시간 선택"
        onChange={handleChange}
        options={OPTIONS}
        value="00"
      />,
    );

    await user.click(screen.getByRole("option", { name: "02" }));

    expect(handleChange).toHaveBeenCalledWith("02");
  });

  test("changes the selected option with arrow keys", async () => {
    const user = userEvent.setup();

    function ControlledWheelPicker() {
      const [value, setValue] = useState("01");

      return (
        <WheelPicker
          ariaLabel="시간 선택"
          onChange={setValue}
          options={OPTIONS}
          value={value}
        />
      );
    }

    render(<ControlledWheelPicker />);

    const picker = screen.getByRole("listbox", { name: "시간 선택" });
    picker.focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("option", { name: "02" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("wraps to the first option when moving down from the last infinite option", async () => {
    const user = userEvent.setup();

    function ControlledWheelPicker() {
      const [value, setValue] = useState("02");

      return (
        <WheelPicker
          ariaLabel="시간 선택"
          isInfinite
          onChange={setValue}
          options={OPTIONS}
          value={value}
        />
      );
    }

    render(<ControlledWheelPicker />);

    const picker = screen.getByRole("listbox", { name: "시간 선택" });
    picker.focus();
    await user.keyboard("{ArrowDown}");

    expect(
      screen
        .getAllByRole("option", { name: "00" })
        .some((option) => option.getAttribute("aria-selected") === "true"),
    ).toBe(true);
  });
});
