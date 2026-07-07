# Record Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `record` 화면을 카드 없는 모바일 앱 캔버스로 다시 만들고, 실제 `bathroom_logs` 원탭 저장, 저장 직후 상세 추가, 즉시 취소를 지원한다.

**Architecture:** Supabase 접근은 `src/api/bathroomLogs/index.ts`로 분리하고, API 경계 타입은 `src/api/bathroomLogs/type.ts`에 둔다. `record` 화면의 UI 상태와 라벨은 route-local 파일에 둔다. `RecordPageContent`는 인증된 사용자 화면 조립, 빠른 기록 버튼, 저장 후 바텀시트, 상세 입력 상태, 하단 탭을 담당한다.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase JS, SCSS Modules, Vitest, Testing Library.

---

## 파일 구조

- 수정: `src/types/supabase.ts`
  - `bathroom_logs` table 타입을 추가한다.
  - 기존 `is_allowed_user` RPC 타입은 유지한다.
- 생성: `src/api/bathroomLogs/index.ts`
  - `createBathroomLog`, `updateBathroomLogDetails`, `deleteBathroomLog`를 제공한다.
  - 현재 Supabase user id를 확인한 뒤 RLS 소유권과 맞는 `user_id`로 insert한다.
- 생성: `src/api/bathroomLogs/type.ts`
  - `TBathroomLogRow`, `TBathroomLogInsert`, `TBathroomLogUpdate`, `TCreateBathroomLogInput`, `TUpdateBathroomLogDetailsInput`을 둔다.
- 생성: `src/api/bathroomLogs/index.test.ts`
  - API wrapper가 Supabase client를 올바르게 호출하는지 검증한다.
- 생성: `src/app/(app)/record/_type/bathroomLog.ts`
  - `TBathroomLogKind`, `TUrgency`, `TStoolState`, `TRecordDetailFormState`, `TJustSavedBathroomLog`를 둔다.
- 생성: `src/app/(app)/record/_define/recordOptions.ts`
  - 기록 종류 라벨, 상세 옵션, 하단 탭 목록을 둔다.
- 생성: `src/app/(app)/record/_util/recordDetailForm.ts`
  - 상세 입력 초기값과 API update payload 변환을 담당한다.
- 수정: `src/app/(app)/record/_component/RecordPageContent.test.tsx`
  - 기존 비활성 임시 버튼 테스트를 새 UX 테스트로 교체한다.
- 수정: `src/app/(app)/record/_component/RecordPageContent.tsx`
  - 빠른 기록, 바텀시트, 상세 입력, 취소, 하단 탭을 구현한다.
- 수정: `src/app/(app)/record/_component/recordPageContent.module.scss`
  - `.surface` 카드 의존을 제거하고 모바일 앱 캔버스, 세로 버튼, 바텀시트, 하단 탭 스타일을 구현한다.

---

## Task 1: Supabase 타입과 기록 API

**Files:**
- Modify: `src/types/supabase.ts`
- Create: `src/api/bathroomLogs/index.ts`
- Create: `src/api/bathroomLogs/type.ts`
- Create: `src/api/bathroomLogs/index.test.ts`

- [ ] **Step 1: API 테스트 작성**

Create `src/api/bathroomLogs/index.test.ts`:

