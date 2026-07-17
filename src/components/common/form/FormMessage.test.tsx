import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import FormMessage from "./FormMessage";

describe("FormMessage", () => {
  test("renders a default message", () => {
    render(<FormMessage>허용된 계정 이메일을 입력하세요.</FormMessage>);

    expect(screen.getByText("허용된 계정 이메일을 입력하세요.")).toBeInTheDocument();
  });

  test("renders an error message", () => {
    render(<FormMessage type="error">이메일 형식을 확인해주세요.</FormMessage>);

    expect(screen.getByText("이메일 형식을 확인해주세요.")).toBeInTheDocument();
  });
});
