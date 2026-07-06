create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.allowed_users allowed
      where allowed.email = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
        and allowed.is_active = true
    );
$$;

drop policy "Users can check their own allowlist row" on public.allowed_users;
create policy "Users can check their own allowlist row"
on public.allowed_users
for select
to authenticated
using (
  email = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
);

drop policy "Allowed users can create their own profile" on public.profiles;
create policy "Allowed users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
  (select public.is_allowed_user())
  and (select auth.uid()) = user_id
  and email = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
);

drop policy "Allowed users can update their own profile" on public.profiles;
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
  and email = lower(coalesce(((select auth.jwt()) ->> 'email'), ''))
);
