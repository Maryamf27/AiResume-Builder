create or replace function public.template_events_validate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.template_id is null then
    raise exception 'template_id is required' using errcode = '23502';
  end if;

  if not exists (
    select 1
    from public.templates t
    where t.id = new.template_id
      and t.is_published = true
  ) then
    raise exception 'template_id must reference a published template' using errcode = '23514';
  end if;

  if new.user_id is null and auth.uid() is not null then
    raise exception 'authenticated users must provide their own user_id' using errcode = '42501';
  end if;

  if new.user_id is not null and auth.uid() is distinct from new.user_id then
    raise exception 'template event user_id must match auth.uid()' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.template_events_validate() from public, anon, authenticated;
grant execute on function public.template_events_validate() to anon, authenticated;

drop trigger if exists template_events_validate on public.template_events;
create trigger template_events_validate
  before insert or update on public.template_events
  for each row execute function public.template_events_validate();

-- Keep client-side inserts limited to published templates only.
drop policy if exists "template_events_insert_authenticated" on public.template_events;
create policy "template_events_insert_authenticated"
  on public.template_events for insert
  to authenticated
  with check (
    auth.uid() = user_id and
    exists (
      select 1
      from public.templates t
      where t.id = template_id and t.is_published = true
    )
  );

drop policy if exists "template_events_insert_guest" on public.template_events;
create policy "template_events_insert_guest"
  on public.template_events for insert
  to anon
  with check (
    user_id is null and
    auth.uid() is null and
    exists (
      select 1
      from public.templates t
      where t.id = template_id and t.is_published = true
    )
  );
