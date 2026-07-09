# 기록 보기 달력 요약 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `기록 보기`에 기본 `요약보기` 달력을 추가하고, 날짜별 소변·대변 횟수에서 해당 날짜의 기존 상세 목록으로 이동하게 한다.

**Architecture:** 최근 50개 상세 목록 조회는 유지하고, 달력은 선택 월의 시간 범위를 별도 API로 조회한다. 월 범위 계산과 날짜별 집계는 route 전용 순수 유틸, 달력 렌더링은 route 전용 컴포넌트, 조회·탭·날짜 필터 상태 조립은 `RecordsPageClient`가 담당한다.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase JS, SCSS Modules, Vitest, Testing Library

---

## 파일 구조

- Modify: `src/api/bathroomLogs/type.ts` — 월 범위 조회 요청 타입
- Modify: `src/api/bathroomLogs/index.ts` — 시작 이상·다음 달 시작 미만 조회 wrapper
- Modify: `src/api/bathroomLogs/index.test.ts` — Supabase 범위 query 계약
- Create: `src/app/(app)/records/_type/recordsCalendar.ts` — 달력 day와 view 타입
- Create: `src/app/(app)/records/_util/recordsCalendar.ts` — 월 범위, 월 키, 날짜 키, 달력 day 집계
- Create: `src/app/(app)/records/_util/recordsCalendar.test.ts` — 시간대·집계 단위 테스트
- Create: `src/app/(app)/records/_component/RecordsCalendarSummary.tsx` — 월 이동과 날짜 선택 UI
- Create: `src/app/(app)/records/_component/RecordsCalendarSummary.test.tsx` — 달력 렌더링과 이벤트 테스트
- Create: `src/app/(app)/records/_component/recordsCalendarSummary.module.scss` — 달력 전용 스타일
- Modify: `src/app/(app)/records/RecordsPageClient.tsx` — 탭, 월 캐시, 날짜 필터, 기존 CRUD 상태 동기화
- Modify: `src/app/(app)/records/recordsPageClient.module.scss` — 탭과 날짜 필터 스타일
- Modify: `src/app/(app)/records/RecordsPageClient.test.tsx` — 탭·월 이동·날짜 필터·회귀 테스트

### Task 1: 월 범위 API 추가

**Files:**
- Modify: `src/api/bathroomLogs/type.ts`
- Modify: `src/api/bathroomLogs/index.ts`
- Test: `src/api/bathroomLogs/index.test.ts`

- [ ] **Step 1: 월 범위 query 계약을 재현하는 실패 테스트 작성**

`index.test.ts` import에 `listBathroomLogsByRange`를 추가하고 다음 테스트를 작성한다.

```ts
test("lists bathroom logs inside a half-open date range", async () => {
  const order = vi.fn().mockResolvedValue({
    data: [],
    error: null,
  });
  const lt = vi.fn(() => ({ order }));
  const gte = vi.fn(() => ({ lt }));
  const select = vi.fn(() => ({ gte }));
  supabaseMocks.from.mockReturnValue({ select });

  await listBathroomLogsByRange({
    from: "2026-06-30T15:00:00.000Z",
    to: "2026-07-31T15:00:00.000Z",
  });

  expect(select).toHaveBeenCalledWith("*");
  expect(gte).toHaveBeenCalledWith("logged_at", "2026-06-30T15:00:00.000Z");
  expect(lt).toHaveBeenCalledWith("logged_at", "2026-07-31T15:00:00.000Z");
  expect(order).toHaveBeenCalledWith("logged_at", { ascending: false });
});
```

- [ ] **Step 2: API 테스트가 함수 미정의로 실패하는지 확인**

Run:

```bash
npm test -- src/api/bathroomLogs/index.test.ts
```

Expected: FAIL — `listBathroomLogsByRange` export가 없다는 오류.

- [ ] **Step 3: 요청 타입과 최소 조회 wrapper 구현**

