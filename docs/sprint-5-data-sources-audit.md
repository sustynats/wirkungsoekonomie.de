# Sprint 5 Data Sources Audit

Stand: 2026-05-22.

## Umgesetzt

- Datenqualitätsmodell A-F erstellt: `content/data/data-quality-levels.json`.
- Externe Datenquellen-Registry erstellt: `content/data/external-data-sources.json`.
- Produktdaten, Unternehmensdaten, ESG-/Ratingmethodiken, öffentliche Daten, Politik/Gesetze und Medien/Öffentlichkeit strukturiert erfasst.

## Quellenstatus

- Open Food Facts, EPREL, Eurostat, UN SDG Data, Destatis, UBA, Bundestag/DIP und EUR-Lex sind als öffentliche Anschlussräume vorbereitet.
- GS1, EPD, CDP, ESG-Ratinganbieter und proprietäre Datenquellen brauchen Lizenzprüfung.
- DPP/ESPR und ESAP sind perspektivisch, nicht als verfügbare Live-Daten behauptet.

## Datenqualitätslogik

- A: geprüfte Primärdaten.
- B: Berichts- oder Auditdaten.
- C: offene Datenbank / offizieller Standard / öffentliches Register.
- D: Branchenbenchmark / Kategorieannahme.
- E: unvollständige Annahme.
- F: keine belastbare Datenbasis.

## Offene Punkte

- API-Endpunkte vor produktiver Anbindung einzeln prüfen.
- Lizenzmatrix für Datenquellen ergänzen.
- Quellenversionierung und Caching-Regeln definieren.
