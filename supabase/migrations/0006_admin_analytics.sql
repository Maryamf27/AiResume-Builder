create or replace function public.admin_summary()
returns table (
  total_users bigint,
  new_users_7d bigint,
  total_resumes bigint,
  total_downloads bigint,
  total_selections bigint,
  guest_downloads bigint,
  published_templates bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    (select count(*) from public.profiles),
    (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    (select count(*) from public.resumes),
    (select count(*) from public.template_events where event_type = 'downloaded'),
    (select count(*) from public.template_events where event_type = 'selected'),
    (select count(*) from public.template_events where event_type = 'downloaded' and user_id is null),
    (select count(*) from public.templates where is_published);
end;
$$;

create or replace function public.admin_user_overview()
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  resume_count bigint,
  last_resume_update timestamptz,
  downloads bigint,
  selections bigint,
  last_activity timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    coalesce(r.cnt, 0),
    r.last_update,
    coalesce(e.downloads, 0),
    coalesce(e.selections, 0),
    greatest(r.last_update, e.last_event)
  from public.profiles p
  left join (
    select user_id, count(*) as cnt, max(updated_at) as last_update
    from public.resumes group by user_id
  ) r on r.user_id = p.id
  left join (
    select user_id,
           count(*) filter (where event_type = 'downloaded') as downloads,
           count(*) filter (where event_type = 'selected') as selections,
           max(created_at) as last_event
    from public.template_events
    where user_id is not null
    group by user_id
  ) e on e.user_id = p.id
  order by p.created_at desc;
end;
$$;


create or replace function public.admin_template_usage()
returns table (
  template_id uuid,
  name text,
  slug text,
  is_published boolean,
  selected_count bigint,
  downloaded_count bigint,
  unique_users bigint,
  last_used timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  return query
  select
    t.id,
    t.name,
    t.slug,
    t.is_published,
    count(e.id) filter (where e.event_type = 'selected'),
    count(e.id) filter (where e.event_type = 'downloaded'),
    count(distinct e.user_id),
    max(e.created_at)
  from public.templates t
  left join public.template_events e on e.template_id = t.id
  group by t.id, t.name, t.slug, t.is_published
  order by
    count(e.id) filter (where e.event_type = 'downloaded') desc,
    count(e.id) filter (where e.event_type = 'selected') desc,
    t.name;
end;
$$;

create or replace function public.admin_daily_activity(days integer default 14)
returns table (
  day date,
  downloads bigint,
  selections bigint,
  signups bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  days := greatest(1, least(coalesce(days, 14), 90));

  return query
  select
    d::date,
    (select count(*) from public.template_events e
       where e.event_type = 'downloaded' and e.created_at::date = d::date),
    (select count(*) from public.template_events e
       where e.event_type = 'selected' and e.created_at::date = d::date),
    (select count(*) from public.profiles p where p.created_at::date = d::date)
  from generate_series(current_date - (days - 1), current_date, interval '1 day') d
  order by d;
end;
$$;

revoke all on function public.admin_summary() from public, anon;
revoke all on function public.admin_user_overview() from public, anon;
revoke all on function public.admin_template_usage() from public, anon;
revoke all on function public.admin_daily_activity(integer) from public, anon;
grant execute on function public.admin_summary() to authenticated;
grant execute on function public.admin_user_overview() to authenticated;
grant execute on function public.admin_template_usage() to authenticated;
grant execute on function public.admin_daily_activity(integer) to authenticated;
