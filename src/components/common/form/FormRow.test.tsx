import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import FormRow from "./FormRow";

describe("FormRow", () => {
  test("renders a row label with form content", () => {
    render(
      <FormRow label="날짜" htmlFor="record-date">
        <input id="record-date" type="date" />
      </FormRow>,
    );

    expect(screen.getByLabelText("날짜")).toHaveAttribute("type", "date");
  });

  test("merges an additional class name", () => {
    const { container } = render(
      <FormRow className="compact-row" label="시간">
        <span>오후 11:00</span>
      </FormRow>,
    );

    expect(container.firstChild).toHaveClass("compact-row");
  });
});
