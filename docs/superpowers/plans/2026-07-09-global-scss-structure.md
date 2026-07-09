# Global SCSS Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 전역 SCSS를 디자인 변수, reset, 앱 전역 스타일로 분리하고 모든 SCSS 파일에서 Sass 변수를 자동으로 사용할 수 있게 한다.

**Architecture:** `_variables.scss`를 CSS를 출력하지 않는 디자인 토큰 원본으로 두고 Next.js가 모든 SCSS 파일에 자동 `@use`한다. `global.scss`는 reset을 한 번 불러오고 기존 CSS custom properties를 Sass 변수에서 생성해 현재 CSS Module과의 호환을 유지한다.

**Tech Stack:** Next.js 15, TypeScript, Sass

---

### Task 1: 전역 SCSS 역할 분리

**Files:**
- Create: `src/assets/scss/_variables.scss`
- Create: `src/assets/scss/_reset.scss`
- Create: `src/assets/scss/global.scss`
- Delete: `src/app/globals.scss`
- Modify: `src/app/layout.tsx:3`

- [ ] **Step 1: 디자인 토큰을 Sass 변수로 정의**

`src/assets/scss/_variables.scss`에 기존 `:root` 값과 일대일로 대응하는 `$background`, `$surface`, `$primary`, `$app-max-width`, `$z-modal` 등의 변수를 정의한다. 이 파일에는 selector를 작성하지 않아 CSS가 직접 출력되지 않게 한다.

- [ ] **Step 2: reset 규칙 분리**

`src/assets/scss/_reset.scss`에 기존 `globals.scss`의 `box-sizing`, `html/body` margin, 제목·문단 margin, 폼 요소 font 상속과 입력 최소 너비 규칙만 옮긴다.

- [ ] **Step 3: 앱 전역 스타일 구성**

`src/assets/scss/global.scss`에서 `@use "./reset";`을 선언한다. `:root`에서 각 기존 CSS custom property를 `--primary: #{$primary};` 형식으로 Sass 변수에 연결하고, `body`, focus, `.app-shell`, `.surface`, `.eyebrow`, `.muted`, `.stack` 규칙을 옮긴다.

- [ ] **Step 4: 루트 layout import 변경**

`src/app/layout.tsx`의 import를 다음과 같이 변경한다.

```tsx
import "@/assets/scss/global.scss";
```

- [ ] **Step 5: 이전 전역 파일 제거**

모든 규칙이 새 파일로 이동한 것을 확인하고 `src/app/globals.scss`를 삭제한다.

### Task 2: Sass 변수 자동 주입

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Next.js Sass 설정 추가**

`next.config.ts`에 다음 설정을 추가한다.

```ts
const nextConfig: NextConfig = {
  reactStrictMode: true,
  sassOptions: {
    additionalData: '@use "@/assets/scss/variables" as *;',
  },
};
```

- [ ] **Step 2: TypeScript 설정 검증**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 3: 전체 SCSS 컴파일 검증**

Run: `npm run build`

Expected: Next.js production build가 SCSS 변수 충돌이나 경로 오류 없이 완료된다.

- [ ] **Step 4: diff 공백 검증**

Run: `git diff --check`

Expected: 출력 없이 exit code 0.

- [ ] **Step 5: 변경 커밋**

```bash
git add next.config.ts src/app/layout.tsx src/app/globals.scss src/assets/scss
git commit -m "refactor: split global scss responsibilities"
```
