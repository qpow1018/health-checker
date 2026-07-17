create extension if not exists pgcrypto with schema extensions;

create table public.allowed_users (
  email text primary key,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint allowed_users_email_lowercase check (email = lower(email)),
  constraint allowed_users_email_shape check (position('@' in email) > 1)
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_lowercase check (email = lower(email)),
  constraint profiles_email_shape check (position('@' in email) > 1)
);

create table public.bathroom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  kind text not null,
  urgency text,
  woke_from_sleep boolean,
  note text,
  urine_pain boolean,
  urine_color_unusual boolean,
  stool_state text,
  bowel_pain boolean,
  possible_blood boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bathroom_logs_kind_check check (kind in ('urine', 'bowel', 'both')),
  constraint bathroom_logs_urgency_check check (
    urgency is null or urgency in ('relaxed', 'ordinary', 'urgent')
  ),
  constraint bathroom_logs_stool_state_check check (
    stool_state is null or stool_state in ('usual', 'loose', 'hard')
  )
);

create table public.reference_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  url text not null unique,
  topic text not null,
  status text not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reference_sources_status_check check (
    status in ('approved', 'candidate', 'rejected')
  )
);

create index profiles_email_idx on public.profiles (email);
create index bathroom_logs_user_id_idx on public.bathroom_logs (user_id);
create index bathroom_logs_user_logged_at_idx on public.bathroom_logs (user_id, logged_at desc);
create index reference_sources_status_topic_idx on public.reference_sources (status, topic);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger bathroom_logs_set_updated_at
before update on public.bathroom_logs
for each row execute function public.set_updated_at();

create trigger reference_sources_set_updated_at
before update on public.reference_sources
for each row execute function public.set_updated_at();

create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.allowed_users allowed
      where allowed.email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
        and allowed.is_active = true
    );
$$;

revoke execute on function public.is_allowed_user() from public, anon, service_role;
grant execute on function public.is_allowed_user() to authenticated;

alter table public.allowed_users enable row level security;
alter table public.profiles enable row level security;
alter table public.bathroom_logs enable row level security;
alter table public.reference_sources enable row level security;

create policy "Users can check their own allowlist row"
on public.allowed_users
for select
to authenticated
using (
  email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

create policy "Allowed users can read their own profile"
on public.profiles
for select
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
  and email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

create policy "Allowed users can update their own profile"
on public.profiles
for update
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
)
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
  and email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

create policy "Allowed users can read their own bathroom logs"
on public.bathroom_logs
for select
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can create their own bathroom logs"
on public.bathroom_logs
for insert
to authenticated
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can update their own bathroom logs"
on public.bathroom_logs
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

create policy "Allowed users can delete their own bathroom logs"
on public.bathroom_logs
for delete
to authenticated
using (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
);

create policy "Allowed users can read approved reference sources"
on public.reference_sources
for select
to authenticated
using (
  (select public.is_allowed_user())
  and status = 'approved'
);

grant select on public.allowed_users to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.bathroom_logs to authenticated;
grant select on public.reference_sources to authenticated;

insert into public.reference_sources (title, organization, url, topic, status)
values
  (
    'Frequent Urination',
    'Cleveland Clinic',
    'https://my.clevelandclinic.org/health/symptoms/15533-frequent-urination',
    'urination_frequency',
    'approved'
  ),
  (
    'Constipation',
    'Cleveland Clinic',
    'https://my.clevelandclinic.org/health/diseases/4059-constipation',
    'bowel_frequency',
    'approved'
  ),
  (
    'Urinary tract infections (UTIs)',
    'NHS',
    'https://www.nhs.uk/conditions/urinary-tract-infections-utis/',
    'urinary_warning_signs',
    'approved'
  )
on conflict (url) do update
set
  title = excluded.title,
  organization = excluded.organization,
  topic = excluded.topic,
  status = excluded.status,
  updated_at = now();
