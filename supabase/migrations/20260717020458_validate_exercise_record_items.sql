create function public.is_valid_exercise_items_v1(exercise_items jsonb)
returns boolean
language plpgsql
immutable
security invoker
set search_path = ''
as $$
begin
  if exercise_items is null
    or jsonb_typeof(exercise_items) is distinct from 'array'
    or jsonb_array_length(exercise_items) = 0
  then
    return false;
  end if;

  return not exists (
    select 1
    from jsonb_array_elements(exercise_items) as exercise(item)
    where jsonb_typeof(exercise.item) is distinct from 'object'
      or jsonb_typeof(exercise.item -> 'name') is distinct from 'string'
      or not ((exercise.item ->> 'name') ~ '[^[:space:]]')
      or (
        exercise.item ? 'amount'
        and (
          jsonb_typeof(exercise.item -> 'amount') is distinct from 'string'
          or not ((exercise.item ->> 'amount') ~ '[^[:space:]]')
        )
      )
      or (((exercise.item - 'name') - 'amount') <> '{}'::jsonb)
  );
end;
$$;

revoke all on function public.is_valid_exercise_items_v1(jsonb) from public;
grant execute on function public.is_valid_exercise_items_v1(jsonb) to authenticated, service_role;

alter table public.health_records
add constraint health_records_exercise_details_check check (
  category <> 'exercise'
  or (
    details_version = 1
    and jsonb_typeof(details) = 'object'
    and details ? 'exercises'
    and public.is_valid_exercise_items_v1(details -> 'exercises')
    and (details - 'exercises') = '{}'::jsonb
  )
);
