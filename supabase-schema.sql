-- ============================================================
-- IA PARA NEGOCIOS — Supabase Schema
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor
-- ============================================================

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  plan text default 'free',
  tokens_used integer default 0,
  runs_today integer default 0,
  last_reset_at date default current_date,
  created_at timestamptz default now()
);

-- AUTOMATIONS
create table if not exists public.automations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  type text not null check (type in ('email','content','summary','analysis','chatbot','notification')),
  prompt_template text,
  config jsonb default '{}',
  is_active boolean default true,
  runs_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AUTOMATION RUNS
create table if not exists public.automation_runs (
  id uuid default gen_random_uuid() primary key,
  automation_id uuid references public.automations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text not null check (status in ('running','success','error')),
  input_text text,
  output_text text,
  tokens_used integer default 0,
  duration_ms integer,
  created_at timestamptz default now()
);

-- CHAT MESSAGES
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  tokens_used integer default 0,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.automations enable row level security;
alter table public.automation_runs enable row level security;
alter table public.chat_messages enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Automations
create policy "Users manage own automations" on public.automations for all using (auth.uid() = user_id);

-- Runs
create policy "Users manage own runs" on public.automation_runs for all using (auth.uid() = user_id);

-- Chat
create policy "Users manage own chat" on public.chat_messages for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- ADMIN POLICIES (añadir después del schema base)
-- Permite al super admin leer todos los perfiles vía service_role
-- NOTA: service_role bypasea RLS por defecto, esto es solo
-- para añadir una policy explícita si usas anon key en el admin.
-- ============================================================

-- Si quieres permitir al admin leer todos los perfiles con anon key,
-- añade esta policy (opcional si usas service_role en la API):
-- create policy "Admin can view all profiles"
--   on public.profiles for select
--   using (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));
