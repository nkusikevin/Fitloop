-- Create resume_sessions table
create table if not exists public.resume_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_text text not null,
  job_post_url text,
  job_description_text text,
  fit_summary text,
  gap_analysis jsonb,
  updated_resume_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.resume_sessions enable row level security;

-- Create RLS policies
create policy "Users can view their own sessions" on public.resume_sessions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own sessions" on public.resume_sessions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own sessions" on public.resume_sessions
  for update using (auth.uid() = user_id);

create policy "Users can delete their own sessions" on public.resume_sessions
  for delete using (auth.uid() = user_id);

-- Create an index for faster queries
create index if not exists resume_sessions_user_id_idx on public.resume_sessions(user_id);
create index if not exists resume_sessions_created_at_idx on public.resume_sessions(created_at);
