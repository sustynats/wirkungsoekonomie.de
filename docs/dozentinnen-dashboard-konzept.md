# Dozentinnen-Dashboard-Konzept

Hinweis: Dieses Dokument beschreibt die erste Dashboard-Idee. Für die aktuelle Stufen-, Vorlesungs-, Prüfungsfreigabe- und Zertifikatslogik ist `docs/leitungsdashboard-konzept.md` maßgeblich. Die operative Route heißt künftig `/leitung`, nicht `/dozentin`.

## Ziel

Natalie braucht einen geschützten Leitungsbereich für die WÖk-Akademie. Dort sieht sie alle Studierenden, Kohorten, Lernstände, Prüfungen und später Zertifikate.

Der Bereich soll ruhig, sachlich und akademisch wirken. Keine grelle Lernplattform-Optik, keine Ranglisten, keine Gamification.

## Berechtigungen

### Akademie-Leitung

`Akademie-Leitung` ist die höchste Berechtigungsstufe der Akademie-App.

Darf:

- alle Studierenden sehen
- alle Kohorten sehen
- alle Inhalte sehen
- alle Lernstände sehen
- Zertifikate manuell ausstellen
- Zertifikate widerrufen
- Zertifikate neu erzeugen
- Zertifikatsstatus ändern
- Abschlussstatus setzen
- Studierende freischalten
- Inhalte und Prüfungen später verwalten

### Team

`Team` bleibt davon getrennt.

Team steht für:

- Moderation
- Technik
- Redaktion
- interne Vorschau

Team ist nicht automatisch akademische Vollfreigabe.

## Seitenstruktur

### `/leitung`

Dashboard für Akademie-Leitung:

- Übersicht
- Kennzahlen
- Studierendenliste
- Filter
- Links zu Einzelprofilen

### `/leitung/studierende/[userId]`

Einzelprofil:

- Discord-Username
- Kohorte
- Statusrollen
- letzter Login
- gesamter Fortschritt
- Fortschritt je Teil
- Fortschritt je Modul
- gelesene Inhalte
- angesehene Videos
- Prüfungsversuche
- nächste Aufgabe

### `/zertifikat/[certificateCode]`

Öffentliche Verifizierungsseite für freigegebene Zertifikate.

## Datenmodell

Benötigte Tabellen und Views:

- `users`
- `user_access`
- `cohorts`
- `course_versions`
- `academy_parts`
- `modules`
- `content_items`
- `content_progress`
- `module_progress`
- `exams`
- `exam_attempts`
- `exam_answers`
- `student_progress_summary`
- `certificate_types`
- `certificates`

### content_items

Jede Lerneinheit wird als Content Item geführt:

- article
- script
- lesson
- video
- reflection
- quiz

### content_progress

Speichert pro Person und Inhalt:

- not_started
- opened
- completed
- opened_at
- completed_at
- last_seen_at
- progress_percent

Bei Skripten und Videos wird Abschluss aktiv per Button bestätigt.

### certificates

Zertifikate:

- werden nicht automatisch erzeugt
- werden durch Akademie-Leitung manuell freigegeben
- erhalten eindeutigen Code
- erhalten öffentliche Verifizierung
- können widerrufen, ersetzt oder optional als abgelaufen markiert werden

## Progress-Berechnung

Ein Modul gilt als abgeschlossen, wenn:

- alle verpflichtenden Content Items completed sind
- ein verpflichtendes Video completed ist
- ein verpflichtendes Quiz bestanden ist

Berechnung:

- Modulfortschritt = abgeschlossene verpflichtende Inhalte / alle verpflichtenden Inhalte.
- Teilfortschritt = abgeschlossene Module / alle Module im Teil.
- Gesamtfortschritt = abgeschlossene Module / alle Module des zugewiesenen Kurses.

Freischaltung:

- Modul 1 ist nach Zugang offen.
- Modul 2 öffnet nach Abschluss von Modul 1.
- Modul 3 öffnet nach Abschluss von Modul 2.
- Modul 4 öffnet nach Abschluss von Modul 3.
- Der nächste Teil öffnet nach Abschluss aller vier Module des vorherigen Teils.
- Akademie-Leitung sieht immer alles.

## UI-Skizze in Textform

### Dashboard-Kopf

Kicker: Dozentinnen-Dashboard

Titel: Akademie-Leitung

Kurztext: Lernstände, Kohorten und nächste Schritte der Studierenden.

### Kennzahlen

Vier ruhige Kacheln:

- Studierende gesamt
- aktive Studierende
- Durchschnittlicher Fortschritt
- bestandene Prüfungen

### Studierendenliste

Tabelle:

- Name
- Kohorte
- Status
- aktuelles Modul
- Fortschritt
- zuletzt aktiv
- Prüfungen
- Profil ansehen

### Einzelprofil

Kopf:

- Name
- Kohorte
- Status

Kacheln:

- Gesamtfortschritt
- abgeschlossene Inhalte
- bestandene Prüfungen

Listen:

- gelesene Skripte
- gesehene Videos
- Prüfungsversuche

## MVP-Funktionen

- Login als Akademie-Leitung
- Liste aller Studierenden
- Filter nach Kohorte
- Fortschritt in Prozent
- aktuelles Modul
- zuletzt aktiv
- Detailseite pro Student:in
- Anzeige gelesener Inhalte, Videos und Prüfungen

## Nicht im MVP

- automatische Nachrichten
- komplexes Mentoring
- Notenbuch
- Zertifikatsverwaltung im UI
- Ranglisten
- Zahlungslogik

## Spätere Ausbaustufen

- Zertifikat ausstellen
- Zertifikat widerrufen
- Verifizierungsseite öffnen
- Zertifikats-PDF erzeugen
- QR-Code auf Zertifikat
- Mentor:innen-Dashboard
- Adminbereich für Inhalte und Prüfungen
- Abschlussstatus setzen
- Reflexionsaufgaben prüfen
