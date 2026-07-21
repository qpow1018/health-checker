create or replace function public.create_health_record_from_favorite(favorite_id_value uuid)
returns public.health_records
language plpgsql
security invoker
set search_path = ''
as $$
declare
  favorite public.record_favorites;
  created_record public.health_records;
  current_time_value timestamptz := now();
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
    date_trunc('hour', current_time_value)
      + round(extract(minute from current_time_value) / 5.0) * interval '5 minutes',
    favorite.details,
    favorite.details_version
  )
  returning * into created_record;

  return created_record;
end;
$$;
