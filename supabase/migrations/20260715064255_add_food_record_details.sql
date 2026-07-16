alter table public.health_records
add constraint health_records_food_details_check check (
  category <> 'food'
  or (
    details_version = 1
    and jsonb_typeof(details) = 'object'
    and details ? 'foods'
    and jsonb_typeof(details -> 'foods') = 'array'
    and jsonb_array_length(details -> 'foods') > 0
    and (details - 'foods') = '{}'::jsonb
  )
);
