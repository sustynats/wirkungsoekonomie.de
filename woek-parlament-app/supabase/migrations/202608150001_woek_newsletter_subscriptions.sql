-- A separate tenant for the general Wirkungsökonomie newsletter. This is
-- deliberately independent from parliament.wirkungsradar_subscriptions.

create table if not exists parliament.woek_newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_hash text not null unique,
  status text not null default 'AWAITING_CONFIRMATION_DELIVERY' check (status in (
    'AWAITING_CONFIRMATION_DELIVERY',
    'PENDING_CONFIRMATION',
    'ACTIVE',
    'UNSUBSCRIBED',
    'BLOCKED'
  )),
  consent_version text not null,
  consent_source text not null,
  consent_captured_at timestamptz not null default now(),
  privacy_notice_version text not null,
  confirmation_token_hash text,
  confirmation_sent_at timestamptz,
  confirmation_expires_at timestamptz,
  confirmed_at timestamptz,
  unsubscribe_token_hash text not null,
  recognition_token_hash text,
  unsubscribed_at timestamptz,
  suppression_reason text,
  retention_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'ACTIVE' and confirmed_at is not null) or status <> 'ACTIVE')
);

create table if not exists parliament.woek_newsletter_subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references parliament.woek_newsletter_subscriptions(id) on delete cascade,
  event_type text not null check (event_type in (
    'REQUESTED',
    'CONFIRMATION_QUEUED',
    'CONFIRMED',
    'UNSUBSCRIBED',
    'BLOCKED',
    'PURGED'
  )),
  event_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists woek_newsletter_subscriptions_status_idx
  on parliament.woek_newsletter_subscriptions (status, created_at);
create index if not exists woek_newsletter_subscription_events_subscription_idx
  on parliament.woek_newsletter_subscription_events (subscription_id, event_at desc);

alter table parliament.woek_newsletter_subscriptions enable row level security;
alter table parliament.woek_newsletter_subscription_events enable row level security;

grant all privileges on parliament.woek_newsletter_subscriptions to service_role;
grant all privileges on parliament.woek_newsletter_subscription_events to service_role;
