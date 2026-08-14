# WÖk-KI Capabilities

Stand: 2026-08-14. Die „WÖK-KI" ist **kein** generischer Chatbot, sondern ein quellengebundenes, WÖk-methodisches System — und sie existiert derzeit in **zwei getrennten Implementierungen** plus mehreren Frontends.

## Implementierung 1: WÖk-Kern-API auf Oracle (führend für die Website)

- Basis: `https://130.162.217.58.sslip.io` (Override `window.WOEK_API_BASE`); Server-Code **nicht** im Website-Repo (Codex-Lane).
- Endpoints: `POST /api/woek-ai` (Frag die WÖk), `POST /api/factcheck` (Faktencheck/Wirkungscheck inkl. Bild-Beleg), `POST /api/product-check` (Produktcheck mit Wirkungsscore, SDG-Bezug, Reverse Merit Order), `POST /api/feedback` (👍/👎), `POST/GET /api/share-result` (Permalinks), `POST /api/community/discord-token`, `GET /api/community/status`.
- Auth: keine Pflicht; optional Discord-Bearer; anonyme `X-WOEK-Client-ID` (localStorage). Kein Account nötig.
- Frontends: `/app/` (PWA, 3 Tabs), `/woek-ki/` (Beta-Chat), `/werkzeuge/faktencheck/`, Wirkungscheck-V3 (Opt-in-Vertiefung).
- Besondere WÖk-Fähigkeiten: Folgen-vor-Fakten-Methodik (Truth-Sandwich), Quellenangaben aus Website/Bibliothek/Glossar/Dossiers, Produktcheck mit RMO-Logik, Feedback-Rückkanal in die Redaktions-Qualitätsschleife (Akademie-Cockpit pollt `/api/feedback`).

## Implementierung 2: `/api/ki-beta` in der Akademie-App

- RAG über `data/woek-search-index.json` (Spiegel des Website-Suchindex, ~29k Einträge) via `lib/woek-ai/retrieval.ts` + Hosted-LLM `lib/woek-ai/hostedProvider.ts` (OpenAI-kompatibel: Together AI default, OpenRouter/Fireworks-Fallback, Modell-Fallback-Liste, Retrieval-only ohne API-Key). CORS für die Hauptwebsite freigegeben. Frontend `/ki-beta` (Akademie).

## Privacy-Architektur (bewährt, für alle neuen Produkte übernehmen)

Regelbasierte **lokale** Auswertung zuerst; KI nur als **freiwillige Vertiefung** nach aktiver, nicht vorausgewählter Einwilligung. Referenzimplementierung Wirkungscheck V3 (`docs/wirkungscheck-v3/WOEK_AI_V3.md`): erlaubter Kontext = Thema/Ziel/Ansatz/Engpass/rote Linien/Erfolgssignale/Praxiskontext; **verboten** = Partei, Fraktion, E-Mail, Name, CiviCRM-ID, Präferenz-Scores, Freitext, personenbezogene Zuordnung. V1 hatte sogar CSP `connect-src 'none'` (technisch offline).

## Grenzen (dokumentiert in `api/v1/capabilities/`)

„Keine Personenbewertung, kein Social-Credit"; KI schreibt keine offiziellen Voten/Empfehlungen — redaktionelle Freigabe bleibt menschlich (für das Parlament-Portal zwingend: `EDITORIAL_REVIEW_REQUIRED` statt Auto-Änderung).

## Shared-Service-Befund (§22 Bootstrap)

Es gibt faktisch **zwei parallele KI-Backends** (Oracle-Kern vs. Akademie-RAG) und **drei Chat-Frontends** (`/app/`, `/woek-ki/`, Akademie `/ki-beta`) mit unterschiedlicher Wissensanbindung. Vor dem Parlament-Portal ist zu entscheiden (Codex + Natalie): Welche Implementierung ist der kanonische `WoekAiService`, und wie werden Kontexte (`PARLIAMENT_CASE`, `PRODUCT_ANALYSIS`, `ACADEMY`, `IMPACT_CHECK`, `GENERAL_WOEK`) darauf abgebildet? → `CROSSCHECK.md`, `DUPLICATION_AND_TECH_DEBT.md` (MISSING_SHARED_SERVICE).

Offene Codex-Verifikation: Systemprompt/Wissensquellen/Speicherverhalten des Oracle-Services (Server-Repo nicht lokal); Status `api/kwi.py`-Deployment; ob `/api/factcheck` von der Akademie-App genutzt wird (derzeit: nein, nur `/api/feedback`).
