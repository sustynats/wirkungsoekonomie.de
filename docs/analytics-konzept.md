# Datensparsames Analytics-Konzept für Website und WÖk-Akademie-App

Stand: 20. Mai 2026

## 1. Ziel

Google Analytics soll ersetzt werden. Die Wirkungsökonomie braucht kein werbeorientiertes Tracking, sondern ein kleines eigenes System, das zeigt:

- welche Inhalte auf der öffentlichen Website genutzt werden
- welche Einstiegsseiten funktionieren
- wo Menschen im Lernpfad der Akademie stehen
- wo Inhalte unklar sind oder Lernpfade stocken

Der wichtigste Leitsatz:

Analytics sollen nicht zeigen, wie gut Marketing funktioniert. Sie sollen zeigen, ob Menschen die Wirkungsökonomie verstehen, welche Inhalte genutzt werden und wo Lernpfade stocken.

## 2. Warum kein Google Analytics

Google Analytics ist für Marketing, Attribution, Zielgruppenbildung und Kampagnenoptimierung gebaut. Für `wirkungsoekonomie.de` und die WÖk-Akademie ist das zu groß, zu unruhig und zu nah an Werbelogik.

Die gewünschte Lösung soll:

- keine Werbeprofile erzeugen
- keine Cross-Site-Verfolgung ermöglichen
- keine Third-Party-Cookies setzen
- keine vollständigen IP-Adressen dauerhaft speichern
- keine öffentlichen Website-Besucher:innen personenbezogen auswerten
- verständlich, wartungsarm und kontrollierbar bleiben

## 3. Trennung Website und Akademie

Es gibt zwei getrennte Analytics-Systeme.

### Öffentliche Website

Die öffentliche Website bleibt auf GitHub Pages. Sie erhält nur ein kleines First-Party-Script, das Ereignisse an einen API-Endpunkt der Akademie-App sendet:

`https://akademie.wirkungsoekonomie.de/api/site-event`

Die Website-Analytics sind möglichst anonym. Sie dienen der Inhalts- und Navigationsverbesserung, nicht der Nutzerprofilierung.

### Akademie-App

Die Akademie-App läuft unter:

`https://akademie.wirkungsoekonomie.de`

Hier sind bestimmte Daten personenbezogen, weil sie für Login, Lernstand, Prüfungen, Betreuung und Zertifikate notwendig sind. Diese Daten gehören zur Lernverwaltung und dürfen nur der Rolle `Akademie-Leitung` angezeigt werden.

Wichtig:

- Website Analytics und Akademie Analytics bleiben getrennt.
- Anonyme Website-Sessions werden nicht mit Akademie-Usern zusammengeführt.
- Erst wenn sich eine Person bewusst in die Akademie einloggt, entsteht ein personenbezogener Akademie-Kontext.

## 4. Metriken Website

Die öffentliche Website soll nur einfache, datensparsame Metriken erfassen.

### Kernmetriken

- Besucher heute
- Besucher gestern
- Besucher letzte 7 Tage
- Besucher letzter Monat
- frei definierbarer Zeitraum
- Seitenaufrufe
- meistbesuchte Seiten
- Einstiegsseiten
- Referrer grob, nur Domain
- durchschnittliche Verweildauer grob
- aktuell online
- Echtzeit: welche Seiten gerade besucht werden

### Optional, nur datenschutzarm

- wiederkehrende Besucher über kurzlebige First-Party-ID
- Seiten mit hoher Absprungrate
- outbound_click für wichtige externe Links

### Nicht vorgesehen

- Heatmaps
- Scrolltracking
- Werbe-Attribution
- komplexe Funnels
- A/B-Tests
- personenbezogene Profile

## 5. Metriken Akademie

Die Akademie-Analytics sind Teil der Lernverwaltung.

Erfasst werden:

- Anzahl Besucher Akademie
- Anzahl Logins
- Logins heute
- Logins letzte 7 Tage
- wer hat sich wann eingeloggt
- wer ist gerade online
- letzter Login pro Student:in
- aktuelle Kohorte
- aktuelle Stufe
- aktuelles Modul oder aktuelle Vorlesung
- Lernfortschritt
- gelesene Inhalte
- angesehene Videos
- bestandene Prüfungen
- offene Prüfungsanfragen
- Zertifikatsstatus

Normale Student:innen sehen nur den eigenen Lernstand. Akademie-Leitung sieht die aggregierte Übersicht und Einzelprofile.

## 6. Rollen und Zugriff

### Sichtbarkeit

- `Akademie-Leitung`: vollständiger Zugriff auf Website-Analytics und Akademie-Analytics
- `Team`: später optional eingeschränkter Zugriff
- `Student:in`: nur eigener Lernstand
- `Mentor:in`: später optional begrenzte Betreuungsansicht

