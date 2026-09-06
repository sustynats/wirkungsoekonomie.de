# Umfragen · Chronik, Aufgaben und Abnahmekriterien

Verantwortlich: Natalie Weber. Öffentlich freigegebene Projektdokumentation.

Rückblickend dokumentiert am 6. September 2026. Die genannten historischen Daten bezeichnen belegte Arbeits- oder Veröffentlichungsstände, nicht das Erstellungsdatum dieser Akte. Ein früheres, genaues Ideendatum ist nicht belegt. Offene Aufgaben sind Arbeitsaufträge; eine unabhängige Abnahme wird dadurch nicht behauptet.

## Belegter Verlauf

### 2026-09-04 · Umfragemodul und erste Umfrage veröffentlicht
Der öffentliche Katalog dokumentiert 08:23:28 UTC als Veröffentlichungszeit der Wirkungsticker-Umfrage. Die Betriebsdokumentation hält Website- und API-Abnahme fest.

Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/content/polls/public-catalog.json

### 2026-09-04 · Stabiler Betrieb und Auffindbarkeit abgesichert
Bestehender Oracle-Dienst, dauerhafte Stimmen, interne Freitextrückmeldung, tägliche lokale Sicherung und Footer-Verlinkung sind dokumentiert.

Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md

### 2026-09-06 · Zweite Umfrage in Umsetzung
Die Projektinhaberin bestätigt die laufende Umsetzung einer weiteren Umfrage. Sie bleibt ein Arbeitsstand; ein Veröffentlichungsdatum wird nicht vorweggenommen.

Beleg: Projektauftrag der Inhaberin vom 06.09.2026.

### 2026-09-06 · Institutsprojekt nachgetragen
Auftrag, Konzept, Chronik und Aufgaben sind der Projektinhaberin Natalie Weber zugeordnet. Die erste und die zweite Umfrage erhalten getrennte Arbeitsstände.

Beleg: Projektauftrag der Inhaberin vom 06.09.2026.

## Aufgaben und Arbeitsstände

### UMF-01 · Auftrag und Zustandsmodell des Umfragemoduls definieren
- Arbeits-/Belegdatum: 2026-09-04
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Öffentliche Rückmeldungen ohne Konto ermöglichen und Status/Freigabe klar regeln.
- Ergebnis/Arbeitsstand: Umfragemodul mit Entwurf, Planung, Aktiv, Pause, Ende und Archiv implementiert.
- Abnahmekriterium: Gespeicherter Entwurf und tatsächlich veröffentlichte Umfrage werden getrennt.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md

### UMF-02 · Oracle-Datenspeicherung und Administration umsetzen
- Arbeits-/Belegdatum: 2026-09-04
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Umfragen und Stimmen im vorhandenen Oracle-Dienst dauerhaft speichern.
- Ergebnis/Arbeitsstand: Datenbank, Administration und automatische statische Veröffentlichung dokumentiert.
- Abnahmekriterium: Stimmen überstehen Deployments; Entwürfe und private Angaben erscheinen nicht im öffentlichen Export.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md

### UMF-03 · Erste Wirkungsticker-Umfrage erstellen und veröffentlichen
- Arbeits-/Belegdatum: 2026-09-04
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Frage, vier Antwortoptionen und verständlichen Einstieg zum neuen Wirkungsticker bereitstellen.
- Ergebnis/Arbeitsstand: Umfrage seit 04.09.2026 öffentlich erreichbar.
- Abnahmekriterium: Der veröffentlichte Katalog und die Live-Seite stimmen überein.
- Beleg: https://wirkungsoekonomie.de/umfragen/wirkungsticker-feedback/

### UMF-04 · Ergebnisregeln und internes Freitextfeedback prüfen
- Arbeits-/Belegdatum: 2026-09-04
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Ergebnisse erst entsprechend der konfigurierten Regel anzeigen; optionale Kommentare schützen.
- Ergebnis/Arbeitsstand: Erste Umfrage zeigt Ergebnisse nach eigener Abstimmung; Feedback ist nur intern einsehbar.
- Abnahmekriterium: Keine öffentlichen Einzelantworten oder Kommentare; Stimme bleibt unabhängig vom Kommentar gespeichert.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md

