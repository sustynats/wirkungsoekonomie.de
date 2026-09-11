# Gemeinsamer Vertrag für Recherchequellen - 11.09.2026

Der Bridge-3-Umschlag erlaubte bislang beliebige Objekte in `research_sources`.
Die spätere Quellenprüfung verlangte dagegen benannte Felder und ein überprüfbares
Originalzitat. Dadurch konnte eine formal akzeptierte ChatGPT-Ausgabe erst beim
Import an `BRIDGE_SCHEMA_INVALID:$[0]` scheitern.

`research-source-schema.mjs` ist nun die gemeinsame Definition für den
Nachrichtenumschlag und die Quellenprüfung. Neue Jobprompts und technische
Korrekturaufträge enthalten dieselben Vorgaben. Fehlende und unbekannte Felder
werden mit vollständigem JSON-Pfad ausgewiesen. Originalinputs, Hashes, ACKs und
bereits abgeschlossene Beiträge werden nicht verändert.

Pflichtfelder je ergänzender Quelle: `source_id`, `url`, `title`, `publisher`,
`source_function`, `quote`, `supports`; optional `published_at`.
`quote` ist ein echter Originalauszug, keine Paraphrase. Der vorhandene Abruf- und
Zitatabgleich bleibt erhalten. `sources` bleibt an die ursprünglichen IDs/URLs
gebunden; zusätzliche recherchierte Quellen gehören in `research_sources`.

Die neun bereits zurückgegebenen Ausgaben werden im bestehenden Repair-Lifecycle
redaktionell überarbeitet. Eine automatische Umbenennung von `excerpt` zu `quote`
wäre fachlich falsch und findet nicht statt. Lieferung, unabhängige semantische
Prüfung und Veröffentlichung bleiben getrennte Schritte.
