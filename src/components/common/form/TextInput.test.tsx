import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";

import { TextInput } from "./TextInput";

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
        <TextInput
          id="email"
          label="이메일"
          onChange={handleValueChange}
          placeholder="name@example.com"
          value={value}
        />
      );
    }

    render(<ControlledInput />);

    const input = screen.getByLabelText("이메일");

    expect(input).toHaveAttribute("placeholder", "name@example.com");

    await user.type(input, "ab");

    expect(handleChange).toHaveBeenLastCalledWith("ab");
  });

  test("connects helper text and error message to the input", () => {
    render(
      <TextInput
        errorMessage="이메일 형식을 확인해주세요."
        helperText="허용된 계정 이메일을 입력하세요."
        id="login-email"
        label="이메일"
        onChange={() => undefined}
        value=""
      />,
    );

    const input = screen.getByLabelText("이메일");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      "허용된 계정 이메일을 입력하세요. 이메일 형식을 확인해주세요.",
    );
  });
});
