# AGENTS.md

Behavioral guidelines for working in this repository.

## Core Principles

- State assumptions before implementing.
- Ask when requirements are unclear.
- Keep changes small and tied to the request.
- Prefer simple code over speculative abstractions.
- Verify changes before calling them complete.

## Product Scope

This project is a private mobile app for bathroom pattern tracking.

The MVP records:

- Urine visits.
- Bowel movement visits.
- Visits that include both.
- Optional details after quick logging.
- AI reports based on personal records and approved references.

Do not broaden the product into a general health platform unless explicitly asked.

## Health Data Rules

- Treat all records as sensitive health data.
- Do not expose private records without authentication.
- Do not add public signup flows unless explicitly requested.
- Keep personal data collection minimal.
- Do not add analytics or tracking for health records unless explicitly requested.

## Supabase Rules

- Enable RLS on every user-owned table.
- User-owned rows must be scoped by `user_id = auth.uid()`.
- Write policies must prevent users from assigning rows to another user.
- Never expose service role keys in the app.
- OpenAI calls must go through Supabase Edge Functions or another server-side boundary.

## AI Safety Rules

- AI reports summarize patterns; they do not diagnose.
- Do not generate treatment, medication, or emergency instructions.
- Mention uncertainty when records are sparse.
- Before 7 days of records exist, say the personal baseline is still being collected.
- Only approved reference sources may support general health guidance.
- Do not invent source links.

## UX Rules

- The record screen is the default first screen.
- One-tap logging must remain fast.
- Detail entry is optional after save.
- Recent records must be correctable.
- Use clear Korean product copy by default.
- Avoid medical-diagnostic wording such as "normal" or "abnormal" as a conclusion.

## Documentation Rules

- Update docs when product, security, AI, or workflow decisions change.
- Keep repository guidance concise.
- Put deeper process notes under `docs/`.

## Verification

For implementation work, run the smallest meaningful verification:

- Typecheck for TypeScript changes.
- Tests for data helpers, policies, and AI prompt shaping.
- Manual smoke checks for main mobile flows when available.
- Supabase policy checks before trusting data access.

For documentation changes, check for ambiguity, contradictions, and scope creep.

