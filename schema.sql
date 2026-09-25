create table if not exists public.projects (
  id text primary key,
  name text not null default 'Untitled project',
  template_id text not null default 'playoff-poster',
  type text not null default 'Poster',
  updated text not null default 'just now',
  status text not null default 'Draft',
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_updated_at on public.projects(updated_at desc);

alter table public.projects enable row level security;

create policy "Allow public read access"
  on public.projects
  for select
  using (true);

create policy "Allow public write access"
  on public.projects
  for insert
  with check (true);

create policy "Allow public update access"
  on public.projects
  for update
  using (true)
  with check (true);

create policy "Allow public delete access"
  on public.projects
  for delete
  using (true);
