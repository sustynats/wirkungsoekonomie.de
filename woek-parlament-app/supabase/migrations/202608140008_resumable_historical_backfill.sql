-- A historical import is intentionally resumable.  Each official API cursor
-- is persisted, so an interrupted serverless invocation never has to start a
-- long period again or silently treat a partial result as complete.
create table if not exists parliament.historical_backfill_checkpoints (
  id uuid primary key default gen_random_uuid(),
  stream text not null check (stream in ('VORGANG', 'DRUCKSACHE')),
  start_date date not null,
  end_date date,
  next_cursor text,
  status text not null default 'PENDING' check (status in ('PENDING', 'RUNNING', 'COMPLETE', 'FAILED')),
  pages_processed integer not null default 0,
  source_records_processed integer not null default 0,
  records_stored integer not null default 0,
  records_skipped integer not null default 0,
  last_error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stream, start_date, end_date)
);

alter table parliament.historical_backfill_checkpoints enable row level security;
grant select, insert, update on parliament.historical_backfill_checkpoints to service_role;

notify pgrst, 'reload schema';
