# Record Page UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish `RecordPageClient` so it uses the approved A-direction title structure and simpler quick-record buttons.

**Architecture:** Keep the existing record route ownership unchanged. Update only the route-root client copy and route-local SCSS module; preserve the quick-save API calls, modal flow, bottom navigation, and health-data boundaries.

**Tech Stack:** Next.js App Router, React, TypeScript, SCSS Modules, Vitest/Testing Library.

---

## File Structure

- Modify: `src/app/(app)/record/RecordPageClient.test.tsx`
  - Assert the approved title and simplified helper text.
  - Keep existing interaction tests focused on the same save/modal behavior.
- Modify: `src/app/(app)/record/RecordPageClient.tsx`
  - Change the heading copy to the approved A-direction text.
  - Render only the main record label inside each quick-record button.
  - Change the helper text to one short sentence outside the buttons.
- Modify: `src/app/(app)/record/recordPageClient.module.scss`
  - Tighten top spacing and title hierarchy.
  - Reduce quick button height and remove styles for button descriptions.
  - Keep mobile WebView-safe padding and the existing app canvas.

### Task 1: Update Record Page UI Expectations

**Files:**
- Modify: `src/app/(app)/record/RecordPageClient.test.tsx`

- [ ] **Step 1: Read current tests**

Run:

```bash
sed -n '1,260p' 'src/app/(app)/record/RecordPageClient.test.tsx'
```

Expected: Find tests that render the record buttons and existing title/helper copy.

- [ ] **Step 2: Update copy assertions**

Change expectations so the test suite looks for:

```tsx
expect(
  screen.getByRole("heading", { name: "방금 다녀온 기록을 남겨요" }),
).toBeInTheDocument();
expect(
  screen.getByText("저장 후 필요한 내용만 이어서 적을 수 있습니다."),
).toBeInTheDocument();
expect(
  screen.getByText("탭하면 지금 시각으로 바로 저장됩니다."),
).toBeInTheDocument();
```

If the test currently asserts old per-button descriptions such as `지금 시각으로 소변 기록`, remove those assertions.

- [ ] **Step 3: Run the focused test and confirm it fails**

Run:

```bash
npm run test -- RecordPageClient
```

Expected: FAIL because the implementation still renders the old heading or helper copy.

### Task 2: Implement the Approved A-Direction UI

**Files:**
- Modify: `src/app/(app)/record/RecordPageClient.tsx`
- Modify: `src/app/(app)/record/recordPageClient.module.scss`

- [ ] **Step 1: Update the heading and helper copy**

In `RecordPageClient.tsx`, change the topbar copy to:

```tsx
<p className={styles["eyebrow"]}>오늘 기록</p>
<h1>방금 다녀온 기록을 남겨요</h1>
<p className={styles["topbar-description"]}>
  저장 후 필요한 내용만 이어서 적을 수 있습니다.
</p>
```

Change the helper text to:

```tsx
<p className={styles["helper-text"]}>
  탭하면 지금 시각으로 바로 저장됩니다.
</p>
```

- [ ] **Step 2: Simplify quick-record buttons**

In the `RECORD_KIND_OPTIONS.map` block, remove the `<small>{option.description}</small>` line so each button renders only:

```tsx
<span>{option.label}</span>
```

Do not change the button `onClick`, `disabled`, `key`, or record kind classes.

- [ ] **Step 3: Tighten the route-local SCSS**

In `recordPageClient.module.scss`, keep the same class names and adjust these values:

```scss
.topbar {
  display: flex;
  align-items: flex-start;
  padding-top: 8px;
}

.topbar-title {
  min-width: 0;

  h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.22;
  }
}

.topbar-description {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.quick-section {
  display: grid;
  gap: 10px;
  margin-top: 26px;
}

.record-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 76px;
  border: 0;
  border-radius: 14px;
  padding: 0 18px;
  color: #ffffff;
  cursor: pointer;
  text-align: left;
}

.record-button span {
  font-size: 21px;
  font-weight: 850;
  line-height: 1.2;
}
```

Remove the nested `.record-button small` styles because the button no longer renders descriptions.

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
npm run test -- RecordPageClient
```

Expected: PASS.

### Task 3: Verify TypeScript and Review Diff

**Files:**
- Verify only

- [ ] **Step 1: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 2: Review the final diff**

Run:

```bash
git diff -- 'src/app/(app)/record/RecordPageClient.tsx' 'src/app/(app)/record/recordPageClient.module.scss' 'src/app/(app)/record/RecordPageClient.test.tsx'
```

Expected: Diff only contains approved copy, button simplification, and route-local styling changes.

- [ ] **Step 3: Leave implementation uncommitted for review**

Do not commit implementation changes unless explicitly requested after review.
