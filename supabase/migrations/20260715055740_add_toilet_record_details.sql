alter table public.health_records
add constraint health_records_toilet_details_check check (
  category <> 'toilet'
  or (
    details_version = 1
    and jsonb_typeof(details) = 'object'
    and details ? 'type'
    and details ->> 'type' in ('urine', 'bowel', 'both')
    and (
      not (details ? 'urgency')
      or details ->> 'urgency' in ('relaxed', 'ordinary', 'urgent')
    )
    and (
      not (details ? 'wokeFromSleep')
      or jsonb_typeof(details -> 'wokeFromSleep') = 'boolean'
    )
    and (
      not (details ? 'urine')
      or (
        jsonb_typeof(details -> 'urine') = 'object'
        and (
          not (details -> 'urine' ? 'pain')
          or jsonb_typeof(details -> 'urine' -> 'pain') = 'boolean'
        )
        and (
          not (details -> 'urine' ? 'unusualColor')
          or jsonb_typeof(details -> 'urine' -> 'unusualColor') = 'boolean'
        )
        and ((details -> 'urine') - 'pain' - 'unusualColor') = '{}'::jsonb
      )
    )
    and (
      not (details ? 'bowel')
      or (
        jsonb_typeof(details -> 'bowel') = 'object'
        and (
          not (details -> 'bowel' ? 'state')
          or details -> 'bowel' ->> 'state' in ('usual', 'loose', 'hard')
        )
        and (
          not (details -> 'bowel' ? 'pain')
          or jsonb_typeof(details -> 'bowel' -> 'pain') = 'boolean'
        )
        and (
          not (details -> 'bowel' ? 'possibleBlood')
          or jsonb_typeof(details -> 'bowel' -> 'possibleBlood') = 'boolean'
        )
        and ((details -> 'bowel') - 'state' - 'pain' - 'possibleBlood') = '{}'::jsonb
      )
    )
    and (
      details ->> 'type' = 'both'
      or (details ->> 'type' = 'urine' and not (details ? 'bowel'))
      or (details ->> 'type' = 'bowel' and not (details ? 'urine'))
    )
    and (details - 'type' - 'urgency' - 'wokeFromSleep' - 'urine' - 'bowel') = '{}'::jsonb
  )
);
