import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { AppBottomTabs } from "./AppBottomTabs";

describe("AppBottomTabs", () => {
  test("renders app tabs and marks the active tab", () => {
    render(<AppBottomTabs activeHref="/record" />);

    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("href", "/records");
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("link", { name: "기록" }).className).toContain("active-tab");
  });
});