`type.ts`에 추가한다.

```ts
export type TReqListBathroomLogsByRange = {
  from: string;
  to: string;
};
```

`index.ts`에서 타입을 import하고 다음 함수를 추가한다.

```ts
export async function listBathroomLogsByRange({
  from,
  to,
}: TReqListBathroomLogsByRange) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("bathroom_logs")
    .select("*")
    .gte("logged_at", from)
    .lt("logged_at", to)
    .order("logged_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
```

- [ ] **Step 4: API 테스트 통과 확인**

Run:

```bash
npm test -- src/api/bathroomLogs/index.test.ts
```

Expected: PASS.

- [ ] **Step 5: API 변경 커밋**

```bash
git add src/api/bathroomLogs/type.ts src/api/bathroomLogs/index.ts src/api/bathroomLogs/index.test.ts
git commit -m "feat: add bathroom log range query"
```

### Task 2: 달력 계산 유틸 구현

**Files:**
- Create: `src/app/(app)/records/_type/recordsCalendar.ts`
- Create: `src/app/(app)/records/_util/recordsCalendar.ts`
- Test: `src/app/(app)/records/_util/recordsCalendar.test.ts`

- [ ] **Step 1: 월 범위와 날짜별 종류 집계 실패 테스트 작성**

```ts
import { describe, expect, test } from "vitest";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import {
  createCalendarDays,
  createMonthRange,
  filterLogsByDateKey,
} from "./recordsCalendar";

function createLog(
  id: string,
  kind: TBathroomLogRow["kind"],
  loggedAt: string,
): TBathroomLogRow {
  return {
    id,
    user_id: "user-1",
    kind,
    logged_at: loggedAt,
    urgency: null,
    woke_from_sleep: null,
    note: null,
    urine_pain: null,
    urine_color_unusual: null,
    stool_state: null,
    bowel_pain: null,
    possible_blood: null,
    created_at: loggedAt,
    updated_at: loggedAt,
  };
}

describe("recordsCalendar", () => {
  test("creates a Seoul month as a half-open UTC range", () => {
    expect(createMonthRange(2026, 6)).toEqual({
      from: "2026-06-30T15:00:00.000Z",
      to: "2026-07-31T15:00:00.000Z",
    });
  });

  test("counts urine, bowel, and both records by Seoul date", () => {
    const logs = [
      createLog("urine", "urine", "2026-07-07T15:30:00.000Z"),
      createLog("bowel", "bowel", "2026-07-08T01:00:00.000Z"),
      createLog("both", "both", "2026-07-08T02:00:00.000Z"),
    ];

    const day = createCalendarDays(2026, 6, logs).find(
      (calendarDay) => calendarDay.dateKey === "2026-07-08",
    );

    expect(day).toMatchObject({
      urineCount: 2,
      bowelCount: 2,
      hasRecords: true,
    });
    expect(filterLogsByDateKey(logs, "2026-07-08")).toHaveLength(3);
  });
});
```

- [ ] **Step 2: 유틸 테스트가 모듈 미정의로 실패하는지 확인**

Run:

```bash
npm test -- 'src/app/(app)/records/_util/recordsCalendar.test.ts'
```

Expected: FAIL — `recordsCalendar` 모듈이 없음.

- [ ] **Step 3: 달력 타입 작성**

`_type/recordsCalendar.ts`:

```ts
export type TRecordsView = "summary" | "details";

export type TRecordsCalendarDay = {
  dateKey: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  urineCount: number;
  bowelCount: number;
  hasRecords: boolean;
};

export type TMonthRange = {
  from: string;
  to: string;
};
```

- [ ] **Step 4: 서울 시간 기준 월 범위·날짜 키·집계 구현**

`_util/recordsCalendar.ts`:

