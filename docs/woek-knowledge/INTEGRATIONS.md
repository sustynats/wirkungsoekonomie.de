# Integrations — Schnittstellen des WÖk-Ökosystems

Stand: 2026-08-14 · Maschinenlesbar: [`integration-registry.yaml`](integration-registry.yaml) (mit `last_verified`, `privacy_class`, Status).

## Das Wichtigste in Kürze

- **Öffentliche Lese-API der Website**: „WÖk Core Static API" `wirkungsoekonomie.de/api/v1/` — rein statisch generierte JSON-Snapshots (capabilities, glossary, methods, canvases, search-Metadaten, sdg-plus, wirkungsradar inkl. Distribution-Kits und Embed-Formaten). Kein Server, kein Auth, keine Query-Verarbeitung. Generator: `scripts/api/build-core-api-manifest.mjs`.
- **Dynamik ist konsequent ausgelagert** (bestätigt Architekturprinzip „Pages=statisch"):
  - **Oracle-VM** (`130.162.217.58.sslip.io`): KI/Faktencheck/Produktcheck/Feedback/Share/Community-Auth (Details `WOEK_AI_CAPABILITIES.md`).
  - **Supabase** (`fganranxrdyewbjpvubx`): Edge Function `site-event` (Website-Analytics) + Akademie-Datenbank (PII/System of Record).
  - **Akademie-Subdomain**: Konto/Merkliste (`/api/me[/saved]`), Curriculum-JSON, KI-Beta, KWI-Live, Zertifikatsprüfung, Community-Einreichungen, eigener Analytics-Ingest.
  - **Institut-Subdomain**: `GET /api/quellen` — einzige Quelle des Quellenarchiv-Spiegels (build-seitig, wöchentlicher Auto-Sync-PR).
  - **GitHub Releases** (`woek-public-assets-v2`): CDN für große Medien/Dokumente; Policy-Gate `scripts/assets/check-release-assets.mjs`, Registry `assets/data/public-release-assets.json`.
  - **Discord**: Community-OAuth (implicit flow) + Journal-Webhook-Posting (Cron alle 30 Min).
- **Amtliche Daten**: Bundeswahlleiterin-CSVs (Wahlkreis-Strukturdaten, Datenlizenz DE 2.0, build-seitig). **Keine DIP-/Bundestag-Integration** — nur vorbereiteter Registry-Eintrag in `content/data/external-data-sources.json` → Kernlücke fürs Parlament-Portal.
- **Vorbereitet, nicht live**: CiviCRM + LimeSurvey + Invitation-Service + Analytics-Dienst für MdB-Dialog (`ops/wahlkreis-wirkungscheck/`, nur lokal; Produktivversand erfordert Vier-Augen-Freigabe `CONFIRM PRODUCTION SEND`); IONOS-SMTP nur Konzept; kein Newsletter-Anbieter, keine POST-Kontaktformulare (mailto).

## Deploy & CI (Website-Repo)

- `deploy.yml`: Pages-Workflow-Modus — Node 22 + Python 3.12, `npm run build` (>150 Skripte: Bibliografie→Onlinefassungen→Glossar→Quellenarchiv→Portale→Wirkungsradar→i18n→Suchindex→Taxonomie→API-Manifest→Header/Footer-Normalisierung→QA-Gates), `build:artifact` → `_site` (nicht committet), `check:privacy` (scannt auf lokale Pfade/Token/JWT-Muster), `check:size`.
- `pr-quality.yml`: Gate — Suchindex/Taxonomie müssen aktuell committet sein (`git diff --exit-code`), voller Build + Privacy-/Link-/Size-Checks.
- `quellenarchiv-sync.yml` (wöchentlich, Auto-PR) · `discord-journal-rss.yml` (30-Min-Cron, State in eigenem Branch).
- `package.json`: bewusst **0 npm-Dependencies** (Vanilla Node + Python-Stdlib/pip für PDF/Excel).

## Sicherheits-/Privacy-Beobachtungen (für SECURITY-Arbeit vormerken)

1. `admin/`, `_debug/`, `intern/` sind technisch öffentlich (nur `noindex`, kein Auth; robots.txt disallowt sie NICHT) — echte Redaktionsfunktionen liegen zum Glück in der login-geschützten Akademie-App; trotzdem Härtungsbedarf dokumentiert.
2. Zwei parallele Analytics-Ingests (Supabase-Edge-Fn ← Website `main.js` vs. Akademie `/api/site-event`) — Kanonisierung offen.
3. Oracle-Endpoints ohne Rate-Limit-Doku; anonyme Client-ID; optionaler Discord-Bearer. Serverseitige Details (Repo, Limits, Logging) nur Codex bekannt.
4. Externe Dokumente/Community-Eingaben als untrusted input behandeln (Wirkungsradar-Einreichungen laufen durch Akademie-Moderation).
