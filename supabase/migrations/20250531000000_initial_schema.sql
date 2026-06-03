-- AI Champs Dashboard — initial schema with RLS
-- Apply via Supabase CLI: supabase db push
-- Or paste into Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  department text,
  ai_score integer check (ai_score >= 1 and ai_score <= 10),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- Admin check helper (security definer avoids RLS recursion on users table)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.users for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));

create policy "Admins can update all profiles"
  on public.users for update
  using (public.is_admin());

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
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

-- ---------------------------------------------------------------------------
-- tarot_cards
-- ---------------------------------------------------------------------------
create table public.tarot_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  card_type text,
  title text,
  description text,
  strength text,
  growth_area text,
  prediction text,
  created_at timestamptz not null default now()
);

alter table public.tarot_cards enable row level security;

create policy "Users can view own tarot cards"
  on public.tarot_cards for select
  using (auth.uid() = user_id);

create policy "Admins can view all tarot cards"
  on public.tarot_cards for select
  using (public.is_admin());

create policy "Users can insert own tarot cards"
  on public.tarot_cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tarot cards"
  on public.tarot_cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tarot cards"
  on public.tarot_cards for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all tarot cards"
  on public.tarot_cards for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- champ_forms
-- ---------------------------------------------------------------------------
create table public.champ_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  current_project text,
  biggest_challenge text,
  support_needed text,
  created_at timestamptz not null default now()
);

alter table public.champ_forms enable row level security;

create policy "Users can view own champ forms"
  on public.champ_forms for select
  using (auth.uid() = user_id);

create policy "Admins can view all champ forms"
  on public.champ_forms for select
  using (public.is_admin());

create policy "Users can insert own champ forms"
  on public.champ_forms for insert
  with check (auth.uid() = user_id);

create policy "Users can update own champ forms"
  on public.champ_forms for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own champ forms"
  on public.champ_forms for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all champ forms"
  on public.champ_forms for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- risk_flags
-- ---------------------------------------------------------------------------
create table public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  flag_color text not null check (flag_color in ('red', 'amber', 'green')),
  reason text,
  auto_generated boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.risk_flags enable row level security;

create policy "Users can view own risk flags"
  on public.risk_flags for select
  using (auth.uid() = user_id);

create policy "Admins can view all risk flags"
  on public.risk_flags for select
  using (public.is_admin());

create policy "Users can insert own risk flags"
  on public.risk_flags for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all risk flags"
  on public.risk_flags for all
  using (public.is_admin())
  with check (public.is_admin());

-- Indexes for common lookups
create index users_role_idx on public.users (role);
create index tarot_cards_user_id_idx on public.tarot_cards (user_id);
create index champ_forms_user_id_idx on public.champ_forms (user_id);
create index risk_flags_user_id_idx on public.risk_flags (user_id);
