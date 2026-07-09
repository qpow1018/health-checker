# 설정 계정 화면 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 이메일을 확인하고 확인 모달을 거쳐 안전하게 로그아웃할 수 있는 설정 1차 화면을 만든다.

**Architecture:** `page.tsx`는 서버 컴포넌트로 유지하고 route-root `SettingsPageClient`가 `useAuthSession()`의 이메일과 로그아웃 동작을 사용한다. 기존 `Button`, `ConfirmModal`, `BottomNavigation`을 재사용하며 인증 API와 세션 redirect 로직은 `AuthGate`에 남긴다.

**Tech Stack:** Next.js 15, React 19, TypeScript, SCSS Modules, Vitest, Testing Library

---

## 파일 구조

- Modify: `src/app/(app)/settings/page.tsx` — route-level 조립
- Create: `src/app/(app)/settings/SettingsPageClient.tsx` — 계정 표시와 로그아웃 상태
- Create: `src/app/(app)/settings/SettingsPageClient.test.tsx` — 설정 사용자 흐름 테스트
- Create: `src/app/(app)/settings/settingsPageClient.module.scss` — route 전용 모바일 스타일
- Delete: `src/app/(app)/settings/settingsPage.module.scss` — placeholder 전용 스타일 제거

### Task 1: 계정 정보와 확인형 로그아웃 구현

**Files:**
- Modify: `src/app/(app)/settings/page.tsx`
- Create: `src/app/(app)/settings/SettingsPageClient.tsx`
- Test: `src/app/(app)/settings/SettingsPageClient.test.tsx`
- Create: `src/app/(app)/settings/settingsPageClient.module.scss`
- Delete: `src/app/(app)/settings/settingsPage.module.scss`

- [ ] **Step 1: 이메일 표시와 모달 취소 실패 테스트 작성**

`SettingsPageClient.test.tsx`에서 인증 컨텍스트를 mock한다.

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { SettingsPageClient } from "./SettingsPageClient";

const authMocks = vi.hoisted(() => ({
  signOut: vi.fn(),
}));

vi.mock("@/components/auth/AuthGate", () => ({
  useAuthSession: () => ({
    email: "owner@example.com",
    signOut: authMocks.signOut,
  }),
}));

describe("SettingsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.signOut.mockResolvedValue(undefined);
  });

  test("shows the current account and cancels logout", async () => {
    const user = userEvent.setup();
    render(<SettingsPageClient />);

    expect(screen.getByText("owner@example.com")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "하단 탭" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "설정" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByRole("button", { name: "로그아웃" }));
    const dialog = screen.getByRole("dialog", { name: "로그아웃" });
    expect(within(dialog).getByText("로그아웃할까요?")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "취소" }));

    expect(authMocks.signOut).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog", { name: "로그아웃" })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 첫 테스트가 컴포넌트 미정의로 실패하는지 확인**

Run:

```bash
npm test -- 'src/app/(app)/settings/SettingsPageClient.test.tsx'
```

Expected: FAIL — `SettingsPageClient` 모듈이 없음.

- [ ] **Step 3: 로그아웃 성공·처리 중·실패 테스트 추가**

같은 테스트 파일에 다음 흐름을 추가한다.

```tsx
test("signs out once after confirmation and disables modal actions while pending", async () => {
  const user = userEvent.setup();
  let resolveSignOut: (() => void) | undefined;
  authMocks.signOut.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        resolveSignOut = resolve;
      }),
  );

  render(<SettingsPageClient />);
  await user.click(screen.getByRole("button", { name: "로그아웃" }));

  const dialog = screen.getByRole("dialog", { name: "로그아웃" });
  await user.click(within(dialog).getByRole("button", { name: "로그아웃" }));

  expect(authMocks.signOut).toHaveBeenCalledTimes(1);
  expect(within(dialog).getByRole("button", { name: "취소" })).toBeDisabled();
  expect(within(dialog).getByRole("button", { name: "로그아웃" })).toBeDisabled();

  resolveSignOut?.();
});

test("keeps the modal open and shows an error when logout fails", async () => {
  const user = userEvent.setup();
  authMocks.signOut.mockRejectedValue(new Error("network"));

  render(<SettingsPageClient />);
  await user.click(screen.getByRole("button", { name: "로그아웃" }));
  await user.click(
    within(screen.getByRole("dialog", { name: "로그아웃" })).getByRole(
      "button",
      { name: "로그아웃" },
    ),
  );

  expect(
    await screen.findByText("로그아웃하지 못했습니다. 다시 시도해 주세요."),
  ).toBeInTheDocument();
  expect(screen.getByRole("dialog", { name: "로그아웃" })).toBeInTheDocument();
});
```

- [ ] **Step 4: 클라이언트 컴포넌트 최소 구현**

`SettingsPageClient.tsx`를 작성한다.

