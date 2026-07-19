update public.health_records
set details = jsonb_set(
  jsonb_set(
    details,
    '{urgency}',
    to_jsonb(
      case
        when details ->> 'urgency' = 'urgent' then 'urgent'
        else 'ordinary'
      end
    ),
    true
  ),
  '{wokeFromSleep}',
  case
    when jsonb_typeof(details -> 'wokeFromSleep') = 'boolean'
      then details -> 'wokeFromSleep'
    else 'false'::jsonb
  end,
  true
)
where category = 'toilet'
and (
  coalesce(details ->> 'urgency', '') not in ('ordinary', 'urgent')
  or not (details ? 'wokeFromSleep')
);

alter table public.health_records
drop constraint health_records_toilet_details_check;

alter table public.health_records
add constraint health_records_toilet_details_check check (
  category <> 'toilet'
  or (
    details_version = 1
    and jsonb_typeof(details) = 'object'
    and details ? 'type'
    and details ->> 'type' in ('urine', 'bowel', 'both')
    and details ? 'urgency'
    and details ->> 'urgency' in ('ordinary', 'urgent')
    and details ? 'wokeFromSleep'
    and jsonb_typeof(details -> 'wokeFromSleep') = 'boolean'
    and (
      not (details ? 'stoolConsistency')
      or (
        details ->> 'type' in ('bowel', 'both')
        and details ->> 'stoolConsistency' in ('hard', 'formed', 'loose', 'watery')
      )
    )
    and (
      not (details ? 'note')
      or jsonb_typeof(details -> 'note') = 'string'
    )
    and (details - 'type' - 'urgency' - 'wokeFromSleep' - 'stoolConsistency' - 'note') = '{}'::jsonb
  )
);
