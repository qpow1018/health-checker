import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Tabs } from "./Tabs";

const REPORT_TABS = [
  { value: "summary", label: "요약" },
  { value: "sources", label: "출처" },
  { value: "records", label: "기록 기준" },
] as const;

describe("Tabs", () => {
  test("renders accessible tabs and marks the selected tab", () => {
    render(
      <Tabs
        label="AI 리포트 보기"
        tabs={REPORT_TABS}
        value="summary"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole("tablist", { name: "AI 리포트 보기" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "요약" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "출처" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  test("emits the selected tab value when clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Tabs
        label="AI 리포트 보기"
        tabs={REPORT_TABS}
        value="summary"
        onChange={handleChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "출처" }));

    expect(handleChange).toHaveBeenCalledWith("sources");
  });

  test("blocks tab changes when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Tabs
        isDisabled
        label="AI 리포트 보기"
        tabs={REPORT_TABS}
        value="summary"
        onChange={handleChange}
      />,
    );

    const tab = screen.getByRole("tab", { name: "출처" });

    expect(tab).toBeDisabled();

    await user.click(tab);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