```ts
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import type {
  TMonthRange,
  TRecordsCalendarDay,
} from "@/app/(app)/records/_type/recordsCalendar";

const SEOUL_DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Seoul",
});

export function createMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function createMonthRange(year: number, monthIndex: number): TMonthRange {
  const from = createSeoulMonthStart(year, monthIndex);
  const nextMonth = new Date(Date.UTC(year, monthIndex + 1, 1));
  const to = createSeoulMonthStart(
    nextMonth.getUTCFullYear(),
    nextMonth.getUTCMonth(),
  );

  return { from, to };
}

export function createCalendarDays(
  year: number,
  monthIndex: number,
  logs: TBathroomLogRow[],
): TRecordsCalendarDay[] {
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const todayKey = formatRecordDateKey(new Date().toISOString());
  const counts = createCountsByDate(logs);

  return Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstWeekday + 1;
    const date = new Date(Date.UTC(year, monthIndex, dayOffset));
    const dateKey = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
    const count = counts.get(dateKey) ?? { urineCount: 0, bowelCount: 0 };
    const isCurrentMonth = dayOffset >= 1 && dayOffset <= daysInMonth;

    return {
      dateKey,
      dayOfMonth: date.getUTCDate(),
      isCurrentMonth,
      isToday: dateKey === todayKey,
      urineCount: count.urineCount,
      bowelCount: count.bowelCount,
      hasRecords: count.urineCount > 0 || count.bowelCount > 0,
    };
  });
}

export function filterLogsByDateKey(
  logs: TBathroomLogRow[],
  dateKey: string,
) {
  return logs.filter((log) => formatRecordDateKey(log.logged_at) === dateKey);
}

export function formatRecordDateKey(loggedAt: string) {
  return SEOUL_DATE_FORMATTER.format(new Date(loggedAt));
}

function createCountsByDate(logs: TBathroomLogRow[]) {
  const counts = new Map<string, { urineCount: number; bowelCount: number }>();

  logs.forEach((log) => {
    const dateKey = formatRecordDateKey(log.logged_at);
    const current = counts.get(dateKey) ?? { urineCount: 0, bowelCount: 0 };

    if (log.kind === "urine" || log.kind === "both") {
      current.urineCount += 1;
    }

    if (log.kind === "bowel" || log.kind === "both") {
      current.bowelCount += 1;
    }

    counts.set(dateKey, current);
  });

  return counts;
}

function createSeoulMonthStart(year: number, monthIndex: number) {
  const month = String(monthIndex + 1).padStart(2, "0");
  return new Date(`${year}-${month}-01T00:00:00+09:00`).toISOString();
}
```

- [ ] **Step 5: 유틸 테스트 통과 확인**

Run:

```bash
npm test -- 'src/app/(app)/records/_util/recordsCalendar.test.ts'
```

Expected: PASS.

- [ ] **Step 6: 유틸 커밋**

```bash
git add 'src/app/(app)/records/_type/recordsCalendar.ts' 'src/app/(app)/records/_util/recordsCalendar.ts' 'src/app/(app)/records/_util/recordsCalendar.test.ts'
git commit -m "feat: add records calendar calculations"
```

### Task 3: 달력 요약 컴포넌트 구현

**Files:**
- Create: `src/app/(app)/records/_component/RecordsCalendarSummary.tsx`
- Test: `src/app/(app)/records/_component/RecordsCalendarSummary.test.tsx`
- Create: `src/app/(app)/records/_component/recordsCalendarSummary.module.scss`

- [ ] **Step 1: 달력의 월 제목·종류별 횟수·월 이동 실패 테스트 작성**

`RecordsCalendarSummary.test.tsx`를 만들고 다음 테스트를 작성한다.

