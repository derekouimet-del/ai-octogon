alter table sessions add column if not exists max_minutes integer not null default 0;
alter table sessions add column if not exists elapsed_ms integer not null default 0;
alter table sessions add column if not exists resumed_at timestamptz;

update sessions
set resumed_at = coalesce(resumed_at, started_at)
where status in ('live', 'thinking') and resumed_at is null;

update sessions
set elapsed_ms = greatest(
  0,
  floor(extract(epoch from (coalesce(ended_at, updated_at) - started_at)) * 1000)
)::int
where elapsed_ms = 0
  and started_at is not null
  and status in ('completed', 'failed', 'paused');

create table if not exists setups (
  id text primary key,
  name text not null,
  topic text not null,
  mode text not null,
  character_a text not null,
  character_b text not null,
  provider_a text not null,
  provider_b text not null,
  extra_a text not null default '',
  extra_b text not null default '',
  max_exchanges integer not null default 8,
  token_budget integer not null default 12000,
  speed_ms integer not null default 900,
  max_minutes integer not null default 0,
  allow_conclusion boolean not null default true,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);
