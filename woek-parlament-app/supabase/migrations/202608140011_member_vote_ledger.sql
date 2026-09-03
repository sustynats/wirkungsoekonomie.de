-- Official, traceable voting records for member profiles.  This is a ledger
-- of named votes, not a judgement about people and not a political profile.

create table if not exists parliament.members (
  id uuid primary key default gen_random_uuid(),
  external_member_id text not null unique,
  slug text not null unique,
  display_name text not null,
  official_member_url text not null,
  parliamentary_group text,
  federal_state text,
  constituency text,
  mandate_type text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'LEFT_PARLIAMENT', 'ARCHIVED')),
  publication_status text not null default 'DRAFT' check (publication_status in ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  portrait_status text not null default 'NOT_USED' check (portrait_status in ('NOT_USED', 'AWAITING_RIGHTS_CHECK', 'VERIFIED_FOR_USE', 'WITHDRAWN')),
  portrait_source_url text,
  portrait_credit text,
  portrait_usage_terms_url text,
  portrait_verified_at timestamptz,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    portrait_status <> 'VERIFIED_FOR_USE'
    or (portrait_source_url is not null and portrait_credit is not null and portrait_usage_terms_url is not null and portrait_verified_at is not null)
  )
);

create table if not exists parliament.vote_events (
  id uuid primary key default gen_random_uuid(),
  external_vote_id text not null unique,
  case_id uuid references parliament.cases(id) on delete set null,
  decision_unit_id uuid references parliament.decision_units(id) on delete set null,
  vote_date date not null,
  official_title text not null,
  source_url text not null,
  is_named_vote boolean not null default false,
  result jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists parliament.member_votes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references parliament.members(id) on delete cascade,
  vote_event_id uuid not null references parliament.vote_events(id) on delete cascade,
  actual_vote text not null check (actual_vote in ('YES', 'NO', 'ABSTENTION', 'DID_NOT_VOTE')),
  parliamentary_group_at_vote text,
  source_url text not null,
  imported_at timestamptz not null default now(),
  unique (member_id, vote_event_id)
);

create table if not exists parliament.member_vote_impact_ledger (
  id uuid primary key default gen_random_uuid(),
  member_vote_id uuid not null unique references parliament.member_votes(id) on delete cascade,
  preferred_vote_at_decision_time text not null check (preferred_vote_at_decision_time in ('YES', 'NO', 'ABSTENTION', 'NO_SCORE')),
  recommendation_version text,
  agreement_status text not null check (agreement_status in ('ALIGNED', 'NOT_ALIGNED', 'ABSTAINED', 'DID_NOT_VOTE', 'NOT_SCORABLE')),
  materiality_class text check (materiality_class in ('VERY_HIGH', 'HIGH', 'MEDIUM', 'WATCH')),
  public_eligible boolean not null default false,
  ex_post_confirmation_status text check (ex_post_confirmation_status in ('DECISION_CONFIRMED', 'DECISION_MOSTLY_CONFIRMED', 'JUSTIFIABLE_AT_TIME_NOT_CONFIRMED_EX_POST', 'ALTERNATIVE_PREFERABLE', 'NO_ROBUST_RETROSPECTIVE_ASSESSMENT')),
  evidence_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (agreement_status = 'NOT_SCORABLE' and preferred_vote_at_decision_time = 'NO_SCORE')
    or (agreement_status <> 'NOT_SCORABLE' and preferred_vote_at_decision_time <> 'NO_SCORE')
  )
);

create or replace function parliament.reject_non_named_member_vote()
returns trigger
language plpgsql
as $$
begin
  if not exists (select 1 from parliament.vote_events where id = new.vote_event_id and is_named_vote = true) then
    raise exception 'Individual vote records require an official named vote.';
  end if;
  return new;
end;
$$;

drop trigger if exists member_votes_named_vote_only on parliament.member_votes;
create trigger member_votes_named_vote_only
before insert or update of vote_event_id on parliament.member_votes
for each row execute function parliament.reject_non_named_member_vote();

create index if not exists members_publication_idx on parliament.members (publication_status, status, display_name);
create index if not exists vote_events_named_idx on parliament.vote_events (is_named_vote, vote_date desc);
create index if not exists member_votes_member_idx on parliament.member_votes (member_id, vote_event_id);
create index if not exists member_vote_impact_ledger_public_idx on parliament.member_vote_impact_ledger (public_eligible, agreement_status, materiality_class);

alter table parliament.members enable row level security;
alter table parliament.vote_events enable row level security;
alter table parliament.member_votes enable row level security;
alter table parliament.member_vote_impact_ledger enable row level security;

-- The source for a member-level vote must be the official individual vote list.
-- No record can be created for a non-named vote, and party metadata never
-- enters the WÖk assessment or determines agreement status.