```ts
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { TBathroomLogRow } from "@/api/bathroomLogs/type";
import { RecordsCalendarSummary } from "./RecordsCalendarSummary";

const LOG = {
  id: "log-1",
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
} satisfies TBathroomLogRow;

test("shows monthly counts and reports month and date actions", async () => {
  const user = userEvent.setup();
  const onPreviousMonth = vi.fn();
  const onSelectDate = vi.fn();

  render(
    <RecordsCalendarSummary
      year={2026}
      monthIndex={6}
      logs={[LOG]}
      isLoading={false}
      errorMessage=""
      onPreviousMonth={onPreviousMonth}
      onNextMonth={vi.fn()}
      onSelectDate={onSelectDate}
    />,
  );

  expect(screen.getByRole("heading", { name: "2026년 7월" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "7월 8일, 소변 1회, 대변 1회" }))
    .toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "이전 달 보기" }));
  await user.click(
    screen.getByRole("button", { name: "7월 8일, 소변 1회, 대변 1회" }),
  );

  expect(onPreviousMonth).toHaveBeenCalledOnce();
  expect(onSelectDate).toHaveBeenCalledWith("2026-07-08");
});
```

- [ ] **Step 2: UI 테스트가 달력 요소 미존재로 실패하는지 확인**

Run:

```bash
npm test -- 'src/app/(app)/records/_component/RecordsCalendarSummary.test.tsx'
```

Expected: FAIL — `RecordsCalendarSummary` 모듈이 없음.

- [ ] **Step 3: 달력 요약 컴포넌트 구현**

다음 props 경계를 사용한다.

```ts
type TRecordsCalendarSummaryProps = {
  year: number;
  monthIndex: number;
  logs: TBathroomLogRow[];
  isLoading: boolean;
  errorMessage: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateKey: string) => void;
};
```

컴포넌트는 `createCalendarDays(year, monthIndex, logs)`를 렌더링한다. 현재 달에 속하지 않는 칸은 `span`으로, 현재 달이면서 기록이 있는 날은 다음 접근성 이름을 가진 `button`으로 렌더링한다.

```tsx
<button
  type="button"
  aria-label={`${monthIndex + 1}월 ${day.dayOfMonth}일, 소변 ${day.urineCount}회, 대변 ${day.bowelCount}회`}
  onClick={() => onSelectDate(day.dateKey)}
>
  <span>{day.dayOfMonth}</span>
  <span>소변 {day.urineCount}</span>
  <span>대변 {day.bowelCount}</span>
</button>
```

기록이 없는 현재 달 날짜는 버튼이 아닌 날짜 셀로 표시한다. `isLoading`이면 `기록을 불러오는 중입니다.`, `errorMessage`가 있으면 해당 오류를 달력 영역 안에 표시한다.

- [ ] **Step 4: 달력 스타일 구현**

`recordsCalendarSummary.module.scss`에 다음 구조를 구현한다.

```scss
.calendar-summary {
  display: grid;
  gap: 12px;

  .month-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
  }

  .calendar-day {
    min-height: 68px;
    border: 0;
    padding: 8px 4px;
    background: transparent;
    color: var(--text);
    text-align: center;
  }

  .record-count {
    display: block;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.35;
  }
}
```

기록 있는 날짜의 hover/focus와 오늘 표시에는 기존 `--primary`, `--primary-soft`, `--line` 토큰만 사용한다.

- [ ] **Step 5: 달력 UI 테스트 통과 확인**

Run:

```bash
npm test -- 'src/app/(app)/records/_component/RecordsCalendarSummary.test.tsx'
```

Expected: PASS.

- [ ] **Step 6: 달력 컴포넌트 커밋**

```bash
git add 'src/app/(app)/records/_component/RecordsCalendarSummary.tsx' 'src/app/(app)/records/_component/RecordsCalendarSummary.test.tsx' 'src/app/(app)/records/_component/recordsCalendarSummary.module.scss'
git commit -m "feat: add records calendar summary"
```

### Task 4: 탭과 날짜 상세 필터 통합

**Files:**
- Modify: `src/app/(app)/records/RecordsPageClient.tsx`
- Modify: `src/app/(app)/records/recordsPageClient.module.scss`
- Modify: `src/app/(app)/records/RecordsPageClient.test.tsx`

