# Technisches Konzept: WÖk-Akademie-App

Stand: 19. Mai 2026

## 1. Zielbild

Die öffentliche Website `wirkungsoekonomie.de` bleibt eine statische Website auf GitHub Pages. Sie erklärt die Wirkungsökonomie, zeigt die Akademie-Struktur öffentlich und dient als redaktionelles Portal.

Die geschützte Akademie-App läuft separat unter:

`https://akademie.wirkungsoekonomie.de`

Ziel der App ist ein persönlicher Studienraum pro Teilnehmer:in. Dort werden Module, Lektüren, Video-Links, Prüfungsfragen und Lernfortschritte verwaltet.

Grundsatz:

- Discord regelt den Zugang.
- Supabase regelt den Lernstand.

Das bedeutet:

- Discord prüft, ob eine Person überhaupt in die Akademie darf.
- Supabase speichert, welche Module, Lektionen, Prüfungen und Fortschritte diese Person absolviert hat.

Die App darf keine reine Frontend-Zugangskontrolle verwenden. Login, Rollenprüfung, Freischaltung, Prüfungslogik und Fortschrittsspeicherung müssen serverseitig erfolgen.

## 2. Warum GitHub Pages nicht ausreicht

GitHub Pages eignet sich gut für die öffentliche Hauptwebsite, weil dort statische HTML-, CSS-, JS- und Asset-Dateien ausgeliefert werden.

Für die Akademie-App reicht GitHub Pages nicht aus, weil folgende Funktionen serverseitige Logik benötigen:

- Login mit Discord
- sichere OAuth-Verarbeitung
- Prüfung der Discord-Mitgliedschaft
- Prüfung einer Discord-Rolle wie `Akademie-Zugang`
- Schutz persönlicher Studienräume
- Speicherung persönlicher Lernfortschritte
- serverseitige Auswertung von Prüfungsfragen
- Zugriff auf Supabase mit sicheren Service-Schlüsseln
- Zugriff auf die Discord API mit Bot Token

GitHub Pages kann keine sicheren Server-Routen ausführen und keine Secrets schützen. Deshalb sollte die Akademie-App separat als Next.js-App auf Vercel laufen.

## 3. Empfohlener Tech Stack

### Anwendung

- Next.js App Router
- TypeScript
- React Server Components für geschützte Seiten
- Server Actions oder Route Handler für Fortschritt und Prüfungen
- Tailwind CSS oder CSS Modules für wartungsarme UI

### Hosting

- Vercel
- Preview Deployments für Pull Requests
- Production Deployment bei Merge auf `main`

### Datenbank und Auth

- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Supabase Storage zunächst nicht nötig

### Zugang

- Discord OAuth für Login
- Discord Bot API für Rollenprüfung
- Rolle auf Discord-Server, zum Beispiel `Akademie-Zugang`

### Codebasis

Empfehlung: eigenes GitHub-Repo `woek-akademie-app`.

Begründung:

- Das aktuelle Repo ist eine statische öffentliche Website.
- Die Akademie-App benötigt Secrets, Serverlogik, Dependencies und Deployments.
- Ein eigenes Repo trennt Website und App sauber.
- Vercel kann die App direkt aus diesem Repo deployen.
- Codex kann über Pull Requests arbeiten, ohne die öffentliche Website unnötig zu berühren.

Eine Monorepo-Struktur wäre möglich, aber aktuell weniger wartungsarm.

## 4. Login- und Rollenmodell mit Discord

### Nutzerfluss

1. Teilnehmer:in tritt dem Discord-Server bei.
2. Natalie vergibt dort die Rolle `Akademie-Zugang`.
3. Teilnehmer:in öffnet `akademie.wirkungsoekonomie.de`.
4. Teilnehmer:in loggt sich mit Discord ein.
5. Die App prüft serverseitig:
   - Discord User ID
   - Mitgliedschaft im richtigen Discord-Server
   - Rolle `Akademie-Zugang`
6. Bei erfolgreicher Prüfung wird der persönliche Studienraum geöffnet.
7. Ohne Rolle erscheint:

   `Dein Zugang ist noch nicht freigeschaltet. Bitte melde dich im Discord-Server oder warte auf die Freischaltung.`

### Technische Rollenprüfung

Discord OAuth identifiziert die Person. Die Rollenprüfung sollte zusätzlich serverseitig über die Discord Bot API erfolgen.

Empfohlenes Vorgehen:

1. Supabase Auth nutzt Discord als OAuth Provider.
2. Nach Login liest die App serverseitig die Discord User ID aus der Supabase-Session beziehungsweise aus den Identity-Daten.
3. Eine Next.js Server Route ruft Discord auf:

   `GET /guilds/{guild_id}/members/{discord_user_id}`

4. Die Route prüft, ob in `roles` die konfigurierte Rollen-ID für `Akademie-Zugang` enthalten ist.
5. Das Ergebnis wird in Supabase in `user_access` gespeichert.
6. Geschützte Seiten prüfen nicht nur eine Session, sondern auch den aktiven Zugangs- und Kohortenstatus.

Wichtig:

- Die Discord Rollen-ID sollte als Environment Variable gespeichert werden.
- Der Discord Bot muss auf dem Server sein.
- Der Bot benötigt die passenden Rechte, um Mitglieder und Rollen zu lesen.
- Je nach Discord-Konfiguration kann der Server Members Intent nötig sein.
- Der Discord Bot Token darf nie im Browser landen.

### Discord-Rollenmodell

Aktuell existieren auf dem Discord-Server diese Rollen:

- Rookie
- Standard
- Level2
- Akademie-Zugang
- Kohorte-2026-V1
- Kohorte-2026-V2
- Student:in
- Absolvent:in
- Mentor:in
- Team
- Akademie-Leitung
- @everyone

Für die Akademie-App relevant sind nur:

- Akademie-Zugang
- Kohorte-2026-V1
- Kohorte-2026-V2
- Student:in
- Absolvent:in
- Mentor:in
- Team
- Akademie-Leitung

Die Rollen `Rookie`, `Standard` und `Level2` sind Community-/Discord-Level-Rollen und dürfen für die Akademie-App nicht als Zugangskriterium verwendet werden.

#### Zugang

Die Rolle `Akademie-Zugang` ist die Tür in den Studienraum. Ohne diese Rolle gibt es keinen Zugriff auf Dashboard, Module, Prüfungen oder Lernstand.

Ausnahmen:

- `Team` kann als interne Moderations-, Technik- oder Redaktionsrolle Zugriff auf Vorschau- und Arbeitsbereiche erhalten.
- `Akademie-Leitung` ist die höchste App-Rolle und erhält Vollzugriff auf alle Kohorten, Inhalte, Studierendenprofile, Lernstände und spätere Zertifikatsverwaltung.

Prüflogik:

1. User loggt sich mit Discord ein.
2. App prüft serverseitig Discord User ID, Servermitgliedschaft und Rollen.
3. Ohne Servermitgliedschaft erscheint die Servermitgliedschaft-Meldung.
4. Ohne `Akademie-Zugang` erscheint die Freischaltungs-Meldung.
5. Mit `Akademie-Zugang` wird der User in Supabase angelegt oder aktualisiert.
6. Danach entscheidet die Kohortenrolle, welche Kursversion angezeigt wird.

