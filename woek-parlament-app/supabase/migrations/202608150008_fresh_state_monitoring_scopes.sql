-- Monitoring-Vorbereitung für junge Landeswahlperioden. Diese Einträge
-- enthalten nur den institutionellen Umfang; Fallimporte beginnen erst nach
-- einer Quellen- und Fassungsprüfung im jeweiligen Landesadapter.

insert into parliament.parliaments (id, jurisdiction, country, language, legislative_term, name)
values
  ('landtag-bw-18', 'state', 'DE-BW', 'de', '18', 'Landtag von Baden-Württemberg · 18. Wahlperiode'),
  ('landtag-rlp-19', 'state', 'DE-RP', 'de', '19', 'Landtag Rheinland-Pfalz · 19. Wahlperiode'),
  ('buergerschaft-hh-23', 'state', 'DE-HH', 'de', '23', 'Hamburgische Bürgerschaft · 23. Wahlperiode')
on conflict (id) do update set
  jurisdiction = excluded.jurisdiction,
  country = excluded.country,
  language = excluded.language,
  legislative_term = excluded.legislative_term,
  name = excluded.name,
  updated_at = now();

insert into parliament.elections (
  id, parliament_id, election_type, election_date, election_date_note,
  official_election_authority, official_source_url, source_status
) values
  ('lt-bw-2026', 'landtag-bw-18', 'LANDTAG', '2026-03-08', null, 'Landtag Baden-Württemberg', 'https://www.landtag-bw.de/de/aktuelles/themen/landtagswahl-2026', 'COMPLETE'),
  ('lt-rlp-2026', 'landtag-rlp-19', 'LANDTAG', '2026-03-22', null, 'Landeswahlleiter Rheinland-Pfalz', 'https://www.wahlen.rlp.de/landtagswahl/terminkalender', 'COMPLETE'),
  ('hb-2025', 'buergerschaft-hh-23', 'BUERGERSCHAFT', null, 'Wahlperiode seit 2025', 'Hamburgische Bürgerschaft', 'https://www.hamburgische-buergerschaft.de/', 'COMPLETE')
on conflict (id) do update set
  parliament_id = excluded.parliament_id,
  election_type = excluded.election_type,
  election_date = excluded.election_date,
  election_date_note = excluded.election_date_note,
  official_election_authority = excluded.official_election_authority,
  official_source_url = excluded.official_source_url,
  source_status = excluded.source_status,
  updated_at = now();

notify pgrst, 'reload schema';
