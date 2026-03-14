-- Plaud MVP PostgreSQL schema
-- Assumes PostgreSQL 14+

create extension if not exists pgcrypto;

create type plan_t as enum ('free', 'pro', 'enterprise');
create type file_status_t as enum ('pending', 'transcribing', 'completed', 'failed');
create type ask_ai_role_t as enum ('user', 'assistant');
create type subscription_status_t as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type usage_type_t as enum ('transcription_seconds', 'storage_bytes', 'ask_ai_question');

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  avatar_url text,
  plan plan_t not null default 'free',
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table user_preferences (
  user_id uuid primary key references users(id) on delete cascade,
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
  user_id uuid not null references users(id) on delete cascade,
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
  user_id uuid not null references users(id) on delete cascade,
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
  user_id uuid not null references users(id) on delete cascade,
  role ask_ai_role_t not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
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
  user_id uuid not null references users(id) on delete cascade,
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

create index idx_refresh_tokens_user_id on refresh_tokens(user_id);
create index idx_password_reset_tokens_user_id on password_reset_tokens(user_id);
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

-- Useful materialized view candidates for later:
-- 1. per-user monthly usage rollups
-- 2. completed transcription export metrics

-- Application-level rules to enforce:
-- 1. File ownership must be checked on every file-scoped query.
-- 2. Tag ownership must match the file owner before attachment.
-- 3. Hard delete should also remove the storage object when retention policy allows.
-- 4. Subscription plan should be mirrored into users.plan after billing webhook processing.
