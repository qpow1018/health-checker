import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import FormRow from "./FormRow";
import TextInput from "./TextInput";

describe("TextInput", () => {
  test("renders a labeled input and emits the next value", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    function ControlledInput() {
      const [value, setValue] = useState("");

      function handleValueChange(nextValue: string) {
        setValue(nextValue);
        handleChange(nextValue);
      }

      return (
        <FormRow label="이메일" htmlFor="email">
          <TextInput
            id="email"
            onChange={handleValueChange}
            placeholder="name@example.com"
            value={value}
          />
        </FormRow>
      );
    }

    render(<ControlledInput />);

    const input = screen.getByLabelText("이메일");

    expect(input).toHaveAttribute("placeholder", "name@example.com");

    await user.type(input, "ab");

    expect(handleChange).toHaveBeenLastCalledWith("ab");
  });

  test("passes native input attributes to the control", () => {
    render(
      <FormRow label="이메일" htmlFor="login-email">
        <TextInput
          autoComplete="email"
          id="login-email"
          inputMode="email"
          onChange={() => undefined}
          type="email"
          value=""
        />
      </FormRow>,
    );

    const input = screen.getByLabelText("이메일");

    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveAttribute("inputmode", "email");
    expect(input).toHaveAttribute("type", "email");
  });
});
