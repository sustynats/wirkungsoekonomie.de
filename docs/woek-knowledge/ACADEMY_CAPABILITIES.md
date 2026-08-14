# Academy Capabilities — Akademie der Wirkungsökonomie

Stand: 2026-08-14 · Quelle: Vollinventur Repo `woek-akademie-app` (Branch main) + Live-Check `akademie.wirkungsoekonomie.de` (HTTP 200).
Eigenes Repo/Deployment: Next.js (App Router) auf Vercel (Projekt `woek-akademie-app`), Supabase-Projekt `fganranxrdyewbjpvubx` (geteilt mit Institut), Domain per IONOS-CNAME.

## Lehrgänge (Quelle: `lib/curriculum/seed.ts` — statischer Seed, kein CMS)

| Track | Umfang | Status |
|---|---|---|
| **WÖk-G Grundstudium** (`woek-g`) | 9 Studienabschnitte G1–G9, 36 Module, 108 Vorlesungen, 9 Zwischenprüfungen, Praxisprojekt, 4 Abschlussprüfungen (AP1–AP4) | PRODUCTION (Struktur); **nur 8/108 Vorlesungen published mit echtem Skript** (V01–V22 in 3er-Schritten → `content/v2/stufe-1..2/`), Rest `planned` mit Platzhalter |
| 11 Aufbaupfade WÖk-A2…A12 (Wirkungsmanagement, Produktion/Lieferkette, Politik/Verwaltung, Finanz/Steuer, Bildung, Gesundheit, Handwerk, Medien, Kultur, IT/KI, Beratung) | je 1 Teil, 4 Module, 12 Vorlesungen | PLANNED (alles Platzhalter) |
| WÖk-M Meisterstufe (Ph.WÖk) | 1 Teil, 3 Module, 0 Vorlesungen | PLANNED |

**Nicht im Code gefunden** (aktiv per Volltextsuche verifiziert): „Impact-Controlling"-Kurs, „Multiplikatoren", „Demokratie-Kurse", „Unternehmenslehrgänge", Flag `isOpenSelfStudy`. Diese existieren als Konzepte/Handoffs außerhalb dieses Repos → `KNOWLEDGE_GAPS.md`.

## Kernfunktionen

