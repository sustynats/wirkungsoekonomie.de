# WÖk v1.1 Migration - Abschlussbericht

Stand: 2026-05-24
Status: Entwurf / Referenzordnung 1.1 vorbereitet

## 1. Geänderte Dateien

- `scripts/import/build-mainwork-reference.py`
  Generatorlogik für die Online-Referenz auf `2026.2-live-reference` gestellt und Metadaten-Overrides für Teil XV, Teil XVII sowie Kapitel 17, 96 und 99 ergänzt.

- `src/data/glossary.terms.yml`
  Glossarstruktur um die v1.1-Begriffsbasis ergänzt, insbesondere NWI, WStG/WUStG, Wirkstoff, Wirkungspotenzial, Netto-Wirkung, positive Netto-Wirkung, T-SROI, SDG+, Wirkungsgrenze, Wirkungswahrheit und Wirkungsarchitektur.

- `assets/js/glossaryTerms.js`
  Hoverdefinitionen und clientseitige Begriffserklärungen aktualisiert. Die Definitionen folgen jetzt der Regel: Wirkung ist neutral; Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.

- `referenz/index.html`, `referenz/kapitel/index.html`, `referenz/teile/index.html`, relevante Teil- und Kapitelseiten
  Sichtbare Metadaten für Teil XV, Teil XVII, Kapitel 17, Kapitel 96 und Kapitel 99 korrigiert.

- `public/data/content-manifest.json`
  Teil- und Kapitelmetadaten an die korrigierte Referenzordnung angepasst.

- `assets/search/search-index.json` und `public/data/woek-search-meta.json`
  Bestehenden Suchindex neu aufgebaut und WÖk-Inhalte mit korrigierten Begriffen, Routen und Metadaten reintegriert. Es wurde keine zweite Suche eingeführt.

## 2. Neu erstellte Dateien

- `docs/migration/WOeK_Migrationsmatrix_v1.1.md`
- `docs/gesetze/WStG_2.0_Wirkungssteuerrahmengesetz_Entwurf.md`
- `docs/gesetze/WUStG_Technische_Leitlinien_v2.1_Entwurf.md`
- `docs/whitepaper/T-SROI_v2.0_Transformationswirkung.md`
- `docs/grundlagen/Historische_Dokumente_Hinweis_v1.1.md`
- `docs/grundlagen/Wirkungsoekonomie_Kurzfassung_v1.1.md`
- `docs/grundlagen/Manifest_Kurzfassung_v1.1.md`
- `docs/praxis/Praxisanhaenge_v1.1_Updatehinweise.md`
- `docs/changelog/2026-05-woek-v1.1-migration.md`
- `docs/migration/WOeK_v1.1_Abschlussbericht.md`

## 3. Historisch markierte Dokumentgruppen

Die alten Grundsatz-, Manifest- und politischen Fassungen wurden nicht gelöscht. Sie sind in der Migrationsmatrix und im historischen Hinweis als frühere Entwicklungsstände klassifiziert:

- Grundlagenpapier Wirkungsökonomie
- WÖk-Manifest / Minifest
- WÖK-Partei / politische Programmatik
- NATS WÖk allgemein
- ältere Präsentations- und Leitbildfassungen

Für künftige Begriffsverwendung gilt der Führende Begriffsleitfaden der Wirkungsökonomie v1.0, Stand 2026-05-21.

## 4. Behobene Begriffsprobleme

- Wirkung wird in neuen und aktualisierten Texten neutral und relational definiert.
- Zielgröße ist positive Netto-Wirkung, nicht einfach Wirkung.
- T-SROI wurde von Netto-Wirkung getrennt und als Transformationskennzahl neu gefasst.
- NWI wurde als operative Netto-Wirkungskennzahl ergänzt.
- SDG+ wird als transparente WÖk-Erweiterung formuliert, nicht als offizielle UN-Kategorie.
- Wirkstoff wird nur als didaktische Analogie für einen Auslöser mit Wirkungspotenzial beschrieben.
- Reverse Merit Order und Nichtkompensation werden als Schutz gegen beliebige Verrechnung geführt.
- Social-Credit-Abgrenzung wurde in den neuen Gesetzes-, Praxis- und Grundlagentexten verankert.

## 5. Rechtliche und methodische Neuausrichtung

Das WStG wurde nicht fortgeschrieben, sondern als `WStG 2.0 - Wirkungssteuerrahmengesetz` neu aufgesetzt. Es ist jetzt ausdrücklich Rahmenarchitektur und Entwurf, nicht Vollmechanik aller Einzelsteuern.

Die WUStG-Leitlinien wurden als v2.1-Zielarchitektur vorbereitet. Sie trennen FinalScore, NWI und T-SROI, stärken Datenqualität, Einspruch, KMU-Schutz, Kaufkraftschutz, Pilotierung und EU-rechtliche Vorsicht.

Das T-SROI-Whitepaper wurde als v2.0 neu ausgerichtet: NWI bewertet operative Netto-Wirkung; T-SROI bewertet Transformationswirkung auf Basis geprüfter Netto-Wirkung.

## 6. Offen / manuell zu prüfen

- Die binären Original-PDFs wurden nicht verändert.
- Die alten PDF-/DOCX-Originale müssen bei einer späteren Redaktionsrunde einzeln gegen die Migrationsmatrix geprüft werden.
- Die neuen Markdown-Fassungen sind Entwürfe und benötigen juristische, steuerfachliche und methodische Prüfung.
- Tabellen aus alten PDF-Importen bleiben dort, wo sie technisch beschädigt importiert wurden, weiterhin Kandidaten für manuelle Rekonstruktion.
- Die Suchperformance sollte zusätzlich im Browser geprüft werden, insbesondere weil der bestehende Index sehr groß ist.

## 7. Ausgeführte Checks

- `node scripts/glossary/build-glossary-registry.mjs`
- `node scripts/glossary/build-term-links.mjs`
- `node scripts/glossary/build-glossary-pages.mjs`
- `python3 tools/build_search_index.py`
- `node scripts/search/build-woek-search-index.mjs`
- `node --check assets/js/glossaryTerms.js`
- `python3 -m py_compile scripts/import/build-mainwork-reference.py`
- `node scripts/glossary/check-glossary-alphabetical.mjs`
- `node scripts/quality/check-search-integration.mjs`
- `node scripts/review/check-current-terminology.mjs`

Hinweis: Ein versehentlicher `node --check` auf die Python-Datei wurde verworfen und korrekt durch `python3 -m py_compile` ersetzt.

## 8. Ergebnis

Die Version 1.1 ist als Referenzordnung vorbereitet: Migrationsmatrix, neue Gesetzesarchitektur, WUStG-Update, T-SROI-Neuausrichtung, historische Kennzeichnung, Praxis-Updatehinweise, Glossar-/Hover-Basis, korrigierte Website-Metadaten, aktualisierter Suchindex und Changelog liegen vor.

Phase 1 bleibt statisch. Nicht umgesetzt wurden Kommentare, Discord-Login, Backend, Datenbank, serverseitige Exporte oder ein neuer Suchdienst.
