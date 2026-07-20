alter table public.health_records
drop constraint health_records_food_details_check;

alter table public.health_records
add constraint health_records_food_details_check check (
  category <> 'food'
  or (
    details_version = 1
    and jsonb_typeof(details) = 'object'
    and details ? 'foods'
    and jsonb_typeof(details -> 'foods') = 'array'
    and jsonb_array_length(details -> 'foods') > 0
    and (
      not (details ? 'source')
      or (
        jsonb_typeof(details -> 'source') = 'string'
        and (details ->> 'source') ~ '[^[:space:]]'
      )
    )
    and (details - 'source' - 'foods') = '{}'::jsonb
  )
);