### Routen

Bevorzugte Routen:

- `/analytics` für öffentliche Website-Analytics
- `/dozentin/analytics` oder perspektivisch `/leitung/analytics` für Akademie-Analytics

Da die Rolle `Akademie-Leitung` die höchste akademische Berechtigung ist, sollte die endgültige Route langfristig eher `/leitung/analytics` heißen. Wenn die aktuelle App bereits `/dozentin` nutzt, kann `/dozentin/analytics` als Alias erhalten bleiben.

## 7. Datenmodell Website

### site_events

```text
site_events
- id
- event_type
  Werte: page_view, heartbeat, outbound_click optional
- path
- title optional
- referrer_domain optional
- session_id_hash
- visitor_id_hash optional
- user_agent_hash optional
- country optional, nur grob und nur wenn datenschutzkonform
- created_at
```

### site_sessions

```text
site_sessions
- id
- session_id_hash
- visitor_id_hash optional
- first_seen_at
- last_seen_at
- landing_path
- referrer_domain optional
- pageview_count
- duration_seconds optional
```

### site_daily_stats

```text
site_daily_stats
- date
- visitors
- sessions
- pageviews
- avg_duration_seconds
- top_pages jsonb optional
```

### Datenschutzregeln Website

- IP-Adressen nicht dauerhaft speichern.
- Wenn IP für Missbrauchsschutz oder Hashing genutzt wird, dann nur serverseitig und nicht im Klartext speichern.
- Besser: zufällige First-Party-Session-ID mit kurzer Lebensdauer.
- Referrer nur als Domain speichern, nicht als vollständige URL mit Parametern.
- User Agent höchstens gehasht oder grob klassifiziert speichern.

## 8. Datenmodell Akademie

### academy_login_events

```text
academy_login_events
- id
- user_id
- discord_user_id
- login_at
- success
- reason optional
```

### academy_activity_events

```text
academy_activity_events
- id
- user_id
- event_type
  Werte: login, logout, page_view, content_opened, content_completed,
  video_opened, video_completed, quiz_started, quiz_submitted,
  module_completed, certificate_issued
- entity_type optional
- entity_id optional
- metadata jsonb optional
- created_at
```

### academy_presence

```text
academy_presence
- user_id
- last_seen_at
- current_path optional
- is_online berechnet aus last_seen_at < 5 Minuten
```

Die bestehenden Tabellen für `lecture_progress`, `exam_requests`, `exam_attempts`, `certificates` und `user_access` bleiben die fachliche Quelle für Lernstand, Prüfungen und Zertifikate.

## 9. Echtzeit und Online-Status

Für das MVP reicht ein Heartbeat.

### Website

- First-Party-Script sendet `page_view` beim Laden.
- Optional sendet es alle 30 bis 60 Sekunden `heartbeat`.
- Online = Session mit `last_seen_at` innerhalb der letzten 5 Minuten.

### Akademie-App

- eingeloggte Nutzer:innen senden serverseitig oder clientseitig einen Heartbeat
- `academy_presence.last_seen_at` wird aktualisiert
- online = `last_seen_at` innerhalb der letzten 5 Minuten

Keine Websocket- oder Realtime-Infrastruktur im MVP.

## 10. API-Endpunkte

Die API liegt in der Akademie-App.

```text
POST /api/site-event
```

Für anonyme Website-Events der öffentlichen Website.

```text
POST /api/academy-event
```

Für eingeloggte Akademie-Events.

```text
GET /api/analytics/site
```

Nur für `Akademie-Leitung`. Liefert Website-Metriken.

```text
GET /api/analytics/academy
```

Nur für `Akademie-Leitung`. Liefert Akademie-Metriken.

Alle Admin-Endpunkte müssen serverseitig prüfen:

- gültige Session
- Discord-Rollenstatus
- `is_akademie_leitung = true`

## 11. Tracking-Script öffentliche Website

Die öffentliche Website erhält nur ein kleines Script oder Snippet.

Eigenschaften:

- First-Party-Logik
- kein Google Analytics
- kein externer Trackinganbieter
- sehr geringe Datenmenge
- sendet `page_view` beim Laden
- sendet optional `heartbeat`
- respektiert Do Not Track optional
- respektiert Consent-Entscheidung, falls rechtlich notwendig
- funktioniert auf GitHub Pages
- sendet Events an `https://akademie.wirkungsoekonomie.de/api/site-event`

Das Script darf keine vollständigen IP-Adressen kennen oder speichern. Die API verarbeitet technische Requestdaten nur serverseitig und speichert nur datensparsame Ableitungen.

## 12. Website-Analytics-Dashboard

