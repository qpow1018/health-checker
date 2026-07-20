create function public.food_recommendation_key_v1(source_value text, food_items jsonb)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'source', lower(regexp_replace(btrim(coalesce(source_value, '')), '[[:space:]]+', ' ', 'g')),
    'foods', coalesce(jsonb_agg(normalized_name order by normalized_name), '[]'::jsonb)
  )::text
  from (
    select lower(
      regexp_replace(btrim(food.item ->> 'name'), '[[:space:]]+', ' ', 'g')
    ) as normalized_name
    from jsonb_array_elements(food_items) as food(item)
  ) as normalized_foods;
$$;

create function public.food_recommendation_search_text_v1(source_value text, food_items jsonb)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select lower(concat_ws(
    ' ',
    nullif(regexp_replace(btrim(coalesce(source_value, '')), '[[:space:]]+', ' ', 'g'), ''),
    (
      select string_agg(
        regexp_replace(btrim(food.item ->> 'name'), '[[:space:]]+', ' ', 'g'),
        ' '
        order by food.ordinal
      )
      from jsonb_array_elements(food_items) with ordinality as food(item, ordinal)
    )
  ));
$$;

revoke all on function public.food_recommendation_key_v1(text, jsonb) from public;
revoke all on function public.food_recommendation_search_text_v1(text, jsonb) from public;
grant execute on function public.food_recommendation_key_v1(text, jsonb)
to authenticated, service_role;
grant execute on function public.food_recommendation_search_text_v1(text, jsonb)
to authenticated, service_role;

create table public.food_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source text,
  foods jsonb not null,
  normalized_key text generated always as (
    public.food_recommendation_key_v1(source, foods)
  ) stored,
  search_text text generated always as (
    public.food_recommendation_search_text_v1(source, foods)
  ) stored,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint food_recommendations_user_key_unique unique (user_id, normalized_key),
  constraint food_recommendations_source_check check (
    source is null or source ~ '[^[:space:]]'
  ),
  constraint food_recommendations_foods_check check (
    public.is_valid_food_items_v1(foods)
  )
);

create index food_recommendations_user_last_used_at_idx
on public.food_recommendations (user_id, last_used_at desc);

create trigger food_recommendations_set_updated_at
before update on public.food_recommendations
for each row execute function public.set_updated_at();

alter table public.food_recommendations enable row level security;

create policy "Allowed users can read their own food recommendations"
on public.food_recommendations
for select
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can create their own food recommendations"
on public.food_recommendations
for insert
to authenticated
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can update their own food recommendations"
on public.food_recommendations
for update
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
)
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can delete their own food recommendations"
on public.food_recommendations
for delete
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

grant select, insert, update, delete on public.food_recommendations to authenticated;

create function public.upsert_food_recommendation_from_health_record()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.category <> 'food' then
    return new;
  end if;

  insert into public.food_recommendations (
    user_id,
    source,
    foods,
    last_used_at
  )
  values (
    new.user_id,
    nullif(btrim(new.details ->> 'source'), ''),
    new.details -> 'foods',
    greatest(new.created_at, new.updated_at)
  )
  on conflict (user_id, normalized_key)
  do update set
    source = excluded.source,
    foods = excluded.foods,
    last_used_at = excluded.last_used_at;

  return new;
end;
$$;

revoke all on function public.upsert_food_recommendation_from_health_record() from public;
grant execute on function public.upsert_food_recommendation_from_health_record()
to authenticated, service_role;

create trigger health_records_upsert_food_recommendation
after insert or update of details on public.health_records
for each row execute function public.upsert_food_recommendation_from_health_record();

with food_records as (
  select
    user_id,
    nullif(btrim(details ->> 'source'), '') as source,
    details -> 'foods' as foods,
    public.food_recommendation_key_v1(details ->> 'source', details -> 'foods') as normalized_key,
    greatest(created_at, updated_at) as last_used_at
  from public.health_records
  where category = 'food'
),
ranked_food_records as (
  select
    user_id,
    source,
    foods,
    last_used_at,
    row_number() over (
      partition by user_id, normalized_key
      order by last_used_at desc
    ) as recency_rank
  from food_records
)
insert into public.food_recommendations (
  user_id,
  source,
  foods,
  last_used_at
)
select
  user_id,
  source,
  foods,
  last_used_at
from ranked_food_records
where recency_rank = 1;
