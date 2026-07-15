import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import FormRow from "./FormRow";
import TimePicker from "./TimePicker";

describe("TimePicker", () => {
  test("opens the time selection modal and applies the selected time", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function ControlledTimePicker() {
      const [value, setValue] = useState("23:30");

      function handleValueChange(nextValue: string) {
        setValue(nextValue);
        handleChange(nextValue);
      }

      return (
        <FormRow label="시간" htmlFor="record-time">
          <TimePicker id="record-time" onChange={handleValueChange} value={value} />
        </FormRow>
      );
    }

    render(<ControlledTimePicker />);

    await user.click(screen.getByRole("button", { name: "시간" }));

    const dialog = screen.getByRole("dialog", { name: "시간 선택" });
    await user.click(
      getMiddleOption(
        within(dialog).getByRole("listbox", { name: "시 선택" }),
        "22",
      ),
    );
    await user.click(
      getMiddleOption(
        within(dialog).getByRole("listbox", { name: "분 선택" }),
        "45",
      ),
    );
    await user.click(within(dialog).getByRole("button", { name: "적용하기" }));

    expect(handleChange).toHaveBeenCalledWith("22:45");
    expect(screen.getByRole("button", { name: "시간" })).toHaveTextContent("22:45");
    expect(screen.queryByRole("dialog", { name: "시간 선택" })).not.toBeInTheDocument();
  });

  test("keeps the saved time when closing without applying", async () => {
    const user = userEvent.setup();

    render(
      <FormRow label="시간" htmlFor="record-time">
        <TimePicker id="record-time" onChange={() => undefined} value="23:30" />
      </FormRow>,
    );

    await user.click(screen.getByRole("button", { name: "시간" }));

    const dialog = screen.getByRole("dialog", { name: "시간 선택" });
    await user.click(
      getMiddleOption(
        within(dialog).getByRole("listbox", { name: "시 선택" }),
        "22",
      ),
    );
    await user.click(within(dialog).getByRole("button", { name: "취소" }));

    expect(screen.getByRole("button", { name: "시간" })).toHaveTextContent("23:30");
  });
});

function getMiddleOption(listbox: HTMLElement, name: string) {
  const options = within(listbox).getAllByRole("option", { name });

  return options[Math.floor(options.length / 2)];
}
