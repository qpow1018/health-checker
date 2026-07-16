import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import ConditionPageClient from "./ConditionPageClient";

const back = vi.fn();
const healthRecordMocks = vi.hoisted(() => ({
  createConditionRecord: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/condition",
  useRouter: () => ({
    back,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  createConditionRecord: healthRecordMocks.createConditionRecord,
}));

describe("ConditionPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows the condition record form with the current time", () => {
    render(<QueryProvider><ConditionPageClient /></QueryProvider>);

    expect(screen.getByRole("main", { name: "컨디션 기록 화면" })).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toHaveTextContent(/^\d{2}:\d{2}$/);
    expect(screen.getByLabelText("불편했던 점")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("saves a condition note", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createConditionRecord.mockResolvedValue({ id: "record-5" });
    render(<QueryProvider><ConditionPageClient /></QueryProvider>);

    await user.type(screen.getByLabelText("불편했던 점"), "두통");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(healthRecordMocks.createConditionRecord).toHaveBeenCalledWith({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: expect.stringMatching(/^\d{2}:\d{2}$/),
      note: "두통",
    });
    expect(back).toHaveBeenCalled();
  });

  test("shows an error when saving fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createConditionRecord.mockRejectedValue(new Error("save failed"));
    render(<QueryProvider><ConditionPageClient /></QueryProvider>);

    await user.type(screen.getByLabelText("불편했던 점"), "두통");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("컨디션 기록을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