#### Kohorten

- `Kohorte-2026-V1` = alte Kurse / alte Inhalte / alte Prüfungsstruktur
- `Kohorte-2026-V2` = neue Akademie-Struktur / neue Inhalte / neuer Studienpfad

Die Kursanzeige wird immer aus zwei Informationen berechnet:

1. `cohort_key` bestimmt die Kursversion.
2. `highest_stage_unlocked` bestimmt die sichtbaren Stufen.

Beispiele:

- `Kohorte-2026-V1` + `highest_stage_unlocked = 3` zeigt alte Stufe 1, alte Stufe 2 und alte Stufe 3.
- `Kohorte-2026-V2` + `highest_stage_unlocked = 3` zeigt neue Stufe 1, neue Stufe 2 und neue Stufe 3.

Die Stufennummern sind gleich. Die Inhalte kommen aus der jeweiligen Kursversion der Kohorte.

Wenn ein User beide Kohortenrollen hat:

- `Team` und `Mentor:in` dürfen beide Kursversionen sehen.
- `Akademie-Leitung` darf immer beide Kursversionen sehen und wird nicht durch Kohortenlogik eingeschränkt.
- Normale Student:innen sehen standardmäßig die neuere Kohorte, also `Kohorte-2026-V2`.

Wenn ein User `Akademie-Zugang`, aber keine Kohortenrolle hat, erscheint:

`Dein Akademie-Zugang ist aktiv, aber dir wurde noch keine Kohorte zugewiesen. Bitte melde dich im Discord-Server oder warte auf die Zuordnung.`

#### Statusrollen

- `Student:in` = aktiv eingeschrieben
- `Absolvent:in` = Studium abgeschlossen
- `Mentor:in` = darf perspektivisch andere begleiten oder erweiterte Einsicht erhalten
- `Team` = Moderation / Technik / Redaktion, optional eingeschränkter Zugriff
- `Akademie-Leitung` = Vollzugriff, akademische Freigaben und Zertifikatsverwaltung

MVP-Berechtigungen:

- `Akademie-Zugang` + `Kohorte-2026-V1` + `Student:in` -> Zugang zu alten Kursinhalten
- `Akademie-Zugang` + `Kohorte-2026-V2` + `Student:in` -> Zugang zum neuen Studienpfad
- `Akademie-Zugang` + `Absolvent:in` -> Zugang zu Archiv/Abschlussbereich, später Zertifikat
- `Akademie-Zugang` + `Mentor:in` -> später Mentor:innen-Dashboard
- `Team` -> interne Vorschau, Technik, Redaktion oder spätere Moderationsfunktionen
- `Akademie-Leitung` -> Vollzugriff auf alle Studierenden, Kohorten, Inhalte, Lernstände und Zertifikate

Für den MVP reicht:

- `Akademie-Zugang` prüfen
- Kohorte prüfen
- höchste Akademie-Stufe aus Discord-Rollen ermitteln
- `Student:in` optional als Status speichern
- `Team` als Teamflag speichern
- `Akademie-Leitung` als höchste Berechtigungsstufe speichern

#### Stufenrollen

Zusätzlich werden für die neue Akademie-Struktur diese Discord-Rollen vorgesehen:

- `Akademie-Stufe-1`
- `Akademie-Stufe-2`
- `Akademie-Stufe-3`
- `Akademie-Stufe-4`

Diese Rollen steuern nur, welche Akademie-Stufe grundsätzlich sichtbar ist. Sie steuern nicht einzelne Vorlesungen, Prüfungen oder Lernschritte.

Logik:

- `Akademie-Stufe-1` = Stufe 1 sichtbar
- `Akademie-Stufe-2` = Stufe 1 und 2 sichtbar
- `Akademie-Stufe-3` = Stufe 1, 2 und 3 sichtbar
- `Akademie-Stufe-4` = Stufe 1, 2, 3 und 4 sichtbar

Die höchste vorhandene Stufenrolle entscheidet. Hat ein User `Akademie-Stufe-3`, dann werden Stufe 1, 2 und 3 grundsätzlich angezeigt.

Die Stufenrolle entscheidet nicht, ob alte oder neue Inhalte angezeigt werden. Sie entscheidet nur, bis zu welcher Stufe Inhalte sichtbar sind. Die Kursversion kommt ausschließlich aus `cohort_key`.

Keine Discord-Rollen anlegen für:

- einzelne Vorlesungen
- einzelne Prüfungen
- einzelne Module
- bestandene Prüfungen

Begründung: Discord regelt Zugang, Kohorte und Stufe. Supabase regelt Vorlesungsfortschritt, Prüfungsanfragen, Prüfungsfreigaben, Prüfungsversuche und Zertifikate.

Beispiele:

- Neue Studierende: `Akademie-Zugang`, `Student:in`, `Kohorte-2026-V2`, `Akademie-Stufe-1`
- Alte Studierende, die die ersten beiden alten Kurse bereits durchlaufen haben: `Akademie-Zugang`, `Student:in`, `Kohorte-2026-V1`, `Akademie-Stufe-3`

#### Warum Lernstand nicht über Discord-Rollen läuft

Discord regelt Zugang, Kohorte und groben Status. Supabase regelt Lernstand, Module, Prüfungen, Fortschritt und Freischaltungen.

Es werden keine Modulrollen wie `Modul 1`, `Teil I` oder `Prüfung bestanden` in Discord angelegt. Modulfreischaltungen gehören in Supabase, weil sie personenbezogen, versioniert und prüfungsabhängig sind.

#### Environment Variables für Rollen-IDs

Rollen müssen über IDs geprüft werden, nicht über Namen. Rollennamen können später geändert werden.