```ts
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  createBathroomLog,
  deleteBathroomLog,
  updateBathroomLogDetails,
} from "./index";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

describe("bathroomLogs API", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      error: null,
    });
  });

  test("creates a bathroom log owned by the current user", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-07T02:30:00.000Z"));

    const single = vi.fn().mockResolvedValue({
      data: {
        id: "log-1",
        user_id: "user-1",
        kind: "urine",
        logged_at: "2026-07-07T02:30:00.000Z",
        urgency: null,
        woke_from_sleep: null,
        note: null,
        urine_pain: null,
        urine_color_unusual: null,
        stool_state: null,
        bowel_pain: null,
        possible_blood: null,
        created_at: "2026-07-07T02:30:00.000Z",
        updated_at: "2026-07-07T02:30:00.000Z",
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    mockFrom.mockReturnValue({ insert });

    const result = await createBathroomLog({ kind: "urine" });

    expect(mockFrom).toHaveBeenCalledWith("bathroom_logs");
    expect(insert).toHaveBeenCalledWith({
      user_id: "user-1",
      kind: "urine",
      logged_at: "2026-07-07T02:30:00.000Z",
    });
    expect(select).toHaveBeenCalledWith("*");
    expect(result.id).toBe("log-1");
  });

  test("updates details for a bathroom log", async () => {
    const eq = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const update = vi.fn(() => ({ eq }));
    mockFrom.mockReturnValue({ update });

    await updateBathroomLogDetails("log-1", {
      urgency: "urgent",
      woke_from_sleep: false,
      note: "저녁 이후",
      urine_pain: true,
      urine_color_unusual: false,
      stool_state: null,
      bowel_pain: null,
      possible_blood: null,
    });

    expect(mockFrom).toHaveBeenCalledWith("bathroom_logs");
    expect(update).toHaveBeenCalledWith({
      urgency: "urgent",
      woke_from_sleep: false,
      note: "저녁 이후",
      urine_pain: true,
      urine_color_unusual: false,
      stool_state: null,
      bowel_pain: null,
      possible_blood: null,
    });
    expect(eq).toHaveBeenCalledWith("id", "log-1");
  });

  test("deletes a bathroom log by id", async () => {
    const eq = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const deleteQuery = vi.fn(() => ({ eq }));
    mockFrom.mockReturnValue({ delete: deleteQuery });

    await deleteBathroomLog("log-1");

    expect(mockFrom).toHaveBeenCalledWith("bathroom_logs");
    expect(deleteQuery).toHaveBeenCalledWith();
    expect(eq).toHaveBeenCalledWith("id", "log-1");
  });

  test("throws when there is no authenticated user for create", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: null,
      },
      error: null,
    });

    await expect(createBathroomLog({ kind: "bowel" })).rejects.toThrow(
      "로그인한 사용자만 기록을 저장할 수 있습니다.",
    );
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```bash
npm run test -- src/api/bathroomLogs/index.test.ts
```

Expected: FAIL because `src/api/bathroomLogs/index.ts` does not exist.

- [ ] **Step 3: Supabase 타입 추가**

Replace `src/types/supabase.ts` with:

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bathroom_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          kind: "urine" | "bowel" | "both";
          urgency: "relaxed" | "ordinary" | "urgent" | null;
          woke_from_sleep: boolean | null;
          note: string | null;
          urine_pain: boolean | null;
          urine_color_unusual: boolean | null;
          stool_state: "usual" | "loose" | "hard" | null;
          bowel_pain: boolean | null;
          possible_blood: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          kind: "urine" | "bowel" | "both";
          urgency?: "relaxed" | "ordinary" | "urgent" | null;
          woke_from_sleep?: boolean | null;
          note?: string | null;
          urine_pain?: boolean | null;
          urine_color_unusual?: boolean | null;
          stool_state?: "usual" | "loose" | "hard" | null;
          bowel_pain?: boolean | null;
          possible_blood?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          logged_at?: string;
          kind?: "urine" | "bowel" | "both";
          urgency?: "relaxed" | "ordinary" | "urgent" | null;
          woke_from_sleep?: boolean | null;
          note?: string | null;
          urine_pain?: boolean | null;
          urine_color_unusual?: boolean | null;
          stool_state?: "usual" | "loose" | "hard" | null;
          bowel_pain?: boolean | null;
          possible_blood?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      is_allowed_user: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
  };
};
```

- [ ] **Step 4: API 타입 생성**

Create `src/api/bathroomLogs/type.ts`:

```ts
import type { Database } from "@/types/supabase";

export type TBathroomLogRow = Database["public"]["Tables"]["bathroom_logs"]["Row"];
export type TBathroomLogInsert = Database["public"]["Tables"]["bathroom_logs"]["Insert"];
export type TBathroomLogUpdate = Database["public"]["Tables"]["bathroom_logs"]["Update"];

export type TCreateBathroomLogInput = {
  kind: TBathroomLogRow["kind"];
  loggedAt?: string;
};

export type TUpdateBathroomLogDetailsInput = Pick<
  TBathroomLogUpdate,
  | "urgency"
  | "woke_from_sleep"
  | "note"
  | "urine_pain"
  | "urine_color_unusual"
  | "stool_state"
  | "bowel_pain"
  | "possible_blood"
>;
```

- [ ] **Step 5: API 구현**

Create `src/api/bathroomLogs/index.ts`:

```ts
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  TBathroomLogInsert,
  TCreateBathroomLogInput,
  TUpdateBathroomLogDetailsInput,
} from "./type";

export async function createBathroomLog({ kind, loggedAt }: TCreateBathroomLogInput) {
  const supabase = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    throw new Error("로그인한 사용자만 기록을 저장할 수 있습니다.");
  }

  const insertPayload: TBathroomLogInsert = {
    user_id: userData.user.id,
    kind,
    logged_at: loggedAt ?? new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("bathroom_logs")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateBathroomLogDetails(
  id: string,
  details: TUpdateBathroomLogDetailsInput,
) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("bathroom_logs").update(details).eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteBathroomLog(id: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("bathroom_logs").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
```

- [ ] **Step 6: 테스트 통과 확인**

Run:

```bash
npm run test -- src/api/bathroomLogs/index.test.ts
```

