begin;

do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  rid uuid := gen_random_uuid();
  n int;
begin
  -- two throwaway users (rolled back below)
  insert into auth.users (id, instance_id, aud, role, email)
  values
    (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@example.test'),
    (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@example.test');

  -- ===== act as user A =====
  perform set_config('request.jwt.claim.sub', a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;

  insert into public.resumes (id, user_id, title, data) values (rid, a, 'A resume', '{"summary":"secret A"}');
  select count(*) into n from public.resumes where id = rid;
  if n <> 1 then raise exception 'FAIL: user A cannot read their own resume'; end if;

  update public.resumes set title = 'A edited' where id = rid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: user A cannot update their own resume'; end if;

  begin
    update public.resumes set user_id = b where id = rid;
    raise exception 'FAIL: user A was able to reassign ownership to user B';
  exception when insufficient_privilege then
    null; 
  end;

  begin
    insert into public.resumes (user_id, data) values (b, '{}');
    raise exception 'FAIL: user A was able to insert a resume owned by user B';
  exception when insufficient_privilege then
    null;
  end;

  -- ===== act as user B =====
  reset role;
  perform set_config('request.jwt.claim.sub', b::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.resumes where id = rid;
  if n <> 0 then raise exception 'FAIL: user B can read user A''s resume'; end if;

  update public.resumes set title = 'hacked' where id = rid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: user B can update user A''s resume'; end if;

  delete from public.resumes where id = rid;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: user B can delete user A''s resume'; end if;

  -- an upsert on A's row id (what the app does) must not hijack it either
  begin
    insert into public.resumes (id, user_id, data) values (rid, b, '{}')
    on conflict (id) do update set user_id = excluded.user_id, data = excluded.data;
    raise exception 'FAIL: user B hijacked user A''s resume via upsert';
  exception when insufficient_privilege then
    null; -- expected
  end;

  -- ===== anonymous (logged out) =====
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;

  begin
    perform 1 from public.resumes;
    raise exception 'FAIL: anon role can query resumes';
  exception when insufficient_privilege then
    null;
  end;

  reset role;

  -- ===== owner can still delete their own =====
  perform set_config('request.jwt.claim.sub', a::text, true);
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  set local role authenticated;
  delete from public.resumes where id = rid;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: user A cannot delete their own resume'; end if;
  reset role;

  raise notice 'ALL RLS CHECKS PASSED';
end;
$$;

rollback;