Erforderliche Werte:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_GUILD_ID`
- `DISCORD_ROLE_AKADEMIE_ZUGANG_ID`
- `DISCORD_ROLE_KOHORTE_2026_V1_ID`
- `DISCORD_ROLE_KOHORTE_2026_V2_ID`
- `DISCORD_ROLE_STUDENT_ID`
- `DISCORD_ROLE_ABSOLVENT_ID`
- `DISCORD_ROLE_MENTOR_ID`
- `DISCORD_ROLE_TEAM_ID`
- `DISCORD_ROLE_AKADEMIE_LEITUNG_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_1_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_2_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_3_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_4_ID`
- `DISCORD_EXAM_NOTIFICATION_WEBHOOK_URL` optional
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Serverseitige Prüfung

Discord OAuth soll serverseitig ausgewertet werden. Voraussichtlich benötigte Scopes:

- `identify`
- `guilds`
- `guilds.members.read`

Supabase Auth übernimmt den Discord Login. Ob Supabase die benötigten Scopes und Rolleninformationen vollständig liefert, muss praktisch geprüft werden. Falls nicht, übernimmt die Next.js-App nach dem Login eine ergänzende serverseitige Prüfung über Discord API und Bot Token.

#### Fehlermeldungen

Ohne `Akademie-Zugang`:

`Dein Zugang zur WÖk-Akademie ist noch nicht freigeschaltet. Bitte melde dich im Discord-Server oder warte auf die Freischaltung.`

Ohne Kohorte:

`Dein Akademie-Zugang ist aktiv, aber dir wurde noch keine Kohorte zugewiesen. Bitte melde dich im Discord-Server oder warte auf die Zuordnung.`

Ohne Servermitgliedschaft:

`Du bist noch nicht mit dem WÖk-Discord-Server verbunden. Bitte tritt dem Server bei und melde dich danach erneut an.`

Ohne `Akademie-Leitung` bei `/leitung`:

`Dieser Bereich ist nur für die Akademie-Leitung freigeschaltet.`

Rollenprüfung darf niemals nur im Browser stattfinden.

#### Fehlermeldungen

Ohne Akademie-Zugang:

`Dein Zugang zur WÖk-Akademie ist noch nicht freigeschaltet. Bitte melde dich im Discord-Server oder warte auf die Freischaltung.`

Ohne Kohorte:

`Dein Akademie-Zugang ist aktiv, aber dir wurde noch keine Kohorte zugewiesen. Bitte melde dich im Discord-Server oder warte auf die Zuordnung.`

Ohne Stufenrolle:

`Deine Akademie-Stufe wurde noch nicht freigeschaltet. Bitte warte auf die Freischaltung durch die Akademie-Leitung.`

Prüfung noch nicht freigegeben:

`Deine Prüfungsanmeldung wurde übermittelt. Die Akademie-Leitung prüft deinen Lernstand und schaltet die Prüfung anschließend frei.`

Bei fehlender Discord-Servermitgliedschaft:

`Du bist noch nicht mit dem WÖk-Discord-Server verbunden. Bitte tritt dem Server bei und melde dich danach erneut an.`

#### Alte und neue Kurse parallel führen

Kursinhalte sollen versionierbar sein.

- `Kohorte-2026-V1` sieht alte Inhalte.
- `Kohorte-2026-V2` sieht neue Inhalte.
- Alte Studierende werden nicht automatisch auf neue Inhalte umgestellt.
- Neue Studierende starten in V2.

Das Dashboard zeigt:

- Name / Discord-Username
- Rolle: Student:in, Mentor:in, Team oder Absolvent:in
- Kohorte: 2026 V1 oder 2026 V2
- aktueller Lernstand
- freigeschaltete Module

Die App sollte die Rollen nicht nur beim ersten Login prüfen, sondern regelmäßig erneut:

- bei jedem Login
- bei Zugriff auf geschützte Server-Seiten
- optional per geplanter Revalidierung, zum Beispiel einmal täglich

## 5. Supabase-Datenmodell

### users

Speichert die App-Nutzer:innen. Supabase Auth hat zusätzlich eine eigene `auth.users` Tabelle. Die öffentliche App-Tabelle sollte mit `auth.users.id` verbunden werden.

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_user_id text unique not null,
  discord_username text,
  avatar_url text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
```

### user_access

Speichert Zugang, Kohorte und Statusrollen aus Discord.

```sql
create table public.user_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  has_akademie_zugang boolean not null default false,
  cohort_key text,
  highest_stage_unlocked int not null default 0,
  is_student boolean not null default false,
  is_absolvent boolean not null default false,
  is_mentor boolean not null default false,
  is_team boolean not null default false,
  is_akademie_leitung boolean not null default false,
  discord_roles_snapshot jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id)
);
```

Für `Akademie-Leitung` gilt `is_akademie_leitung = true`. Diese Rolle ist nicht durch Kohortenlogik eingeschränkt.

### cohorts

```sql
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text,
  version text not null,
  is_active boolean not null default true
);
```

### course_versions

```sql
create table public.course_versions (
  id uuid primary key default gen_random_uuid(),
  cohort_key text not null references public.cohorts(key) on delete restrict,
  title text not null,
  description text,
  is_active boolean not null default true
);
```

Kursauswahl:

- Die App wählt zuerst anhand von `user_access.cohort_key` die passende `course_versions`-Zeile.
- Danach filtert sie `stages` dieser Kursversion nach `stage_number <= highest_stage_unlocked`.
- Die gleiche Stufennummer kann in V1 und V2 unterschiedliche Inhalte haben.
- Normale Student:innen sehen nie gemischte Inhalte aus V1 und V2.
- Akademie-Leitung kann alle Kursversionen vergleichen.

### Aktualisierte Kursarchitektur ab V2: Stufen und Vorlesungen

Für die neue Akademie-Struktur ersetzt die Stufen-/Vorlesungslogik die ältere Teil-/Modul-Logik im MVP.

Die Akademie hat bis zur finalen Prüfung vier Stufen. Jede Stufe hat vier Vorlesungen.

Jede Vorlesung enthält:

- Online-Skript als Website-Inhalt, nicht PDF
- YouTube-Video-Link
- optional Begleittext
- Button `Skript gelesen`
- Button `Video angesehen`

Vorlesungsskripte werden als hochwertige Lernseiten im GitHub-Repo gepflegt. Word- oder PDF-Vorlagen werden durch Codex in saubere MDX- oder Markdown-Lernseiten umgewandelt und nach Merge automatisch über Vercel veröffentlicht.

Bevorzugte Struktur:

```text
content/
  v1/
    stufe-1/
      vorlesung-1.mdx
      vorlesung-2.mdx
      vorlesung-3.mdx
      vorlesung-4.mdx
  v2/
    stufe-1/
      vorlesung-1.mdx
      vorlesung-2.mdx
      vorlesung-3.mdx
      vorlesung-4.mdx
```

Die Kohorte entscheidet, ob `v1` oder `v2` geladen wird. Die Akademie-Stufe entscheidet, welche Stufe freigeschaltet ist. Der individuelle Lernfortschritt entscheidet, welche Vorlesung innerhalb der Stufe anklickbar ist.

PDFs können optional als Download angeboten werden. Die Hauptnutzung soll aber die Website-Lernseite sein, nicht ein eingebettetes PDF.

Vorlesungen werden innerhalb jeder Stufe nacheinander freigeschaltet:

- Vorlesung 1 ist sichtbar, wenn die Stufe freigeschaltet ist.
- Vorlesung 2 wird sichtbar, wenn Vorlesung 1 abgeschlossen ist.
- Vorlesung 3 wird sichtbar, wenn Vorlesung 2 abgeschlossen ist.
- Vorlesung 4 wird sichtbar, wenn Vorlesung 3 abgeschlossen ist.
- Nach Vorlesung 4 kann die Prüfung angemeldet werden.

#### stages

```sql
create table public.stages (
  id uuid primary key default gen_random_uuid(),
  course_version_id uuid not null references public.course_versions(id) on delete cascade,
  stage_number int not null,
  title text not null,
  description text,
  order_index int not null,
  exam_required boolean not null default true,
  final_exam boolean not null default false,
  is_active boolean not null default true,
  unique (course_version_id, stage_number)
);
```

#### lectures

```sql
create table public.lectures (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  lecture_number int not null,
  title text not null,
  slug text not null,
  description text,
  script_path text not null,
  script_download_url text,
  video_url text,
  required_script boolean not null default true,
  required_video boolean not null default true,
  published boolean not null default false,
  order_index int not null,
  estimated_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stage_id, lecture_number),
  unique (stage_id, slug)
);
```

`script_path` zeigt auf die versionierte MDX-/Markdown-Datei im Repo, zum Beispiel `content/v2/stufe-1/vorlesung-1.mdx`.

