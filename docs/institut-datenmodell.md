# WÖk-Institut — Datenmodell & Mandantentrennung

Stand: 2026-07-03
Status: **verbindliche Spec** (v1) für alle Institut-Migrationen
Verwandte Docs: `institut-gesamtkonzept.md` (Module) · `institut-arbeitsteilung-claude-codex.md`
(Prozess) · `woek-akademie-app/docs/claude-architecture-handoff.md` (Supabase-Muster) ·
`woek-akademie-app/supabase/migrations/0016_discord_server_analytics.sql` (Discord-Analytics-Muster)

> **Grundsatzentscheidung (mit Natalie abgestimmt):** Das Institut nutzt **dasselbe
> Supabase-Projekt** wie die Akademie, aber mit strikter **Mandantentrennung**. Keine
> Akademie-Tabelle wird verändert. Auth-User werden geteilt (dieselbe Supabase Auth).

---

## 1. Trennprinzip

**Namens-Mandantierung im `public`-Schema:** Alle Institut-Objekte tragen das Präfix
`institut_`. Das ist die reibungsärmste Variante mit dem bestehenden `@supabase/ssr`-Setup und
der PostgREST-Default-Konfiguration (nur `public` exponiert).

- **Regel 1:** Institut-Migrationen erstellen **ausschließlich** `institut_*`-Objekte
  (Tabellen, Views, Policies, Funktionen, Enums mit Präfix `institut_`).
- **Regel 2:** Institut-Migrationen **verändern niemals** Akademie-Objekte (`users`,
  `certificates`, `site_events`, `discord_server_events`, …). Kein `ALTER TABLE` auf fremde
  Tabellen, kein Rename, kein Drop.
- **Regel 3:** Auth ist geteilt. Institut-Tabellen referenzieren `auth.users(id)` direkt (per
  FK oder gespeicherter UUID), **nicht** die Akademie-Tabelle `users`. So bleibt die
  Mitgliedschaft im Institut unabhängig vom Akademie-Lernstatus.

**Dokumentierte Alternative (nicht gewählt):** eigenes Postgres-Schema `institut`. Sauberste
Kapselung, aber erfordert PostgREST-Schema-Exposure + angepasste Client-Konfiguration in der
App. Falls das Institut später sehr groß wird, ist ein Umzug `institut_*` → Schema `institut`
ein bewusster, eigener Migrationsschritt.

---

## 2. Migrations-Konvention (Kollisionsschutz)

Zwei Repos schreiben in **eine** Datenbank. Damit Migrationsnummern nicht kollidieren:

- Institut-Migrationen liegen in `woek-institut-app/supabase/migrations/`.
- Dateiname-Präfix: **`institut_NNNN_kurzbeschreibung.sql`** (eigener Nummernkreis,
  beginnend bei `institut_0001`). So sind sie in einer gemeinsamen DB eindeutig von den
  Akademie-Migrationen (`0001`…`0019`) unterscheidbar und sortierbar.
- Jede Migration ist **idempotent gedacht** (`create table if not exists`, `create policy`
  nur wenn nicht vorhanden) und enthält oben einen Kommentarblock: Zweck, betroffene Tabellen,
  abhängige Migration.
- **RLS pflicht:** Jede Tabelle mit personen- oder rollenbezogenen Daten bekommt
  `enable row level security` + explizite Policies. Kein „RLS off als Bequemlichkeit".

---

## 3. Rollen in der DB

Rollen aus `institut-gesamtkonzept.md` §6 werden als Daten geführt, **nicht** als
Postgres-Rollen:

- `institut_roles` — Zuordnung `user_id → role` (`member` | `researcher` | `reviewer` |
  `editor` | `governance` | `admin`). Ein Mensch kann mehrere Rollen haben.
- Serverseitige Guards (analog Akademie `lib/access.ts`) lesen diese Tabelle; der
  Service-Role-Key bleibt server-only.
- RLS-Policies prüfen Rollen über eine `security definer`-Hilfsfunktion
  `institut_has_role(uid, role)` (nur `institut_*` lesend).

---

## 4. MVP-Tabellen (v1)

Minimal nötig für Projektwerkstatt-MVP + öffentliche „Aktuelle Arbeiten"-Seite.

