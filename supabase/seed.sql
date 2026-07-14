insert into public.allowed_users (email, is_active)
values ('local@example.com', true)
on conflict (email) do update
set is_active = excluded.is_active;
