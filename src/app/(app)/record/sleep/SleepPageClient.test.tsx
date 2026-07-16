import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import SleepPageClient from "./SleepPageClient";

const back = vi.fn();
const healthRecordMocks = vi.hoisted(() => ({
  createSleepRecord: vi.fn(),
  updateHealthRecord: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/sleep",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    back,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  createSleepRecord: healthRecordMocks.createSleepRecord,
  updateHealthRecord: healthRecordMocks.updateHealthRecord,
}));

describe("SleepPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows the slept time form", () => {
    render(<QueryProvider><SleepPageClient /></QueryProvider>);

    expect(
      screen.getByRole("main", { name: "잠든 시간 기록 화면" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
  });

  test("enables saving after selecting a time", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><SleepPageClient /></QueryProvider>);

    await user.click(screen.getByLabelText("시간"));
    await user.click(screen.getAllByRole("option", { name: "23" })[0]);
    await user.click(screen.getAllByRole("option", { name: "30" })[0]);
    await user.click(screen.getByRole("button", { name: "적용하기" }));

    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
  });

  test("saves the selected sleep time", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createSleepRecord.mockResolvedValue({ id: "record-1" });
    render(<QueryProvider><SleepPageClient /></QueryProvider>);

    await selectTime(user);
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(healthRecordMocks.createSleepRecord).toHaveBeenCalledWith({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: "23:30",
      event: "slept",
    });
    expect(back).toHaveBeenCalled();
  });

  test("shows an error when saving fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createSleepRecord.mockRejectedValue(new Error("save failed"));
    render(<QueryProvider><SleepPageClient /></QueryProvider>);

    await selectTime(user);
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("잠든 시간을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  test("moves back to the record page", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><SleepPageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalled();
  });
});

async function selectTime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("시간"));
  await user.click(screen.getAllByRole("option", { name: "23" })[0]);
  await user.click(screen.getAllByRole("option", { name: "30" })[0]);
  await user.click(screen.getByRole("button", { name: "적용하기" }));
}