- [ ] **Step 1: 기본 탭과 날짜 선택 이동 실패 테스트 작성**

API mock에 `listBathroomLogsByRange`를 추가하고 기본 반환값을 `LOGS`로 설정한다. 테스트 현재 월은 `vi.setSystemTime(new Date("2026-07-09T00:00:00.000Z"))`로 고정하고 `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`을 사용한다.

```ts
test("opens the selected calendar date in the details tab", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<RecordsPageClient />);

  expect(await screen.findByRole("tab", { name: "요약보기" }))
    .toHaveAttribute("aria-selected", "true");

  await user.click(
    screen.getByRole("button", { name: "7월 8일, 소변 0회, 대변 1회" }),
  );

  expect(screen.getByRole("tab", { name: "상세보기" }))
    .toHaveAttribute("aria-selected", "true");
  expect(screen.getByText("7월 8일 기록")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /오전 9:10 대변/ })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /오후 10:30 소변/ }))
    .not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "전체 보기" }));

  expect(screen.getByRole("button", { name: /오후 10:30 소변/ })).toBeInTheDocument();
});

test("loads the previous calendar month with a half-open range", async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<RecordsPageClient />);

  await screen.findByRole("heading", { name: "2026년 7월" });
  await user.click(screen.getByRole("button", { name: "이전 달 보기" }));

  expect(bathroomLogMocks.listBathroomLogsByRange).toHaveBeenLastCalledWith({
    from: "2026-05-31T15:00:00.000Z",
    to: "2026-06-30T15:00:00.000Z",
  });
});
```

기존 목록·수정·삭제 테스트는 먼저 `상세보기` 탭을 누른 뒤 현재 assertion을 수행하도록 바꾼다.

- [ ] **Step 2: 탭·날짜 필터 테스트가 실패하는지 확인**

Run:

```bash
npm test -- 'src/app/(app)/records/RecordsPageClient.test.tsx'
```

Expected: FAIL — tab과 날짜 필터 UI가 없음.

- [ ] **Step 3: 탭과 월 캐시 상태 조립**

`RecordsPageClient`에 다음 상태를 둔다.

```ts
const now = new Date();
const [activeView, setActiveView] = useState<TRecordsView>("summary");
const [visibleMonth, setVisibleMonth] = useState({
  year: now.getFullYear(),
  monthIndex: now.getMonth(),
});
const [calendarLogs, setCalendarLogs] = useState<TBathroomLogRow[]>([]);
const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
const [calendarErrorMessage, setCalendarErrorMessage] = useState("");
const [isCalendarLoading, setIsCalendarLoading] = useState(true);
const monthCacheRef = useRef<Record<string, TBathroomLogRow[]>>({});
```

선택 월 변경 effect는 `createMonthKey`로 캐시를 먼저 확인하고, 없을 때만 `createMonthRange`와 `listBathroomLogsByRange`를 호출한다. 이전·다음 달은 `new Date(year, monthIndex ± 1, 1)`로 연도 경계를 함께 처리한다.

- [ ] **Step 4: 접근 가능한 탭과 날짜 이동 구현**

헤더 아래에 `role="tablist"`를 추가하고 각 버튼에 `role="tab"`, `aria-selected`, `aria-controls`를 연결한다. 직접 `상세보기`를 누르는 handler는 `selectedDateKey`를 `null`로 만들고 전체 목록을 보여준다.

달력 날짜 선택 handler는 다음처럼 날짜 필터와 탭을 함께 바꾼다.

```ts
function handleSelectCalendarDate(dateKey: string) {
  setSelectedDateKey(dateKey);
  setActiveView("details");
}
```

상세 목록 데이터는 다음처럼 선택한다.

```ts
const visibleDetailLogs = selectedDateKey
  ? filterLogsByDateKey(calendarLogs, selectedDateKey)
  : logs;
const groupedLogs = groupLogsByDate(visibleDetailLogs);
```

