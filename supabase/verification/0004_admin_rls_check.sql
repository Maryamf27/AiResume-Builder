begin;

do $$
declare
  admin_id uuid := gen_random_uuid();
  user_id  uuid := gen_random_uuid();
  pub uuid := gen_random_uuid();
  draft uuid := gen_random_uuid();
  n int;
begin
  insert into auth.users (id, instance_id, aud, role, email) values
    (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'adm@example.test'),
    (user_id,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'usr@example.test');
  update public.profiles set role = 'admin' where id = admin_id;

  insert into public.templates (id, slug, name, html, is_published) values
    (pub,   'pub-tpl',   'Published', '<div/>', true),
    (draft, 'draft-tpl', 'Draft',     '<div/>', false);

  -- ===== anon =====
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  set local role anon;
  select count(*) into n from public.templates;
  if n <> 1 then raise exception 'FAIL: anon should see exactly the published template, saw %', n; end if;
  insert into public.template_events (template_id, event_type) values (pub, 'selected');
  begin
    insert into public.template_events (template_id, user_id, event_type) values (pub, user_id, 'selected');
    raise exception 'FAIL: anon inserted an event impersonating a user';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.template_events;
    raise exception 'FAIL: anon can read events';
  exception when insufficient_privilege then null; end;
  reset role;

  -- ===== normal user =====
  perform set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.templates;
  if n <> 1 then raise exception 'FAIL: user should not see drafts, saw %', n; end if;

  begin
    update public.profiles set role = 'admin' where id = user_id;
    raise exception 'FAIL: user promoted themselves to admin';
  exception when insufficient_privilege then null; end;

  begin
    insert into public.templates (slug, name, html) values ('evil', 'Evil', '<script/>');
    raise exception 'FAIL: non-admin created a template';
  exception when insufficient_privilege then null; end;

  update public.templates set name = 'hacked' where id = pub;
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: non-admin updated a template'; end if;

  select count(*) into n from public.template_events;
  if n <> 0 then raise exception 'FAIL: non-admin can read events'; end if;

  select count(*) into n from public.feedback;
  if n <> 0 then raise exception 'FAIL: non-admin can read feedback'; end if;

  select count(*) into n from public.profiles;
  if n <> 1 then raise exception 'FAIL: user should only see own profile, saw %', n; end if;
  reset role;

  -- ===== admin =====
  perform set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.templates;
  if n <> 2 then raise exception 'FAIL: admin should see drafts too, saw %', n; end if;
  update public.templates set is_published = true where id = draft;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL: admin cannot update templates'; end if;
  select count(*) into n from public.template_events;
  if n < 1 then raise exception 'FAIL: admin cannot read events'; end if;
  select count(*) into n from public.profiles;
  if n < 2 then raise exception 'FAIL: admin cannot read all profiles'; end if;
  reset role;

  raise notice 'ALL 0004 CHECKS PASSED';
end;
$$;

rollback;