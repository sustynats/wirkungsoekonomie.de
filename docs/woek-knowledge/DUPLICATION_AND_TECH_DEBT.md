# Duplication & Tech Debt

Stand: 2026-08-14. Nur Dokumentation — **kein** sofortiges Refactoring. Kategorien: DUPLICATED_FUNCTION | DUPLICATED_CONTENT | DUPLICATED_DATA | LEGACY_API | DEPRECATED_TOOL | MISSING_ABSTRACTION | MISSING_SHARED_SERVICE.

## MISSING_SHARED_SERVICE (strategisch wichtigst)

1. **Zwei KI-Backends, drei Chat-Frontends**: Oracle `/api/woek-ai` (+`/app/`, `/woek-ki/`) vs. Akademie `/api/ki-beta` (RAG+Together) — kein gemeinsamer `WoekAiService` mit Kontexten. → Entscheidung vor Parlament-Portal.
2. **Zwei Analytics-Ingests**: Supabase-Edge-Fn `site-event` (Website `main.js`) vs. Akademie `/api/site-event` (+academy-event, discord-ingest). Kanonisierung offen.
3. **Zwei KWI-Berechner**: Website `api/kwi.py` (Deployment unklar) vs. Akademie `/api/kwi` (Live-Scraping einer **abgeschalteten** Quelle) + statische Snapshots. Quellen-Migration „Portal Nachhaltige Kommunen" nötig.

## MISSING_ABSTRACTION

4. **Akademie Seed-vs-DB-Drift**: `lib/curriculum/service.ts` liest nur `CURRICULUM_SEED`; Admin-APIs schreiben in DB-Tabellen (`lectures.video_url` u.a.), die das Frontend nie liest — Admin-Edits wirkungslos. Zertifikats-Ausstellung fehlt komplett (2 ungenutzte Schemata).
5. **Frontend-Doppellogik gegen denselben Endpoint**: `faktencheck.js` vs. `woek-app.js` implementieren Render/Progress/Share doppelt gegen `/api/factcheck` (gemeinsam nur `woek-ai-client.js` für woek-ai/feedback).

## DUPLICATED_FUNCTION / DEPRECATED_TOOL

6. **Wirkungscheck-Versionswirrwarr**: V1 verwaist (Code da, im HTML nirgends eingebunden; im alten Branch-Checkout noch „live"), V2 = Holding-Page (`werkzeuge/wirkungscheck-bundestag-v2/`), V3 = Pilot auf der V1-URL. Ziel-Route lt. Konzept (`/werkzeuge/bundestag-wirkungscheck/`) existiert nicht. Abschaltplan dokumentieren.
7. **Totes JS-Duplikat**: `assets/js/woek-community-auth.js` (0 Referenzen) ≡ byte-identisch `-v2.js` (aktiv) — sicherer Löschkandidat.
8. **Zwei Suchindex-Builder**: `scripts/search/build-woek-search-index.mjs` (aktiv) vs. `tools/build_search_index.py` (nur noch via `check:links`).
9. **Erleben-Paare**: `produktwirkung.html` vs. `produktwirkungsrechner/`; `medienwirkung.html` vs. `medienwirkungscheck/`; `erleben.html` vs. `erleben/` (zwei fast gleiche Hubs, kein Redirect, Content-Drift-Risiko).
10. **13 Methodikseiten laden Rechen-JS ungenutzt** (`impact-calculations.js`+`tool-examples-dashboard.js` ohne `data-tool-example-*`) — halb verdrahtete Tool-Absicht (u.a. `wirkungsrisiko-matrix`).

## DUPLICATED_CONTENT

11. **Gesundheit doppelt**: `wirkungsfelder/gesundheit/` UND `gesundheit-pflege/` beide live, inkonsistent verlinkt (Hub vs. Footer/Rang 10).
12. **SDG+-Mehrfachbestand**: führend `verstehen/sdgs-sdgplus/` + zwei echte Altseiten (`sdg-plus.html` ≠ `sdg-plus/`) + Redirect-Zoo; `sdg-und-sdg-plus/` redirectet aufs falsche Ziel.
13. **werkzeuge/ vs. wirkungssteuerung/**: gleiche Konzepte doppelt betextet (reverse-merit-order, woek-ids, wirkungsrat, wirkungshaushalt, scorecards, digitaler-produktpass …).
14. **Vier Navigationsstände**: Live-Nav ≠ `templates/header.html` ≠ `bibliothek/index.html`-Nav ≠ `en/`-Nav; Planungsdatei `website-architecture-v21.json` beschreibt eine dritte Wirkungsfelder-Gliederung. Kanonisch: `assets/data/navigation.json` + Normalisierungsskripte.
15. **Zwei Download-Welten**: `downloads.html` vs. `downloads/`; drei Redirect-Aliase auf `ueber.html`; `verstehen.html` vs. `verstehen/` (beide echte Inhalte).
16. **Wirkungsradar-Pfad-Aliase**: `resonanz/`≙`resonanz-kompass/`, `ursachen/`≙`ursachen-navigator/`, `detail/`≙`live/` (Spiegel) — als Alias ok, aber ungeprüft.

## DUPLICATED_DATA / LEGACY_API

17. **`assets/data/document-registry 2.json`** (383 KB, 223 Einträge, reicheres Schema, 0 Referenzen) — verwaistes macOS-Duplikat im Deploy-Pfad; das aktive `document-registry.json` hat nur 12 Einträge. Klären, ob „2" der eigentlich gewollte Datenbestand ist!
18. **Snapshot-Drifts**: `api/v1/glossary.json` (2092) hinter `glossary-lookup.json` (2121); `docs/stage-9-library-versioning.md` (führend=10) hinter Registry-JSON (11); `llms.txt` verlinkt Master Items **v1.2**; `docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md` (13.08.!) nennt Begriffsleitfaden v1.0 als führend. Glossar-Zählungen 2281 (Seiten) vs. 2121 (Lookup) vs. 2092 (API) erklären.
19. **Master-Items-v1.2-Doppelstrang**: ein PDF „ersetzt", eines „aktuell" (`public/downloads/originals/WOeK_Master_Items_final_v1.2.pdf`).
20. **Api-Root dreifach** (`api.json`, `api/index.json`, `api/index.html`) — bewusst lt. Build-Skript, aber 3× derselbe Payload.
21. **Audit-Artefakte im Repo-Root** statt `reports/` (debattkompass_quality_audit.json 2 MB, glossar-bestand-audit.json, qa-report.md, …); `term-registry.json` 18,3 MB als größte Einzeldatei.
22. **SITE-INVENTORY.md veraltet** (19.05.: „keine Build-Pipeline", 103 Blogdateien — real: >150 Skripte, 149 Einträge).

## Sicherheits-Debt

23. `admin/`, `_debug/`, `intern/` (inkl. Obscurity-Hash-Pfad `intern/studio-aufnahme-6f3d9c2a/`) öffentlich erreichbar, nur `noindex`; robots.txt disallowt sie nicht. Redaktions-Realfunktionen liegen in der Akademie-App (gut) — Rest härten oder entfernen.
24. Wahlkreis-Wirkungscheck-Branch-Checkout (`woek-wahlkreis-wirkungscheck/`) hat ~12 200 uncommittete kosmetische Änderungen — Arbeitskopie aufräumen, sonst Fehlschlüsse.
