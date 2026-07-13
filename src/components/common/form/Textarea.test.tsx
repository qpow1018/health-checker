import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import { Textarea } from "./Textarea";

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
        <Textarea
          id="note"
          label="메모"
          onChange={handleValueChange}
          placeholder="남길 내용을 적어주세요."
          value={value}
        />
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
      <Textarea
        id="disabled-note"
        isDisabled
        isRequired
        label="메모"
        onChange={() => undefined}
        rows={5}
        value=""
      />,
    );

    const textarea = screen.getByLabelText("메모");

    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("required");
    expect(textarea).toHaveAttribute("rows", "5");
  });
});