Expected: PASS.

- [ ] **Step 7: 커밋**

```bash
git add src/types/supabase.ts src/api/bathroomLogs/index.ts src/api/bathroomLogs/type.ts src/api/bathroomLogs/index.test.ts
git commit -m "feat: add bathroom log api"
```

---

## Task 2: record route-local 타입, 옵션, 상세 변환 유틸

**Files:**
- Create: `src/app/(app)/record/_type/bathroomLog.ts`
- Create: `src/app/(app)/record/_define/recordOptions.ts`
- Create: `src/app/(app)/record/_util/recordDetailForm.ts`
- Create: `src/app/(app)/record/_util/recordDetailForm.test.ts`

- [ ] **Step 1: 상세 변환 테스트 작성**

Create `src/app/(app)/record/_util/recordDetailForm.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import { createEmptyDetailForm, toBathroomLogDetailUpdate } from "./recordDetailForm";

describe("recordDetailForm", () => {
  test("creates an empty detail form", () => {
    expect(createEmptyDetailForm()).toEqual({
      urgency: "",
      wokeFromSleep: "",
      note: "",
      urinePain: false,
      urineColorUnusual: false,
      stoolState: "",
      bowelPain: false,
      possibleBlood: false,
    });
  });

  test("maps urine details and clears bowel-only fields", () => {
    expect(
      toBathroomLogDetailUpdate("urine", {
        urgency: "urgent",
        wokeFromSleep: "no",
        note: "  저녁 이후  ",
        urinePain: true,
        urineColorUnusual: false,
        stoolState: "loose",
        bowelPain: true,
        possibleBlood: true,
      }),
    ).toEqual({
      urgency: "urgent",
      woke_from_sleep: false,
      note: "저녁 이후",
      urine_pain: true,
      urine_color_unusual: false,
      stool_state: null,
      bowel_pain: null,
      possible_blood: null,
    });
  });

  test("maps bowel details and clears urine-only fields", () => {
    expect(
      toBathroomLogDetailUpdate("bowel", {
        urgency: "",
        wokeFromSleep: "yes",
        note: "",
        urinePain: true,
        urineColorUnusual: true,
        stoolState: "hard",
        bowelPain: false,
        possibleBlood: true,
      }),
    ).toEqual({
      urgency: null,
      woke_from_sleep: true,
      note: null,
      urine_pain: null,
      urine_color_unusual: null,
      stool_state: "hard",
      bowel_pain: false,
      possible_blood: true,
    });
  });

  test("keeps urine and bowel fields for both kind", () => {
    expect(
      toBathroomLogDetailUpdate("both", {
        urgency: "ordinary",
        wokeFromSleep: "",
        note: "메모",
        urinePain: false,
        urineColorUnusual: true,
        stoolState: "usual",
        bowelPain: true,
        possibleBlood: false,
      }),
    ).toEqual({
      urgency: "ordinary",
      woke_from_sleep: null,
      note: "메모",
      urine_pain: false,
      urine_color_unusual: true,
      stool_state: "usual",
      bowel_pain: true,
      possible_blood: false,
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```bash
npm run test -- 'src/app/(app)/record/_util/recordDetailForm.test.ts'
```

Expected: FAIL because route-local type and util files do not exist.

- [ ] **Step 3: route-local 타입 생성**

Create `src/app/(app)/record/_type/bathroomLog.ts`:

```ts
import type { Database } from "@/types/supabase";

export type TBathroomLogRow = Database["public"]["Tables"]["bathroom_logs"]["Row"];
export type TBathroomLogKind = TBathroomLogRow["kind"];
export type TUrgency = NonNullable<TBathroomLogRow["urgency"]>;
export type TStoolState = NonNullable<TBathroomLogRow["stool_state"]>;

export type TRecordDetailFormState = {
  urgency: "" | TUrgency;
  wokeFromSleep: "" | "yes" | "no";
  note: string;
  urinePain: boolean;
  urineColorUnusual: boolean;
  stoolState: "" | TStoolState;
  bowelPain: boolean;
  possibleBlood: boolean;
};

export type TJustSavedBathroomLog = Pick<TBathroomLogRow, "id" | "kind" | "logged_at">;
```

- [ ] **Step 4: route-local 옵션 생성**

Create `src/app/(app)/record/_define/recordOptions.ts`:

```ts
import type { TBathroomLogKind, TStoolState, TUrgency } from "../_type/bathroomLog";

export const RECORD_KIND_LABEL: Record<TBathroomLogKind, string> = {
  urine: "소변",
  bowel: "대변",
  both: "둘 다",
};

