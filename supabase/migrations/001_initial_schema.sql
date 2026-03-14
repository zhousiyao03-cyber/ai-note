-- ai-note MVP Supabase schema
-- Adapted from docs/schema.sql for Supabase Auth + RLS
-- Assumes PostgreSQL 14+ (Supabase default)

-- ============================================================
-- Extensions
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- Custom enum types
-- ============================================================

create type plan_t as enum ('free', 'pro', 'enterprise');
create type file_status_t as enum ('pending', 'transcribing', 'completed', 'failed');
create type ask_ai_role_t as enum ('user', 'assistant');
create type subscription_status_t as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type usage_type_t as enum ('transcription_seconds', 'storage_bytes', 'ask_ai_question');

-- ============================================================
-- Tables
-- ============================================================

-- Profile — extends Supabase auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  avatar_url text,
  plan plan_t not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_notifications boolean not null default true,
  auto_transcribe boolean not null default true,
  speaker_detection boolean not null default true,
  language text not null default 'en',
  theme text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  storage_key text not null unique,
  audio_url text,
  mime_type text,
  language text,
  duration_sec integer,
  size_bytes bigint not null default 0,
  status file_status_t not null default 'pending',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  error_message text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table transcriptions (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null unique references files(id) on delete cascade,
  content_html text not null default '',
  summary text not null default '',
  language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table speakers (
  id uuid primary key default gen_random_uuid(),
  transcription_id uuid not null references transcriptions(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table transcription_segments (
  id uuid primary key default gen_random_uuid(),
  transcription_id uuid not null references transcriptions(id) on delete cascade,
  speaker_id uuid references speakers(id) on delete set null,
  start_time numeric(10,3) not null,
  end_time numeric(10,3) not null,
  text text not null,
  sequence integer not null,
  created_at timestamptz not null default now(),
  constraint transcription_segments_time_check check (end_time >= start_time),
  constraint transcription_segments_sequence_unique unique (transcription_id, sequence)
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now(),
  unique (user_id, lower(name))
);

create table file_tags (
  file_id uuid not null references files(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (file_id, tag_id)
);

create table ask_ai_messages (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references files(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role ask_ai_role_t not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text unique,
  plan plan_t not null,
  status subscription_status_t not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_id uuid references files(id) on delete set null,
  type usage_type_t not null,
  amount bigint not null,
  unit text not null,
  created_at timestamptz not null default now()
);

create table transcription_jobs (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null unique references files(id) on delete cascade,
  provider text not null,
  provider_job_id text,
  status text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  attempts integer not null default 0,
  last_error text,
  queued_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_files_user_id_created_at on files(user_id, created_at desc);
create index idx_files_user_id_status on files(user_id, status);
create index idx_files_user_id_deleted_at on files(user_id, deleted_at);
create index idx_transcription_segments_transcription_id on transcription_segments(transcription_id);
create index idx_speakers_transcription_id on speakers(transcription_id);
create index idx_tags_user_id on tags(user_id);
create index idx_file_tags_tag_id on file_tags(tag_id);
create index idx_ask_ai_messages_file_id_created_at on ask_ai_messages(file_id, created_at);
create index idx_usage_records_user_id_created_at on usage_records(user_id, created_at desc);
create index idx_transcription_jobs_status on transcription_jobs(status);

-- ============================================================
-- Functions
-- ============================================================

-- Auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Auto-create profile + preferences on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Triggers — updated_at
-- ============================================================

create trigger set_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger set_updated_at before update on files
  for each row execute function update_updated_at();

create trigger set_updated_at before update on transcriptions
  for each row execute function update_updated_at();

create trigger set_updated_at before update on subscriptions
  for each row execute function update_updated_at();

create trigger set_updated_at before update on user_preferences
  for each row execute function update_updated_at();

create trigger set_updated_at before update on transcription_jobs
  for each row execute function update_updated_at();

-- ============================================================
-- Trigger — auto-create profile on auth signup
-- ============================================================

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table files enable row level security;
alter table transcriptions enable row level security;
alter table speakers enable row level security;
alter table transcription_segments enable row level security;
alter table tags enable row level security;
alter table file_tags enable row level security;
alter table ask_ai_messages enable row level security;
alter table subscriptions enable row level security;
alter table usage_records enable row level security;
alter table transcription_jobs enable row level security;

-- profiles: users can read and update their own profile
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- user_preferences: users can read and update their own preferences
create policy "user_preferences_select_own" on user_preferences
  for select using (auth.uid() = user_id);
create policy "user_preferences_update_own" on user_preferences
  for update using (auth.uid() = user_id);

-- files: full CRUD on own files
create policy "files_select_own" on files
  for select using (auth.uid() = user_id);
create policy "files_insert_own" on files
  for insert with check (auth.uid() = user_id);
create policy "files_update_own" on files
  for update using (auth.uid() = user_id);
create policy "files_delete_own" on files
  for delete using (auth.uid() = user_id);

-- transcriptions: access via file ownership
create policy "transcriptions_select_own" on transcriptions
  for select using (
    exists (select 1 from files where files.id = transcriptions.file_id and files.user_id = auth.uid())
  );
create policy "transcriptions_insert_own" on transcriptions
  for insert with check (
    exists (select 1 from files where files.id = transcriptions.file_id and files.user_id = auth.uid())
  );
create policy "transcriptions_update_own" on transcriptions
  for update using (
    exists (select 1 from files where files.id = transcriptions.file_id and files.user_id = auth.uid())
  );

-- speakers: access via transcription → file ownership
create policy "speakers_select_own" on speakers
  for select using (
    exists (
      select 1 from transcriptions t
      join files f on f.id = t.file_id
      where t.id = speakers.transcription_id and f.user_id = auth.uid()
    )
  );
create policy "speakers_insert_own" on speakers
  for insert with check (
    exists (
      select 1 from transcriptions t
      join files f on f.id = t.file_id
      where t.id = speakers.transcription_id and f.user_id = auth.uid()
    )
  );
create policy "speakers_update_own" on speakers
  for update using (
    exists (
      select 1 from transcriptions t
      join files f on f.id = t.file_id
      where t.id = speakers.transcription_id and f.user_id = auth.uid()
    )
  );
create policy "speakers_delete_own" on speakers
  for delete using (
    exists (
      select 1 from transcriptions t
      join files f on f.id = t.file_id
      where t.id = speakers.transcription_id and f.user_id = auth.uid()
    )
  );

-- transcription_segments: access via transcription → file ownership
create policy "transcription_segments_select_own" on transcription_segments
  for select using (
    exists (
      select 1 from transcriptions t
      join files f on f.id = t.file_id
      where t.id = transcription_segments.transcription_id and f.user_id = auth.uid()
    )
  );
create policy "transcription_segments_insert_own" on transcription_segments
  for insert with check (
    exists (
      select 1 from transcriptions t
      join files f on f.id = t.file_id
      where t.id = transcription_segments.transcription_id and f.user_id = auth.uid()
    )
  );
create policy "transcription_segments_update_own" on transcription_segments
  for update using (
    exists (
      select 1 from transcriptions t
      join files f on f.id = t.file_id
      where t.id = transcription_segments.transcription_id and f.user_id = auth.uid()
    )
  );

-- tags: own tags
create policy "tags_select_own" on tags
  for select using (auth.uid() = user_id);
create policy "tags_insert_own" on tags
  for insert with check (auth.uid() = user_id);
create policy "tags_delete_own" on tags
  for delete using (auth.uid() = user_id);

-- file_tags: via file ownership
create policy "file_tags_select_own" on file_tags
  for select using (
    exists (select 1 from files where files.id = file_tags.file_id and files.user_id = auth.uid())
  );
create policy "file_tags_insert_own" on file_tags
  for insert with check (
    exists (select 1 from files where files.id = file_tags.file_id and files.user_id = auth.uid())
  );
create policy "file_tags_delete_own" on file_tags
  for delete using (
    exists (select 1 from files where files.id = file_tags.file_id and files.user_id = auth.uid())
  );

-- ask_ai_messages: own messages
create policy "ask_ai_messages_select_own" on ask_ai_messages
  for select using (auth.uid() = user_id);
create policy "ask_ai_messages_insert_own" on ask_ai_messages
  for insert with check (auth.uid() = user_id);
create policy "ask_ai_messages_delete_own" on ask_ai_messages
  for delete using (auth.uid() = user_id);

-- subscriptions: read and update own
create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);
create policy "subscriptions_update_own" on subscriptions
  for update using (auth.uid() = user_id);

-- usage_records: read and insert own
create policy "usage_records_select_own" on usage_records
  for select using (auth.uid() = user_id);
create policy "usage_records_insert_own" on usage_records
  for insert with check (auth.uid() = user_id);

-- transcription_jobs: read own via file ownership
create policy "transcription_jobs_select_own" on transcription_jobs
  for select using (
    exists (select 1 from files where files.id = transcription_jobs.file_id and files.user_id = auth.uid())
  );

-- ============================================================
-- Supabase Storage (configure via dashboard or CLI)
-- ============================================================

-- Storage bucket: 'audio-files' (private)
-- Policy: authenticated users can upload to their own folder ({user_id}/*)
-- Policy: authenticated users can read their own files
