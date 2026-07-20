import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import QueryProvider from "@/components/QueryProvider";

import WakePageClient from "./WakePageClient";

const back = vi.fn();
const healthRecordMocks = vi.hoisted(() => ({
  createWakeRecord: vi.fn(),
  updateHealthRecord: vi.fn(),
}));
const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/wake",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    back,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  createWakeRecord: healthRecordMocks.createWakeRecord,
  updateHealthRecord: healthRecordMocks.updateHealthRecord,
}));

vi.mock("@/utils/toast", () => ({
  default: {
    success: toastMocks.success,
  },
}));

describe("WakePageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows the wake time form", () => {
    render(<QueryProvider><WakePageClient /></QueryProvider>);

    expect(screen.getByRole("main", { name: "기상 시간 기록 화면" })).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeEnabled();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
  });

  test("saves the selected wake time", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createWakeRecord.mockResolvedValue({ id: "record-1" });
    render(<QueryProvider><WakePageClient /></QueryProvider>);

    await selectTime(user);
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(healthRecordMocks.createWakeRecord).toHaveBeenCalledWith({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: "06:30",
    });
    expect(toastMocks.success).toHaveBeenCalledWith("기록을 저장했습니다.");
    expect(back).toHaveBeenCalled();
  });

  test("shows an error when saving fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createWakeRecord.mockRejectedValue(new Error("save failed"));
    render(<QueryProvider><WakePageClient /></QueryProvider>);

    await selectTime(user);
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("기상 시간을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  test("moves back to the record page", async () => {
    const user = userEvent.setup();
    render(<QueryProvider><WakePageClient /></QueryProvider>);

    await user.click(screen.getByRole("button", { name: "뒤로가기" }));

    expect(back).toHaveBeenCalled();
  });
});

async function selectTime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("시간"));
  await user.click(screen.getAllByRole("option", { name: "06" })[0]);
  await user.click(screen.getAllByRole("option", { name: "30" })[0]);
  await user.click(screen.getByRole("button", { name: "적용하기" }));
}