### UMF-05 · Live-Abnahme, mobile Ansicht und Mehrfachschutz durchführen
- Arbeits-/Belegdatum: 2026-09-04
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Öffentliche Seite, API, Mobilansicht und Persistenz prüfen.
- Ergebnis/Arbeitsstand: Betriebsdokumentation nennt bestandene automatisierte und Browser-Prüfungen mit separater Testumfrage.
- Abnahmekriterium: Keine Teststimmen in echte Umfragen; Grenzen einfacher Mehrfachschutzmaßnahmen transparent machen.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md

### UMF-06 · Navigation, Suche und regelmäßige Sicherung integrieren
- Arbeits-/Belegdatum: 2026-09-04
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Öffentliche Umfragen auffindbar machen und Daten vor lokalem Defekt sichern.
- Ergebnis/Arbeitsstand: Footer, Suche und tägliche Sicherung auf dem Server sind dokumentiert.
- Abnahmekriterium: Eine Sicherung auf demselben Server wird nicht als externe Sicherung ausgegeben.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md

### UMF-07 · Zweite Umfrage konzipieren und umsetzen
- Arbeits-/Belegdatum: 2026-09-06
- Status: In Arbeit
- Verantwortlich: Natalie Weber
- Auftrag: Fragestellung, Zielgruppe, Antwortoptionen, Erläuterung und Ergebnisregeln für die zweite Umfrage ausarbeiten.
- Ergebnis/Arbeitsstand: Laufende Umsetzung durch die Projektinhaberin bestätigt; Veröffentlichung noch offen.
- Abnahmekriterium: Frage und Optionen sind verständlich, nicht suggestiv und vor Livegang geprüft.
- Beleg: Projektauftrag vom 06.09.2026; Fertigstellung offen.

### UMF-08 · Zweite Umfrage prüfen und freigeben
- Arbeits-/Belegdatum: 2026-09-06
- Status: Backlog
- Verantwortlich: Natalie Weber
- Auftrag: Die konkrete zweite Umfrage nach Fertigstellung fachlich und technisch prüfen.
- Ergebnis/Arbeitsstand: Offener Folgeschritt, abhängig von UMF-07.
- Abnahmekriterium: Live-Link, Status, Mobilansicht, Ergebnisregeln und Datenschutz prüfen; reales Veröffentlichungsdatum erst danach eintragen.
- Beleg: Projektauftrag vom 06.09.2026; Fertigstellung offen.

### UMF-09 · Erste Umfrage auswerten und Rückkopplung dokumentieren
- Arbeits-/Belegdatum: 2026-09-06
- Status: Bereit
- Verantwortlich: Natalie Weber
- Auftrag: Aggregierte Antworten und vertrauliche Hinweise sichten; Verbesserungen des Wirkungstickers ableiten.
- Ergebnis/Arbeitsstand: Noch keine abgeschlossene Auswertung in dieser Akte belegt.
- Abnahmekriterium: Keine Repräsentativität behaupten; veröffentlichte Schlussfolgerungen von privaten Freitexten trennen.
- Beleg: https://wirkungsoekonomie.de/umfragen/wirkungsticker-feedback/

### UMF-10 · Externe Sicherung des Umfragebestands prüfen
- Arbeits-/Belegdatum: 2026-09-06
- Status: Backlog
- Verantwortlich: Natalie Weber
- Auftrag: Vorhandene Oracle-Backupmöglichkeiten auf eine zusätzliche Sicherung außerhalb des Servers prüfen.
- Ergebnis/Arbeitsstand: Betriebsdokumentation bezeichnet die externe Sicherung als offenen Punkt.
- Abnahmekriterium: Sicherung und Wiederherstellung nachweisen, ohne neue private Daten in Vercel oder öffentliche Artefakte zu schreiben.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md

## Verbindungen

- Öffentliches Angebot: https://wirkungsoekonomie.de/umfragen/
- Institutsprojekt: https://institut.wirkungsoekonomie.de/projekte/umfragen
- Projektwerkstatt mit Aufgaben: https://institut.wirkungsoekonomie.de/werkstatt/umfragen

## Quellen und Ergebniszugänge

- [Architektur, Betrieb und dokumentierte Live-Abnahme](https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/umfragen.md)
- [Erste Umfrage](https://wirkungsoekonomie.de/umfragen/wirkungsticker-feedback/)
- [Erstes vollständiges Pages-Release](https://github.com/sustynats/wirkungsoekonomie.de/commit/caa7701c0b15ea6985bc17f577d68728463b8980)
- [Öffentlicher Umfragekatalog](https://github.com/sustynats/wirkungsoekonomie.de/blob/main/content/polls/public-catalog.json)