export const RECORD_KIND_OPTIONS: Array<{
  kind: TBathroomLogKind;
  label: string;
  description: string;
}> = [
  {
    kind: "urine",
    label: "소변",
    description: "지금 시각으로 소변 기록",
  },
  {
    kind: "bowel",
    label: "대변",
    description: "지금 시각으로 대변 기록",
  },
  {
    kind: "both",
    label: "둘 다",
    description: "소변과 대변을 함께 기록",
  },
];

export const URGENCY_OPTIONS: Array<{ value: TUrgency; label: string }> = [
  { value: "relaxed", label: "여유" },
  { value: "ordinary", label: "보통" },
  { value: "urgent", label: "급함" },
];

export const STOOL_STATE_OPTIONS: Array<{ value: TStoolState; label: string }> = [
  { value: "usual", label: "평소와 비슷함" },
  { value: "loose", label: "묽음" },
  { value: "hard", label: "딱딱함" },
];

export const BOTTOM_TABS = [
  { href: "/record", label: "기록" },
  { href: "/records", label: "기록 보기" },
  { href: "/report", label: "AI 리포트" },
  { href: "/settings", label: "설정" },
] as const;
```

- [ ] **Step 5: 상세 변환 유틸 생성**

Create `src/app/(app)/record/_util/recordDetailForm.ts`:

```ts
import type { TUpdateBathroomLogDetailsInput } from "@/api/bathroomLogs/type";
import type { TBathroomLogKind, TRecordDetailFormState } from "../_type/bathroomLog";

export function createEmptyDetailForm(): TRecordDetailFormState {
  return {
    urgency: "",
    wokeFromSleep: "",
    note: "",
    urinePain: false,
    urineColorUnusual: false,
    stoolState: "",
    bowelPain: false,
    possibleBlood: false,
  };
}

export function toBathroomLogDetailUpdate(
  kind: TBathroomLogKind,
  form: TRecordDetailFormState,
): TUpdateBathroomLogDetailsInput {
  const hasUrineFields = kind === "urine" || kind === "both";
  const hasBowelFields = kind === "bowel" || kind === "both";
  const note = form.note.trim();

  return {
    urgency: form.urgency || null,
    woke_from_sleep: toNullableBoolean(form.wokeFromSleep),
    note: note || null,
    urine_pain: hasUrineFields ? form.urinePain : null,
    urine_color_unusual: hasUrineFields ? form.urineColorUnusual : null,
    stool_state: hasBowelFields ? form.stoolState || null : null,
    bowel_pain: hasBowelFields ? form.bowelPain : null,
    possible_blood: hasBowelFields ? form.possibleBlood : null,
  };
}