`video_url` wird nicht fest im Code eingebaut. Akademie-Leitung pflegt den YouTube-Link im Leitungsdashboard. Die Lernseite lädt das Skript aus dem Repo und kombiniert es zur Laufzeit mit dem Video-Link aus Supabase.

Für Dashboard und Kursanzeige kann zusätzlich eine View genutzt werden:

```sql
lecture_catalog:
- course_version_id
- cohort_key
- stage_number
- lecture_number
- title
- slug
- script_path
- script_download_url
- video_url
- published
- required_script
- required_video
```

Diese View macht sichtbar, welche Skriptdatei und welcher Video-Link zu welcher Kohorte, Stufe und Vorlesung gehören.

#### lecture_progress

```sql
create table public.lecture_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lecture_id uuid not null references public.lectures(id) on delete cascade,
  script_opened_at timestamptz,
  script_completed_at timestamptz,
  video_opened_at timestamptz,
  video_completed_at timestamptz,
  completed_at timestamptz,
  status text not null default 'not_started',
  updated_at timestamptz not null default now(),
  unique (user_id, lecture_id)
);
```

Statuswerte:

- `locked`
- `not_started`
- `in_progress`
- `completed`

#### exam_requests

Prüfungen werden nicht automatisch sichtbar. Nach Abschluss der vier Vorlesungen einer Stufe kann eine Prüfungsanfrage gestellt werden.

```sql
create table public.exam_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stage_id uuid not null references public.stages(id) on delete cascade,
  status text not null default 'requested',
  requested_at timestamptz not null default now(),
  approved_by_user_id uuid references public.users(id) on delete set null,
  approved_at timestamptz,
  rejected_by_user_id uuid references public.users(id) on delete set null,
  rejected_at timestamptz,
  rejection_reason text,
  notes text
);
```

Statuswerte:

- `requested`
- `approved`
- `rejected`
- `cancelled`

### Inhaltsverwaltung

Für den MVP wird eine hybride Content-Logik empfohlen:

1. Vorlesungsskripte liegen als MDX oder Markdown im GitHub-Repo.
2. Codex wandelt Word- oder PDF-Skripte in saubere Lernseiten um.
3. Vercel veröffentlicht Skripte automatisch nach Merge.
4. Supabase speichert Metadaten, Pfad, YouTube-Link, Veröffentlichung und Pflichtstatus.

Supabase speichert pro Vorlesung:

- Kursversion über `course_versions`
- `cohort_key`
- `stage_number`
- `lecture_number`
- `script_path`
- `video_url`
- `published`
- `required_script`
- `required_video`
- `lecture_progress`

Technisch kann `cohort_key` über `course_versions` und `stage_number` über `stages` kommen. Für das Dashboard kann daraus eine View `lecture_catalog` gebaut werden.

Vorteile:

- Skripte sind sauber versioniert.
- Codex kann Word/PDF in hochwertige Lernseiten umwandeln.
- Änderungen an Skripten laufen über Pull Request und Vercel Deployment.
- YouTube-Links bleiben flexibel im Leitungsdashboard pflegbar.
- Supabase bleibt zuständig für Status, Fortschritt, Video-Link und Veröffentlichung.

### Prüfungsanmeldung und Prüfungsfreigabe

Workflow:

1. Student:in schließt alle vier Vorlesungen einer Stufe ab.
2. Button erscheint: `Zur Prüfung anmelden`.
3. Student:in klickt den Button.
4. Eine Prüfungsanfrage wird in `exam_requests` gespeichert.
5. Akademie-Leitung sieht die Anfrage im Dashboard unter `Offene Prüfungsanfragen`.
6. Optional erzeugt ein Discord-Webhook eine Nachricht in einem privaten Kanal.
7. Akademie-Leitung prüft Lernstand.
8. Akademie-Leitung klickt `Prüfung freigeben`.
9. Erst danach sieht Student:in die Prüfungsfragen.
10. Nach Bestehen wird die nächste Stufe durch Akademie-Leitung oder durch eine vorgeschlagene Aktion freigeschaltet.

Die Prüfungsfreigabe wird in Supabase gespeichert, nicht als Discord-Rolle.

Optionaler Discord-Webhook:

- Environment Variable: `DISCORD_EXAM_NOTIFICATION_WEBHOOK_URL`
- Beispielnachricht: `Neue Prüfungsanmeldung: [Discord-Username] - Stufe [X] - Kohorte [Y]`

### Aktualisierte exams

Für die Stufenlogik hängen Prüfungen an `stage_id`, nicht an einzelnen Modulen.

```sql
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  title text not null,
  description text,
  passing_score int not null default 80,
  max_attempts int not null default 3,
  published boolean not null default false,
  is_final_exam boolean not null default false
);
```

### Aktualisierte questions

```sql
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  type text not null,
  question_text text not null,
  options jsonb,
  correct_answer jsonb,
  explanation text,
  order_index int not null,
  published boolean not null default true,
  unique (exam_id, order_index)
);
```

Fragetypen:

- `multiple_choice`
- `single_choice`
- `free_text`
- `reflection`

### Aktualisierte exam_attempts und exam_answers

```sql
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  stage_id uuid not null references public.stages(id) on delete cascade,
  attempt_number int not null default 1,
  score int,
  passed boolean,
  submitted_at timestamptz,
  reviewed_by_user_id uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  status text not null default 'started'
);

create table public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer jsonb not null,
  is_correct boolean,
  feedback text
);
```

Statuswerte für `exam_attempts`:

- `started`
- `submitted`
- `passed`
- `failed`
- `needs_review`

### activity_log

```sql
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  actor_user_id uuid references public.users(id) on delete set null,
  type text not null,
  entity_type text,
  entity_id uuid,
  message text,
  created_at timestamptz not null default now()
);
```

### Fortschrittsberechnung ab V2

Vorlesung abgeschlossen, wenn:

- `required_script = false` oder `script_completed_at` gesetzt ist
- `required_video = false` oder `video_completed_at` gesetzt ist

Stufe abgeschlossen, wenn:

- alle vier Vorlesungen der Stufe abgeschlossen sind
- Prüfung bestanden ist, falls `exam_required = true`

Prüfung anmelden möglich, wenn:

- alle vier Vorlesungen abgeschlossen sind
- noch keine offene Prüfungsanfrage existiert
- Prüfung noch nicht bestanden ist

Prüfung sichtbar, wenn:

- `exam_requests.status = approved`

Nächste Stufe sichtbar, wenn:

- `user_access.highest_stage_unlocked` mindestens der Stufennummer entspricht
- dieser Wert beim Login aus der höchsten Discord-Stufenrolle berechnet wurde
- oder Akademie-Leitung den Wert in Supabase manuell erhöht hat
- oder später nach bestandener Prüfung und Bestätigung durch Akademie-Leitung

Für den MVP wird `highest_stage_unlocked` beim Rollencheck aus den Discord-Stufenrollen berechnet und in Supabase gespeichert. Supabase kann zusätzlich als Override durch Akademie-Leitung dienen.

Entscheidend:

- `cohort_key` bestimmt die Kursversion.
- `highest_stage_unlocked` bestimmt die sichtbare Stufentiefe.
- `course_versions` + `stages.stage_number` liefern die konkreten Inhalte.

