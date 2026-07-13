import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { BottomNavigation } from "./BottomNavigation";

let pathname = "/record";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

describe("BottomNavigation", () => {
  beforeEach(() => {
    pathname = "/record";
  });

  test("renders bottom navigation items and marks the active item", () => {
    render(<BottomNavigation />);

    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("href", "/records");
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "기록 보기" })).not.toHaveAttribute("aria-current");
  });

  test("marks a navigation item as active on nested paths", () => {
    pathname = "/records/detail";

    render(<BottomNavigation />);

    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "기록" })).not.toHaveAttribute("aria-current");
  });
});
