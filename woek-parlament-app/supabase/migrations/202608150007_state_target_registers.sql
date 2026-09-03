-- Versionierte landesspezifische Zielregister ergänzen den globalen
-- Referenzrahmen. Sie sind bewusst getrennt von Landesverfassungen und
-- einzelnen politischen Fallbewertungen gespeichert.

create table if not exists parliament.state_target_registers (
  id uuid primary key default gen_random_uuid(),
  register_key text not null unique,
  parliament_id text not null references parliament.parliaments(id),
  jurisdiction_id text not null,
  title text not null,
  source_url text not null,
  source_sha256 text not null check (source_sha256 ~ '^[a-f0-9]{64}$'),
  source_published_at date not null,
  declared_target_count integer not null check (declared_target_count > 0),
  register_status text not null check (register_status in ('SOURCE_CAPTURED', 'STRUCTURED_AND_VALIDATED', 'PUBLISHED')),
  imported_at timestamptz not null default now(),
  imported_payload jsonb not null,
  unique (parliament_id, source_sha256)
);

create table if not exists parliament.state_targets (
  id uuid primary key default gen_random_uuid(),
  register_id uuid not null references parliament.state_target_registers(id) on delete cascade,
  target_key text not null,
  label text not null,
  source_quote text not null,
  source_page integer not null check (source_page > 0),
  source_section text not null,
  sdg_codes jsonb not null default '[]'::jsonb,
  indicator_refs jsonb not null default '[]'::jsonb,
  target_type text not null check (target_type in ('QUANTIFIED', 'DIRECTIONAL', 'RULE_BASED')),
  target_value jsonb not null,
  measurement_boundary text not null,
  effect_space jsonb not null,
  valid_from date not null,
  valid_to date,
  source_ref text not null,
  imported_payload jsonb not null,
  unique (register_id, target_key)
);

create index if not exists state_target_registers_scope_idx
  on parliament.state_target_registers (jurisdiction_id, source_published_at desc);
create index if not exists state_targets_register_idx
  on parliament.state_targets (register_id, target_key);

create table if not exists parliament.release_deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_hash text not null unique check (delivery_hash ~ '^[a-f0-9]{64}$'),
  publisher text not null,
  manifest jsonb not null,
  release_summary jsonb not null,
  public_report_markdown text not null,
  imported_at timestamptz not null default now(),
  import_status text not null default 'REVIEW_PROPOSAL'
    check (import_status in ('REVIEW_PROPOSAL', 'VALIDATED', 'APPROVED', 'REJECTED'))
);

alter table parliament.state_target_registers enable row level security;
alter table parliament.state_targets enable row level security;
alter table parliament.release_deliveries enable row level security;
grant select, insert, update, delete on parliament.state_target_registers to service_role;
grant select, insert, update, delete on parliament.state_targets to service_role;
grant select, insert, update, delete on parliament.release_deliveries to service_role;

notify pgrst, 'reload schema';
