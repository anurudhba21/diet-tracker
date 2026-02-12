-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  password_hash text,
  name text,
  phone text,
  height_cm integer,
  dob text,
  gender text,
  avatar_id text,
  created_at timestamp with time zone default now()
);

-- Daily Entries Table
create table if not exists daily_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  date text not null,
  weight real,
  notes text,
  junk integer default 0,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Meals Table
create table if not exists meals (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid references daily_entries(id) on delete cascade,
  type text, -- 'breakfast', 'lunch', 'dinner', 'snack'
  content text,
  created_at timestamp with time zone default now()
);

-- Habits Table (Daily Log)
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid references daily_entries(id) on delete cascade,
  habit_name text,
  completed integer default 0, -- 0 or 1
  created_at timestamp with time zone default now()
);

-- User Habits (Definitions)
create table if not exists user_habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  time_of_day text, -- 'morning', 'afternoon', 'evening', 'any'
  active integer default 1,
  created_at timestamp with time zone default now()
);

-- Workouts (Definitions)
create table if not exists workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  sets integer,
  reps integer,
  days text, -- JSON string e.g., '["Mon", "Wed"]'
  created_at timestamp with time zone default now()
);

-- Workout Logs (Daily Log - represents a session of a specific workout)
-- Actually, let's refine this. 
-- 'workouts' defines the PLAN (e.g. "Chest Day").
-- 'daily_entries' links to a date.
-- We need to link specific EXERCISES done on a day.
-- Current Schema: workout_logs links entry_id <-> workout_id. 
-- BUT 'workouts' table seems to be a mix of "Routine" and "Exercise". 
-- Let's check `workouts` table again: name, sets, reps, days. Use Case: "Pushups, 3 sets, 12 reps, Mon/Wed".
-- So `workflow_logs` currently tracks if "Pushups" was done on "Monday".

-- New Requirement: Track actual sets.
create table if not exists workout_logs (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid references daily_entries(id) on delete cascade,
  workout_id uuid references workouts(id) on delete cascade,
  completed integer default 0,
  created_at timestamp with time zone default now()
);

-- NEW: Detailed Sets
create table if not exists workout_sets (
  id uuid primary key default uuid_generate_v4(),
  workout_log_id uuid references workout_logs(id) on delete cascade,
  set_number integer not null,
  weight_kg real,
  reps integer,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- Goals Table
create table if not exists goals (
  user_id uuid primary key references users(id) on delete cascade,
  start_weight real,
  target_weight real,
  start_date text,
  created_at timestamp with time zone default now()
);

-- OTPs Table
create table if not exists otps (
  phone text primary key,
  code text not null,
  expires_at bigint not null,
  created_at timestamp with time zone default now()
);

-- RLS Policies (Optional but recommended for Supabase)
alter table users enable row level security;
alter table daily_entries enable row level security;
alter table meals enable row level security;
alter table habits enable row level security;
alter table user_habits enable row level security;
alter table workouts enable row level security;
alter table workout_logs enable row level security;
alter table goals enable row level security;

-- Simple RLS policy: Users can only access their own data
-- Note: internal backend service using service_role key bypasses RLS
create policy "Users can same user data" on users for all using (auth.uid() = id);
