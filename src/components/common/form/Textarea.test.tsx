import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import FormRow from "./FormRow";
import Textarea from "./Textarea";

describe("Textarea", () => {
  test("renders a labeled textarea and emits the next value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function ControlledTextarea() {
      const [value, setValue] = useState("");

      function handleValueChange(nextValue: string) {
        setValue(nextValue);
        handleChange(nextValue);
      }

      return (
        <FormRow label="메모" htmlFor="note">
          <Textarea
            id="note"
            onChange={handleValueChange}
            placeholder="남길 내용을 적어주세요."
            value={value}
          />
        </FormRow>
      );
    }

    render(<ControlledTextarea />);

    const textarea = screen.getByLabelText("메모");

    expect(textarea).toHaveAttribute("placeholder", "남길 내용을 적어주세요.");

    await user.type(textarea, "기록");

    expect(handleChange).toHaveBeenLastCalledWith("기록");
  });

  test("uses the requested row count and disabled state", () => {
    render(
      <FormRow label="메모" htmlFor="disabled-note">
        <Textarea
          id="disabled-note"
          isDisabled
          onChange={() => undefined}
          rows={5}
          value=""
        />
      </FormRow>,
    );

    const textarea = screen.getByLabelText("메모");

    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("rows", "5");
  });
});
