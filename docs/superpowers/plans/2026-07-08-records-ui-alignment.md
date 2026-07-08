# Records UI Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the records page visual language with the record page and shared common components without changing records behavior.

**Architecture:** Keep this as a route-local SCSS change. `RecordsPageClient.tsx` continues to own the records view and interactions, while `recordsPageClient.module.scss` uses the existing global design tokens for app canvas, header, messages, empty state, and list items.

**Tech Stack:** Next.js App Router, React, TypeScript, SCSS Modules, Vitest Testing Library.

---

### Task 1: Align Records Page Styles

**Files:**
- Modify: `src/app/(app)/records/recordsPageClient.module.scss`
- Verify: `src/app/(app)/records/RecordsPageClient.test.tsx`

- [ ] **Step 1: Confirm current behavioral tests**

Run: `npm run test -- src/app/(app)/records/RecordsPageClient.test.tsx`

Expected: Existing records tests pass before the CSS-only change.

- [ ] **Step 2: Replace route-local palette with app tokens**

Update `src/app/(app)/records/recordsPageClient.module.scss` so the page uses:

```scss
background: var(--surface-muted);
color: var(--text);
border-color: var(--line);
background: var(--surface);
color: var(--muted);
color: var(--primary);
color: var(--primary-strong);
```

Remove direct beige/brown color values from this file.

- [ ] **Step 3: Match the route header to the record page hierarchy**

Set the records page app canvas and topbar to match the record page proportions:

```scss
padding: max(18px, env(safe-area-inset-top)) 18px calc(var(--bottom-tabs-reserved-height) + 22px);

h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.22;
}
```

Keep route-local class names unchanged.

- [ ] **Step 4: Keep list cards quiet but token-based**

Style record list items as information cards, not strong CTA buttons:

```scss
border: 1px solid var(--line);
border-radius: var(--radius);
background: var(--surface);
color: var(--text);
```

Use `var(--muted)` for meta/note text and `var(--primary-strong)` for record kind labels.

- [ ] **Step 5: Verify behavior tests**

Run: `npm run test -- src/app/(app)/records/RecordsPageClient.test.tsx`

Expected: All records page tests pass.

- [ ] **Step 6: Verify TypeScript**

Run: `npm run typecheck`

Expected: TypeScript check exits successfully.

- [ ] **Step 7: Browser smoke check**

Run the app with `npm run dev`, open `/records`, and verify:

- Header, description, status messages, empty state, and list items use the same visual family as `/record`.
- Text does not overlap or overflow on a mobile-width viewport.
- The bottom navigation does not cover the last list item.

- [ ] **Step 8: Commit implementation**

```bash
git add docs/superpowers/plans/2026-07-08-records-ui-alignment.md src/app/(app)/records/recordsPageClient.module.scss
git commit -m "style: align records page with app ui"
```