function toNullableBoolean(value: TRecordDetailFormState["wokeFromSleep"]) {
  if (value === "yes") {
    return true;
  }

  if (value === "no") {
    return false;
  }

  return null;
}
```

- [ ] **Step 6: 테스트 통과 확인**

Run:

```bash
npm run test -- 'src/app/(app)/record/_util/recordDetailForm.test.ts'
```

Expected: PASS.

- [ ] **Step 7: 커밋**

```bash
git add 'src/app/(app)/record/_type/bathroomLog.ts' 'src/app/(app)/record/_define/recordOptions.ts' 'src/app/(app)/record/_util/recordDetailForm.ts' 'src/app/(app)/record/_util/recordDetailForm.test.ts'
git commit -m "feat: add record detail helpers"
```

---

## Task 3: RecordPageContent 테스트 교체

**Files:**
- Modify: `src/app/(app)/record/_component/RecordPageContent.test.tsx`

- [ ] **Step 1: 새 UX 기준 테스트 작성**

Replace `src/app/(app)/record/_component/RecordPageContent.test.tsx` with:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { RecordPageContent } from "./RecordPageContent";

const authMocks = vi.hoisted(() => ({
  signOut: vi.fn(),
}));

const bathroomLogMocks = vi.hoisted(() => ({
  createBathroomLog: vi.fn(),
  deleteBathroomLog: vi.fn(),
  updateBathroomLogDetails: vi.fn(),
}));

vi.mock("@/components/auth/AuthGate", () => ({
  useAuthSession: () => ({
    email: "me@example.com",
    signOut: authMocks.signOut,
  }),
}));

vi.mock("@/api/bathroomLogs", () => ({
  createBathroomLog: bathroomLogMocks.createBathroomLog,
  deleteBathroomLog: bathroomLogMocks.deleteBathroomLog,
  updateBathroomLogDetails: bathroomLogMocks.updateBathroomLogDetails,
}));

describe("RecordPageContent", () => {
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
    render(<RecordPageContent />);

    expect(screen.getByRole("main", { name: "기록 화면" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "소변 지금 시각으로 소변 기록" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "대변 지금 시각으로 대변 기록" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "둘 다 소변과 대변을 함께 기록" })).toBeEnabled();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "기록" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "기록 보기" })).toHaveAttribute("href", "/records");
    expect(screen.getByRole("link", { name: "AI 리포트" })).toHaveAttribute("href", "/report");
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute("href", "/settings");
  });

  test("creates a quick log and shows the saved bottom sheet", async () => {
    const user = userEvent.setup();

    render(<RecordPageContent />);
    await user.click(screen.getByRole("button", { name: "소변 지금 시각으로 소변 기록" }));

    expect(bathroomLogMocks.createBathroomLog).toHaveBeenCalledWith({ kind: "urine" });
    const sheet = screen.getByRole("dialog", { name: "방금 저장된 기록" });
    expect(within(sheet).getByText("방금 저장됨")).toBeInTheDocument();
    expect(within(sheet).getByText("소변")).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "상세 추가" })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  test("dismisses the bottom sheet without undoing the log", async () => {
    const user = userEvent.setup();

    render(<RecordPageContent />);
    await user.click(screen.getByRole("button", { name: "소변 지금 시각으로 소변 기록" }));
    await user.click(screen.getByRole("button", { name: "닫기" }));

    expect(screen.queryByRole("dialog", { name: "방금 저장된 기록" })).not.toBeInTheDocument();
    expect(bathroomLogMocks.deleteBathroomLog).not.toHaveBeenCalled();
  });

  test("undoes the just-saved log", async () => {
    const user = userEvent.setup();

    render(<RecordPageContent />);
    await user.click(screen.getByRole("button", { name: "소변 지금 시각으로 소변 기록" }));
    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(bathroomLogMocks.deleteBathroomLog).toHaveBeenCalledWith("log-1");
    expect(screen.queryByRole("dialog", { name: "방금 저장된 기록" })).not.toBeInTheDocument();
  });

  test("opens detail fields for urine logs and saves them", async () => {
    const user = userEvent.setup();

    render(<RecordPageContent />);
    await user.click(screen.getByRole("button", { name: "소변 지금 시각으로 소변 기록" }));
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
    expect(screen.queryByRole("dialog", { name: "방금 저장된 기록" })).not.toBeInTheDocument();
  });

  test("shows a save failure message without opening the sheet", async () => {
    const user = userEvent.setup();
    bathroomLogMocks.createBathroomLog.mockRejectedValue(new Error("network"));

    render(<RecordPageContent />);
    await user.click(screen.getByRole("button", { name: "대변 지금 시각으로 대변 기록" }));

    expect(screen.getByRole("status")).toHaveTextContent("기록을 저장하지 못했습니다. 다시 시도해 주세요.");
    expect(screen.queryByRole("dialog", { name: "방금 저장된 기록" })).not.toBeInTheDocument();
  });

  test("keeps sign out available", async () => {
    const user = userEvent.setup();

    render(<RecordPageContent />);
    await user.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(authMocks.signOut).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run:

```bash
npm run test -- 'src/app/(app)/record/_component/RecordPageContent.test.tsx'
```

Expected: FAIL because the current component still renders disabled temporary buttons and does not call the bathroom log API.

- [ ] **Step 3: 커밋하지 않기**

Do not commit failing tests alone. Continue to Task 4.

---

## Task 4: RecordPageContent 구현과 스타일 교체

**Files:**
- Modify: `src/app/(app)/record/_component/RecordPageContent.tsx`
- Modify: `src/app/(app)/record/_component/recordPageContent.module.scss`

- [ ] **Step 1: 컴포넌트 구현**

Replace `src/app/(app)/record/_component/RecordPageContent.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  createBathroomLog,
  deleteBathroomLog,
  updateBathroomLogDetails,
} from "@/api/bathroomLogs";
import { useAuthSession } from "@/components/auth/AuthGate";
import {
  BOTTOM_TABS,
  RECORD_KIND_LABEL,
  RECORD_KIND_OPTIONS,
  STOOL_STATE_OPTIONS,
  URGENCY_OPTIONS,
} from "../_define/recordOptions";
import type {
  TBathroomLogKind,
  TJustSavedBathroomLog,
  TRecordDetailFormState,
} from "../_type/bathroomLog";
import { createEmptyDetailForm, toBathroomLogDetailUpdate } from "../_util/recordDetailForm";
import styles from "./recordPageContent.module.scss";

type TSheetMode = "summary" | "detail";

const SAVE_ERROR_MESSAGE = "기록을 저장하지 못했습니다. 다시 시도해 주세요.";
const UNDO_ERROR_MESSAGE = "취소가 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.";
const DETAIL_ERROR_MESSAGE = "상세 내용을 저장하지 못했습니다. 다시 시도해 주세요.";

