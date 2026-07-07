# Record Page Design

## Summary

`record` is the default first screen of the mobile app. It should feel like an app screen, not a web card. The page keeps one-tap recording fast, then offers optional follow-up actions from the bottom of the screen.

The selected interaction model is:

1. The user taps `소변`, `대변`, or `둘 다`.
2. The app saves a log for the current time.
3. A bottom sheet appears with the saved log summary.
4. The user can add details, undo the just-created log, or dismiss the sheet.

## Goals

- Make the primary record action reachable immediately after opening the app.
- Preserve one-tap speed by avoiding a confirmation step before saving.
- Let the user recover from an accidental tap immediately after saving.
- Keep detailed input optional and secondary.
- Match the mobile WebView direction with a fixed bottom tab bar.
- Avoid a centered card or dashboard-card layout on the record screen.

## Non-Goals

- Do not add broad health tracking beyond bathroom logs.
- Do not add medical interpretation, `정상`, or `비정상` wording.
- Do not put daily summaries on the first record implementation.
- Do not make the `record` page responsible for the full records list.
- Do not add signup, onboarding, or public account flows.

## Layout

The screen uses a full mobile app canvas.

- Top area: short page context, such as `오늘 기록`.
- Main area: large vertical action buttons for `소변`, `대변`, and `둘 다`.
- Bottom area: fixed tab bar with `기록`, `기록 보기`, `AI 리포트`, and `설정`.
- No centered `.surface` card is used for the record page body.

The main action buttons are stacked vertically. This keeps tap targets large and leaves enough room for Korean labels on narrow mobile screens.

## Recording Flow

The quick record buttons create a log with the current time.

The supported kinds are:

- `urine`: `소변`
- `bowel`: `대변`
- `both`: `둘 다`

After the save succeeds, a bottom sheet appears. It shows:

- `방금 저장됨`
- kind label
- saved time
- `상세 추가`
- `취소`
- `닫기`

`상세 추가` opens a detail input state for the saved log. The detail state stays secondary to the quick save and is reached only after a log exists.

The detail input includes:

- common fields: urgency, woke from sleep, note
- urine fields for `urine` and `both`: urine pain, unusual urine color
- bowel fields for `bowel` and `both`: stool state, bowel pain, possible blood

Saving details updates the just-created log and closes the detail state.

`닫기` dismisses the sheet and leaves the saved log in place.

## Accidental Tap Handling

The record page supports immediate undo for the last just-created log.

Rules:

- There is no pre-save confirmation modal.
- `취소` is shown only in the post-save bottom sheet.
- `취소` affects only the log represented by the current bottom sheet.
- After the bottom sheet is dismissed or another record is created, older logs are edited or deleted from `기록 보기`.
- If undo succeeds, the sheet closes and the screen returns to the default quick-record state.
- If undo fails, the sheet stays visible and shows a non-medical error message.

This keeps the record action fast while still making accidental taps reversible.

## Data Boundary

`bathroom_logs` remains the source of truth.

The record page should not store health records in WebView localStorage. Browser or client state may hold only transient UI state, such as the currently displayed just-saved log.

The implementation should use route-local types for record UI state. Shared Supabase wrappers belong in `src/api/` if the first implementation connects real persistence.

## Error States

Errors should be plain Korean UI states, not medical guidance.

Save failure:

- Keep the user on the record screen.
- Show that the record was not saved.
- Let the user try again.

Undo failure:

- Keep the bottom sheet open.
- Show that cancellation did not complete.
- Do not imply the health record has been removed unless deletion actually succeeded.

Auth and allowlist failures remain the responsibility of `AuthGate`.

## Testing

Record page tests should cover:

- The quick record buttons render with `소변`, `대변`, and `둘 다`.
- The page does not depend on a centered card surface for the main record UI.
- Tapping a quick record action shows the just-saved bottom sheet.
- The bottom sheet includes `상세 추가`, `취소`, and `닫기`.
- `상세 추가` opens detail fields that match the saved log kind.
- `닫기` dismisses the bottom sheet without undoing the record.
- `취소` calls the undo path for the current just-saved log.
- Sign-out remains available if it stays on the record screen.

For TypeScript or React changes, run `npm run typecheck` and the relevant tests.
