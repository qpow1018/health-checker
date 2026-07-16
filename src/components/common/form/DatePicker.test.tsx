import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import FormRow from "./FormRow";
import DatePicker from "./DatePicker";

describe("DatePicker", () => {
  test("opens the date selection modal and applies the selected date", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function ControlledDatePicker() {
      const [value, setValue] = useState("2026-07-15");

      function handleValueChange(nextValue: string) {
        setValue(nextValue);
        handleChange(nextValue);
      }

      return (
        <FormRow label="날짜" htmlFor="record-date">
          <DatePicker id="record-date" onChange={handleValueChange} value={value} />
        </FormRow>
      );
    }

    render(<ControlledDatePicker />);

    expect(screen.getByText("2026년 7월 15일")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "날짜" }));

    const dialog = screen.getByRole("dialog", { name: "날짜 선택" });
    await user.click(
      within(dialog).getByRole("button", { name: /^(오늘, )?2026년 7월 16일 목요일$/ }),
    );

    await user.click(within(dialog).getByRole("button", { name: "적용하기" }));

    expect(handleChange).toHaveBeenCalledWith("2026-07-16");
    expect(screen.getByText("2026년 7월 16일")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "날짜 선택" })).not.toBeInTheDocument();
  });

  test("keeps the saved date when closing without applying", async () => {
    const user = userEvent.setup();

    render(
      <FormRow label="날짜" htmlFor="record-date">
        <DatePicker id="record-date" onChange={() => undefined} value="2026-07-15" />
      </FormRow>,
    );

    await user.click(screen.getByRole("button", { name: "날짜" }));

    const dialog = screen.getByRole("dialog", { name: "날짜 선택" });
    await user.click(
      within(dialog).getByRole("button", { name: /^(오늘, )?2026년 7월 16일 목요일$/ }),
    );
    await user.click(within(dialog).getByRole("button", { name: "취소" }));

    expect(screen.getByText("2026년 7월 15일")).toBeInTheDocument();
  });
});