### academy_parts

```sql
create table public.academy_parts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  order_index int not null,
  description text,
  unique (order_index)
);
```

### modules

```sql
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  academy_part_id uuid not null references public.academy_parts(id) on delete cascade,
  title text not null,
  order_index int not null,
  description text,
  required_reading_url text,
  video_url text,
  unique (academy_part_id, order_index)
);
```

### module_progress

```sql
create table public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  reading_completed boolean not null default false,
  video_completed boolean not null default false,
  quiz_passed boolean not null default false,
  completed_at timestamptz,
  unique (user_id, module_id)
);
```

### exams

```sql
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  passing_score int not null default 80
);
```

### questions

```sql
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  type text not null,
  question_text text not null,
  options jsonb,
  correct_answer jsonb not null,
  explanation text,
  order_index int not null,
  unique (exam_id, order_index)
);
```

### attempts

```sql
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  score int not null,
  passed boolean not null,
  submitted_at timestamptz not null default now()
);
```

### answers

```sql
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer jsonb not null,
  is_correct boolean not null
);
```

### content_items

Website-Skripte, Lektionen, Videos, Reflexionsaufgaben und Quiz-Elemente werden als Content Items geführt. Skripte sind Website-Seiten, keine PDFs.

```sql
create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  slug text unique not null,
  url text,
  type text not null,
  required boolean not null default true,
  order_index int not null,
  estimated_minutes int,
  created_at timestamptz not null default now()
);
```

### content_progress

```sql
create table public.content_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  status text not null default 'not_started',
  opened_at timestamptz,
  completed_at timestamptz,
  last_seen_at timestamptz,
  progress_percent int not null default 0,
  time_spent_seconds int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, content_item_id)
);
```

Bei Website-Skripten setzt das Öffnen den Status auf `opened`. Erst der Button `Als gelesen markieren` setzt `completed`. Bei Videos reicht im MVP der Button `Video angesehen`. Kein heimliches Tracking.

### exam_attempts und exam_answers

```sql
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  score int not null,
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  attempt_number int not null default 1
);

create table public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.exam_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  answer jsonb not null,
  is_correct boolean not null
);
```

### student_progress_summary

Für das Leitungsdashboard wird eine zusammengefasste View oder serverseitige Query vorgesehen:

```sql
student_progress_summary:
- user_id
- discord_username
- cohort_key
- status
- current_part
- current_module
- overall_progress_percent
- current_part_progress_percent
- current_module_progress_percent
- completed_content_count
- completed_video_count
- passed_exam_count
- last_activity_at
```

### certificate_types und certificates

Zertifikate werden nicht automatisch erzeugt. Sie werden manuell durch `Akademie-Leitung` freigegeben.

```sql
create table public.certificate_types (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  certificate_code text unique not null,
  title text not null,
  issued_by_user_id uuid references public.users(id) on delete set null,
  issued_at timestamptz not null default now(),
  status text not null,
  revoked_at timestamptz,
  revoked_reason text,
  verification_slug text unique not null,
  public_verification_enabled boolean not null default true,
  notes text
);
```

Statuswerte:

- `gültig`
- `widerrufen`
- `ersetzt`
- `abgelaufen` optional

Mögliche Zertifikatstypen:

- Wirkungskompetenz
- WÖk-Practitioner
- WÖk-Mentor:in

Zertifikatscodes werden automatisch generiert, zum Beispiel `WOEK-2026-00017` oder `WOEK-PRACT-2026-017`. Die öffentliche Prüfung läuft später über `/zertifikat/[certificateCode]`. Ein QR-Code auf dem Zertifikat wird vorbereitet.

### Row Level Security

Empfohlene Grundregeln:

- Teilnehmer:innen dürfen nur eigene Fortschritte, Versuche und Antworten lesen.
- Teilnehmer:innen dürfen Fortschritte nur für sich selbst schreiben.
- Prüfungsfragen und richtige Antworten dürfen nicht vollständig an den Client ausgeliefert werden.
- Die Bewertung von Prüfungen muss serverseitig erfolgen.
- Der Supabase Service Role Key darf nur in Vercel Server Routes verwendet werden.

## Leitungsdashboard und Lernfortschritt

### 1. Rolle Akademie-Leitung als Vollzugriff

Die Discord-Rolle `Akademie-Leitung` ist die höchste Berechtigungsstufe der Akademie-App. Sie darf alle Studierenden, Kohorten, Kursversionen, Inhalte, Lernstände und später Zertifikate sehen und verwalten.

`Team` bleibt davon getrennt. Team steht für Moderation, Technik und Redaktion und kann später eingeschränkte interne Rechte erhalten. Akademische Freigaben, Zertifikate und Abschlussstatus liegen bei `Akademie-Leitung`.

### 2. Persönliches Dashboard für Studierende

Jede:r Student:in erhält eine persönliche Seite mit:

- Begrüßung mit Discord-Username
- Rolle und Kohorte
- aktueller Stufe
- aktueller Vorlesung
- freigeschalteten Stufen
- Gesamtfortschritt
- Fortschritt in der aktuellen Stufe
- bereits erledigten Inhalten
- nächstem freigeschalteten Schritt
- Kontakt zu Natalie via Discord `@natsnatalie`
- Prüfungsstatus: noch nicht verfügbar, Anmeldung möglich, Anfrage gesendet, freigegeben, bestanden oder nicht bestanden

### 3. Leitungsdashboard für Natalie

Route: `/leitung`

Zugriff nur für `Akademie-Leitung`. Ohne diese Rolle erscheint:

`Dieser Bereich ist nur für die Akademie-Leitung freigeschaltet.`

Die Übersicht zeigt:

- Anzahl Studierende gesamt
- Anzahl aktive Studierende
- Anzahl je Kohorte
- Anzahl je Stufe
- Anzahl abgeschlossener Vorlesungen
- Anzahl bestandener Prüfungen
- offene Prüfungsanfragen
- Durchschnittlicher Fortschritt
- Studierende ohne Aktivität seit X Tagen

### 4. Studierendenliste

Die Liste enthält:

- Name / Discord-Username
- Kohorte
- Status: Student:in / Absolvent:in / Mentor:in
- höchste freigeschaltete Stufe
- aktuelle Stufe
- aktuelle Vorlesung
- Fortschritt in Prozent
- Fortschritt aktuelle Stufe in Prozent
- offene Prüfungsanfrage ja/nein
- Prüfung freigegeben ja/nein
- zuletzt aktiv
- Anzahl gelesener Inhalte
- Anzahl abgeschlossener Videos
- Anzahl bestandener Prüfungen
- Link `Profil ansehen`

Filter:

- Kohorte
- Stufe
- Status
- Prüfungsanfrage offen
- Prüfung freigegeben
- Fortschritt
- zuletzt aktiv
- Suche nach Discord-Username

### 5. Einzelprofil pro Student:in

Route: `/leitung/studierende/[userId]`

Das Einzelprofil zeigt:

- Discord-Username
- Discord-ID
- Kohorte
- Statusrollen
- höchste freigeschaltete Stufe
- aktuelle Stufe
- aktuelle Vorlesung
- letzter Login
- gesamter Fortschritt
- Fortschritt je Stufe
- Fortschritt je Vorlesung
- gelesene Inhalte
- angesehene Videos
- Prüfungsanfragen
- Prüfungsfreigaben
- Prüfungsversuche
- bestandene und nicht bestandene Prüfungen
- Zertifikate
- aktuelle Aufgabe
- nächste freigeschaltete Vorlesung
- Notizen später optional

