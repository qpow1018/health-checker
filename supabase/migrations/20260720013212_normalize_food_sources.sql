update public.health_records
set details = '{"source":"아딸","foods":[{"name":"떡볶이"},{"name":"튀김"}]}'::jsonb
where category = 'food'
and details_version = 1
and details = '{"foods":[{"name":"아딸 - 떡볶이, 튀김"}]}'::jsonb;

update public.health_records
set details = '{"source":"송추","foods":[{"name":"갈비"}]}'::jsonb
where category = 'food'
and details_version = 1
and details = '{"foods":[{"name":"송추갈비"}]}'::jsonb;
