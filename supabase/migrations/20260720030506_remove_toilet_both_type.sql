alter table public.health_records
drop constraint health_records_toilet_details_check;

alter table public.health_records
add constraint health_records_toilet_details_check check (
  category <> 'toilet'
  or (
    details_version = 1
    and jsonb_typeof(details) = 'object'
    and details ? 'type'
    and details ->> 'type' in ('urine', 'bowel')
    and details ? 'urgency'
    and details ->> 'urgency' in ('ordinary', 'urgent')
    and details ? 'wokeFromSleep'
    and jsonb_typeof(details -> 'wokeFromSleep') = 'boolean'
    and (
      (
        details ->> 'type' = 'urine'
        and not (details ? 'stoolConsistency')
      )
      or (
        details ->> 'type' = 'bowel'
        and details ? 'stoolConsistency'
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
