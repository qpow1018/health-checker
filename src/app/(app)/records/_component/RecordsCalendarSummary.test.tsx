import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import { RecordsCalendarSummary } from "./RecordsCalendarSummary";

const BOTH_LOG: TBathroomLogRow = {
  id: "both-log",
  user_id: "user-1",
  kind: "both",
  logged_at: "2026-07-08T01:00:00.000Z",
  urgency: null,
  woke_from_sleep: null,
  note: null,
  urine_pain: null,
  urine_color_unusual: null,
  stool_state: null,
  bowel_pain: null,
  possible_blood: null,
  created_at: "2026-07-08T01:00:00.000Z",
  updated_at: "2026-07-08T01:00:00.000Z",
};

function renderCalendar(
  overrides: Partial<React.ComponentProps<typeof RecordsCalendarSummary>> = {},
) {
  const props: React.ComponentProps<typeof RecordsCalendarSummary> = {
    year: 2026,
    monthIndex: 6,
    logs: [BOTH_LOG],
    isLoading: false,
    errorMessage: "",
    onPreviousMonth: vi.fn(),
    onNextMonth: vi.fn(),
    onSelectDate: vi.fn(),
    ...overrides,
  };

  render(<RecordsCalendarSummary {...props} />);

  return props;
}

describe("RecordsCalendarSummary", () => {
  test("shows the month summary and supports month and record-date selection", async () => {
    const user = userEvent.setup();
    const props = renderCalendar();
    const calendar = screen.getByRole("table", {
      name: "2026년 7월 기록 달력",
    });
    const recordDateButton = screen.getByRole("button", {
      name: "7월 8일, 소변 1회, 대변 1회",
    });

    expect(screen.getByRole("heading", { name: "2026년 7월" })).toBeInTheDocument();
    expect(within(calendar).getAllByRole("columnheader")).toHaveLength(7);
    expect(
      within(calendar)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["일", "월", "화", "수", "목", "금", "토"]);
    expect(within(calendar).getAllByRole("row")).toHaveLength(7);
    expect(within(calendar).getAllByRole("cell")).toHaveLength(42);
    expect(recordDateButton).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "이전 달 보기" }));
    await user.click(screen.getByRole("button", { name: "다음 달 보기" }));
    await user.click(recordDateButton);

    expect(props.onPreviousMonth).toHaveBeenCalledOnce();
    expect(props.onNextMonth).toHaveBeenCalledOnce();
    expect(props.onSelectDate).toHaveBeenCalledWith("2026-07-08");
  });

  test("shows loading and error messages without stale record buttons", () => {
    const { rerender } = render(
      <RecordsCalendarSummary
        year={2026}
        monthIndex={6}
        logs={[BOTH_LOG]}
        isLoading
        errorMessage=""
        onPreviousMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onSelectDate={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "기록을 불러오는 중입니다.",
    );
    expect(
      screen.queryByRole("button", { name: "7월 8일, 소변 1회, 대변 1회" }),
    ).not.toBeInTheDocument();

    rerender(
      <RecordsCalendarSummary
        year={2026}
        monthIndex={6}
        logs={[BOTH_LOG]}
        isLoading={false}
        errorMessage="기록을 불러오지 못했습니다."
        onPreviousMonth={vi.fn()}
        onNextMonth={vi.fn()}
        onSelectDate={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "기록을 불러오지 못했습니다.",
    );
    expect(
      screen.queryByRole("button", { name: "7월 8일, 소변 1회, 대변 1회" }),
    ).not.toBeInTheDocument();
  });
});
