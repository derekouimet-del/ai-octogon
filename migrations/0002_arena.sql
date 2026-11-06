create table if not exists providers (
  id text primary key,
  name text not null,
  kind text not null,
  base_url text not null default '',
  model text not null default '',
  temperature double precision not null default 0.8,
  max_tokens integer not null default 500,
  context_turns integer not null default 14,
  extra text not null default '{}',
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists characters (
  id text primary key,
  name text not null,
  role text not null default '',
  personality text not null default '',
  perspective text not null default '',
  style text not null default '',
  background text not null default '',
  emotion text not null default '',
  domains text not null default '',
  motivation text not null default '',
  objective text not null default '',
  constraints text not null default '',
  voice_provider text not null default 'none',
  voice_id text not null default '',
  favorite boolean not null default false,
  is_template boolean not null default false,
  portrait_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memories (
  id text primary key,
  character_id text not null references characters (id) on delete cascade,
  kind text not null default 'long',
  content text not null,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists memories_character_idx on memories (character_id);

create table if not exists sessions (
  id text primary key,
  title text not null,
  topic text not null,
  mode text not null,
  status text not null default 'draft',
  agent_a text not null,
  agent_b text not null,
  max_exchanges integer not null default 8,
  token_budget integer not null default 12000,
  tokens_used integer not null default 0,
  speed_ms integer not null default 1200,
  allow_conclusion boolean not null default true,
  is_public boolean not null default true,
  summary text,
  agreements text,
  disagreements text,
  conclusion text,
  design text,
  exchange_count integer not null default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_status_idx on sessions (status);

create table if not exists messages (
  id text primary key,
  session_id text not null references sessions (id) on delete cascade,
  speaker text not null,
  content text not null,
  tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists messages_session_idx on messages (session_id, created_at);

create table if not exists app_meta (
  key text primary key,
  value text not null
);
