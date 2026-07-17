create function public.is_valid_food_items_v1(food_items jsonb)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  if food_items is null
    or jsonb_typeof(food_items) is distinct from 'array'
    or jsonb_array_length(food_items) = 0
  then
    return false;
  end if;

  return not exists (
    select 1
    from jsonb_array_elements(food_items) as food(item)
    where jsonb_typeof(food.item) is distinct from 'object'
      or jsonb_typeof(food.item -> 'name') is distinct from 'string'
      or not ((food.item ->> 'name') ~ '[^[:space:]]')
      or (
        food.item ? 'amount'
        and (
          jsonb_typeof(food.item -> 'amount') is distinct from 'string'
          or not ((food.item ->> 'amount') ~ '[^[:space:]]')
        )
      )
      or (((food.item - 'name') - 'amount') <> '{}'::jsonb)
  );
end;
$$;

revoke all on function public.is_valid_food_items_v1(jsonb) from public;
grant execute on function public.is_valid_food_items_v1(jsonb) to authenticated, service_role;

alter table public.health_records
add constraint health_records_food_items_check check (
  category <> 'food'
  or public.is_valid_food_items_v1(details -> 'foods')
);
