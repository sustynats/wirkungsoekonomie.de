-- Engagement is recorded per sent newsletter delivery, not per browser or
-- recipient profile. The only recipient reference is a one-way address hash.
-- This keeps the two newsletters as separate tenant keys while providing
-- auditable delivery, unique-open and unique-click totals to the Academy.

create table if not exists parliament.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  newsletter_key text not null check (newsletter_key in ('wirkungsradar', 'wirkungsbrief')),
  subject text not null,
  status text not null default 'SENDING' check (status in ('SENDING', 'SENT', 'PARTIALLY_SENT', 'FAILED')),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  completed_at timestamptz
);

create table if not exists parliament.newsletter_campaign_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references parliament.newsletter_campaigns(id) on delete cascade,
  newsletter_key text not null check (newsletter_key in ('wirkungsradar', 'wirkungsbrief')),
  subscription_id uuid not null,
  recipient_hash text not null,
  tracking_token_hash text not null unique,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  unsubscribed_at timestamptz,
  delivery_error text,
  created_at timestamptz not null default now(),
  unique (campaign_id, recipient_hash)
);

create table if not exists parliament.newsletter_campaign_links (
  delivery_id uuid not null references parliament.newsletter_campaign_deliveries(id) on delete cascade,
  link_code text not null,
  target_url text not null,
  primary key (delivery_id, link_code),
  check (target_url ~ '^https://')
);

create index if not exists newsletter_campaigns_tenant_sent_idx
  on parliament.newsletter_campaigns (newsletter_key, sent_at desc);
create index if not exists newsletter_campaign_deliveries_campaign_idx
  on parliament.newsletter_campaign_deliveries (campaign_id, sent_at);
create index if not exists newsletter_campaign_deliveries_engagement_idx
  on parliament.newsletter_campaign_deliveries (newsletter_key, sent_at, opened_at, clicked_at);

alter table parliament.newsletter_campaigns enable row level security;
alter table parliament.newsletter_campaign_deliveries enable row level security;
alter table parliament.newsletter_campaign_links enable row level security;

grant all privileges on parliament.newsletter_campaigns to service_role;
grant all privileges on parliament.newsletter_campaign_deliveries to service_role;
grant all privileges on parliament.newsletter_campaign_links to service_role;

-- The previous version of this function did not expose campaign engagement.
-- Recreate it with additive result columns so the existing authenticated
-- Academy integration stays a single aggregate-only reporting boundary.
drop function if exists parliament.get_newsletter_analytics(timestamptz, timestamptz);

create function parliament.get_newsletter_analytics(
  range_start_input timestamptz,
  range_end_input timestamptz
)
returns table (
  newsletter_key text,
  active_addresses bigint,
  pending_confirmations bigint,
  requested bigint,
  confirmation_sends bigint,
  confirmed bigint,
  unsubscribed bigint,
  delivery_failures bigint,
  welcome_sends bigint,
  issue_sends bigint,
  unique_opens bigint,
  unique_clicks bigint
)
language sql
security definer
set search_path = parliament, pg_temp
as $$
  with wirkungsradar_contacts as (
    select
      count(*) filter (where status = 'ACTIVE') as active_addresses,
      count(*) filter (where status in ('AWAITING_CONFIRMATION_DELIVERY', 'PENDING_CONFIRMATION')) as pending_confirmations
    from parliament.wirkungsradar_subscriptions
  ),
  wirkungsradar_events as (
    select
      count(*) filter (where event_type = 'REQUESTED') as requested,
      count(*) filter (where event_type = 'CONFIRMATION_QUEUED') as confirmation_sends,
      count(*) filter (where event_type = 'CONFIRMED') as confirmed,
      count(*) filter (where event_type = 'UNSUBSCRIBED') as unsubscribed
    from parliament.wirkungsradar_subscription_events
    where event_at >= range_start_input and event_at <= range_end_input
  ),
  wirkungsbrief_contacts as (
    select
      count(*) filter (where status = 'ACTIVE') as active_addresses,
      count(*) filter (where status in ('AWAITING_CONFIRMATION_DELIVERY', 'PENDING_CONFIRMATION')) as pending_confirmations
    from parliament.woek_newsletter_subscriptions
  ),
  wirkungsbrief_metrics as (
    select
      coalesce(sum(count) filter (where metric_key = 'REQUESTED'), 0) as requested,
      coalesce(sum(count) filter (where metric_key = 'CONFIRMATION_SENT'), 0) as confirmation_sends,
      coalesce(sum(count) filter (where metric_key = 'CONFIRMED'), 0) as confirmed,
      coalesce(sum(count) filter (where metric_key = 'UNSUBSCRIBED'), 0) as unsubscribed,
      coalesce(sum(count) filter (where metric_key = 'CONFIRMATION_DELIVERY_FAILED'), 0) as delivery_failures,
      coalesce(sum(count) filter (where metric_key = 'WELCOME_SENT'), 0) as welcome_sends
    from parliament.woek_newsletter_daily_metrics
    where day >= ((range_start_input at time zone 'Europe/Berlin')::date)
      and day <= ((range_end_input at time zone 'Europe/Berlin')::date)
  ),
  campaign_engagement as (
    select
      newsletter_key,
      count(*) filter (where sent_at is not null) as issue_sends,
      count(*) filter (where opened_at is not null) as unique_opens,
      count(*) filter (where clicked_at is not null) as unique_clicks
    from parliament.newsletter_campaign_deliveries
    where sent_at >= range_start_input and sent_at <= range_end_input
    group by newsletter_key
  )
  select
    'wirkungsradar'::text,
    wirkungsradar_contacts.active_addresses,
    wirkungsradar_contacts.pending_confirmations,
    wirkungsradar_events.requested,
    wirkungsradar_events.confirmation_sends,
    wirkungsradar_events.confirmed,
    wirkungsradar_events.unsubscribed,
    0::bigint,
    0::bigint,
    coalesce(wirkungsradar_campaigns.issue_sends, 0),
    coalesce(wirkungsradar_campaigns.unique_opens, 0),
    coalesce(wirkungsradar_campaigns.unique_clicks, 0)
  from wirkungsradar_contacts
  cross join wirkungsradar_events
  left join campaign_engagement wirkungsradar_campaigns on wirkungsradar_campaigns.newsletter_key = 'wirkungsradar'
  union all
  select
    'wirkungsbrief'::text,
    wirkungsbrief_contacts.active_addresses,
    wirkungsbrief_contacts.pending_confirmations,
    wirkungsbrief_metrics.requested,
    wirkungsbrief_metrics.confirmation_sends,
    wirkungsbrief_metrics.confirmed,
    wirkungsbrief_metrics.unsubscribed,
    wirkungsbrief_metrics.delivery_failures,
    wirkungsbrief_metrics.welcome_sends,
    coalesce(wirkungsbrief_campaigns.issue_sends, 0),
    coalesce(wirkungsbrief_campaigns.unique_opens, 0),
    coalesce(wirkungsbrief_campaigns.unique_clicks, 0)
  from wirkungsbrief_contacts
  cross join wirkungsbrief_metrics
  left join campaign_engagement wirkungsbrief_campaigns on wirkungsbrief_campaigns.newsletter_key = 'wirkungsbrief';
$$;

revoke all on function parliament.get_newsletter_analytics(timestamptz, timestamptz) from public;
grant execute on function parliament.get_newsletter_analytics(timestamptz, timestamptz) to service_role;
