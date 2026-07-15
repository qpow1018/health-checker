import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import ToiletPageClient from "./ToiletPageClient";

const back = vi.fn();
const healthRecordMocks = vi.hoisted(() => ({
  createToiletRecord: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record/toilet",
  useRouter: () => ({
    back,
  }),
}));

vi.mock("@/api/healthRecords", () => ({
  createToiletRecord: healthRecordMocks.createToiletRecord,
}));

describe("ToiletPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("shows the toilet record form", () => {
    render(<ToiletPageClient />);

    expect(screen.getByRole("main", { name: "화장실 기록 화면" })).toBeInTheDocument();
    expect(screen.getByLabelText("날짜")).toBeInTheDocument();
    expect(screen.getByLabelText("시간")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "종류" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "대변 상태" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  test("shows the stool consistency options for a bowel record", async () => {
    const user = userEvent.setup();
    render(<ToiletPageClient />);

    await user.click(within(screen.getByRole("group", { name: "종류" })).getByRole("button", { name: "대변" }));

    expect(screen.getByRole("group", { name: "대변 상태" })).toBeInTheDocument();
  });

  test("saves the selected toilet record", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createToiletRecord.mockResolvedValue({ id: "record-3" });
    render(<ToiletPageClient />);

    await selectTime(user);
    await user.click(within(screen.getByRole("group", { name: "종류" })).getByRole("button", { name: "대변" }));
    await user.click(within(screen.getByRole("group", { name: "급한 정도" })).getByRole("button", { name: "급함" }));
    await user.click(within(screen.getByRole("group", { name: "잠에서 깬 뒤인지" })).getByRole("button", { name: "예" }));
    await user.click(within(screen.getByRole("group", { name: "대변 상태" })).getByRole("button", { name: "묽음" }));
    await user.type(screen.getByLabelText("특이사항 (선택)"), "복통 있음");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(healthRecordMocks.createToiletRecord).toHaveBeenCalledWith({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      time: "06:30",
      details: {
        type: "bowel",
        urgency: "urgent",
        wokeFromSleep: true,
        stoolConsistency: "loose",
        note: "복통 있음",
      },
    });
    expect(back).toHaveBeenCalled();
  });

  test("shows an error when saving fails", async () => {
    const user = userEvent.setup();
    healthRecordMocks.createToiletRecord.mockRejectedValue(new Error("save failed"));
    render(<ToiletPageClient />);

    await selectTime(user);
    await user.click(within(screen.getByRole("group", { name: "종류" })).getByRole("button", { name: "소변" }));
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      await screen.findByText("화장실 기록을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});

async function selectTime(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByLabelText("시간"));
  await user.click(screen.getAllByRole("option", { name: "06" })[0]);
  await user.click(screen.getAllByRole("option", { name: "30" })[0]);
  await user.click(screen.getByRole("button", { name: "적용하기" }));
}
