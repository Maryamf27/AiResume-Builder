alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  description text,
  category text,
  html text not null,            -- markup with {{placeholders}}
  css text not null default '',
  thumbnail_url text,
  version integer not null default 1,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists templates_published_sort_idx
  on public.templates (is_published, sort_order);

drop trigger if exists templates_set_updated_at on public.templates;
create trigger templates_set_updated_at
  before update on public.templates
  for each row execute function public.set_updated_at();

alter table public.templates enable row level security;

revoke all on public.templates from anon, authenticated;
grant select on public.templates to anon, authenticated;
grant insert, update, delete on public.templates to authenticated;

-- Everyone (including guests) can see published templates.
drop policy if exists "templates_select_published" on public.templates;
create policy "templates_select_published"
  on public.templates for select
  to anon, authenticated
  using (is_published);

-- Admins see drafts too and manage everything.
drop policy if exists "templates_select_admin" on public.templates;
create policy "templates_select_admin"
  on public.templates for select
  to authenticated
  using (public.is_admin());

drop policy if exists "templates_insert_admin" on public.templates;
create policy "templates_insert_admin"
  on public.templates for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "templates_update_admin" on public.templates;
create policy "templates_update_admin"
  on public.templates for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "templates_delete_admin" on public.templates;
create policy "templates_delete_admin"
  on public.templates for delete
  to authenticated
  using (public.is_admin());

create table if not exists public.template_events (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,   -- null = guest
  event_type text not null check (event_type in ('selected', 'downloaded')),
  created_at timestamptz not null default now()
);

create index if not exists template_events_template_type_idx
  on public.template_events (template_id, event_type);
create index if not exists template_events_created_at_idx
  on public.template_events (created_at);

alter table public.template_events enable row level security;

-- Append-only from the client; only admins can read.
revoke all on public.template_events from anon, authenticated;
grant insert on public.template_events to anon, authenticated;
grant select on public.template_events to authenticated;

drop policy if exists "template_events_insert_authenticated" on public.template_events;
create policy "template_events_insert_authenticated"
  on public.template_events for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "template_events_insert_guest" on public.template_events;
create policy "template_events_insert_guest"
  on public.template_events for insert
  to anon
  with check (user_id is null);

drop policy if exists "template_events_select_admin" on public.template_events;
create policy "template_events_select_admin"
  on public.template_events for select
  to authenticated
  using (public.is_admin());
grant select, update on public.feedback to authenticated;

drop policy if exists "feedback_select_admin" on public.feedback;
create policy "feedback_select_admin"
  on public.feedback for select
  to authenticated
  using (public.is_admin());

drop policy if exists "feedback_update_admin" on public.feedback;
create policy "feedback_update_admin"
  on public.feedback for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'template-assets', 'template-assets', true, 2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Public bucket = anyone can read objects by URL. Only admins may write.
drop policy if exists "template_assets_insert_admin" on storage.objects;
create policy "template_assets_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'template-assets' and public.is_admin());

drop policy if exists "template_assets_update_admin" on storage.objects;
create policy "template_assets_update_admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'template-assets' and public.is_admin())
  with check (bucket_id = 'template-assets' and public.is_admin());

drop policy if exists "template_assets_delete_admin" on storage.objects;
create policy "template_assets_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'template-assets' and public.is_admin());
