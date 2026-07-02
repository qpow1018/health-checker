# Health Data and AI Safety Policy

## Data Sensitivity

Bathroom logs are personal health data. Treat them as sensitive even though this is a private app.

The app must default to privacy, minimal collection, and clear access boundaries.

## Authentication

- Login is required before any data is shown.
- Public signup is not part of the MVP.
- Only explicitly allowed accounts may access the app.
- Unauthorized authenticated users must be blocked from app data and AI reports.

## Database Security

- Enable RLS on every user-owned table.
- Use `user_id = auth.uid()` ownership checks for all user-owned records.
- Policies must include both `USING` and `WITH CHECK` where writes can change row ownership.
- Do not expose service role keys to the app.
- Do not use user-editable metadata for authorization decisions.

## AI Safety

The AI report system is a pattern-summary feature, not a medical device.

Allowed AI behavior:

- Summarize records.
- Compare recent data to the user's baseline.
- Compare with approved general adult reference guidance.
- Mention uncertainty and context.
- Recommend professional consultation for warning signs.

Forbidden AI behavior:

- Diagnosis.
- Treatment instructions.
- Medication advice.
- Emergency triage beyond recommending professional help for serious symptoms.
- New medical thresholds without approved sources.
- Fabricated citations or links.

## Reference Source Policy

- Reports may cite only approved sources.
- New sources may be suggested as candidates but are not automatically approved.
- MVP source approval is developer-managed through code or DB seed data.
- In-app source approval UI is out of scope for MVP.
- Report text must distinguish personal-record observations from source-based general guidance.

Initial source categories:

- Urination frequency and urinary symptoms.
- Nighttime waking to urinate.
- Bowel movement frequency and constipation.
- Warning signs such as blood, pain, fever, severe diarrhea, or persistent constipation.

## Warning Signs

The app should recommend consulting a healthcare professional when records or notes include concerning signs such as:

- Blood in urine or stool.
- Pain during urination or bowel movement.
- Fever with urinary symptoms.
- Severe or persistent diarrhea.
- Constipation lasting multiple weeks.
- Sudden major change from personal baseline.
- Bathroom patterns that disrupt sleep or daily life.

