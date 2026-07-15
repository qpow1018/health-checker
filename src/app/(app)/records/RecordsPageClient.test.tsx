import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { RecordsPageClient } from "./RecordsPageClient";

describe("RecordsPageClient", () => {
  test("shows an empty state while the record model is being prepared", () => {
    render(<RecordsPageClient />);

    expect(screen.getByRole("main", { name: "기록 보기 화면" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "저장한 기록을 확인해요" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "빈 기록" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록하러 가기" })).toHaveAttribute(
      "href",
      "/record",
    );
  });
});
