# Health Checker MVP

## Purpose

Health Checker is a private mobile app for recording bathroom visits and reviewing personal patterns over time.

The first MVP focuses on urine and bowel movement logs. It helps answer: "Am I going more often than usual, and is there a pattern worth paying attention to?"

## Product Scope

Included in the MVP:

- Private mobile app for one allowed user.
- Supabase login required before any app data is shown.
- One-tap logging for urine, bowel movement, or both.
- Optional detail entry after the quick log is saved.
- Daily, 7-day, and 30-day summaries.
- AI reports generated from the user's own records and approved reference sources.
- Source links shown with report statements that rely on general health references.

Excluded from the MVP:

- Medical diagnosis.
- Treatment recommendations.
- Public signup or multi-user product flows.
- Automatic use of unapproved medical references.
- In-app approval UI for new reference sources.
- Age- or sex-specific comparison logic.

## Main User Flow

1. The user opens the app and signs in.
2. The default screen is the record screen.
3. The user taps `urine`, `bowel movement`, or `both`.
4. The app immediately saves the record with the current timestamp.
5. A small post-save panel offers `add details`.
6. The user can ignore the panel or add details.
7. Recent records can be edited later from the record list.

## Log Details

Common details:

- Urgency: relaxed, ordinary, urgent.
- Woke from sleep: yes, no, not recorded.
- Note.

Urine details:

- Pain.
- Color seems unusual.

Bowel movement details:

- Stool state: usual, loose, hard.
- Pain.
- Possible blood.

## Baseline

The first 7 days are treated as a baseline collection period.

Before 7 days of records exist, the app may summarize records but must say that there is not enough personal baseline data for stronger comparison.

After the baseline period, reports compare:

- Recent records against the user's own baseline.
- Recent records against approved adult general reference ranges.

## AI Report Behavior

AI reports may:

- Summarize daily, 7-day, and 30-day patterns.
- Compare recent records to the user's baseline.
- Mention approved general reference ranges with source links.
- Flag changes or recorded warning signs.
- Recommend talking to a healthcare professional when warning signs appear.

AI reports must not:

- Diagnose a condition.
- Say a pattern is normal or abnormal as a medical conclusion.
- Give treatment instructions.
- Invent medical thresholds or source links.
- Use unapproved references as evidence.