Aktionen:

- Prüfung freigeben
- Prüfung sperren
- Prüfungsanfrage ablehnen
- nächsten Versuch freigeben
- Zertifikat ausstellen
- Zertifikat widerrufen
- manuelle Notiz hinzufügen
- manuelle Fortschrittskorrektur, nur Akademie-Leitung

### 6. Tracking von Website-Skripten

Skripte sind Website-Seiten. Wenn Student:innen eine Skriptseite öffnen, wird `status = opened` gespeichert. Am Ende der Seite gibt es den Button `Als gelesen markieren`. Erst dieser Button setzt `status = completed`.

Es gibt im MVP kein heimliches Time-Tracking.

### 7. Tracking von Videos

Video-Seite öffnen setzt `opened`. Der Button `Video angesehen` setzt `completed`. Eine echte Video-Tracking-Integration kann später ergänzt werden. Im MVP reicht die manuelle Bestätigung.

### 8. Prüfungsfortschritt

Prüfungen werden serverseitig ausgewertet. Gespeichert werden:

- Versuch
- Punktzahl
- bestanden / nicht bestanden
- Antworten
- Zeitpunkt
- Versuchszahl

### 9. Fortschrittsberechnung

- Vorlesung abgeschlossen = Skript gelesen und Video angesehen, sofern beide als verpflichtend markiert sind.
- Stufenfortschritt = abgeschlossene Vorlesungen / vier Vorlesungen der Stufe, plus Prüfungsstatus falls Prüfung erforderlich ist.
- Gesamtfortschritt = abgeschlossene Vorlesungen und bestandene Prüfungen / alle Anforderungen der freigeschalteten Stufen.

Freischaltlogik:

- Vorlesung 1 ist sichtbar, wenn die Stufe freigeschaltet ist.
- Vorlesung 2 wird nach Abschluss von Vorlesung 1 freigeschaltet.
- Vorlesung 3 wird nach Abschluss von Vorlesung 2 freigeschaltet.
- Vorlesung 4 wird nach Abschluss von Vorlesung 3 freigeschaltet.
- Nach Vorlesung 4 kann die Prüfung angemeldet werden.
- Die Prüfung wird erst nach Freigabe durch Akademie-Leitung sichtbar.
- `Akademie-Leitung` sieht immer alles.
- `Mentor:in` kann später optional Einblick bekommen, aber nicht im MVP.

### 10. Datenschutz und minimale Datenspeicherung

Studierende müssen wissen, dass ihr Lernfortschritt gespeichert wird. Gespeichert wird nur, was für die Akademie notwendig ist.

- Leitungsansicht nur für `Akademie-Leitung`.
- keine öffentlichen Ranglisten.
- keine unnötige Verhaltensüberwachung.
- kein automatisches Time-Tracking im MVP.
- `gelesen` und `gesehen` werden aktiv per Button bestätigt.

## Zertifikatslogik

Zertifikate werden nicht automatisch erzeugt. Sie werden manuell durch `Akademie-Leitung` freigegeben.

`Akademie-Leitung` darf:

- Zertifikate ausstellen
- Zertifikate widerrufen
- Zertifikate neu erzeugen
- Zertifikatsstatus ändern
- Abschlussstatus setzen

Jedes Zertifikat erhält:

- eindeutige Zertifikats-ID
- Zertifikatstitel
- Ausstellungsdatum
- Status
- öffentliche Verifizierungsseite
- optional später QR-Code

Öffentliche Verifizierungsseite:

`/zertifikat/[certificateCode]`

Anzeige:

- Name
- Zertifikatstitel
- Akademiepfad
- Ausstellungsdatum
- Status
- Hinweis: `Dieses Zertifikat wurde durch die WÖk-Akademie verifiziert.`

## 6. MVP-Umfang

Der MVP bildet die neue Stufenlogik ab.

### Akademie-Struktur im MVP

Die Akademie hat vier Stufen bis zur finalen Prüfung. Jede Stufe hat vier Vorlesungen.

Stufe 1 startet für neue Studierende mit:

1. Was ist Wirkungsökonomie?
2. Erfolg und Zukunft
3. Mensch, Planet und Demokratie
4. Wirkung statt bloßer Absicht

Die weiteren Stufen werden strukturell angelegt und können über das Leitungsdashboard mit Inhalten gefüllt werden.

### MVP-Funktionen

- Discord Login
- serverseitige Rollenprüfung
- `Akademie-Zugang`
- Kohorte V1/V2
- Stufenrollen 1 bis 4
- persönliches Dashboard
- 4 Stufen mit je 4 Vorlesungen
- Online-Skripte
- YouTube-Link pro Vorlesung
- pro Vorlesung:
  - kurze Einführung
  - Online-Skript
  - Video-Link
  - Button `Skript gelesen`
  - Button `Video angesehen`
- Lernfortschritt speichern
- nächste Vorlesung erst nach Abschluss freischalten
- Fortschrittsbalken
- Prüfungsanmeldung nach vier abgeschlossenen Vorlesungen
- Prüfungsfreigabe durch Akademie-Leitung
- Leitungsdashboard
- Studierendenübersicht
- Einzelprofil
- Zertifikat manuell ausstellen
- Zertifikatscode und Verifizierungsseite

Nicht im MVP:

- automatische Zertifikate
- komplexe Notenverwaltung
- Zahlungslogik
- Ranglisten
- vollautomatisches Video-Tracking
- komplexe Mentoring-Funktionen
- KI-Auswertung von Freitexten
- eigene Video-Hosting-Infrastruktur

### Content-Pflege im MVP

Vorlesungsskripte sollen als hochwertige Website-Lernseiten wirken. Deshalb empfiehlt sich für den MVP die hybride Pflege:

Skripte:

- liegen als MDX oder Markdown im GitHub-Repo
- werden aus Word- oder PDF-Vorlagen durch Codex in Lernseiten umgewandelt
- liegen versioniert unter `content/v1/...` oder `content/v2/...`
- werden nach Merge automatisch über Vercel veröffentlicht

YouTube-Links:

- werden im Leitungsdashboard gepflegt
- werden pro Vorlesung in Supabase gespeichert
- werden auf der Lernseite eingebettet
- können ohne GitHub-Änderung aktualisiert werden

Supabase speichert zusätzlich:

- `script_path`
- `published`
- `required_script`
- `required_video`
- `lecture_progress`

Damit bleibt die redaktionelle Qualität der Skripte hoch, während Natalie Video-Links und Freigaben im Leitungsdashboard pflegen kann.

### Lernseite pro Vorlesung

Die Lernseite kombiniert zwei Quellen:

1. MDX-/Markdown-Skript aus dem GitHub-Repo
2. Vorlesungsmetadaten und YouTube-Link aus Supabase

Die Seite zeigt:

- Skript als Website-Inhalt
- optionalen PDF-Download, falls vorhanden
- YouTube-Video, wenn `video_url` gesetzt und `published = true`
- Button `Skript gelesen`
- Button `Video angesehen`
- aktuellen Status der Vorlesung
- Hinweis auf die nächste freigeschaltete Vorlesung