- **Einschreibung/Bewerbung**: `lib/admissions.ts` — Staff-Rolle → `enrollments` → Legacy-Bestand → `track_applications` (pending/approved/rejected); Freigabe durch Leitung unter `/dozentin/bewerbungen`. Kein Self-Enrollment ohne Freigabe.
- **Prüfungs-Engine** (portierbar, domänen-neutral): `lib/curriculum/assessment-engine.ts` + State Machine + Attempt-Policy — 9 Fragetypen, deterministisches Autograding, Blueprint 30/30/25/15, Bestehensgrenze 70 %, 3 Versuche → zwingend `instructor_review_required` (nie Auto-Exmatrikulation), Dozent-Entscheidungen mit Audit-Log.
- **Zertifikate**: Öffentliche Verifikationsroute `/zertifikat/[certificateCode]` liest Tabelle `certificates` — **aber keine Ausstellungslogik implementiert** (kein INSERT irgendwo; zwei parallele ungenutzte Schemata `certificates`/`learning_certificates`). Nur berechneter Status-String via `/api/me/certificate-status`. Bewusste spätere Ausbaustufe lt. `docs/dozentinnen-dashboard-konzept.md`. → Lücke in `KNOWLEDGE_GAPS.md`.
- **Lernfortschritt**: `user_progress` (Skript/Video/Quiz/Transfer je Vorlesung) + sequenzielle Freischaltung; Legacy-Systeme `module_progress`, `legacy_progress` (migriert via Migration 0018).
- **Karteikarten/Selbsttests**: NICHT vorhanden (nur bewertete Assessments/Modulkurztests derselben Engine).
- **Bibliothek**: `/bibliothek` aus `data/main-library.json` (Spiegel der Website-Bibliothek).
- **Suche/Glossar/KI**: `data/woek-search-index.json` (gespiegelt aus Website `assets/search/search-index.json` via `scripts/sync-knowledge-index.mjs` vor jedem Build) + `/ki-beta` (RAG `lib/woek-ai/retrieval.ts` + Hosted-LLM `lib/woek-ai/hostedProvider.ts`, OpenAI-kompatibel: Together AI default, OpenRouter/Fireworks-Fallback, Retrieval-only ohne Key).
- **KWI-API**: `GET /api/kwi` — Live-Scraping sdg-portal.de, berechnet Mensch/Planet/Demokratie-Index je Kommune, CORS für Hauptwebsite. (Zweitimplementierung neben Website-`api/kwi.py` → `DUPLICATION_AND_TECH_DEBT.md`.)
- **Analytics**: `/api/site-event` (Ingest auch für Hauptwebsite via CORS, anonymisiert SHA-256, Vercel-Geo-Header), `/api/academy-event`, `/api/discord-analytics/ingest` (Bearer-Token, gefüttert vom externen „Oracle"-Discord-Bot). Supabase-Tabellen `site_events`/`site_sessions`/`site_daily_stats` + Akademie-/Discord-Analytics.
- **Community-Einreichungen** (wiederverwendbares Muster „Einreichung → Moderation → Veröffentlichung"): `/fragen/einreichen` (`question_submissions`, Rate-Limit, leichter Discord-OAuth nur `identify`) und `/narrativ-einreichen` (Debatten-Kompass, `narrative_submissions`) mit Moderations-Queues unter `/dozentin/*`.
- **Dozent-/Leitungsbereich**: zwei parallele UIs — `/dozent/*` (Prüfungs-Review, Rollen instructor+) und `/dozentin/*` (Leitungs-Dashboard, Bewerbungen, Fragen, Narrative, Qualitäts-Cockpit `review_tasks` + WÖk-KI-Feedback vom Oracle-Endpoint `/api/feedback`, Analytics, Task-Inbox mit `instructor_task_closures`).

## Rollen & Auth

- Rollen `student | instructor | dozent | admin` aus **Discord-Rollen** (serverseitig via Bot geprüft, `lib/discord.ts`) + manuelle Overrides (`user_access.discord_roles_snapshot.appRoleOverrides`, `/api/admin/users/[id]/roles`).
- Auth-Provider: **nur Discord** (Supabase OAuth). **LinkedIn ist NICHT implementiert** (nur Konzeptnotiz in `docs/discord-setup-anleitung.md`).
- Guard-Muster: `requireUser/requireAcademyAccess/requireTrackEnrollment/requireDozentAccess/requireAkademieLeitung` (Server Components) + `requireApi*` (Route Handlers) — sauber getrennt, wiederverwendbar.

## Öffentliche APIs der Akademie

`GET /api/curriculum`, `/api/curriculum/[trackCode]`, `/api/curriculum/[trackCode]/[partCode]` (öffentliches Curriculum-JSON) · `POST /api/ki-beta` (CORS für Hauptwebsite) · `GET /api/kwi` · `POST /api/site-event` · `GET /api/me/*` (Studierenden-API, Cookie-Auth) — vollständige Routenliste in der Agenten-Inventur, Schlüsselpfade unten.

## Bekannte Drift (wichtig!)

`lib/curriculum/service.ts` liest **ausschließlich `CURRICULUM_SEED`**, nie die DB — die Admin-APIs (`/api/admin/lectures/[id]` u.a., Migration 0009–0013) schreiben in Tabellen, die das Frontend nicht zurückliest. `videoUrl` ist im Seed durchgängig `null` → im neuen System ist aktuell **kein einziges Video verdrahtet** (echte Videos nur in Legacy `lib/academy/legacy.ts`). → `DUPLICATION_AND_TECH_DEBT.md` (MISSING_ABSTRACTION), Codex-Verifikation in `CROSSCHECK.md`.

## Supabase (19 Migrationen, Tabellenkurzliste)

`users`, `user_access`, `cohorts`, `course_versions`, alte Teil-1/2-Strukturen (`academy_parts`, `modules`, `module_progress`, `content_items`, `content_progress`, 2 Alt-Prüfungsschemata), `certificate_types`/`certificates` (alt) · Analytics (`site_events`, `site_sessions`, `site_daily_stats`, `academy_login_events`, `academy_activity_events`, `academy_presence`) · `narrative_submissions`, `question_submissions`, `legacy_progress`, `review_tasks` + Audit · **Curriculum v2** (`curriculum_versions`, `tracks`, `curriculum_parts`, `curriculum_modules`, `lectures` inkl. `video_url`, `assessments`, `user_progress`, `assessment_attempts`, `project_submissions`, `learning_certificates`, `discord_role_mappings`) · Prüfungs-Backend (`question_pools`, `questions`, `question_options`, `question_correct_answers`, `assessment_attempt_answers`, `student_assessment_statuses`, `instructor_decisions`, `enrollments`, `audit_logs`) · `instructor_task_closures`, `discord_server_events/-snapshots`, `track_applications`, `academy_notifications`, `academy_messages`.
RLS: eigene Zeilen für Nutzertabellen; Leitungs-Policies für Review/Applications; viele Tabellen bewusst Service-Role-only. **Keine Edge Functions in diesem Repo** (kein `supabase/functions/`).

## Wiederverwendbar für andere WÖk-Produkte (u.a. Parlament)

1. Auth-/Rollen-Engine (`lib/auth.ts`, `lib/access.ts`, `lib/discord.ts`, `middleware.ts`)
2. Prüfungs-/Quiz-Engine (komplett, domänen-neutral)
3. Zertifikats-Verifikationsmuster (Route + Schema; Ausstellung fehlt)
4. Wissens-Retrieval/Glossar-Suche (`lib/woek-ai/retrieval.ts` über JSON-Index)
5. KI-Client mit Multi-Provider-Fallback (`lib/woek-ai/hostedProvider.ts`)
6. Analytics-Ingest-Muster (Anonymisierung, CORS-Whitelist, Zeitzonen-Buckets)
7. Instructor-Task-Aggregation (heterogene Quellen → eine priorisierte Inbox)
8. Einreichungs-/Moderations-Muster (Bürger:innen-Eingabe → Redaktion → Veröffentlichung)

Env-Variablen-Namen (ohne Werte) und vollständige Routenliste: siehe Inventur-Anhang; Schlüsselpfade: `lib/curriculum/*`, `lib/woek-ai/*`, `lib/kwi/collector.ts`, `supabase/migrations/0001–0018`, `app/api/**`.
