import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { RecordPageClient } from "./RecordPageClient";

const bathroomLogMocks = vi.hoisted(() => ({
  createBathroomLog: vi.fn(),
  deleteBathroomLog: vi.fn(),
  updateBathroomLogDetails: vi.fn(),
}));

vi.mock("@/api/bathroomLogs", () => ({
  createBathroomLog: bathroomLogMocks.createBathroomLog,
  deleteBathroomLog: bathroomLogMocks.deleteBathroomLog,
  updateBathroomLogDetails: bathroomLogMocks.updateBathroomLogDetails,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/record",
}));

describe("RecordPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bathroomLogMocks.createBathroomLog.mockResolvedValue({
      id: "log-1",
      kind: "urine",
      logged_at: "2026-07-07T02:30:00.000Z",
    });
    bathroomLogMocks.deleteBathroomLog.mockResolvedValue(undefined);
    bathroomLogMocks.updateBathroomLogDetails.mockResolvedValue(undefined);
  });

  test("shows mobile app canvas actions and bottom tabs", () => {
    render(<RecordPageClient />);

    expect(screen.getByRole("main", { name: "기록 화면" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "방금 다녀온 기록을 남겨요" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("저장 후 필요한 내용만 이어서 적을 수 있습니다."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("탭하면 지금 시각으로 바로 저장됩니다."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "소변" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "대변" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "둘 다" })).toBeEnabled();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("href", "/records");
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
  });

  test("creates a quick log and shows the saved bottom sheet", async () => {
    const user = userEvent.setup();

    render(<RecordPageClient />);
    await user.click(screen.getByRole("button", { name: "소변" }));

    expect(bathroomLogMocks.createBathroomLog).toHaveBeenCalledWith({ kind: "urine" });
    const sheet = screen.getByRole("dialog", { name: "방금 저장됨" });
    expect(within(sheet).getByText("소변")).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "상세 추가" })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "닫기" })).toBeInTheDocument();
    expect(
      within(sheet).getByRole("button", { name: "방금 저장한 기록 취소" }),
    ).toBeInTheDocument();
  });

  test("dismisses the bottom sheet without undoing the log", async () => {
    const user = userEvent.setup();

    render(<RecordPageClient />);
    await user.click(screen.getByRole("button", { name: "소변" }));
    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(screen.queryByRole("dialog", { name: "방금 저장됨" })).not.toBeInTheDocument();
    expect(bathroomLogMocks.deleteBathroomLog).not.toHaveBeenCalled();
  });

  test("undoes the just-saved log", async () => {
    const user = userEvent.setup();

    render(<RecordPageClient />);
    await user.click(screen.getByRole("button", { name: "소변" }));
    await user.click(screen.getByRole("button", { name: "방금 저장한 기록 취소" }));

    expect(bathroomLogMocks.deleteBathroomLog).toHaveBeenCalledWith("log-1");
    expect(screen.queryByRole("dialog", { name: "방금 저장됨" })).not.toBeInTheDocument();
  });

  test("opens detail fields for urine logs and saves them", async () => {
    const user = userEvent.setup();

    render(<RecordPageClient />);
    await user.click(screen.getByRole("button", { name: "소변" }));
    await user.click(screen.getByRole("button", { name: "상세 추가" }));

    expect(screen.getByLabelText("긴급도")).toBeInTheDocument();
    expect(screen.getByLabelText("자다가 깼음")).toBeInTheDocument();
    expect(screen.getByLabelText("메모")).toBeInTheDocument();
    expect(screen.getByLabelText("소변 통증")).toBeInTheDocument();
    expect(screen.getByLabelText("색이 평소와 다름")).toBeInTheDocument();
    expect(screen.queryByLabelText("대변 상태")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("긴급도"), "urgent");
    await user.selectOptions(screen.getByLabelText("자다가 깼음"), "no");
    await user.click(screen.getByLabelText("소변 통증"));
    await user.type(screen.getByLabelText("메모"), "저녁 이후");
    await user.click(screen.getByRole("button", { name: "상세 저장" }));

    expect(bathroomLogMocks.updateBathroomLogDetails).toHaveBeenCalledWith("log-1", {
      urgency: "urgent",
      woke_from_sleep: false,
      note: "저녁 이후",
      urine_pain: true,
      urine_color_unusual: false,
      stool_state: null,
      bowel_pain: null,
      possible_blood: null,
    });
    expect(screen.queryByRole("dialog", { name: "방금 저장됨" })).not.toBeInTheDocument();
  });

  test("returns from detail modal to the saved summary modal", async () => {
    const user = userEvent.setup();

    render(<RecordPageClient />);
    await user.click(screen.getByRole("button", { name: "소변" }));
    await user.click(screen.getByRole("button", { name: "상세 추가" }));
    await user.click(screen.getByRole("button", { name: "뒤로" }));

    const sheet = screen.getByRole("dialog", { name: "방금 저장됨" });
    expect(within(sheet).getByRole("button", { name: "상세 추가" })).toBeInTheDocument();
  });

  test("shows a save failure message without opening the sheet", async () => {
    const user = userEvent.setup();
    bathroomLogMocks.createBathroomLog.mockRejectedValue(new Error("network"));

    render(<RecordPageClient />);
    await user.click(screen.getByRole("button", { name: "대변" }));

    expect(screen.getByRole("status")).toHaveTextContent("기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    expect(screen.queryByRole("dialog", { name: "방금 저장됨" })).not.toBeInTheDocument();
  });
});