Die nächste Vorlesung wird erst anklickbar, wenn die aktuelle Vorlesung abgeschlossen ist. Eine Vorlesung gilt als abgeschlossen, wenn alle verpflichtenden Bestandteile aktiv bestätigt wurden.

Videos sollen im MVP nicht selbst gehostet werden. Geeignet sind:

- YouTube ungelistet
- Vimeo privat/ungelistet
- vergleichbare externe Video-Links

## 7. Spätere Ausbaustufen

### Ausbau 1

- alle vier Stufen vollständig mit je vier Vorlesungen befüllen
- Fortschrittsübersicht pro Stufe
- bessere Navigation im Studienraum
- Wiederholungsmodus für Prüfungsfragen

### Ausbau 2

- Reflexionsaufgaben
- Praxisprojekt
- Upload oder Einreichung von Texten
- Mentor:innenrolle
- Feedback durch Natalie oder Mentor:innen

### Ausbau 3

- Zertifikat
- automatische Zertifikats-PDFs
- Abschlussprüfung
- interne Zertifikatsnummer
- optional Discord-Rolle nach Abschluss

### Ausbau 4

- erweiterte Inhaltsverwaltung
- Fragenverwaltung
- manuelle Freischaltungen
- Export von Fortschritten
- optionale Discord-Benachrichtigungen bei Prüfungsanfragen

## 8. Deployment-Workflow mit GitHub, Codex und Vercel

### Empfohlene Repo-Struktur

Neues Repo:

`woek-akademie-app`

Beispielstruktur:

```text
woek-akademie-app/
  app/
    (public)/
    (academy)/
    api/
  components/
  content/
    v1/
      stufe-1/
        vorlesung-1.mdx
        vorlesung-2.mdx
        vorlesung-3.mdx
        vorlesung-4.mdx
    v2/
      stufe-1/
        vorlesung-1.mdx
  lib/
    discord/
    supabase/
    academy/
  supabase/
    migrations/
    seed.sql
  docs/
  README.md
```

### Workflow

1. Codex erstellt Änderungen in einem Branch.
2. Codex öffnet Pull Request auf GitHub.
3. Vercel erzeugt automatisch ein Preview Deployment.
4. Natalie prüft Preview URL.
5. Nach Merge auf `main` deployt Vercel in Produktion.

### Umgebungen

Empfohlen:

- `development`: lokale Entwicklung
- `preview`: Vercel Preview Deployments
- `production`: Vercel Production

Supabase kann zunächst ein Projekt verwenden. Für spätere Stabilität ist sinnvoll:

- ein Supabase-Projekt für Produktion
- optional ein zweites Supabase-Projekt für Preview/Testing

## 9. Sicherheits- und Datenschutzfragen

### Secrets

Nicht ins GitHub-Repo schreiben:

- Discord Client Secret
- Discord Bot Token
- Supabase Service Role Key
- Vercel Tokens
- API Keys

Diese Werte gehören in Vercel Environment Variables und gegebenenfalls lokal in `.env.local`, das per `.gitignore` ausgeschlossen ist.

### Serverpflichtige Logik

Serverseitig bleiben müssen:

- Discord Rollenprüfung
- Freischaltung
- Prüfungsauswertung
- Fortschrittsfreigabe
- Zugriff mit Supabase Service Role Key

### Datenschutz

Zu prüfen und später in Datenschutztexten zu ergänzen:

- Welche Discord-Daten werden gespeichert?
- Wird eine E-Mail gespeichert?
- Wie lange werden Lernfortschritte gespeichert?
- Wie kann eine Person Löschung verlangen?
- Wie werden Prüfungsversuche gespeichert?
- Welche externen Video-Plattformen werden eingebunden?
- Wird YouTube erst nach Consent geladen oder nur als Link geöffnet?

### Datensparsamkeit

Für den MVP reicht:

- Discord User ID
- Discord Username
- Avatar URL optional
- E-Mail nur, wenn wirklich benötigt und erlaubt
- Lernfortschritt
- Prüfungsversuche

## 10. DNS / IONOS / Subdomain

Die öffentliche Hauptwebsite `wirkungsoekonomie.de` bleibt unverändert auf GitHub Pages.

Nur die Subdomain `akademie.wirkungsoekonomie.de` zeigt später auf die Vercel-App.

### Grundlogik

1. In Vercel muss beim Akademie-Projekt die Domain `akademie.wirkungsoekonomie.de` hinzugefügt werden.
2. Vercel zeigt danach den benötigten DNS-Eintrag an.
3. Für eine Subdomain wird in der Regel ein CNAME-Record benötigt.
4. Bei IONOS muss für die Subdomain `akademie` ein CNAME-Record gesetzt werden.
5. Der Zielwert ist der von Vercel angezeigte CNAME-Wert, häufig ähnlich wie `cname.vercel-dns.com` oder ein projektspezifischer `vercel-dns.com` Wert.
6. Den Zielwert nicht raten, sondern exakt aus Vercel übernehmen.
7. Falls Vercel einen Punkt am Ende des CNAME-Ziels anzeigt, diesen exakt übernehmen, sofern IONOS das akzeptiert.
8. DNS-Änderungen können bis zu 24 Stunden dauern.
9. SSL/HTTPS wird danach in Vercel geprüft und automatisch aktiviert.

### Anleitung für Natalie: Vercel

1. Vercel öffnen.
2. Akademie-Projekt auswählen.
3. `Settings` öffnen.
4. `Domains` öffnen.
5. `akademie.wirkungsoekonomie.de` hinzufügen.
6. Den von Vercel angezeigten CNAME-Wert kopieren.
7. Nach IONOS wechseln und den Wert dort eintragen.
8. Danach in Vercel die Domain-Verifizierung prüfen.

### Anleitung für Natalie: IONOS

1. Bei IONOS einloggen.
2. `Domains & SSL` öffnen.
3. `wirkungsoekonomie.de` auswählen.
4. Subdomain `akademie` anlegen, falls sie noch nicht vorhanden ist.
5. DNS der Subdomain öffnen.
6. Record hinzufügen.
7. `CNAME` auswählen.
8. Hostname: `akademie`
9. Ziel / zeigt auf: den von Vercel vorgegebenen CNAME-Wert eintragen.
10. Speichern.

Wichtig:

- Keine Weiterleitung / Redirect bei IONOS einrichten.
- Keine A-Records für `akademie` setzen, wenn Vercel für die Subdomain einen CNAME verlangt.
- Keine bestehende Hauptdomain `wirkungsoekonomie.de` verändern.
- Nur die Subdomain `akademie.wirkungsoekonomie.de` konfigurieren.

## 11. Offene Entscheidungen

### Discord

- Server ID festlegen.
- Rollen-ID `Akademie-Zugang` festlegen.
- Bot zum Server hinzufügen.
- Rechte und Intents prüfen.
- Text für nicht freigeschaltete Personen finalisieren.

### Supabase

- Soll Supabase Auth direkt Discord OAuth übernehmen?
- Soll es getrennte Supabase-Projekte für Preview und Produktion geben?
- Welche Daten dürfen gespeichert werden?
- Wie lange werden Prüfungsversuche gespeichert?

