-- Idempotent delivery ledger for the end-of-day political impact digest.
-- Recipient delivery rows are removed with the subscription. Aggregate run
-- counts contain no email addresses and remain available for operational QA.

create table if not exists parliament.wirkungsradar_digest_runs (
  digest_id text primary key,
  publication_date date not null,
  content_hash text not null,
  source_deployment_ids text[] not null default '{}',
  item_count integer not null check (item_count >= 0),
  recipient_count integer not null default 0 check (recipient_count >= 0),
  sent_count integer not null default 0 check (sent_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  status text not null check (status in (
    'PREPARED',
    'SENDING',
    'PARTIAL',
    'SENT',
    'NO_RECIPIENTS',
    'FAILED'
  )),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists parliament.wirkungsradar_digest_deliveries (
  digest_id text not null references parliament.wirkungsradar_digest_runs(digest_id) on delete cascade,
  subscription_id uuid not null references parliament.wirkungsradar_subscriptions(id) on delete cascade,
  status text not null check (status in ('QUEUED', 'SENT', 'FAILED')),
  item_count integer not null default 0 check (item_count >= 0),
  error_code text,
  queued_at timestamptz not null default now(),
  sent_at timestamptz,
  primary key (digest_id, subscription_id)
);

create index if not exists wirkungsradar_digest_runs_date_idx
  on parliament.wirkungsradar_digest_runs (publication_date desc);
create index if not exists wirkungsradar_digest_deliveries_status_idx
  on parliament.wirkungsradar_digest_deliveries (digest_id, status);

alter table parliament.wirkungsradar_digest_runs enable row level security;
alter table parliament.wirkungsradar_digest_deliveries enable row level security;

grant all privileges on parliament.wirkungsradar_digest_runs to service_role;
grant all privileges on parliament.wirkungsradar_digest_deliveries to service_role;
