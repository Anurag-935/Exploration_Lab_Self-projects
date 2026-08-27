-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Skills table
create table skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  xp_total integer default 0,
  level integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Short tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  note text,
  status text default 'open' check (status in ('open', 'done')),
  carried_over_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Task time logs
create table time_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references tasks on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  duration_seconds integer
);

-- Habits
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  note text,
  schedule jsonb not null,
  skip_used_this_week boolean default false,
  streak_current integer default 0,
  streak_best integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habit completion logs
create table habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references habits on delete cascade not null,
  completed_date date not null,
  unique(habit_id, completed_date)
);

-- Long plans
create table long_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  note text,
  status text default 'active' check (status in ('active', 'paused', 'done')),
  target_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Long plan journal entries
create table plan_journal_entries (
  id uuid default uuid_generate_v4() primary key,
  long_plan_id uuid references long_plans on delete cascade not null,
  date date not null,
  text text,
  images text[]
);

-- Daily journals
create table daily_journals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  cover_image text,
  summary text,
  body text,
  images text[],
  unique(user_id, date)
);

-- Tag join tables
create table task_skills (
  task_id uuid references tasks on delete cascade,
  skill_id uuid references skills on delete cascade,
  primary key (task_id, skill_id)
);

create table habit_skills (
  habit_id uuid references habits on delete cascade,
  skill_id uuid references skills on delete cascade,
  primary key (habit_id, skill_id)
);

create table plan_skills (
  long_plan_id uuid references long_plans on delete cascade,
  skill_id uuid references skills on delete cascade,
  primary key (long_plan_id, skill_id)
);

-- Set up Row Level Security (RLS)
alter table skills enable row level security;
alter table tasks enable row level security;
alter table time_logs enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table long_plans enable row level security;
alter table plan_journal_entries enable row level security;
alter table daily_journals enable row level security;
alter table task_skills enable row level security;
alter table habit_skills enable row level security;
alter table plan_skills enable row level security;

-- Create policies for RLS
create policy "Users can manage their own skills" on skills for all using (auth.uid() = user_id);
create policy "Users can manage their own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can manage their own habits" on habits for all using (auth.uid() = user_id);
create policy "Users can manage their own long plans" on long_plans for all using (auth.uid() = user_id);
create policy "Users can manage their own daily journals" on daily_journals for all using (auth.uid() = user_id);

-- Policies for children tables (time_logs, habit_logs, etc.)
create policy "Users can manage time logs for their tasks" on time_logs for all using (
  exists (select 1 from tasks where tasks.id = time_logs.task_id and tasks.user_id = auth.uid())
);
create policy "Users can manage habit logs for their habits" on habit_logs for all using (
  exists (select 1 from habits where habits.id = habit_logs.habit_id and habits.user_id = auth.uid())
);
create policy "Users can manage journal entries for their long plans" on plan_journal_entries for all using (
  exists (select 1 from long_plans where long_plans.id = plan_journal_entries.long_plan_id and long_plans.user_id = auth.uid())
);

create policy "Users can manage task skills" on task_skills for all using (
  exists (select 1 from tasks where tasks.id = task_skills.task_id and tasks.user_id = auth.uid())
);
create policy "Users can manage habit skills" on habit_skills for all using (
  exists (select 1 from habits where habits.id = habit_skills.habit_id and habits.user_id = auth.uid())
);
create policy "Users can manage plan skills" on plan_skills for all using (
  exists (select 1 from long_plans where long_plans.id = plan_skills.long_plan_id and long_plans.user_id = auth.uid())
);