### Inhalte

- Wie werden Word- und PDF-Vorlagen an Codex übergeben?
- Welche MDX-Komponenten braucht eine gute Lernseite: Merkkasten, Reflexionsfrage, Prüfungshinweis, Downloadlink?
- Sollen PDF-Originale zusätzlich als Downloadlink angeboten werden?
- Wo liegen Pflichtlektüren?
- Welche Videos werden für Stufe 1 genutzt?

### Prüfung

- Wie viele Versuche pro Stufenprüfung?
- Welche Punktzahl gilt als bestanden?
- Dürfen Erklärungen direkt nach jeder Frage angezeigt werden?
- Soll eine falsche Antwort später erneut gestellt werden?
- Wann soll nach bestandener Prüfung die nächste Stufe freigeschaltet werden: manuell, automatisch vorgeschlagen oder später automatisiert?

### Zugang

- Soll die Rolle `Akademie-Zugang` dauerhaft gelten?
- Soll Zugang entzogen werden, wenn die Rolle auf Discord entfernt wird?
- Wie oft wird die Rolle neu geprüft?

## 12. Schritt-für-Schritt-Umsetzungsplan

### Phase 1: Projekt vorbereiten

1. Neues GitHub-Repo `woek-akademie-app` anlegen.
2. Next.js App mit TypeScript erstellen.
3. Vercel-Projekt mit GitHub-Repo verbinden.
4. Supabase-Projekt verbinden.
5. `.env.example` ohne echte Secrets anlegen.
6. `.env.local` in `.gitignore` aufnehmen.

### Phase 2: Auth und Discord

1. Discord OAuth in Supabase konfigurieren.
2. Callback URLs für lokal, Preview und Produktion eintragen.
3. Discord Bot erstellen oder vorhandene App als Bot konfigurieren.
4. Bot in Discord-Server einladen.
5. Environment Variables in Vercel setzen:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_GUILD_ID`
   - `DISCORD_ROLE_AKADEMIE_ZUGANG_ID`
   - `DISCORD_ROLE_KOHORTE_2026_V1_ID`
   - `DISCORD_ROLE_KOHORTE_2026_V2_ID`
   - `DISCORD_ROLE_STUDENT_ID`
   - `DISCORD_ROLE_ABSOLVENT_ID`
   - `DISCORD_ROLE_MENTOR_ID`
   - `DISCORD_ROLE_TEAM_ID`
   - `DISCORD_ROLE_AKADEMIE_LEITUNG_ID`
   - `DISCORD_ROLE_AKADEMIE_STUFE_1_ID`
   - `DISCORD_ROLE_AKADEMIE_STUFE_2_ID`
   - `DISCORD_ROLE_AKADEMIE_STUFE_3_ID`
   - `DISCORD_ROLE_AKADEMIE_STUFE_4_ID`
   - `DISCORD_EXAM_NOTIFICATION_WEBHOOK_URL` optional
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Server Route für Rollenprüfung bauen.
7. Geschützte Layouts mit serverseitigem Access Check bauen.

### Phase 3: Datenbank

1. Supabase Migrationen für Tabellen erstellen.
2. Row Level Security aktivieren.
3. Policies für eigene Fortschritte schreiben.
4. Seed-Daten für vier Stufen mit je vier Vorlesungsplätzen anlegen.
5. Testnutzer mit Discord Login prüfen.

### Phase 4: MVP Studienraum

1. Dashboard bauen.
2. Vier Stufen mit je vier Vorlesungsplätzen anzeigen.
3. Stufenfreigabe aus Discord-Rollen und Supabase Override berechnen.
4. Vorlesungsfreischaltung nach Reihenfolge implementieren.
5. Buttons `Skript gelesen` und `Video angesehen` speichern.
6. Prüfungsanmeldung nach Abschluss der vier Vorlesungen bauen.
7. Prüfungsfreigabe durch Akademie-Leitung bauen.
8. Prüfung serverseitig auswerten.
9. Ergebnisanzeige bauen.
10. Fortschrittsanzeige bauen.

### Phase 5: Leitungsdashboard

1. Route `/leitung` schützen.
2. Studierendenliste mit Kohorte, Stufe, Vorlesung, Fortschritt und Prüfungsstatus bauen.
3. Filter nach Kohorte, Stufe, Status und Prüfungsanfrage bauen.
4. Einzelprofil `/leitung/studierende/[userId]` bauen.
5. Offene Prüfungsanfragen anzeigen.
6. Aktionen für Prüfung freigeben, sperren, ablehnen und nächsten Versuch freigeben bauen.
7. Zertifikat manuell ausstellen und widerrufen vorbereiten.
8. Inhaltsverwaltung `/leitung/inhalte` für Titel, Beschreibung, Skript und YouTube-Link bauen.

### Phase 6: Deployment und Domain

1. Vercel Preview prüfen.
2. Production Deployment auf `main` aktivieren.
3. Domain `akademie.wirkungsoekonomie.de` in Vercel hinzufügen.
4. CNAME-Wert aus Vercel nach IONOS übertragen.
5. Vercel Domain Verification abwarten.
6. SSL/HTTPS prüfen.

### Phase 7: Qualitätssicherung

1. Login mit Discord testen.
2. Test ohne Rolle prüfen.
3. Test mit Rolle `Akademie-Zugang` prüfen.
4. Test ohne Stufenrolle prüfen.
5. Test mit Stufe 1 bis 4 prüfen.
6. Fortschritt speichern und erneut laden.
7. Vorlesungs-Freischaltung prüfen.
8. Prüfungsanmeldung und Freigabe prüfen.
9. Prüfungsauswertung manipulationssicher testen.
10. Vercel Preview und Production vergleichen.
11. Datenschutztexte für Akademie-App ergänzen.

## 13. MVP-Akademie-Struktur

Die operative App-Struktur besteht aus vier Akademie-Stufen bis zur finalen Prüfung.

Jede Stufe enthält vier Vorlesungen:

- Online-Skript
- YouTube-Video-Link
- optionaler Begleittext
- Button `Skript gelesen`
- Button `Video angesehen`
- gespeicherter Fortschritt

Stufe 1 startet inhaltlich mit:

1. Was ist Wirkungsökonomie?
2. Erfolg und Zukunft
3. Mensch, Planet und Demokratie
4. Wirkung statt bloßer Absicht

Stufe 2 bis 4 werden im MVP strukturell vorbereitet und über das Leitungsdashboard mit Inhalten befüllt.

Nach vier abgeschlossenen Vorlesungen kann eine Prüfungsanfrage gestellt werden. Die Prüfung wird erst nach manueller Freigabe durch Akademie-Leitung sichtbar.

## 14. Kurzfazit

Die sauberste Architektur ist eine getrennte Akademie-App:

- öffentliche Hauptwebsite weiter auf GitHub Pages
- geschützte Akademie-App auf Vercel
- Discord steuert Zugang, Kohorte und Stufe
- Supabase steuert Lernstand, Vorlesungen, Prüfungsanfragen, Prüfungsfreigaben, Prüfungsversuche und Zertifikate
- Inhalte im MVP wartungsarm über das Leitungsdashboard pflegbar

So bleibt die Website stabil, während die Akademie-App sicher wachsen kann.
