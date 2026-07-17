create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null,
  recorded_at timestamptz not null,
  details jsonb not null default '{}'::jsonb,
  details_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint health_records_category_check check (
    category in ('sleep', 'food', 'toilet', 'exercise', 'condition')
  ),
  constraint health_records_details_version_check check (details_version >= 1),
  constraint health_records_sleep_details_check check (
    category <> 'sleep'
    or (
      details_version = 1
      and details ? 'event'
      and details ->> 'event' in ('slept', 'woke')
    )
  )
);

create index health_records_user_recorded_at_idx
on public.health_records (user_id, recorded_at desc);

create index health_records_user_category_recorded_at_idx
on public.health_records (user_id, category, recorded_at desc);

create trigger health_records_set_updated_at
before update on public.health_records
for each row execute function public.set_updated_at();

alter table public.health_records enable row level security;

create policy "Allowed users can read their own health records"
on public.health_records
for select
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can create their own health records"
on public.health_records
for insert
to authenticated
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can update their own health records"
on public.health_records
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

create policy "Allowed users can delete their own health records"
on public.health_records
for delete
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

grant select, insert, update, delete on public.health_records to authenticated;
