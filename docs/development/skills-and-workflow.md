# Development Skills and Workflow

## Working Style

Use small, verifiable steps. Prefer the minimum implementation that satisfies the current request.

Before coding:

- State assumptions.
- Name ambiguous decisions.
- Keep scope narrow.
- Define verification.

## Project-Specific Skills To Develop

### Product Planning

Use this when changing product behavior, screens, or AI report scope.

Required output:

- What user problem changes?
- What is included?
- What is excluded?
- How will success be verified?

### Health Data Safety Review

Use this when touching logs, profiles, references, AI reports, auth, or database policies.

Required checks:

- Does this collect only necessary data?
- Does RLS protect user-owned rows?
- Are secrets kept out of the app?
- Does AI avoid diagnosis and treatment advice?
- Are reference links approved before use?

### Supabase Change Review

Use this when changing schema, policies, functions, or seeds.

Required checks:

- Migration is explicit and reviewable.
- RLS is enabled for exposed user-owned tables.
- Policies restrict by authenticated user ownership.
- Edge Functions validate the caller.
- Service role is never used in the mobile app.

### Mobile UX Review

Use this when changing the record screen or navigation.

Required checks:

- One-tap logging remains fast.
- Detail entry is optional.
- Recent logs can be corrected.
- Text is clear and not medical-diagnostic.
- The most-used action stays on the first screen.

## Verification Defaults

For code changes, prefer:

- Typecheck.
- Unit tests for data and policy helpers.
- Component tests for critical UI behavior.
- Manual mobile smoke test when the app shell exists.
- Supabase policy tests before trusting production data access.

For documentation-only changes:

- Check for contradictions.
- Check that MVP scope remains narrow.
- Check that health and AI safety language is explicit.

