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
5. Das Ergebnis wird in Supabase in `enrollments` gespeichert.
6. Geschützte Seiten prüfen nicht nur eine Session, sondern auch den aktiven Enrollment-Status.

Wichtig:

- Die Discord Rollen-ID sollte als Environment Variable gespeichert werden.
- Der Discord Bot muss auf dem Server sein.
- Der Bot benötigt die passenden Rechte, um Mitglieder und Rollen zu lesen.
- Je nach Discord-Konfiguration kann der Server Members Intent nötig sein.
- Der Discord Bot Token darf nie im Browser landen.

### Rollen- und Statuslogik

Mögliche Enrollment-Status:

- `pending`: Login vorhanden, Rolle noch nicht bestätigt
- `active`: Rolle bestätigt, Zugang erlaubt
- `revoked`: Zugang wurde entzogen
- `completed`: Akademie abgeschlossen

Die App sollte die Rolle nicht nur beim ersten Login prüfen, sondern regelmäßig erneut:

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
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
```

### enrollments

Speichert den Zugang zur Akademie.

```sql
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending',
  discord_role_verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id)
);
```

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

### Row Level Security

Empfohlene Grundregeln:

- Teilnehmer:innen dürfen nur eigene Fortschritte, Versuche und Antworten lesen.
- Teilnehmer:innen dürfen Fortschritte nur für sich selbst schreiben.
- Prüfungsfragen und richtige Antworten dürfen nicht vollständig an den Client ausgeliefert werden.
- Die Bewertung von Prüfungen muss serverseitig erfolgen.
- Der Supabase Service Role Key darf nur in Vercel Server Routes verwendet werden.

## 6. MVP-Umfang

Der MVP sollte nur Teil I abbilden.

### Teil I - Grundverständnis

Vier Module:

1. Was ist Wirkungsökonomie?
2. Erfolg und Zukunft
3. Mensch, Planet und Demokratie
4. Wirkung statt bloßer Absicht

### MVP-Funktionen

- Discord Login
- serverseitige Rollenprüfung `Akademie-Zugang`
- persönliches Dashboard
- Anzeige Teil I mit 4 Modulen
- pro Modul:
  - kurze Einführung
  - Pflichtlektüre oder Dokument
  - Video-Link
  - Button `gelesen`
  - Button `angesehen`
  - 3 bis 5 Prüfungsfragen
- Lernfortschritt speichern
- nächstes Modul erst nach Abschluss freischalten
- einfache Ergebnisanzeige
- keine Zertifikatsautomatik
- kein komplexer Adminbereich

### Content-Pflege im MVP

Natalie soll Inhalte möglichst über Codex/GitHub pflegen können. Deshalb empfiehlt sich:

- Inhalte zunächst als Markdown/MDX oder TypeScript-Daten im Repo pflegen.
- Video-Links als externe URLs hinterlegen.
- PDFs und öffentliche Lektüren auf der Hauptwebsite verlinken.
- Quizfragen als strukturierte Seed-Daten pflegen.
- Änderungen über Pull Requests prüfen und deployen.

Videos sollen im MVP nicht selbst gehostet werden. Geeignet sind:

- YouTube ungelistet
- Vimeo privat/ungelistet
- vergleichbare externe Video-Links

## 7. Spätere Ausbaustufen

### Ausbau 1

- alle 7 Teile mit je 4 Modulen
- Fortschrittsübersicht pro Teil
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

- Adminbereich
- Teilnehmer:innen-Übersicht
- Modulverwaltung
- Fragenverwaltung
- manuelle Freischaltungen
- Export von Fortschritten

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
    academy/
      teil-1/
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

- Werden Module als MDX im Repo gepflegt oder direkt in Supabase gespeichert?
- Empfehlung für MVP: Inhalte im Repo pflegen, Fortschritt in Supabase speichern.
- Wo liegen Pflichtlektüren?
- Welche Videos werden für Teil I genutzt?

### Prüfung

- Wie viele Versuche pro Modul?
- Welche Punktzahl gilt als bestanden?
- Dürfen Erklärungen direkt nach jeder Frage angezeigt werden?
- Soll eine falsche Antwort später erneut gestellt werden?

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
   - `DISCORD_ACADEMY_ROLE_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Server Route für Rollenprüfung bauen.
7. Geschützte Layouts mit serverseitigem Access Check bauen.

### Phase 3: Datenbank

1. Supabase Migrationen für Tabellen erstellen.
2. Row Level Security aktivieren.
3. Policies für eigene Fortschritte schreiben.
4. Seed-Daten für Teil I anlegen.
5. Testnutzer mit Discord Login prüfen.

### Phase 4: MVP Studienraum

1. Dashboard bauen.
2. Teil I mit vier Modulen anzeigen.
3. Modul-Freischaltung nach Reihenfolge implementieren.
4. Buttons `gelesen` und `angesehen` speichern.
5. Quiz pro Modul serverseitig auswerten.
6. Ergebnisanzeige bauen.
7. Fortschrittsanzeige bauen.

### Phase 5: Deployment und Domain

1. Vercel Preview prüfen.
2. Production Deployment auf `main` aktivieren.
3. Domain `akademie.wirkungsoekonomie.de` in Vercel hinzufügen.
4. CNAME-Wert aus Vercel nach IONOS übertragen.
5. Vercel Domain Verification abwarten.
6. SSL/HTTPS prüfen.

### Phase 6: Qualitätssicherung

1. Login mit Discord testen.
2. Test ohne Rolle prüfen.
3. Test mit Rolle `Akademie-Zugang` prüfen.
4. Fortschritt speichern und erneut laden.
5. Modul-Freischaltung prüfen.
6. Quiz-Auswertung manipulierungssicher testen.
7. Vercel Preview und Production vergleichen.
8. Datenschutztexte für Akademie-App ergänzen.

## 13. MVP-Akademie-Struktur

Die Gesamtakademie besteht perspektivisch aus sieben Teilen:

1. Teil I - Grundverständnis
2. Teil II - Wirkungskompetenz
3. Teil III - Maßstab und Bewertung
4. Teil IV - Steuerung und Rückkopplung
5. Teil V - Anwendung in Feldern
6. Teil VI - Transformation und Systemdesign
7. Teil VII - Praxisprojekt / Abschluss

Der MVP startet nur mit Teil I.

Teil I enthält:

1. Was ist Wirkungsökonomie?
2. Erfolg und Zukunft
3. Mensch, Planet und Demokratie
4. Wirkung statt bloßer Absicht

Jedes Modul enthält:

- Einführung
- Pflichtlektüre oder Dokument
- Video-Link
- Status `gelesen`
- Status `angesehen`
- Quiz mit 3 bis 5 Fragen
- gespeicherter Fortschritt

## 14. Kurzfazit

Die sauberste Architektur ist eine getrennte Akademie-App:

- öffentliche Hauptwebsite weiter auf GitHub Pages
- geschützte Akademie-App auf Vercel
- Discord als Zugangssystem
- Supabase als Lernstand- und Prüfungsdatenbank
- Inhalte wartungsarm über GitHub und Codex pflegbar

So bleibt die Website stabil, während die Akademie-App sicher wachsen kann.