export function RecordPageContent() {
  const { email, signOut } = useAuthSession();
  const [justSavedLog, setJustSavedLog] = useState<TJustSavedBathroomLog | null>(null);
  const [sheetMode, setSheetMode] = useState<TSheetMode>("summary");
  const [detailForm, setDetailForm] = useState<TRecordDetailFormState>(() => createEmptyDetailForm());
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  async function handleQuickRecord(kind: TBathroomLogKind) {
    setErrorMessage("");
    setStatusMessage("");
    setIsSaving(true);

    try {
      const savedLog = await createBathroomLog({ kind });
      setJustSavedLog(savedLog);
      setDetailForm(createEmptyDetailForm());
      setSheetMode("summary");
      setStatusMessage(`${RECORD_KIND_LABEL[kind]} 기록을 저장했습니다.`);
    } catch {
      setJustSavedLog(null);
      setStatusMessage("");
      setErrorMessage(SAVE_ERROR_MESSAGE);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUndo() {
    if (!justSavedLog) {
      return;
    }

    setErrorMessage("");
    setIsUndoing(true);

    try {
      await deleteBathroomLog(justSavedLog.id);
      setJustSavedLog(null);
      setStatusMessage("방금 저장한 기록을 취소했습니다.");
    } catch {
      setErrorMessage(UNDO_ERROR_MESSAGE);
    } finally {
      setIsUndoing(false);
    }
  }

  async function handleSaveDetails() {
    if (!justSavedLog) {
      return;
    }

    setErrorMessage("");
    setIsSavingDetails(true);

    try {
      await updateBathroomLogDetails(
        justSavedLog.id,
        toBathroomLogDetailUpdate(justSavedLog.kind, detailForm),
      );
      setJustSavedLog(null);
      setStatusMessage("상세 내용을 저장했습니다.");
    } catch {
      setErrorMessage(DETAIL_ERROR_MESSAGE);
    } finally {
      setIsSavingDetails(false);
    }
  }

  function handleCloseSheet() {
    setJustSavedLog(null);
    setErrorMessage("");
  }

  function updateDetailForm(nextForm: Partial<TRecordDetailFormState>) {
    setDetailForm((currentForm) => ({
      ...currentForm,
      ...nextForm,
    }));
  }

  return (
    <main className={styles["record-page-content"]} aria-label="기록 화면">
      <div className={styles["app-canvas"]}>
        <header className={styles["topbar"]}>
          <div className={styles["topbar-title"]}>
            <p className={styles["eyebrow"]}>오늘 기록</p>
            <h1>빠르게 기록하고 필요하면 덧붙이기</h1>
          </div>
          <button className={styles["ghost-button"]} type="button" onClick={() => void signOut()}>
            로그아웃
          </button>
        </header>

        <p className={styles["account"]}>{email}</p>

        <section className={styles["quick-section"]} aria-label="빠른 기록">
          {RECORD_KIND_OPTIONS.map((option) => (
            <button
              className={`${styles["record-button"]} ${styles[option.kind]}`}
              type="button"
              key={option.kind}
              onClick={() => void handleQuickRecord(option.kind)}
              disabled={isSaving}
            >
              <span>{option.label}</span>
              <small>{option.description}</small>
            </button>
          ))}
        </section>

        <p className={styles["helper-text"]}>
          저장하면 바로 완료되고, 상세 입력은 이어서 선택할 수 있습니다.
        </p>

        {statusMessage ? (
          <p className={styles["status-message"]} role="status">
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p className={styles["error-message"]} role="alert">
            {errorMessage}
          </p>
        ) : null}

        {justSavedLog ? (
          <section className={styles["bottom-sheet"]} role="dialog" aria-label="방금 저장된 기록">
            {sheetMode === "summary" ? (
              <>
                <div className={styles["sheet-handle"]} />
                <p className={styles["sheet-eyebrow"]}>방금 저장됨</p>
                <div className={styles["sheet-summary"]}>
                  <strong>{RECORD_KIND_LABEL[justSavedLog.kind]}</strong>
                  <span>{formatSavedTime(justSavedLog.logged_at)}</span>
                </div>
                <div className={styles["sheet-actions"]}>
                  <button type="button" onClick={() => setSheetMode("detail")}>
                    상세 추가
                  </button>
                  <button type="button" onClick={() => void handleUndo()} disabled={isUndoing}>
                    취소
                  </button>
                  <button type="button" onClick={handleCloseSheet}>
                    닫기
                  </button>
                </div>
              </>
            ) : (
              <div className={styles["detail-form"]}>
                <div className={styles["sheet-handle"]} />
                <p className={styles["sheet-eyebrow"]}>상세 추가</p>
                <label>
                  긴급도
                  <select
                    value={detailForm.urgency}
                    onChange={(event) => updateDetailForm({ urgency: event.target.value as TRecordDetailFormState["urgency"] })}
                  >
                    <option value="">미기록</option>
                    {URGENCY_OPTIONS.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  자다가 깼음
                  <select
                    value={detailForm.wokeFromSleep}
                    onChange={(event) =>
                      updateDetailForm({
                        wokeFromSleep: event.target.value as TRecordDetailFormState["wokeFromSleep"],
                      })
                    }
                  >
                    <option value="">미기록</option>
                    <option value="yes">예</option>
                    <option value="no">아니오</option>
                  </select>
                </label>
                {showsUrineFields(justSavedLog.kind) ? (
                  <div className={styles["check-group"]}>
                    <label>
                      <input
                        type="checkbox"
                        checked={detailForm.urinePain}
                        onChange={(event) => updateDetailForm({ urinePain: event.target.checked })}
                      />
                      소변 통증
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={detailForm.urineColorUnusual}
                        onChange={(event) =>
                          updateDetailForm({ urineColorUnusual: event.target.checked })
                        }
                      />
                      색이 평소와 다름
                    </label>
                  </div>
                ) : null}
                {showsBowelFields(justSavedLog.kind) ? (
                  <>
                    <label>
                      대변 상태
                      <select
                        value={detailForm.stoolState}
                        onChange={(event) =>
                          updateDetailForm({
                            stoolState: event.target.value as TRecordDetailFormState["stoolState"],
                          })
                        }
                      >
                        <option value="">미기록</option>
                        {STOOL_STATE_OPTIONS.map((option) => (
                          <option value={option.value} key={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className={styles["check-group"]}>
                      <label>
                        <input
                          type="checkbox"
                          checked={detailForm.bowelPain}
                          onChange={(event) => updateDetailForm({ bowelPain: event.target.checked })}
                        />
                        대변 통증
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={detailForm.possibleBlood}
                          onChange={(event) =>
                            updateDetailForm({ possibleBlood: event.target.checked })
                          }
                        />
                        혈변 의심
                      </label>
                    </div>
                  </>
                ) : null}
                <label>
                  메모
                  <textarea
                    value={detailForm.note}
                    onChange={(event) => updateDetailForm({ note: event.target.value })}
                    rows={3}
                  />
                </label>
                <div className={styles["sheet-actions"]}>
                  <button type="button" onClick={() => void handleSaveDetails()} disabled={isSavingDetails}>
                    상세 저장
                  </button>
                  <button type="button" onClick={() => setSheetMode("summary")}>
                    뒤로
                  </button>
                </div>
              </div>
            )}
          </section>
        ) : null}

        <nav className={styles["bottom-tabs"]} aria-label="하단 탭">
          {BOTTOM_TABS.map((tab) => (
            <Link
              className={tab.href === "/record" ? styles["active-tab"] : undefined}
              href={tab.href}
              key={tab.href}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}

function showsUrineFields(kind: TBathroomLogKind) {
  return kind === "urine" || kind === "both";
}

function showsBowelFields(kind: TBathroomLogKind) {
  return kind === "bowel" || kind === "both";
}

function formatSavedTime(loggedAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(loggedAt));
}
```

- [ ] **Step 2: 스타일 구현**

Replace `src/app/(app)/record/_component/recordPageContent.module.scss` with:

```scss
.record-page-content {
  min-height: 100svh;
  background: var(--background);
}

.app-canvas {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(100%, var(--app-max-width));
  min-height: 100svh;
  margin: 0 auto;
  padding: max(18px, env(safe-area-inset-top)) 18px calc(92px + env(safe-area-inset-bottom));
  background: var(--surface-muted);
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding-top: 8px;
}

.topbar-title {
  min-width: 0;

  h1 {
    margin: 0;
    font-size: 28px;
    line-height: 1.18;
  }
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.4;
}

.ghost-button {
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0 12px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
}

.account {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.5;
}

.quick-section {
  display: grid;
  gap: 12px;
  margin-top: 30px;
}

.record-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 104px;
  border: 0;
  border-radius: 14px;
  padding: 20px 18px;
  color: #ffffff;
  cursor: pointer;
  text-align: left;

  span {
    font-size: 22px;
    font-weight: 850;
    line-height: 1.2;
  }

  small {
    margin-top: 8px;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.4;
    opacity: 0.86;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
}

.urine {
  background: var(--record-urine);
}

.bowel {
  background: var(--record-bowel);
}

.both {
  background: var(--record-combined);
}

.helper-text,
.status-message,
.error-message {
  margin: 16px 0 0;
  border-radius: var(--radius);
  padding: 12px;
  font-size: 14px;
  line-height: 1.55;
}

.helper-text {
  color: var(--muted);
}

.status-message {
  background: var(--primary-soft);
  color: var(--primary-strong);
}

.error-message {
  background: var(--danger-soft);
  color: var(--danger);
}

.bottom-sheet {
  position: fixed;
  right: max(0px, calc((100vw - var(--app-max-width)) / 2));
  bottom: 0;
  left: max(0px, calc((100vw - var(--app-max-width)) / 2));
  z-index: 2;
  border: 1px solid var(--line);
  border-bottom: 0;
  border-radius: 22px 22px 0 0;
  padding: 14px 18px calc(86px + env(safe-area-inset-bottom));
  background: var(--surface);
  box-shadow: 0 -16px 40px rgb(24 34 42 / 12%);
}

.sheet-handle {
  width: 42px;
  height: 4px;
  margin: 0 auto 14px;
  border-radius: 999px;
  background: var(--line);
}

.sheet-eyebrow {
  margin: 0 0 10px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
}

.sheet-summary {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  strong {
    font-size: 22px;
  }

  span {
    color: var(--muted);
    font-size: 14px;
  }
}

.sheet-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  button {
    min-height: 44px;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    cursor: pointer;
    font-weight: 800;

    &:first-child {
      border-color: transparent;
      background: var(--primary-soft);
      color: var(--primary-strong);
    }

    &:disabled {
      cursor: wait;
      opacity: 0.7;
    }
  }
}

.detail-form {
  display: grid;
  gap: 12px;

  label {
    display: grid;
    gap: 6px;
    color: var(--text);
    font-size: 14px;
    font-weight: 800;
  }

  select,
  textarea {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 11px 12px;
    background: var(--surface);
    color: var(--text);
    font: inherit;
    font-weight: 500;
  }

  textarea {
    resize: vertical;
  }
}

.check-group {
  display: grid;
  gap: 10px;

  label {
    display: flex;
    grid-template-columns: none;
    align-items: center;
    gap: 8px;
    font-weight: 700;
  }

  input {
    width: 18px;
    height: 18px;
  }
}

.bottom-tabs {
  position: fixed;
  right: max(0px, calc((100vw - var(--app-max-width)) / 2));
  bottom: 0;
  left: max(0px, calc((100vw - var(--app-max-width)) / 2));
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  min-height: calc(70px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--line);
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--surface);

  a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 10px 4px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 800;
    line-height: 1.25;
    text-align: center;
    text-decoration: none;
  }
}

.active-tab {
  color: var(--primary) !important;
}
```

- [ ] **Step 3: record 컴포넌트 테스트 통과 확인**

Run:

```bash
npm run test -- 'src/app/(app)/record/_component/RecordPageContent.test.tsx'
```

Expected: PASS.

- [ ] **Step 4: 전체 관련 테스트 통과 확인**

Run:

```bash
npm run test -- src/api/bathroomLogs/index.test.ts 'src/app/(app)/record/_util/recordDetailForm.test.ts' 'src/app/(app)/record/_component/RecordPageContent.test.tsx'
```

Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add 'src/app/(app)/record/_component/RecordPageContent.tsx' 'src/app/(app)/record/_component/recordPageContent.module.scss' 'src/app/(app)/record/_component/RecordPageContent.test.tsx'
git commit -m "feat: rebuild record page"
```

---

## Task 5: 최종 검증

**Files:**
- No source file changes expected.

- [ ] **Step 1: 전체 테스트 실행**

Run:

```bash
npm run test
```

Expected: all test files PASS.

- [ ] **Step 2: 타입체크 실행**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: 린트 실행**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: 최종 상태 확인**

Run:

```bash
git status --short --branch
```

Expected: clean working tree on `codex/feature-record-page`, ahead of remote by the new implementation commits.

---

## 자체 검토

- 스펙 커버리지: 카드 없는 모바일 앱 캔버스는 Task 4 스타일에서 구현한다. 세로 큰 버튼은 Task 4 컴포넌트와 스타일에서 구현한다. 바텀시트, 상세 추가, 취소, 닫기는 Task 3 테스트와 Task 4 구현에 포함한다. `bathroom_logs` source of truth는 Task 1 API에서 실제 Supabase insert/update/delete로 연결한다.
- 범위 점검: 일별 요약, 전체 기록 목록, 회원가입, 의학적 판단 문구는 포함하지 않는다.
- 타입 일관성: `TBathroomLogKind`는 `Database["public"]["Tables"]["bathroom_logs"]["Row"]["kind"]`에서 파생하고, API와 UI 옵션이 같은 값 `urine`, `bowel`, `both`를 사용한다.
- 검증 기준: API 단위 테스트, 상세 변환 유틸 테스트, RecordPageContent 상호작용 테스트, 전체 test/typecheck/lint를 실행한다.
