-- ============================================================
-- AI Champs — Full Schema (run this once in Supabase SQL Editor)
-- ============================================================

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  department text,
  ai_score numeric(3,1) check (ai_score >= 0.5 and ai_score <= 5 and (ai_score * 2) = floor(ai_score * 2)),
  role text not null default 'user' check (role in ('user', 'admin')),
  tarot_card_type text,
  tarot_card_data jsonb,
  onboarding_complete boolean not null default false,
  risk_flag text check (risk_flag in ('red', 'amber', 'green')),
  current_week integer not null default 1 check (current_week >= 1 and current_week <= 8),
  chosen_roadmap_path jsonb,
  roadmap_mode text check (roadmap_mode in ('fixed', 'custom')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Admin helper (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create policy "Users can view own profile"    on public.users for select using (auth.uid() = id);
create policy "Admins can view all profiles"  on public.users for select using (public.is_admin());
create policy "Users can update own profile"  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));
create policy "Admins can update all profiles" on public.users for update using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- champ_forms
-- ------------------------------------------------------------
create table public.champ_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  current_project text,
  biggest_challenge text,
  support_needed text,
  created_at timestamptz not null default now()
);

alter table public.champ_forms enable row level security;

create policy "Users can view own champ forms"    on public.champ_forms for select using (auth.uid() = user_id);
create policy "Admins can view all champ forms"   on public.champ_forms for select using (public.is_admin());
create policy "Users can insert own champ forms"  on public.champ_forms for insert with check (auth.uid() = user_id);
create policy "Users can update own champ forms"  on public.champ_forms for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins can manage all champ forms" on public.champ_forms for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- roadmap_config
-- ------------------------------------------------------------
create table public.roadmap_config (
  id uuid primary key default gen_random_uuid(),
  week_number integer not null unique check (week_number >= 1 and week_number <= 8),
  title text not null,
  description text not null,
  tools text[] not null default '{}'
);

alter table public.roadmap_config enable row level security;

create policy "Anyone can view roadmap config"      on public.roadmap_config for select using (true);
create policy "Admins can manage roadmap config"    on public.roadmap_config for all using (public.is_admin()) with check (public.is_admin());

insert into public.roadmap_config (week_number, title, description, tools) values
  (1, 'AI Landscape & Tool Discovery',        'Explore the AI ecosystem and find your tools',         array['ChatGPT', 'Claude', 'Perplexity']),
  (2, 'Workflow Design & Automation Thinking','Map processes and identify automation opportunities',   array['Zapier', 'Make', 'Notion AI']),
  (3, 'Content Creation with AI',             'Write, design, and produce with AI assistance',        array['Midjourney', 'Canva AI', 'Copy.ai']),
  (4, 'AI Video Production',                  'Create compelling video content using AI',             array['Runway', 'Pika', 'DIREC.A']),
  (5, 'AI Agents & Assistants',               'Build and deploy intelligent agents',                  array['Custom GPTs', 'Cursor', 'n8n']),
  (6, 'Department-Specific Use Cases',        'Apply AI to your team''s unique challenges',           array['Internal docs', 'Team workshops']),
  (7, 'Building Internal Systems',            'Integrate AI into internal workflows',                 array['APIs', 'Supabase', 'Automation']),
  (8, 'Showcase & Graduation',                'Present your work and graduate as an AI Champ',        array['Demo day', 'Portfolio'])
on conflict (week_number) do nothing;

-- ------------------------------------------------------------
-- risk_flags
-- ------------------------------------------------------------
create table public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  flag_color text not null check (flag_color in ('red', 'amber', 'green')),
  reason text not null,
  analyzed_at timestamptz not null default now()
);

alter table public.risk_flags enable row level security;

create policy "Users can view own risk flags"    on public.risk_flags for select using (auth.uid() = user_id);
create policy "Admins can manage all risk flags" on public.risk_flags for all using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------
-- indexes
-- ------------------------------------------------------------
create index users_role_idx          on public.users (role);
create index champ_forms_user_id_idx on public.champ_forms (user_id);
create index risk_flags_user_id_idx  on public.risk_flags (user_id);

-- ------------------------------------------------------------
-- champ_forms — urgency & problem status columns (migration)
-- Run this block separately if the table already exists
-- ------------------------------------------------------------
alter table public.champ_forms
  add column if not exists urgency          text check (urgency in ('critical','high','medium','low')),
  add column if not exists problem_status   text not null default 'open' check (problem_status in ('open','in_progress','resolved')),
  add column if not exists status_updated_at timestamptz;

-- Allow admins to stamp status_updated_at when they change a flag
create index if not exists champ_forms_urgency_idx        on public.champ_forms (urgency);
create index if not exists champ_forms_problem_status_idx on public.champ_forms (problem_status);
