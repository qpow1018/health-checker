import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { RecordsPageClient } from "./RecordsPageClient";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";

const bathroomLogMocks = vi.hoisted(() => ({
  listBathroomLogs: vi.fn(),
  listBathroomLogsByRange: vi.fn(),
  deleteBathroomLog: vi.fn(),
  updateBathroomLogDetails: vi.fn(),
}));

vi.mock("@/api/bathroomLogs", () => ({
  listBathroomLogs: bathroomLogMocks.listBathroomLogs,
  listBathroomLogsByRange: bathroomLogMocks.listBathroomLogsByRange,
  deleteBathroomLog: bathroomLogMocks.deleteBathroomLog,
  updateBathroomLogDetails: bathroomLogMocks.updateBathroomLogDetails,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/records",
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
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-07-09T03:00:00.000Z"));
    vi.clearAllMocks();
    bathroomLogMocks.listBathroomLogs.mockResolvedValue(LOGS);
    bathroomLogMocks.listBathroomLogsByRange.mockResolvedValue(LOGS);
    bathroomLogMocks.deleteBathroomLog.mockResolvedValue(undefined);
    bathroomLogMocks.updateBathroomLogDetails.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows the current month calendar in the summary tab by default", async () => {
    render(<RecordsPageClient />);

    expect(screen.getByRole("main", { name: "기록 보기 화면" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "요약보기" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(await screen.findByRole("heading", { name: "2026년 7월" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "7월 8일, 소변 0회, 대변 1회" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("aria-current", "page");
    expect(bathroomLogMocks.listBathroomLogs).toHaveBeenCalledWith({ limit: 50 });
  });

  test("filters details to a selected calendar date and can show all recent records", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);

    await user.click(
      await screen.findByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    );

    expect(screen.getByRole("tab", { name: "상세보기" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: "7월 8일 기록" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /오전 9:10 대변/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /오후 10:30 소변/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "전체 보기" }));

    expect(screen.getByRole("heading", { name: "7월 8일 수요일" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "7월 7일 화요일" })).toBeInTheDocument();
  });

  test("shows all recent records when opening the details tab directly", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await user.click(screen.getByRole("tab", { name: "상세보기" }));

    expect(await screen.findByRole("heading", { name: "7월 8일 수요일" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "7월 7일 화요일" })).toBeInTheDocument();
    expect(screen.getByText("아침 식사 후")).toBeInTheDocument();
  });

  test("loads a previous month range and reuses the cached current month", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await screen.findByRole("heading", { name: "2026년 7월" });
    await waitFor(() => {
      expect(bathroomLogMocks.listBathroomLogsByRange).toHaveBeenCalledWith({
        from: "2026-06-30T15:00:00.000Z",
        to: "2026-07-31T15:00:00.000Z",
      });
    });

    await user.click(screen.getByRole("button", { name: "이전 달 보기" }));

    expect(await screen.findByRole("heading", { name: "2026년 6월" })).toBeInTheDocument();
    await waitFor(() => {
      expect(bathroomLogMocks.listBathroomLogsByRange).toHaveBeenCalledWith({
        from: "2026-05-31T15:00:00.000Z",
        to: "2026-06-30T15:00:00.000Z",
      });
    });

    await user.click(screen.getByRole("button", { name: "다음 달 보기" }));
    expect(await screen.findByRole("heading", { name: "2026년 7월" })).toBeInTheDocument();
    expect(bathroomLogMocks.listBathroomLogsByRange).toHaveBeenCalledTimes(2);
  });

  test("moves from January to the previous December with the correct range", async () => {
    const user = userEvent.setup();
    vi.setSystemTime(new Date("2026-01-15T03:00:00.000Z"));

    render(<RecordsPageClient />);
    await user.click(screen.getByRole("button", { name: "이전 달 보기" }));

    expect(await screen.findByRole("heading", { name: "2025년 12월" })).toBeInTheDocument();
    await waitFor(() => {
      expect(bathroomLogMocks.listBathroomLogsByRange).toHaveBeenCalledWith({
        from: "2025-11-30T15:00:00.000Z",
        to: "2025-12-31T15:00:00.000Z",
      });
    });
  });

  test("keeps recent details usable when the calendar request fails", async () => {
    const user = userEvent.setup();
    bathroomLogMocks.listBathroomLogsByRange.mockRejectedValue(new Error("network"));

    render(<RecordsPageClient />);

    expect(
      await screen.findByText("달력 기록을 불러오지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "상세보기" }));
    expect(await screen.findByRole("button", { name: /오전 9:10 대변/ })).toBeInTheDocument();
  });

  test("keeps the summary usable when loading recent details fails", async () => {
    const user = userEvent.setup();
    bathroomLogMocks.listBathroomLogs.mockRejectedValue(new Error("network"));

    render(<RecordsPageClient />);

    expect(
      await screen.findByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "상세보기" }));
    expect(
      await screen.findByText("기록을 불러오지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  test("ignores a stale month response after navigating away", async () => {
    const user = userEvent.setup();
    const julyRequest = createDeferred<TBathroomLogRow[]>();
    const juneRequest = createDeferred<TBathroomLogRow[]>();
    const juneLog: TBathroomLogRow = {
      ...LOGS[0],
      id: "june-log",
      logged_at: "2026-06-08T09:10:00+09:00",
    };
    bathroomLogMocks.listBathroomLogsByRange
      .mockReturnValueOnce(julyRequest.promise)
      .mockReturnValueOnce(juneRequest.promise);

    render(<RecordsPageClient />);
    await user.click(screen.getByRole("button", { name: "이전 달 보기" }));

    await act(async () => {
      juneRequest.resolve([juneLog]);
      await juneRequest.promise;
    });
    expect(
      await screen.findByRole("button", {
        name: "6월 8일, 소변 0회, 대변 1회",
      }),
    ).toBeInTheDocument();

    await act(async () => {
      julyRequest.resolve(LOGS);
      await julyRequest.promise;
    });

    expect(screen.getByRole("heading", { name: "2026년 6월" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "6월 8일, 소변 0회, 대변 1회",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    ).not.toBeInTheDocument();
  });

  test("keeps an edited calendar record synchronized in the month cache", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await user.click(
      await screen.findByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    );
    await user.click(screen.getByRole("button", { name: /오전 9:10 대변/ }));
    await user.click(
      within(screen.getByRole("dialog", { name: "기록 상세" })).getByRole(
        "button",
        { name: "수정" },
      ),
    );
    await user.clear(screen.getByLabelText("메모"));
    await user.type(screen.getByLabelText("메모"), "수정된 메모");
    await user.click(screen.getByRole("button", { name: "수정 저장" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "기록 상세" })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: "요약보기" }));
    await user.click(screen.getByRole("button", { name: "이전 달 보기" }));
    await screen.findByRole("heading", { name: "2026년 6월" });
    await user.click(screen.getByRole("button", { name: "다음 달 보기" }));
    await user.click(
      await screen.findByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    );
    await user.click(screen.getByRole("button", { name: /오전 9:10 대변/ }));

    expect(
      within(screen.getByRole("dialog", { name: "기록 상세" })).getByText(
        "수정된 메모",
      ),
    ).toBeInTheDocument();
    expect(bathroomLogMocks.listBathroomLogsByRange).toHaveBeenCalledTimes(2);
  });

  test("preserves a calendar edit when a stale recent request resolves later", async () => {
    const user = userEvent.setup();
    const recentRequest = createDeferred<TBathroomLogRow[]>();
    bathroomLogMocks.listBathroomLogs.mockReturnValue(recentRequest.promise);

    render(<RecordsPageClient />);
    await user.click(
      await screen.findByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    );
    await user.click(screen.getByRole("button", { name: /오전 9:10 대변/ }));
    await user.click(
      within(screen.getByRole("dialog", { name: "기록 상세" })).getByRole(
        "button",
        { name: "수정" },
      ),
    );
    await user.clear(screen.getByLabelText("메모"));
    await user.type(screen.getByLabelText("메모"), "최신 메모");
    await user.click(screen.getByRole("button", { name: "수정 저장" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "기록 상세" })).not.toBeInTheDocument();
    });

    await act(async () => {
      recentRequest.resolve(LOGS);
      await recentRequest.promise;
    });
    await user.click(screen.getByRole("tab", { name: "상세보기" }));

    expect(screen.getByText("최신 메모")).toBeInTheDocument();
    expect(screen.queryByText("아침 식사 후")).not.toBeInTheDocument();
  });

  test("preserves a deletion when a stale calendar request resolves later", async () => {
    const user = userEvent.setup();
    const calendarRequest = createDeferred<TBathroomLogRow[]>();
    bathroomLogMocks.listBathroomLogsByRange.mockReturnValue(calendarRequest.promise);

    render(<RecordsPageClient />);
    await user.click(screen.getByRole("tab", { name: "상세보기" }));
    await user.click(await screen.findByRole("button", { name: /오전 9:10 대변/ }));
    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "기록 삭제" })).getByRole(
        "button",
        { name: "삭제" },
      ),
    );
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /오전 9:10 대변/ })).not.toBeInTheDocument();
    });

    await act(async () => {
      calendarRequest.resolve(LOGS);
      await calendarRequest.promise;
    });
    await user.click(screen.getByRole("tab", { name: "요약보기" }));

    expect(
      screen.queryByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    ).not.toBeInTheDocument();
  });

  test("shows a date-specific empty state after deleting the selected date record", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await user.click(
      await screen.findByRole("button", {
        name: "7월 8일, 소변 0회, 대변 1회",
      }),
    );
    await user.click(screen.getByRole("button", { name: /오전 9:10 대변/ }));
    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "기록 삭제" })).getByRole(
        "button",
        { name: "삭제" },
      ),
    );

    expect(
      await screen.findByRole("heading", { name: "7월 8일 기록" }),
    ).toBeInTheDocument();
    expect(screen.getByText("이 날짜에는 기록이 없습니다.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /오전 9:10 대변/ })).not.toBeInTheDocument();
  });

  test("shows an empty state when there are no records", async () => {
    const user = userEvent.setup();
    bathroomLogMocks.listBathroomLogs.mockResolvedValue([]);

    render(<RecordsPageClient />);
    await user.click(screen.getByRole("tab", { name: "상세보기" }));

    expect(await screen.findByText("아직 저장된 기록이 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록하러 가기" })).toHaveAttribute("href", "/record");
  });

  test("opens record details and saves edited detail fields", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await user.click(screen.getByRole("tab", { name: "상세보기" }));
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
    expect(screen.getByText("점심 전")).toBeInTheDocument();
  });

  test("confirms deletion before removing a record from the list", async () => {
    const user = userEvent.setup();

    render(<RecordsPageClient />);
    await user.click(screen.getByRole("tab", { name: "상세보기" }));
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

    await user.click(screen.getByRole("tab", { name: "요약보기" }));
    expect(
      screen.queryByRole("button", { name: "7월 8일, 소변 0회, 대변 1회" }),
    ).not.toBeInTheDocument();
  });

  test("shows a load failure message", async () => {
    bathroomLogMocks.listBathroomLogs.mockRejectedValue(new Error("network"));

    render(<RecordsPageClient />);
    await userEvent.setup().click(screen.getByRole("tab", { name: "상세보기" }));

    expect(
      await screen.findByText("기록을 불러오지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });
});

function createDeferred<T>() {
  let resolvePromise: (value: T) => void = () => undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve: resolvePromise,
  };
}