날짜 필터 header에는 `formatSelectedDateLabel(selectedDateKey)` 결과와 `전체 보기` 버튼을 표시한다. 날짜 라벨 helper는 `YYYY-MM-DD`를 분해해 `${month}월 ${day}일 기록`을 반환하며 브라우저 시간대 파싱에 의존하지 않는다.

- [ ] **Step 5: 수정·삭제 후 전체 목록과 월 캐시 동기화**

update 성공 시 같은 mapper를 `logs`, `calendarLogs`, 현재 월 cache에 적용한다.

```ts
function replaceLog(
  currentLogs: TBathroomLogRow[],
  id: string,
  updatePayload: TReqUpdateBathroomLogDetails,
) {
  return currentLogs.map((log) =>
    log.id === id ? { ...log, ...updatePayload } : log,
  );
}
```

delete 성공 시 같은 id를 `logs`, `calendarLogs`, 현재 월 cache에서 제거한다. 이 변경은 현재 기능으로 발생한 월 집계 불일치만 해결하며 새 전역 cache 추상화는 만들지 않는다.

- [ ] **Step 6: 탭과 날짜 필터 스타일 추가**

`recordsPageClient.module.scss`에 `.view-tabs`, `.view-tab`, `.date-filter`를 추가한다. 선택 탭은 `var(--surface)`, `var(--primary-strong)`, `var(--line)`으로 표현하고 키보드 focus가 보이게 한다. 달력과 기존 목록의 app canvas/safe-area 구조는 변경하지 않는다.

- [ ] **Step 7: 통합 테스트 통과 확인**

Run:

```bash
npm test -- 'src/app/(app)/records/RecordsPageClient.test.tsx'
```

Expected: 탭·날짜 필터·기존 상세·수정·삭제 테스트 모두 PASS.

- [ ] **Step 8: 통합 UI 커밋**

```bash
git add 'src/app/(app)/records/RecordsPageClient.tsx' 'src/app/(app)/records/recordsPageClient.module.scss' 'src/app/(app)/records/RecordsPageClient.test.tsx'
git commit -m "feat: connect records calendar to details"
```

### Task 5: 전체 검증과 수동 확인

**Files:**
- Verify only

- [ ] **Step 1: 관련 테스트 전체 실행**

Run:

```bash
npm test -- src/api/bathroomLogs/index.test.ts 'src/app/(app)/records/_util/recordsCalendar.test.ts' 'src/app/(app)/records/_component/RecordsCalendarSummary.test.tsx' 'src/app/(app)/records/RecordsPageClient.test.tsx'
```

Expected: 모든 관련 테스트 PASS.

- [ ] **Step 2: 정적 검증 실행**

Run:

```bash
npm run typecheck
npm run lint
git diff --check
```

Expected: 세 명령 모두 exit code 0.

- [ ] **Step 3: 인증된 브라우저에서 모바일 흐름 smoke check**

`npm run dev`로 앱을 실행하고 인증된 세션에서 `/records`를 연다.

확인 항목:

- 첫 화면이 `요약보기`이며 현재 월 달력이 보인다.
- 360px 안팎 모바일 폭에서 7열 날짜와 두 기록 횟수가 겹치지 않는다.
- 이전·다음 달 이동이 동작한다.
- 기록 날짜를 누르면 상세보기로 이동하고 해당 날짜 기록만 보인다.
- `전체 보기`로 기존 전체 목록이 복원된다.
- 상세 모달, 수정, 삭제가 기존처럼 동작한다.
- 하단 내비게이션과 safe-area 여백이 달력에 가려지지 않는다.

인증 세션이 없으면 보호 route가 `/login`으로 이동할 수 있으므로 component test와 코드 검토 결과를 최종 검증 근거로 남긴다.

- [ ] **Step 4: 최종 상태 확인**

Run:

```bash
git status --short
git log -5 --oneline
```

Expected: 계획된 파일 외 변경이 없고 각 Task 커밋이 최신 로그에 보인다.
