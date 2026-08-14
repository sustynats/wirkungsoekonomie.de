# Data Model

`ParliamentaryCase` und `DecisionUnit` sind getrennt: Ein Vorgang kann mehrere entscheidungsrelevante Einheiten enthalten. Jeder Datensatz trägt von Anfang an `parliament_id`, `jurisdiction` und `legislative_term`.

| Entität | Zweck |
|---|---|
| `parliaments` | Parlament und Zuständigkeitsraum |
| `parliamentary_cases` | DIP-Vorgang, Workflow und Entscheidungsdatum |
| `decision_units` | separat prüfbare Regelungs- oder Beschlusseinheit |
| `source_documents` | Original-URL, Herausgeber, Datum, Hash, Abrufzeit |
| `document_versions` | Fassung, Diff-Auswirkung, finale Abstimmungsfassung |
| `case_knowledge_entries` | zeitgebundene Evidenz für Rückschauen |
| `raw_observations` | unveränderliche Rohdaten mit Quelle, Einheit und Zeitseite |
| `calculation_records` | versionierte Wirkungsbuchhaltung je berechenbarem Aspekt |
| `historical_decision_reviews` | Ex-ante-/Ex-post-Rückblick und Lernschleife |

Die Migration `woek-parlament-app/supabase/migrations/202608140001_parliament_core.sql` erzwingt für `RETROSPECTIVE_CASE` die Grenze `AS_KNOWN_ON_DECISION <= decision_date < POST_DECISION`. Das verhindert Rückschaufehler serverseitig.

Die Calculation-Schicht erweitert diese Garantie auf numerische Rohdaten und
liefert die Details in [CALCULATION_DATA_MODEL.md](CALCULATION_DATA_MODEL.md).