Route:

`/analytics`

Zugriff:

Nur `Akademie-Leitung`.

### Kopfbereich

- aktuell online
- Besucher heute
- Besucher gestern
- Besucher letzte 7 Tage
- Besucher letzter Monat

### Zeitraumfilter

- heute
- gestern
- letzte 7 Tage
- letzter Monat
- frei definierbar

### Tabellen und Karten

- meistbesuchte Seiten
- Einstiegsseiten
- Referrer grob
- durchschnittliche Verweildauer
- aktuelle Live-Seiten
- optional: Seiten mit hoher Absprungrate

Design:

- ruhig
- minimal
- keine bunte Marketing-SaaS-Optik
- passend zum WÖk-Designsystem

## 13. Akademie-Analytics-Dashboard

Route:

`/dozentin/analytics`

Langfristig zusätzlich oder alternativ:

`/leitung/analytics`

Zugriff:

Nur `Akademie-Leitung`.

### Kopfbereich

- aktive Studierende
- online jetzt
- Logins heute
- Logins letzte 7 Tage
- abgeschlossene Module oder Vorlesungen
- bestandene Prüfungen
- ausstehende Zertifikatsprüfungen

### Studierendenliste

- Discord-Username
- Kohorte
- Status
- letzter Login
- aktuell online ja/nein
- aktuelle Stufe
- aktuelle Vorlesung
- Gesamtfortschritt
- Zertifikatsstatus
- Link zum Studierendenprofil

Diese Ansicht ist eine Leitungsansicht, keine Rangliste.

## 14. Datenschutz

### Öffentliche Website

- datensparsam
- keine Werbeprofile
- kein Cross-Site-Tracking
- keine Third-Party-Cookies
- keine Speicherung vollständiger IP-Adressen
- keine personenbezogene Auswertung
- keine Vermischung mit Akademie-Accounts

### Akademie-App

- Lernfortschritt wird gespeichert, weil er für Teilnahme, Betreuung, Prüfungen und Zertifikate notwendig ist.
- Studierende müssen transparent darüber informiert werden.
- Dozentinnen- und Leitungsansicht ist nur für `Akademie-Leitung` sichtbar.
- Keine öffentlichen Ranglisten.
- Keine unnötige Verhaltensüberwachung.
- Kein automatisches Time-Tracking im MVP.
- Status `gelesen` und `gesehen` wird aktiv durch Buttons bestätigt.

Die Datenschutzseite sollte später um einen Abschnitt zur Akademie-App und zu den datensparsamen Website-Analytics ergänzt werden.

## 15. MVP

### Website MVP

- `page_view`
- `heartbeat`
- Besucher heute
- Besucher letzte 7 Tage
- meistbesuchte Seiten
- aktuell online

### Akademie MVP

- Login-Events
- `last_seen_at`
- online jetzt
- letzter Login
- Lernfortschritt
- Studierendenliste mit Fortschritt

Nicht im MVP:

- Heatmaps
- Scrolltracking
- komplexe Funnels
- Marketing-Attribution
- A/B-Tests
- Nutzerprofile für öffentliche Website
- vollautomatisches Time-Tracking

## 16. Spätere Ausbaustufen

- Export von aggregierten Website-Statistiken
- monatliche Inhaltsauswertung
- Hinweis auf Seiten mit hoher Abbruchrate
- Lernpfad-Analyse pro Kohorte
- Anzeige, wo Studierende typischerweise stocken
- optionale Mentor:innenansicht
- optionale Discord-Benachrichtigung bei längerer Inaktivität, nur wenn pädagogisch sinnvoll und transparent

## 17. Deployment und Pflege

- Analytics-API, Dashboards und Datenmodell liegen im Akademie-App-Repo.
- Öffentliche Website erhält nur ein kleines Script oder Snippet.
- Deployment der Akademie-App läuft über GitHub -> Vercel.
- Website-Anpassung läuft über das bestehende Website-Repo.
- Keine Secrets im Repo.
- Supabase Service Role Key bleibt ausschließlich in Vercel Environment Variables.

## 18. Offene Entscheidungen

- Ist für öffentliche Website-Analytics ein Consent-Banner erforderlich oder reicht berechtigtes Interesse bei echter Datensparsamkeit?
- Soll Do Not Track strikt respektiert werden?
- Soll `visitor_id_hash` überhaupt verwendet werden oder reicht eine kurzlebige Session-ID?
- Wie lange werden Website-Events gespeichert, bevor sie aggregiert oder gelöscht werden?
- Wie lange werden Akademie-Activity-Events nach Abschluss aufbewahrt?
- Soll `/analytics` öffentlich gar nicht verlinkt, sondern nur intern erreichbar sein?

