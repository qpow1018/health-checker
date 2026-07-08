import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { RecordsPageClient } from "./RecordsPageClient";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";

const bathroomLogMocks = vi.hoisted(() => ({
  listBathroomLogs: vi.fn(),
  deleteBathroomLog: vi.fn(),
  updateBathroomLogDetails: vi.fn(),
}));

vi.mock("@/api/bathroomLogs", () => ({
  listBathroomLogs: bathroomLogMocks.listBathroomLogs,
  deleteBathroomLog: bathroomLogMocks.deleteBathroomLog,
  updateBathroomLogDetails: bathroomLogMocks.updateBathroomLogDetails,
}));

const LOGS: TBathroomLogRow[] = [
  {
    id: "log-2",
    user_id: "user-1",
    kind: "bowel",
    logged_at: "2026-07-08T09:10:00+09:00",
    urgency: "ordinary",
    woke_from_sleep: false,
    note: "아침 식사 후",
    urine_pain: null,
    urine_color_unusual: null,
    stool_state: "usual",
    bowel_pain: false,
    possible_blood: false,
    created_at: "2026-07-08T09:10:00.000Z",
    updated_at: "2026-07-08T09:10:00.000Z",
  },
  {
    id: "log-1",
    user_id: "user-1",
    kind: "urine",
    logged_at: "2026-07-07T22:30:00+09:00",
    urgency: null,
    woke_from_sleep: null,
    note: null,
    urine_pain: false,
    urine_color_unusual: false,
    stool_state: null,
    bowel_pain: null,
    possible_blood: null,
    created_at: "2026-07-07T22:30:00.000Z",
    updated_at: "2026-07-07T22:30:00.000Z",
  },
];

describe("RecordsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bathroomLogMocks.listBathroomLogs.mockResolvedValue(LOGS);
    bathroomLogMocks.deleteBathroomLog.mockResolvedValue(undefined);
    bathroomLogMocks.updateBathroomLogDetails.mockResolvedValue(undefined);
  });

  test("loads recent records and groups them by day", async () => {
    render(<RecordsPageClient />);

    expect(screen.getByRole("main", { name: "기록 보기 화면" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("기록을 불러오는 중입니다.");

    expect(await screen.findByRole("heading", { name: "7월 8일 수요일" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "7월 7일 화요일" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /오전 9:10 대변/ })).toBeInTheDocument();
    expect(screen.getByText("아침 식사 후")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("aria-current", "page");
    expect(bathroomLogMocks.listBathroomLogs).toHaveBeenCalledWith({ limit: 50 });
  });

  test("shows an empty state when there are no records", async () => {
    bathroomLogMocks.listBathroomLogs.mockResolvedValue([]);

    render(<RecordsPageClient />);

    expect(await screen.findByText("아직 저장된 기록이 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록하러 가기" })).toHaveAttribute("href", "/record");
  });

  test("opens record details and saves edited detail fields", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await user.click(await screen.findByRole("button", { name: /오전 9:10 대변/ }));

    const detailSheet = screen.getByRole("dialog", { name: "기록 상세" });
    expect(within(detailSheet).getByText("대변")).toBeInTheDocument();
    expect(within(detailSheet).getByText("아침 식사 후")).toBeInTheDocument();

    await user.click(within(detailSheet).getByRole("button", { name: "수정" }));
    await user.selectOptions(screen.getByLabelText("긴급도"), "urgent");
    await user.selectOptions(screen.getByLabelText("대변 상태"), "loose");
    await user.clear(screen.getByLabelText("메모"));
    await user.type(screen.getByLabelText("메모"), "점심 전");
    await user.click(screen.getByRole("button", { name: "수정 저장" }));

    expect(bathroomLogMocks.updateBathroomLogDetails).toHaveBeenCalledWith("log-2", {
      urgency: "urgent",
      woke_from_sleep: false,
      note: "점심 전",
      urine_pain: null,
      urine_color_unusual: null,
      stool_state: "loose",
      bowel_pain: false,
      possible_blood: false,
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "기록 상세" })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("status")).toHaveTextContent("기록 상세를 수정했습니다.");
  });

  test("confirms deletion before removing a record from the list", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await user.click(await screen.findByRole("button", { name: /오전 9:10 대변/ }));
    await user.click(screen.getByRole("button", { name: "삭제" }));

    const confirmDialog = screen.getByRole("dialog", { name: "기록 삭제" });
    expect(within(confirmDialog).getByText("이 기록을 삭제할까요?")).toBeInTheDocument();

    await user.click(within(confirmDialog).getByRole("button", { name: "삭제" }));

    expect(bathroomLogMocks.deleteBathroomLog).toHaveBeenCalledWith("log-2");
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /오전 9:10 대변/ })).not.toBeInTheDocument();
    });
    expect(screen.getByRole("status")).toHaveTextContent("기록을 삭제했습니다.");
  });

  test("shows a load failure message", async () => {
    bathroomLogMocks.listBathroomLogs.mockRejectedValue(new Error("network"));

    render(<RecordsPageClient />);

    expect(
      await screen.findByText("기록을 불러오지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});
