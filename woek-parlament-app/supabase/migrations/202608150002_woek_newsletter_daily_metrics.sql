-- Aggregate lifecycle statistics for the general newsletter. These rows hold
-- no recipient data and survive an unsubscribe, while the address itself is
-- deleted from the newsletter tenant.

create table if not exists parliament.woek_newsletter_daily_metrics (
  day date not null,
  metric_key text not null check (metric_key in (
    'REQUESTED',
    'CONFIRMATION_SENT',
    'CONFIRMED',
    'UNSUBSCRIBED',
    'CONFIRMATION_DELIVERY_FAILED',
    'WELCOME_SENT'
  )),
  count integer not null default 0 check (count >= 0),
  primary key (day, metric_key)
);

alter table parliament.woek_newsletter_daily_metrics enable row level security;
grant all privileges on parliament.woek_newsletter_daily_metrics to service_role;

create or replace function parliament.record_woek_newsletter_metric(
  metric_key_input text,
  occurred_at_input timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = parliament, pg_temp
as $$
begin
  insert into parliament.woek_newsletter_daily_metrics (day, metric_key, count)
  values (((occurred_at_input at time zone 'Europe/Berlin')::date), metric_key_input, 1)
  on conflict (day, metric_key)
  do update set count = parliament.woek_newsletter_daily_metrics.count + 1;
end;
$$;

revoke all on function parliament.record_woek_newsletter_metric(text, timestamptz) from public;
grant execute on function parliament.record_woek_newsletter_metric(text, timestamptz) to service_role;

-- A privacy-safe reporting boundary for the Academy analytics backend. It
-- only returns aggregate counts for the two independent newsletter tenants.
create or replace function parliament.get_newsletter_analytics(
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
  welcome_sends bigint
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
    0::bigint
  from wirkungsradar_contacts cross join wirkungsradar_events
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
    wirkungsbrief_metrics.welcome_sends
  from wirkungsbrief_contacts cross join wirkungsbrief_metrics;
$$;

revoke all on function parliament.get_newsletter_analytics(timestamptz, timestamptz) from public;
grant execute on function parliament.get_newsletter_analytics(timestamptz, timestamptz) to service_role;
