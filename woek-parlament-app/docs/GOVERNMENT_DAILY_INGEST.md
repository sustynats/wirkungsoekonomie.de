# Daily-Ingest der Regierungs-Wirkungsanalysen

Der Prozess liest fachlich freigegebene Tagesübergaben aus Dropbox, validiert sie gegen das WÖkImpactCase-Schema 2.0.1 und veröffentlicht nur dann, wenn sämtliche Daten-, Fach-, Darstellungs- und Re-Audit-Gates grün sind.

## Eingabe

Standardordner:

`/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/analysis/`

Je Datum müssen gemeinsam vorliegen:

- `GOVERNMENT-DAILY-YYYY-MM-DD.jsonl`
- `GOVERNMENT-DAILY-YYYY-MM-DD.md`
- `GOVERNMENT-DAILY-SOURCES-YYYY-MM-DD.md`

Die JSONL-Datei ist die maschinenlesbare Fachquelle. Die Markdown-Dateien bleiben als vollständige Fach- und Quellenübergabe erhalten. Bestehende `GOVERNMENT-IMPACT-CASES-WAVE-*` bleiben Bestandsquellen und werden vom Daily-Ingest nicht still in ein neues Schema umgeschrieben.

## Ablauf

1. Vercel Cron ruft täglich `/api/cron/government-daily-impact-ingest` auf.
2. Der Server liest alle drei Tagesdateien und bildet für jede Datei einen SHA-256-Hash.
3. Jeder Datensatz wird unverändert gegen `WOEK-IMPACT-CASE-SCHEMA-2.0.1.json` geprüft.
4. Identität, Versionsfolge, Quellen, Boundary Review und Objektverknüpfungen werden geprüft.
5. Technisch gültige Fachfassungen werden mit vollständiger Historie in den geschützten Dropbox-State übernommen.
6. Fehler und Overmerge-Verdachtsfälle werden in `review-queue.json` geschrieben. Bestätigte Datenfehler werden an `GOVERNMENT_DATA_1.2_PLUS` geroutet.
7. Nur bei vollständig grünen Deployment-Gates wird der Production-Deploy-Hook angefordert.
8. Beim Build materialisiert `scripts/sync-approved-government-impact-cases.mjs` den letzten freigegebenen Stand für Portal, Suche und Sitemap.

## Geschützter Betriebszustand

Standardordner:

`/WOEK/WOEK-REGIERUNG-WIRKUNG-FACHRELEASE-2.0/technical-ingest/`

Dort entstehen:

- `daily-ingest-state.json`: Ledger und vollständige Versionshistorie
- `review-queue.json`: offene fachliche, technische und Datenqualitätsaufgaben
- `coverage.json`: getrennte Fakten- und Wirkungsabdeckung
- `reports/GOVERNMENT-DAILY-INGEST-REPORT-YYYY-MM-DD.md`: Tagesbericht

Eine unveränderte Datei wird nicht erneut importiert. Derselbe Dateiname mit verändertem Hash stoppt den Lauf und erzeugt eine Review-Aufgabe.

## Server-seitige Konfiguration

Erforderlich:

- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_REFRESH_TOKEN`
- `CRON_SECRET`
- `DISCORD_BOT_TOKEN`
- `DISCORD_REVIEW_RECIPIENT_USER_ID`

Optional beziehungsweise erst bei fachlicher Freigabe:

- `DROPBOX_GOVERNMENT_ANALYSIS_PATH`
- `DROPBOX_GOVERNMENT_INGEST_STATE_PATH`
- `GOVERNMENT_DAILY_PRODUCTION_DEPLOY_HOOK`

Keine dieser Variablen darf mit `NEXT_PUBLIC_` beginnen.

## Aktuelle Sperre

Government Data 1.1 ist wegen bestätigter P0-Overmerges nicht produktionsfähig. Die Datei `data/government/impact-cases/deployment-gates.json` steht deshalb vollständig auf `FAIL`. Das ist ein beabsichtigter fail-closed Zustand: Die Automatik darf prüfen und Review-Aufgaben erzeugen, aber weder Regierungsseiten freischalten noch einen Production-Deploy anfordern.