| Tabelle | Zweck | Kernspalten (Skizze) |
|---|---|---|
| `institut_members` | Instituts-Mitgliedschaft (unabhängig von Akademie) | `user_id` (FK `auth.users`), `display_name`, `joined_at`, `is_active` |
| `institut_roles` | Rollenzuordnung | `user_id`, `role`, `granted_by`, `granted_at` |
| `institut_workspaces` | Arbeitsbereiche | `id`, `slug`, `title`, `description`, `sort_order`, `visibility` |
| `institut_projects` | Projekte | `id`, `workspace_id`, `slug`, `title`, `summary`, `project_type`, `status`, `visibility`, `lead_user_id`, `goal_output`, `open_questions`, `sources_needed`, `next_steps`, `created_at`, `updated_at` |
| `institut_tasks` | Aufgabenkarten | `id`, `project_id`, `workspace_id`, `title`, `description`, `task_type`, `board_column`, `assignee_user_id`, `priority`, `due_date`, `visibility`, `created_at` |
| `institut_links` | modulübergreifende Verknüpfungen | `id`, `source_type`, `source_id`, `target_type`, `target_id`, `relation`, `created_by`, `created_at` |
| `institut_activity_events` | interne First-Party-Analytics | `id`, `event_type`, `subject_type`, `subject_id`, `actor_hash`, `occurred_at`, `meta jsonb` |

**Feld-Wertebereiche (an Konzept gekoppelt):**
- `visibility`: `public` | `members` | `internal` (Transparenzmodell §5).
- `institut_projects.status`: `idee` | `recherche` | `brainstorming` | `entwurf` | `review` |
  `redaktion` | `veroeffentlichungsbereit` | `veroeffentlicht` | `aktualisiert` | `archiviert`.
- `institut_tasks.board_column`: `backlog` | `zu_klaeren` | `bereit` | `in_arbeit` | `review` |
  `redaktion` | `bereit_veroeffentlichung` | `erledigt`.
- `project_type`: `wirkungscheck` | `policy_brief` | `methodenpapier` | `dossier` |
  `glossarprojekt` | `plattformprojekt` | `communityprojekt` | `akademieprojekt`.
- `task_type`: `idee` | `recherche` | `these` | `text` | `review` | `design` | `plattform` |
  `entscheidung`.

`institut_links` ist der Schlüssel zum „alles hängt zusammen"-Prinzip: `source_type`/
`target_type` sind Modul-Kennungen (`task`, `project`, `forum_thread`, `board_card`,
`document`, `source`, `publication`, `discord_call`).

---

## 5. Erweiterung v2+ (nur Skizze)

- `institut_sprints` (Arbeitszyklen): `id`, `workspace_id`, `title`, `goal`, `starts_on`,
  `ends_on`, `closing_note`.
- `institut_task_comments` (Kommentare an Aufgaben).
- `institut_reviews` (Review-Workflow): `id`, `subject_type`, `subject_id`, `reviewer_user_id`,
  `verdict`, `notes`, `status`.
- `institut_sources` (Quellenarchiv): `id`, `title`, `url`, `citation`, `source_type`,
  `reliability`, `added_by`.
- `institut_documents` (Dokumentenwerkstatt): `id`, `project_id`, `title`, `version`,
  `content_ref`, `visibility`, `status`.
- `institut_publications` (Veröffentlichungen): `id`, `project_id`, `title`, `output_type`,
  `version`, `published_at`, `verification_code?`.
- **Diskursforum**: baut auf `docs/PHASE_2_DISCUSSION_ARCHITECTURE.md` auf (`commentType`,
  `status`, `moderation`, `authorRole`) — als `institut_forum_*`-Tabellen mandantensicher.
- **Discord-Server-Analytics**: Muster aus Akademie `0016` als `institut_discord_*` neu anlegen
  (eigener Ingest-Token, eigener Hash-Salt). **Keine** Nachrichtentexte, DMs, IP-/Standortdaten.

---

## 6. RLS-Leitlinien

- **Öffentlich lesbar:** Zeilen mit `visibility='public'` sind ohne Login lesbar (Policy
  `using (visibility = 'public')`) — speist die öffentliche „Aktuelle Arbeiten"-Seite direkt.
- **Mitwirkende:** `visibility='members'` nur für eingeloggte `institut_members`.
- **Intern:** `visibility='internal'` nur für `editor`/`governance`/`admin`.
- **Schreiben:** an Rollen gebunden (z. B. Karten verschieben ab `researcher`, Freigabe nur
  `governance`). Nie allein clientseitig — serverseitige Guards + RLS.
- **Analytics/Discord:** datensparsam, gehashte Actor-Kennungen, keine IP im fachlichen Modell,
  keine Re-Identifikation aus Aggregaten, keine Personenrangliste.

---

## 7. Definition of Done für Datenänderungen

Eine Institut-Datenänderung ist erst fertig, wenn:
1. Migration `institut_NNNN_*.sql` vorhanden, idempotent, mit Kommentarblock.
2. Betroffene Tabellen haben RLS + Policies (oder bewusst begründete Ausnahme im Kommentar).
3. Keine Akademie-Tabelle berührt.
4. Feld-Wertebereiche stimmen mit `institut-gesamtkonzept.md` überein.
5. `institut-datenmodell.md` (dieses Doc) ist um neue Tabellen ergänzt.
