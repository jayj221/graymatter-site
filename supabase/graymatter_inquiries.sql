-- GrayMatter AI website inquiries. Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
create table if not exists public.graymatter_inquiries (
  id          bigint generated always as identity primary key,
  reference   text        not null unique,
  name        text        not null check (char_length(name) between 2 and 100),
  email       text        not null check (char_length(email) <= 254),
  company     text        not null check (char_length(company) between 2 and 160),
  team_size   text        not null check (team_size in ('1–24','25–50','51–100','101–300','301+')),
  workflow    text        not null check (char_length(workflow) between 10 and 2000),
  consent     boolean     not null check (consent),
  source      text        not null default 'website',
  status      text        not null default 'new' check (status in ('new','contacted','scoping','proposal','won','lost')),
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists graymatter_inquiries_created on public.graymatter_inquiries (created_at desc);

-- The website key may only add rows. Nobody can read, change or delete leads with it;
-- you read them in the Supabase dashboard (Table Editor) as the project owner.
alter table public.graymatter_inquiries enable row level security;
drop policy if exists "website can insert inquiries" on public.graymatter_inquiries;
create policy "website can insert inquiries" on public.graymatter_inquiries
  for insert to anon with check (consent and status = 'new' and notes is null);
grant insert on public.graymatter_inquiries to anon;
