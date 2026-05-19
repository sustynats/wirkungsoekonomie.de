# Leitungsdashboard-Konzept für die WÖk-Akademie-App

Stand: 19. Mai 2026

## Zweck

Das Leitungsdashboard ist der geschützte Arbeitsbereich für Natalie und die Akademie-Leitung.

Es bündelt:

- Studierendenübersicht
- Lernfortschritte
- Stufen- und Vorlesungsstatus
- Prüfungsanfragen
- Prüfungsfreigaben
- Inhaltsverwaltung
- Zertifikatsverwaltung

Der Bereich soll ruhig, sachlich und akademisch wirken. Keine grelle Lernplattform-Optik, keine Ranglisten, keine Gamification.

## Berechtigungen

Route:

`/leitung`

Zugriff:

Nur User mit `is_akademie_leitung = true`.

Quelle:

Discord-Rolle `Akademie-Leitung`, serverseitig geprüft und in Supabase `user_access.is_akademie_leitung` gespeichert.

Wenn jemand ohne Rolle die Seite öffnet:

`Dieser Bereich ist nur für die Akademie-Leitung freigeschaltet.`

## Unterschied Team und Akademie-Leitung

Team:

- Moderation
- Technik
- Redaktion
- interne Vorschau

Akademie-Leitung:

- Vollzugriff
- akademische Freigaben
- Prüfungsfreigaben
- Zertifikatsverwaltung
- manuelle Fortschrittskorrekturen
- Inhaltsverwaltung

Team darf im MVP keine Zertifikate ausstellen und keine Prüfungen freigeben.

## Seitenstruktur

### `/leitung`

Hauptdashboard mit:

- Kennzahlen
- Studierendenliste
- offene Prüfungsanfragen
- schnelle Filter
- Link zur Inhaltsverwaltung

### `/leitung/studierende/[userId]`

Einzelprofil pro Student:in.

### `/leitung/inhalte`

Verwaltung von Stufen, Vorlesungen, Skripten und YouTube-Links.

### `/zertifikat/[certificateCode]`

Öffentliche Verifizierungsseite für ausgestellte Zertifikate.

## Studierendenliste

Felder:

- Discord-Username
- Kohorte
- höchste freigeschaltete Stufe
- aktuelle Stufe
- aktuelle Vorlesung
- Fortschritt insgesamt in Prozent
- Fortschritt aktuelle Stufe in Prozent
- offene Prüfungsanfrage ja/nein
- Prüfung freigegeben ja/nein
- letzte Aktivität
- Status: aktiv, stockt, inaktiv, abgeschlossen
- Link `Student ansehen`

Filter:

- Kohorte
- Stufe
- Status
- Prüfungsanfrage offen
- Prüfung freigegeben
- Suche nach Discord-Username

## Einzelprofil

Route:

`/leitung/studierende/[userId]`

Anzeigen:

- Discord-Username
- Discord-ID
- Kohorte
- Rollenstatus
- höchste freigeschaltete Stufe
- aktuelle Stufe
- aktuelle Vorlesung
- gesamter Fortschritt
- Fortschritt pro Stufe
- Fortschritt pro Vorlesung
- gelesene Skripte
- angesehene Videos
- Prüfungsanfragen
- Prüfungsfreigaben
- Prüfungsversuche
- bestandene Prüfungen
- nicht bestandene Prüfungen
- Zertifikate
- letzte Aktivität

Aktionen:

- Prüfung freigeben
- Prüfung sperren
- Prüfungsanfrage ablehnen
- nächsten Versuch freigeben
- Zertifikat ausstellen
- Zertifikat widerrufen
- manuelle Notiz hinzufügen
- manuelle Fortschrittskorrektur

Alle Aktionen sind nur für Akademie-Leitung verfügbar.

## Prüfungsanfragen

Offene Prüfungsanfragen erscheinen im Dashboard unter:

`Offene Prüfungsanfragen`

Eintrag:

- Discord-Username
- Kohorte
- Stufe
- Zeitpunkt der Anfrage
- Fortschritt in der Stufe
- Aktion `Prüfung freigeben`
- Aktion `Ablehnen`

Optional später:

Discord-Webhook in privaten Kanal `#akademie-pruefungen-intern`.

Environment Variable:

`DISCORD_EXAM_NOTIFICATION_WEBHOOK_URL`

Nachricht:

`Neue Prüfungsanmeldung: [Discord-Username] - Stufe [X] - Kohorte [Y]`

## Inhaltsverwaltung

Route:

`/leitung/inhalte`

Funktionen:

- Stufe auswählen
- Vorlesung auswählen
- Titel bearbeiten
- Kurzbeschreibung bearbeiten
- Skriptinhalt bearbeiten oder Skript-URL hinterlegen
- YouTube-Link hinterlegen
- Video als required markieren
- Skript als required markieren
- Reihenfolge bearbeiten
- veröffentlichen / unveröffentlicht setzen

## Content-Modell im MVP

Empfohlen: Inhalte in Supabase speichern.

Tabelle:

- `stages`
- `lectures`

Wichtige Felder in `lectures`:

- `title`
- `slug`
- `description`
- `script_body_markdown`
- `script_url`
- `video_url`
- `required_script`
- `required_video`
- `published`
- `order_index`

Vorteil:

Natalie kann Skripte und YouTube-Links im Leitungsdashboard pflegen, ohne GitHub oder Vercel anfassen zu müssen.

## Zertifikate

Zertifikate werden nicht automatisch erzeugt.

Workflow:

1. Student:in erfüllt Abschlussbedingungen.
2. Leitungsdashboard zeigt `Bereit zur Zertifizierung`.
3. Akademie-Leitung prüft final.
4. Akademie-Leitung klickt `Zertifikat ausstellen`.
5. Zertifikatscode wird automatisch erzeugt.
6. Öffentliche Verifizierungsseite wird aktiviert.

Codeformat:

- `WOEK-2026-00017`
- oder `WOEK-PRACT-2026-017`

Aktionen:

- Zertifikat ausstellen
- Zertifikat widerrufen
- Verifizierungsseite öffnen
- später QR-Code erzeugen

## MVP-Funktionen

- Login als Akademie-Leitung
- Route `/leitung`
- Liste aller Studierenden
- Filter nach Kohorte und Stufe
- Fortschritt in Prozent
- aktuelle Vorlesung
- zuletzt aktiv
- offene Prüfungsanfragen
- Prüfung freigeben
- Prüfung ablehnen
- Detailseite pro Student:in
- Anzeige gelesener Skripte, Videos und Prüfungen
- Inhalte und YouTube-Links pflegen
- Zertifikat manuell ausstellen

## Nicht im MVP

- automatische Nachrichten
- komplexes Mentoring
- Notenbuch
- Ranglisten
- Zahlungslogik
- KI-Auswertung von Freitexten
- vollautomatisches Video-Tracking
- eigene Video-Hosting-Infrastruktur

## Datenschutz

- Studierende müssen wissen, dass Lernfortschritt gespeichert wird.
- Gespeichert wird nur, was für die Akademie notwendig ist.
- Keine öffentlichen Ranglisten.
- Kein heimliches Tracking.
- Skript gelesen und Video angesehen werden durch aktive Buttons bestätigt.
- Time-Tracking nicht im MVP.
- Leitungsdashboard nur für Akademie-Leitung.
- Prüfungs- und Zertifikatsdaten sind besonders sorgfältig zu behandeln.
