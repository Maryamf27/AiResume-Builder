create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('Bug Report', 'Feature Request', 'General Feedback')),
  message text not null check (char_length(btrim(message)) between 10 and 5000),
  page_url text,
  status text not null default 'new' check (status in ('new', 'reviewed', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_insert_authenticated" on public.feedback;
drop policy if exists "feedback_insert_guest" on public.feedback;

create policy "feedback_insert_authenticated"
on public.feedback for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "feedback_insert_guest"
on public.feedback for insert
to anon
with check (user_id is null);

revoke select, update, delete on public.feedback from anon, authenticated;
grant insert on public.feedback to anon, authenticated;
EOF

