do $$
begin
  if to_regclass('public.bathroom_logs') is null then
    return;
  end if;

  insert into public.health_records (
    id,
    user_id,
    category,
    recorded_at,
    details,
    details_version,
    created_at,
    updated_at
  )
  select
    legacy.id,
    legacy.user_id,
    'toilet',
    legacy.logged_at,
    jsonb_strip_nulls(
      jsonb_build_object(
        'type', legacy.kind,
        'urgency', legacy.urgency,
        'wokeFromSleep', legacy.woke_from_sleep,
        'stoolConsistency', case legacy.stool_state
          when 'hard' then 'hard'
          when 'loose' then 'loose'
          else null
        end,
        'note', nullif(
          concat_ws(
            E'\n',
            nullif(btrim(legacy.note), ''),
            case when legacy.stool_state = 'usual' then '대변 상태: 평소와 같음' end,
            case when legacy.urine_pain is true then '소변 시 통증' end,
            case when legacy.urine_color_unusual is true then '평소와 다른 소변 색' end,
            case when legacy.bowel_pain is true then '배변 시 통증' end,
            case when legacy.possible_blood is true then '피가 보였을 수 있음' end
          ),
          ''
        )
      )
    ),
    1,
    legacy.created_at,
    legacy.updated_at
  from public.bathroom_logs legacy
  on conflict (id) do nothing;

  drop table public.bathroom_logs;
end;
$$;
