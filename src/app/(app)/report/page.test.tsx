import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import ReportPage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/report",
}));

describe("ReportPage", () => {
  test("renders the report tab as the active bottom navigation item", () => {
    render(<ReportPage />);

    expect(screen.getByRole("heading", { name: "AI 리포트" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
