alter table public.health_records
add constraint health_records_condition_details_check check (
  category <> 'condition'
  or (
    details_version = 1
    and jsonb_typeof(details) = 'object'
    and details ? 'note'
    and jsonb_typeof(details -> 'note') = 'string'
    and btrim(details ->> 'note') <> ''
    and (details - 'note') = '{}'::jsonb
  )
);
