begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'record-favorites-allowed@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'record-favorites-blocked@example.com',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.allowed_users (email, is_active)
values ('record-favorites-allowed@example.com', true);

select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","email":"record-favorites-allowed@example.com","role":"authenticated"}',
  true
);
set local role authenticated;

do $$
declare
  source_record_id uuid;
  first_favorite public.record_favorites;
  second_favorite public.record_favorites;
  created_record public.health_records;
  saved_order uuid[];
begin
  insert into public.health_records (
    category,
    recorded_at,
    details,
    details_version
  )
  values (
    'food',
    now() - interval '1 hour',
    '{"foods":[{"name":"커피","amount":"1잔"}]}'::jsonb,
    1
  )
  returning id into source_record_id;

  first_favorite := public.create_record_favorite(source_record_id, ' 아침 커피 ');

  if first_favorite.title <> '아침 커피' then
    raise exception 'favorite title was not normalized';
  end if;

  delete from public.health_records where id = source_record_id;

  if not exists (
    select 1 from public.record_favorites where id = first_favorite.id
  ) then
    raise exception 'favorite was deleted with its source record';
  end if;

  created_record := public.create_health_record_from_favorite(first_favorite.id);

  if created_record.category <> first_favorite.category
    or created_record.details <> first_favorite.details
    or abs(extract(epoch from (created_record.recorded_at - now()))) > 180
    or mod(extract(epoch from created_record.recorded_at)::bigint, 300) <> 0
  then
    raise exception 'favorite did not create the expected five-minute record';
  end if;

  second_favorite := public.create_record_favorite(created_record.id, '점심 커피');
  perform public.reorder_record_favorites(
    array[second_favorite.id, first_favorite.id]
  );

  select array_agg(id order by sort_order, created_at desc)
  into saved_order
  from public.record_favorites;

  if saved_order <> array[second_favorite.id, first_favorite.id] then
    raise exception 'favorite order was not saved';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"sub":"20000000-0000-0000-0000-000000000002","email":"record-favorites-blocked@example.com","role":"authenticated"}',
  true
);

do $$
begin
  if exists (select 1 from public.record_favorites) then
    raise exception 'another user can read favorites they do not own';
  end if;

  begin
    insert into public.record_favorites (
      title,
      category,
      details,
      details_version
    )
    values (
      '허용되지 않은 즐겨찾기',
      'sleep',
      '{"event":"woke"}'::jsonb,
      1
    );

    raise exception 'an unallowed user created a favorite';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

rollback;
