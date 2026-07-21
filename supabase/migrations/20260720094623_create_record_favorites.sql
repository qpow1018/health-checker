create function public.is_valid_record_favorite_details_v1(
  category_value text,
  details_version_value integer,
  details_value jsonb
)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select coalesce(
    details_version_value = 1
    and jsonb_typeof(details_value) = 'object'
    and case category_value
      when 'sleep' then
        details_value ? 'event'
        and details_value ->> 'event' in ('slept', 'woke')
        and (details_value - 'event') = '{}'::jsonb
      when 'food' then
        details_value ? 'foods'
        and public.is_valid_food_items_v1(details_value -> 'foods')
        and (
          not (details_value ? 'source')
          or (
            jsonb_typeof(details_value -> 'source') = 'string'
            and (details_value ->> 'source') ~ '[^[:space:]]'
          )
        )
        and (details_value - 'source' - 'foods') = '{}'::jsonb
      when 'toilet' then
        details_value ? 'type'
        and details_value ->> 'type' in ('urine', 'bowel')
        and details_value ? 'urgency'
        and details_value ->> 'urgency' in ('ordinary', 'urgent')
        and details_value ? 'wokeFromSleep'
        and jsonb_typeof(details_value -> 'wokeFromSleep') = 'boolean'
        and (
          (
            details_value ->> 'type' = 'urine'
            and not (details_value ? 'stoolConsistency')
          )
          or (
            details_value ->> 'type' = 'bowel'
            and details_value ? 'stoolConsistency'
            and details_value ->> 'stoolConsistency' in ('hard', 'formed', 'loose', 'watery')
          )
        )
        and (
          not (details_value ? 'note')
          or jsonb_typeof(details_value -> 'note') = 'string'
        )
        and (
          details_value - 'type' - 'urgency' - 'wokeFromSleep' - 'stoolConsistency' - 'note'
        ) = '{}'::jsonb
      when 'exercise' then
        details_value ? 'exercises'
        and public.is_valid_exercise_items_v1(details_value -> 'exercises')
        and (details_value - 'exercises') = '{}'::jsonb
      when 'condition' then
        details_value ? 'note'
        and jsonb_typeof(details_value -> 'note') = 'string'
        and btrim(details_value ->> 'note') <> ''
        and (details_value - 'note') = '{}'::jsonb
      else false
    end,
    false
  );
$$;

revoke all on function public.is_valid_record_favorite_details_v1(text, integer, jsonb)
from public;
grant execute on function public.is_valid_record_favorite_details_v1(text, integer, jsonb)
to authenticated, service_role;

create table public.record_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  details jsonb not null,
  details_version integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint record_favorites_title_check check (
    char_length(btrim(title)) between 1 and 60
  ),
  constraint record_favorites_sort_order_check check (sort_order >= 0),
  constraint record_favorites_details_check check (
    public.is_valid_record_favorite_details_v1(category, details_version, details)
  )
);

create index record_favorites_user_sort_order_idx
on public.record_favorites (user_id, sort_order, created_at desc);

create trigger record_favorites_set_updated_at
before update on public.record_favorites
for each row execute function public.set_updated_at();

alter table public.record_favorites enable row level security;

create policy "Allowed users can read their own record favorites"
on public.record_favorites
for select
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can create their own record favorites"
on public.record_favorites
for insert
to authenticated
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can update their own record favorites"
on public.record_favorites
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

create policy "Allowed users can delete their own record favorites"
on public.record_favorites
for delete
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

revoke all on table public.record_favorites from anon, authenticated;
grant select, insert, delete on table public.record_favorites to authenticated;
grant update (title, sort_order) on table public.record_favorites to authenticated;

create function public.create_record_favorite(
  record_id_value uuid,
  favorite_title_value text
)
returns public.record_favorites
language plpgsql
security invoker
set search_path = ''
as $$
declare
  source_record public.health_records;
  created_favorite public.record_favorites;
begin
  select *
  into source_record
  from public.health_records
  where id = record_id_value;

  if not found then
    raise exception '기록을 찾을 수 없습니다.' using errcode = 'P0002';
  end if;

  insert into public.record_favorites (
    title,
    category,
    details,
    details_version
  )
  values (
    btrim(favorite_title_value),
    source_record.category,
    source_record.details,
    source_record.details_version
  )
  returning * into created_favorite;

  return created_favorite;
end;
$$;

create function public.create_health_record_from_favorite(favorite_id_value uuid)
returns public.health_records
language plpgsql
security invoker
set search_path = ''
as $$
declare
  favorite public.record_favorites;
  created_record public.health_records;
begin
  select *
  into favorite
  from public.record_favorites
  where id = favorite_id_value;

  if not found then
    raise exception '즐겨찾기를 찾을 수 없습니다.' using errcode = 'P0002';
  end if;

  insert into public.health_records (
    category,
    recorded_at,
    details,
    details_version
  )
  values (
    favorite.category,
    now(),
    favorite.details,
    favorite.details_version
  )
  returning * into created_record;

  return created_record;
end;
$$;

create function public.reorder_record_favorites(favorite_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owned_favorite_count integer;
  requested_favorite_count integer;
  updated_favorite_count integer;
begin
  if favorite_ids is null then
    raise exception '즐겨찾기 순서가 필요합니다.' using errcode = '22004';
  end if;

  select count(*)
  into owned_favorite_count
  from public.record_favorites
  where user_id = (select auth.uid());

  select count(distinct favorite_id)
  into requested_favorite_count
  from unnest(favorite_ids) as requested(favorite_id);

  if cardinality(favorite_ids) <> owned_favorite_count
    or requested_favorite_count <> owned_favorite_count
  then
    raise exception '즐겨찾기 순서가 올바르지 않습니다.' using errcode = '22023';
  end if;

  update public.record_favorites as favorite
  set sort_order = requested.ordinality - 1
  from unnest(favorite_ids) with ordinality as requested(favorite_id, ordinality)
  where favorite.id = requested.favorite_id
    and favorite.user_id = (select auth.uid());

  get diagnostics updated_favorite_count = row_count;

  if updated_favorite_count <> owned_favorite_count then
    raise exception '즐겨찾기 순서가 올바르지 않습니다.' using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.create_record_favorite(uuid, text) from public;
revoke all on function public.create_health_record_from_favorite(uuid) from public;
revoke all on function public.reorder_record_favorites(uuid[]) from public;

grant execute on function public.create_record_favorite(uuid, text) to authenticated;
grant execute on function public.create_health_record_from_favorite(uuid) to authenticated;
grant execute on function public.reorder_record_favorites(uuid[]) to authenticated;
