-- The public portal starts with the Bundestag but is intentionally a
-- multi-level parliamentary product. A case always belongs to one concrete
-- parliament; an election provides the collection context for election
-- programmes and coalition agreements before a new legislative term begins.

insert into parliament.parliaments (id, jurisdiction, country, language, legislative_term, name)
values
  ('bundestag-21', 'federal', 'DE', 'de', '21', 'Deutscher Bundestag · 21. Wahlperiode'),
  ('landtag-st-2026', 'state', 'DE-ST', 'de', 'nach der Landtagswahl 2026', 'Landtag von Sachsen-Anhalt'),
  ('abgeordnetenhaus-be-2026', 'state', 'DE-BE', 'de', '20. Wahlperiode', 'Abgeordnetenhaus von Berlin'),
  ('landtag-mv-2026', 'state', 'DE-MV', 'de', 'nach der Landtagswahl 2026', 'Landtag Mecklenburg-Vorpommern'),
  ('landtag-sh-2027', 'state', 'DE-SH', 'de', 'nach der Landtagswahl 2027', 'Schleswig-Holsteinischer Landtag'),
  ('landtag-sl-2027', 'state', 'DE-SL', 'de', 'nach der Landtagswahl 2027', 'Landtag des Saarlandes'),
  ('landtag-nw-2027', 'state', 'DE-NW', 'de', 'nach der Landtagswahl 2027', 'Landtag Nordrhein-Westfalen'),
  ('buergerschaft-hb-2027', 'state', 'DE-HB', 'de', 'nach der Bürgerschaftswahl 2027', 'Bremische Bürgerschaft'),
  ('landtag-ni-2027', 'state', 'DE-NI', 'de', 'nach der Landtagswahl 2027', 'Niedersächsischer Landtag'),
  ('european-parliament-10', 'european_union', 'EU', 'de', '10', 'Europäisches Parlament · 10. Wahlperiode')
on conflict (id) do update set
  jurisdiction = excluded.jurisdiction,
  country = excluded.country,
  language = excluded.language,
  legislative_term = excluded.legislative_term,
  name = excluded.name,
  updated_at = now();

create table if not exists parliament.elections (
  id text primary key,
  parliament_id text not null references parliament.parliaments(id),
  election_type text not null check (election_type in ('BUNDESTAG', 'LANDTAG', 'ABGEORDNETENHAUS', 'BUERGERSCHAFT', 'EUROPEAN_PARLIAMENT')),
  election_date date,
  election_date_note text,
  official_election_authority text not null,
  official_source_url text not null,
  source_status text not null default 'SCHEDULE_CONFIRMED'
    check (source_status in ('SCHEDULE_CONFIRMED', 'CANDIDATE_LISTS_PENDING', 'CANDIDATE_LISTS_CONFIRMED', 'PROGRAMME_COLLECTION', 'COMPLETE')),
  candidate_lists_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (election_date is not null or election_date_note is not null)
);

insert into parliament.elections (
  id, parliament_id, election_type, election_date, election_date_note,
  official_election_authority, official_source_url, source_status
) values
  ('bt-2025', 'bundestag-21', 'BUNDESTAG', '2025-02-23', null, 'Bundeswahlleiterin', 'https://www.bundeswahlleiterin.de/bundestagswahlen/2025.html', 'COMPLETE'),
  ('lt-st-2026', 'landtag-st-2026', 'LANDTAG', '2026-09-06', null, 'Landeswahlleiter Sachsen-Anhalt', 'https://wahlen.sachsen-anhalt.de/zu-den-wahlen/landtagswahl/faq-zur-landtagswahl-2026', 'CANDIDATE_LISTS_CONFIRMED'),
  ('agh-be-2026', 'abgeordnetenhaus-be-2026', 'ABGEORDNETENHAUS', '2026-09-20', null, 'Landeswahlleiter Berlin', 'https://www.berlin.de/wahlen/', 'CANDIDATE_LISTS_CONFIRMED'),
  ('lt-mv-2026', 'landtag-mv-2026', 'LANDTAG', '2026-09-20', null, 'Landeswahlleitung Mecklenburg-Vorpommern', 'https://www.regierung-mv.de/Landesregierung/im/Wahlen/', 'PROGRAMME_COLLECTION'),
  ('lt-sh-2027', 'landtag-sh-2027', 'LANDTAG', '2027-04-18', null, 'Landeswahlleiter Schleswig-Holstein', 'https://www.schleswig-holstein.de/DE/landesregierung/themen/inneres-sicherheit-verwaltung/wahlen/wahlen_node.html', 'PROGRAMME_COLLECTION'),
  ('lt-sl-2027', 'landtag-sl-2027', 'LANDTAG', '2027-04-18', null, 'Landeswahlleiter Saarland', 'https://www.saarland.de/landeswahlleiter/DE/home/home_node.html', 'PROGRAMME_COLLECTION'),
  ('lt-nw-2027', 'landtag-nw-2027', 'LANDTAG', '2027-04-25', null, 'Landeswahlleiter Nordrhein-Westfalen', 'https://www.wahlergebnisse.nrw/landtagswahlen/index.html', 'PROGRAMME_COLLECTION'),
  ('hb-2027', 'buergerschaft-hb-2027', 'BUERGERSCHAFT', '2027-05-30', null, 'Landeswahlleitung Bremen', 'https://www.wahlen-bremen.de/', 'PROGRAMME_COLLECTION'),
  ('lt-ni-2027', 'landtag-ni-2027', 'LANDTAG', null, 'Herbst 2027', 'Landeswahlleitung Niedersachsen', 'https://www.landeswahlleiter.niedersachsen.de/', 'SCHEDULE_CONFIRMED'),
  ('ep-2029', 'european-parliament-10', 'EUROPEAN_PARLIAMENT', null, 'Frühjahr 2029', 'Europäisches Parlament', 'https://elections.europa.eu/', 'SCHEDULE_CONFIRMED')
on conflict (id) do update set
  parliament_id = excluded.parliament_id,
  election_type = excluded.election_type,
  election_date = excluded.election_date,
  election_date_note = excluded.election_date_note,
  official_election_authority = excluded.official_election_authority,
  official_source_url = excluded.official_source_url,
  source_status = excluded.source_status,
  updated_at = now();

alter table parliament.political_source_documents
  add column if not exists parliament_id text references parliament.parliaments(id),
  add column if not exists election_id text references parliament.elections(id);

-- Existing Bundestag programme and coalition sources retain their provenance;
-- the two new fields make the same workflow reusable for every election.
update parliament.political_source_documents
set parliament_id = 'bundestag-21',
    election_id = 'bt-2025'
where parliament_id is null;

alter table parliament.political_source_documents
  alter column parliament_id set not null;

create index if not exists elections_parliament_date_idx
  on parliament.elections (parliament_id, election_date);
create index if not exists political_source_documents_scope_idx
  on parliament.political_source_documents (parliament_id, election_id, source_type);

alter table parliament.elections enable row level security;
grant select, insert, update on parliament.elections to service_role;

notify pgrst, 'reload schema';