```tsx
"use client";

import { useState } from "react";

import { useAuthSession } from "@/components/auth/AuthGate";
import { BottomNavigation } from "@/components/common/bottomNavigation/BottomNavigation";
import { Button } from "@/components/common/button/Button";
import { ConfirmModal } from "@/components/common/confirmModal/ConfirmModal";

import styles from "./settingsPageClient.module.scss";

const LOGOUT_ERROR_MESSAGE =
  "로그아웃하지 못했습니다. 다시 시도해 주세요.";

export function SettingsPageClient() {
  const { email, signOut } = useAuthSession();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleOpenLogoutModal() {
    setErrorMessage("");
    setIsLogoutModalOpen(true);
  }

  function handleCloseLogoutModal() {
    if (isSigningOut) {
      return;
    }

    setIsLogoutModalOpen(false);
  }

  async function handleConfirmLogout() {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setErrorMessage("");

    try {
      await signOut();
    } catch {
      setErrorMessage(LOGOUT_ERROR_MESSAGE);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <main className={styles["settings-page"]} aria-label="설정 화면">
      <div className={styles["app-canvas"]}>
        <header className={styles["topbar"]}>
          <p className={styles["eyebrow"]}>설정</p>
          <h1>계정과 앱 설정</h1>
        </header>

        {errorMessage ? (
          <p className={styles["error-message"]} role="status">
            {errorMessage}
          </p>
        ) : null}

        <section className={styles["account-section"]} aria-labelledby="account-title">
          <h2 id="account-title">계정</h2>
          <div className={styles["account-row"]}>
            <span>로그인 계정</span>
            <strong>{email}</strong>
          </div>
        </section>

        <section className={styles["logout-section"]} aria-labelledby="logout-title">
          <div>
            <h2 id="logout-title">로그아웃</h2>
            <p>이 기기에서 현재 계정의 사용을 종료합니다.</p>
          </div>
          <Button
            variant="destructive"
            appearance="outline"
            isFullWidth
            onClick={handleOpenLogoutModal}
          >
            로그아웃
          </Button>
        </section>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="로그아웃"
          message="로그아웃할까요?"
          onClose={handleCloseLogoutModal}
          cancelButton={{
            label: "취소",
            onClick: handleCloseLogoutModal,
            isDisabled: isSigningOut,
          }}
          confirmButton={{
            label: "로그아웃",
            variant: "destructive",
            onClick: () => void handleConfirmLogout(),
            isLoading: isSigningOut,
          }}
        />

        <BottomNavigation activeHref="/settings" />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: 서버 page를 얇게 교체**

`page.tsx`:

```tsx
import { SettingsPageClient } from "./SettingsPageClient";

export default function SettingsPage() {
  return <SettingsPageClient />;
}
```

- [ ] **Step 6: route 전용 SCSS Module 작성**

기존 `settingsPage.module.scss`를 삭제하고 `settingsPageClient.module.scss`에 다음 구조를 작성한다.

```scss
.settings-page {
  min-height: 100svh;
  color: var(--text);

  .app-canvas {
    display: flex;
    min-height: 100svh;
    width: min(100%, var(--app-max-width));
    margin: 0 auto;
    flex-direction: column;
    gap: 20px;
    padding: max(18px, env(safe-area-inset-top)) 18px
      calc(var(--bottom-tabs-reserved-height) + 22px);
    background: var(--surface-muted);
  }

  .topbar {
    padding-top: 8px;

    h1 {
      margin: 0;
      font-size: 24px;
      line-height: 1.22;
    }
  }

  .eyebrow {
    margin: 0 0 8px;
    color: var(--primary);
    font-size: 13px;
    font-weight: 800;
  }

  .account-section,
  .logout-section {
    display: grid;
    gap: 14px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    padding: 16px;
    background: var(--surface);

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 17px;
    }

    p {
      margin-top: 6px;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.5;
    }
  }

  .account-row {
    display: grid;
    gap: 6px;
    min-width: 0;

    span {
      color: var(--muted);
      font-size: 13px;
    }

    strong {
      overflow-wrap: anywhere;
      font-size: 15px;
    }
  }

  .error-message {
    margin: 0;
    border-radius: var(--radius);
    padding: 12px;
    background: var(--danger-soft);
    color: var(--danger);
    font-size: 14px;
  }
}
```

- [ ] **Step 7: 관련 테스트 통과 확인**

Run:

```bash
npm test -- 'src/app/(app)/settings/SettingsPageClient.test.tsx'
```

Expected: 3 tests PASS.

- [ ] **Step 8: 정적 검증과 전체 회귀 테스트**

Run:

```bash
npm run typecheck
npm run lint
npm test
git diff --check
```

Expected: 모든 명령 exit code 0.

- [ ] **Step 9: 구현 커밋**

```bash
git add 'src/app/(app)/settings/page.tsx' 'src/app/(app)/settings/SettingsPageClient.tsx' 'src/app/(app)/settings/SettingsPageClient.test.tsx' 'src/app/(app)/settings/settingsPageClient.module.scss' 'src/app/(app)/settings/settingsPage.module.scss'
git commit -m "feat: add settings account screen"
```

