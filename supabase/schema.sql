-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects Table
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  name text not null,
  subdomain text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pages Table
create table if not exists pages (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  slug text not null,
  title text not null,
  blocks jsonb default '[]'::jsonb not null,
  seo jsonb default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, slug)
);

-- Enable RLS
alter table projects enable row level security;
alter table pages enable row level security;

-- Policies for Projects
create policy "Users can view their own projects" 
  on projects for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own projects" 
  on projects for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own projects" 
  on projects for update 
  using (auth.uid() = user_id);

-- Policies for Pages
create policy "Users can view pages of their projects" 
  on pages for select 
  using (
    exists (
      select 1 from projects 
      where projects.id = pages.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert pages into their projects" 
  on pages for insert 
  with check (
    exists (
      select 1 from projects 
      where projects.id = pages.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update pages of their projects" 
  on pages for update 
  using (
    exists (
      select 1 from projects 
      where projects.id = pages.project_id 
      and projects.user_id = auth.uid()
    )
  );
