# Health Checker MVP Design

## Summary

Health Checker is a private Expo mobile app for logging urine and bowel movement visits and reviewing patterns over time. The MVP is intentionally narrow: fast records first, optional details second, AI reports only after data is collected, and every general health statement linked to approved references.

## Decisions

- Mobile stack: Expo, React Native, TypeScript.
- Backend: Supabase Auth, Postgres, RLS, Edge Functions.
- Repository: private GitHub repo.
- Access: login required, allowed account only.
- Data: urine, bowel movement, or both.
- UX: record screen is the default screen.
- Logging: one-tap save, then optional detail panel.
- Baseline: first 7 days are baseline collection.
- AI: generated through Supabase Edge Function, never from the app directly.
- References: hybrid model. Approved sources are developer-managed in MVP; new candidates may be proposed but not used until approved.

## Product Design

The first screen is optimized for the action the user will perform most often: recording a bathroom visit. The app opens to large actions for urine, bowel movement, and both. Each action saves immediately with the current timestamp. After saving, a small panel allows optional details. Records can be edited later from the list.

Reports are available separately. They summarize today, the last 7 days, or the last 30 days. The first 7 days are treated as baseline collection, so early reports must clearly say that personal comparison is limited.

## Data Design

The core record is `bathroom_logs`.

Each log stores:

- `user_id`
- timestamp
- type: urine, bowel movement, both
- urgency
- woke from sleep
- note
- urine pain
- unusual urine color
- stool state
- bowel pain
- possible blood in stool

Reference sources are stored separately with title, organization, URL, topic, and approval status.

## Security Design

All user-owned data is protected by Supabase Auth and RLS. Public signup is out of scope. Only approved accounts may use the app. The mobile app may use public Supabase configuration, but service role keys and OpenAI credentials must exist only in server-side environments.

## AI Design

The report Edge Function validates the session, loads only the caller's data, loads approved references, and calls OpenAI with constrained instructions.

AI output must distinguish:

- Personal record observations.
- Personal baseline comparisons.
- Approved-source general guidance.

AI output must not diagnose, prescribe, or invent citations.

## Verification

Implementation plans should verify:

- Login gate blocks unauthenticated users.
- Unauthorized users cannot read or write logs.
- One-tap logging saves the correct type and time.
- Details can be added after save.
- Reports do not run with unapproved sources.
- OpenAI credentials are never exposed to the mobile app.
