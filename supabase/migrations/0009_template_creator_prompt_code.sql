alter table public.templates
  add column if not exists prompt text,
  add column if not exists code jsonb;

-- Keep old templates usable by every existing consumer that reads html/css.
update public.templates
set code = jsonb_build_object('html', html, 'css', css)
where code is null;

create or replace function public.sync_template_code()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.code is null then
      new.code := jsonb_build_object('html', new.html, 'css', coalesce(new.css, ''));
    elsif jsonb_typeof(new.code) = 'object'
      and jsonb_typeof(new.code->'html') = 'string'
      and jsonb_typeof(new.code->'css') = 'string' then
      new.html := new.code->>'html';
      new.css := new.code->>'css';
    end if;
  elsif new.html is distinct from old.html or new.css is distinct from old.css then
    new.code := jsonb_build_object('html', new.html, 'css', coalesce(new.css, ''));
  elsif new.code is distinct from old.code
    and jsonb_typeof(new.code) = 'object'
    and jsonb_typeof(new.code->'html') = 'string'
    and jsonb_typeof(new.code->'css') = 'string' then
    new.html := new.code->>'html';
    new.css := new.code->>'css';
  end if;
  return new;
end;
$$;

drop trigger if exists templates_sync_code on public.templates;
create trigger templates_sync_code
  before insert or update on public.templates
  for each row execute function public.sync_template_code();
