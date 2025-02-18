-- Run History Table
create table run_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  task text not null,
  result text,
  progress jsonb not null,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GIF Storage Table
create table run_gifs (
  id uuid default uuid_generate_v4() primary key,
  history_id uuid references run_history(id) on delete cascade,
  gif_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table run_history enable row level security;
alter table run_gifs enable row level security;

-- Policies for run_history
create policy "Users can view their own run history."
  on run_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own run history."
  on run_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own run history."
  on run_history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own run history."
  on run_history for delete
  using (auth.uid() = user_id);

-- Policies for run_gifs
create policy "Users can view their own run gifs."
  on run_gifs for select
  using (
    exists (
      select 1 from run_history
      where run_history.id = run_gifs.history_id
      and run_history.user_id = auth.uid()
    )
  );

create policy "Users can insert their own run gifs."
  on run_gifs for insert
  with check (
    exists (
      select 1 from run_history
      where run_history.id = run_gifs.history_id
      and run_history.user_id = auth.uid()
    )
  );

create policy "Users can delete their own run gifs."
  on run_gifs for delete
  using (
    exists (
      select 1 from run_history
      where run_history.id = run_gifs.history_id
      and run_history.user_id = auth.uid()
    )
  );