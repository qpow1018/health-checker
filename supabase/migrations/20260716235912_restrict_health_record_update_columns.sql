revoke update on table public.health_records from authenticated;

grant update (recorded_at, details)
on table public.health_records
to authenticated;
