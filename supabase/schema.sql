-- ─────────────────────────────────────────────────────────────
-- HabitQuest Database Schema
-- Paste this entire file into Supabase → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

-- Profiles table
-- One row per user. game_state stores the entire game as JSON.
-- This is the simplest possible schema — easy to extend later.
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  game_state  jsonb         not null default '{}',
  updated_at  timestamptz   not null default now()
);

-- Enable Row Level Security
-- This ensures users can ONLY read/write their own row
alter table public.profiles enable row level security;

-- Policy: users can read their own profile only
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Policy: users can insert their own profile
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policy: users can update their own profile only
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-update updated_at on every save
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Index for fast lookups (already indexed via primary key, but explicit for clarity)
create index if not exists profiles_id_idx on public.profiles(id);
