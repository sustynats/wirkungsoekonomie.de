-- Protected evidence model for the public "Mandat & Praxis" comparison.
-- It deliberately separates a documented promise/commitment, the factual
-- parliamentary implementation link and the independent WÖk assessment.
-- Party or coalition metadata may describe a source, but is never an input
-- parameter of the WÖk calculation or recommendation engines.

create table if not exists parliament.political_source_documents (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_type text not null check (source_type in ('ELECTION_PROGRAM', 'COALITION_AGREEMENT')),
  actor_type text not null check (actor_type in ('PARTY', 'PARTY_ALLIANCE', 'COALITION')),
  actor_key text not null,
  election_or_term text not null,
  title text not null,
  canonical_url text not null,
  document_date date,
  retrieved_at timestamptz not null default now(),
  source_hash text,
  archive_status text not null default 'CANONICAL_LINK_ONLY'
    check (archive_status in ('CANONICAL_LINK_ONLY', 'PROTECTED_WORKING_COPY', 'RELEASE_COPY')),
  publication_status text not null default 'SOURCE_REGISTERED'
    check (publication_status in ('SOURCE_REGISTERED', 'STRUCTURED', 'EDITORIALLY_VERIFIED', 'SUPERSEDED', 'WITHDRAWN')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists parliament.policy_commitments (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid not null references parliament.political_source_documents(id) on delete cascade,
  commitment_key text not null unique,
  title text not null,
  commitment_text text not null,
  policy_domain text,
  source_location jsonb not null default '{}'::jsonb,
  temporal_scope text,
  extraction_status text not null default 'SOURCE_EXTRACTED'
    check (extraction_status in ('SOURCE_EXTRACTED', 'EDITORIALLY_VERIFIED', 'SUPERSEDED', 'REJECTED')),
  source_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_document_id, title, source_hash)
);

create table if not exists parliament.commitment_decision_links (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references parliament.policy_commitments(id) on delete cascade,
  case_id uuid not null references parliament.cases(id) on delete cascade,
  decision_unit_id uuid references parliament.decision_units(id) on delete set null,
  relationship_status text not null
    check (relationship_status in ('ADVANCES', 'PARTIALLY_ADVANCES', 'DEVIATES', 'NOT_YET_DECIDED', 'NOT_COMPARABLE', 'EVIDENCE_OPEN')),
  factual_rationale text not null,
  source_refs jsonb not null default '[]'::jsonb,
  implementation_scope text,
  verification_status text not null default 'PROPOSED'
    check (verification_status in ('PROPOSED', 'EDITORIALLY_VERIFIED', 'SUPERSEDED', 'REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (commitment_id, case_id, decision_unit_id)
);

-- The comparison status is a factual traceability result.  The independent
-- impact assessment is stored as a versioned reference to the case review and
-- cannot be inferred from the actor or relationship status.
create table if not exists parliament.commitment_impact_assessments (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null references parliament.policy_commitments(id) on delete cascade,
  assessment_scope text not null check (assessment_scope in ('PROGRAM', 'COALITION_AGREEMENT', 'IMPLEMENTATION')),
  assessment_status text not null check (assessment_status in ('NOT_STARTED', 'DATA_GAP', 'RULE_BASED_ASSESSMENT', 'QUANTIFIED_EXPECTED_EFFECT', 'QUANTIFIED_OBSERVED_EFFECT', 'READY_FOR_APPROVAL', 'PUBLISHED')),
  linked_case_id uuid references parliament.cases(id) on delete set null,
  calculation_record_ids jsonb not null default '[]'::jsonb,
  normative_mapping_ids jsonb not null default '[]'::jsonb,
  boundary_status text,
  reference_snapshot jsonb not null default '{}'::jsonb,
  assessment_note text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (commitment_id, assessment_scope, linked_case_id)
);

create index if not exists policy_commitments_source_document_idx on parliament.policy_commitments (source_document_id, extraction_status);
create index if not exists commitment_decision_links_case_idx on parliament.commitment_decision_links (case_id, verification_status);
create index if not exists commitment_impact_assessments_commitment_idx on parliament.commitment_impact_assessments (commitment_id, assessment_scope);

alter table parliament.political_source_documents enable row level security;
alter table parliament.policy_commitments enable row level security;
alter table parliament.commitment_decision_links enable row level security;
alter table parliament.commitment_impact_assessments enable row level security;

-- These tables are protected working data.  Public pages only surface an
-- explicitly reviewed projection and never the unverified extraction layer.

insert into parliament.political_source_documents (
  source_key, source_type, actor_type, actor_key, election_or_term, title,
  canonical_url, document_date, archive_status, publication_status, metadata
) values
  ('btw-2025-cdu-csu', 'ELECTION_PROGRAM', 'PARTY_ALLIANCE', 'CDU_CSU', 'BT_2025', 'Politikwechsel für Deutschland – Wahlprogramm zur Bundestagswahl 2025', 'https://www.cdu.de/wahlprogramm-von-cdu-und-csu/', '2024-12-17', 'CANONICAL_LINK_ONLY', 'SOURCE_REGISTERED', '{"source_role":"primary_party_source"}'::jsonb),
  ('btw-2025-spd', 'ELECTION_PROGRAM', 'PARTY', 'SPD', 'BT_2025', 'Mehr für Dich. Besser für Deutschland. – Regierungsprogramm 2025', 'https://www.spd.de/bundestagswahl/programm', '2025-01-11', 'CANONICAL_LINK_ONLY', 'SOURCE_REGISTERED', '{"source_role":"primary_party_source"}'::jsonb),
  ('btw-2025-gruene', 'ELECTION_PROGRAM', 'PARTY', 'GRUENE', 'BT_2025', 'Zusammen wachsen – Regierungsprogramm zur Bundestagswahl 2025', 'https://www.gruene.de/artikel/zusammen-wachsen', null, 'CANONICAL_LINK_ONLY', 'SOURCE_REGISTERED', '{"source_role":"primary_party_source"}'::jsonb),
  ('btw-2025-afd', 'ELECTION_PROGRAM', 'PARTY', 'AFD', 'BT_2025', 'Zeit für Deutschland – Wahlprogramm zur Bundestagswahl 2025', 'https://www.afd.de/wahlprogramm25/', '2025-01-12', 'CANONICAL_LINK_ONLY', 'SOURCE_REGISTERED', '{"source_role":"primary_party_source"}'::jsonb),
  ('btw-2025-linke', 'ELECTION_PROGRAM', 'PARTY', 'LINKE', 'BT_2025', 'Alle wollen regieren. Wir wollen verändern. – Wahlprogramm 2025', 'https://www.die-linke.de/bundestagswahl-2025/wahlprogramm/', '2025-01-18', 'CANONICAL_LINK_ONLY', 'SOURCE_REGISTERED', '{"source_role":"primary_party_source"}'::jsonb),
  ('btw-2025-ssw', 'ELECTION_PROGRAM', 'PARTY', 'SSW', 'BT_2025', 'Deine Stimme für den Norden – Wahlprogramm zur Bundestagswahl 2025', 'https://www.ssw.de/bundestagswahl', '2025-01-11', 'CANONICAL_LINK_ONLY', 'SOURCE_REGISTERED', '{"source_role":"primary_party_source"}'::jsonb),
  ('coalition-2025-cdu-csu-spd', 'COALITION_AGREEMENT', 'COALITION', 'CDU_CSU_SPD', '21_LEGISLATIVE_TERM', 'Verantwortung für Deutschland – Koalitionsvertrag für die 21. Legislaturperiode', 'https://www.bundesregierung.de/breg-de/aktuelles/koalitionsvertrag-2025-2340970', '2025-05-05', 'CANONICAL_LINK_ONLY', 'SOURCE_REGISTERED', '{"source_role":"primary_government_source"}'::jsonb)
on conflict (source_key) do update set
  title = excluded.title,
  canonical_url = excluded.canonical_url,
  document_date = excluded.document_date,
  metadata = excluded.metadata,
  updated_at = now();
