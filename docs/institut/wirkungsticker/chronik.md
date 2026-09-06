# Wirkungsticker · Chronik, Aufgaben und Abnahmekriterien

Verantwortlich: Natalie Weber. Öffentlich freigegebene Projektdokumentation.

Rückblickend dokumentiert am 6. September 2026. Die genannten historischen Daten bezeichnen belegte Arbeits- oder Veröffentlichungsstände, nicht das Erstellungsdatum dieser Akte. Ein früheres, genaues Ideendatum ist nicht belegt. Offene Aufgaben sind Arbeitsaufträge; eine unabhängige Abnahme wird dadurch nicht behauptet.

## Belegter Verlauf

### 2026-09-03 · Erste Implementierung und öffentlicher Start
Die erste Implementierung wurde am 02.09. um 23:19 UTC, also am 03.09. um 01:19 in Deutschland, versioniert. Die Veröffentlichungsübersicht führt den Start am 03.09.

Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/8090868b1b

### 2026-09-03 · Lebende Akten, getrennte Prüfungen und App
Automatische Aktualisierungen, Quellenzusammenfassung, Fakten-/Folgencheck und App-Funktionen wurden schrittweise ergänzt.

Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/1f6ed47554

### 2026-09-04 · Titelbilder und Rückmeldung
Titelbild- und App-Ausgabe wurden stabilisiert; die erste öffentliche Umfrage sammelt Rückmeldungen zum Ticker.

Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/6c88c6897a

### 2026-09-05 · Quellenintegrität und Medienprüfung vertieft
Mehrquellenakten, belegte Medienbefunde und redaktionelle Analysen wurden erweitert; Ablehnungen und Korrekturen bleiben prüfbar.

Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/8c1018c55f

### 2026-09-06 · Warteschlange und Betriebsbeobachtung
Technische Wiederholungen, fehlende KI-Entscheidungen und Budgetpriorisierung werden getrennt; die Institutsakte wird nachgetragen.

Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/4141e9b3c9

## Aufgaben und Arbeitsstände

### TIC-01 · Projektidee und redaktionellen Auftrag strukturieren
- Arbeits-/Belegdatum: 2026-09-03
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Ausgewählte Nachrichten nach möglichen Zustandsveränderungen statt bloßer Aufmerksamkeit einordnen.
- Ergebnis/Arbeitsstand: Erste Implementierung und veröffentlichter Produkteinstieg liegen vor.
- Abnahmekriterium: Auftrag, Zielgruppe und Aussagegrenzen sind dokumentiert.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/8090868b1b

### TIC-02 · Quellenregister, Import und Deduplizierung aufbauen
- Arbeits-/Belegdatum: 2026-09-03
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Freigegebene Quellen erfassen, Einträge normalisieren und Wiederholungen erkennen.
- Ergebnis/Arbeitsstand: Versioniertes Register und automatische Verarbeitung vorhanden.
- Abnahmekriterium: Quelle, Aktualität und Dublettenstatus sind nachvollziehbar.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/ops/WIRKUNGSTICKER.md

### TIC-03 · Quellenzusammenfassung von Analyse trennen
- Arbeits-/Belegdatum: 2026-09-03
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Zuerst den Quelleninhalt erklären, danach Fakten- und Folgencheck.
- Ergebnis/Arbeitsstand: Eigenständige neutrale Zusammenfassung wurde implementiert.
- Abnahmekriterium: Lesende erkennen, was Quelle, Behauptung und eigene Einordnung ist.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/e9e58e7ba8

### TIC-04 · Relevanz-, Evidenz- und Publikationsgates umsetzen
- Arbeits-/Belegdatum: 2026-09-03
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Neuigkeit, materielle mögliche Zustandsveränderung und Primärquellenbasis prüfen.
- Ergebnis/Arbeitsstand: Publikationsgates und Ausschlussregeln sind dokumentiert und implementiert.
- Abnahmekriterium: Ungestützte Aussagen, Personenrankings und Scheingenauigkeit blockieren eine Veröffentlichung.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/ops/WIRKUNGSTICKER.md

### TIC-05 · Öffentliche Ausgabe, Feeds und lebende Akten bereitstellen
- Arbeits-/Belegdatum: 2026-09-03
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Übersicht und Detailakten mit stabilen URLs, Feeds und Versionsfortschreibung erzeugen.
- Ergebnis/Arbeitsstand: Wirkungsticker veröffentlicht; neue Entwicklungen können bestehende Akten fortschreiben.
- Abnahmekriterium: Historische Fassungen und Korrekturen werden nicht still überschrieben.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/1f6ed47554

### TIC-06 · App-Aktualisierung und freiwillige Benachrichtigung ergänzen
- Arbeits-/Belegdatum: 2026-09-03
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Installierbare App und Opt-in-Zustellung in den vorhandenen Betrieb einfügen.
- Ergebnis/Arbeitsstand: App- und Push-Funktionen sind dokumentiert; Betriebssystemgrenzen bleiben bestehen.
- Abnahmekriterium: Einwilligung, Deaktivierung und Aktualisierung sind nachvollziehbar.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/ops/WIRKUNGSTICKER-PUSH-UND-CLOCK.md

### TIC-07 · Visuelle Orientierung und Titelbilder stabilisieren
- Arbeits-/Belegdatum: 2026-09-04
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Themen, mögliche Folgen und zeitliche Stände verständlich darstellen.
- Ergebnis/Arbeitsstand: Visuelle Anker und Titelbildausgabe wurden ergänzt.
- Abnahmekriterium: Illustrationen und analytische Visuals gelten nicht als fotografischer Beweis; Zahlen brauchen Quellen.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/6c88c6897a

### TIC-08 · Quellenintegrität und Medien-/Sprachprüfung vertiefen
- Arbeits-/Belegdatum: 2026-09-05
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Ereignis, Akteursaussage und mediale Vermittlung getrennt prüfen.
- Ergebnis/Arbeitsstand: Medienbefunde und Quellenrollen sind im Schema und den Prüfregeln verankert.
- Abnahmekriterium: Nur konkrete kommunikative Handlungen prüfen; keine pauschale Medien- oder Personenbewertung.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/8c1018c55f

### TIC-09 · Warteschlange und Kostensteuerung nachführen
- Arbeits-/Belegdatum: 2026-09-06
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Technische Fehler, redaktionelle Ablehnung und Kapazitätsgrenzen unterscheiden.
- Ergebnis/Arbeitsstand: Reparatur-Commits trennen fehlende KI-Entscheidungen und steuern Wiederholungen.
- Abnahmekriterium: Budgetgrenzen bleiben verbindlich; keine pauschale Zusage störungsfreien Betriebs.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/commit/4141e9b3c9

### TIC-10 · Redaktionelle Qualität und Korrekturen laufend prüfen
- Arbeits-/Belegdatum: 2026-09-06
- Status: In Arbeit
- Verantwortlich: Natalie Weber
- Auftrag: Neue Akten und Aktualisierungen auf Quellen, Wirkpfade und Unsicherheiten prüfen.
- Ergebnis/Arbeitsstand: Fortlaufende Institutsarbeit nach dem Produktstart.
- Abnahmekriterium: Korrekturen begründen und falsche Zusammenführungen transparent auflösen.
- Beleg: https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/ops/WIRKUNGSTICKER-SOURCE-INTEGRITY.md

### TIC-11 · Umfragefeedback in Verbesserungsentscheidungen überführen
- Arbeits-/Belegdatum: 2026-09-06
- Status: Bereit
- Verantwortlich: Natalie Weber
- Auftrag: Rückmeldungen zum Ticker sichten und konkrete Änderungen begründen.
- Ergebnis/Arbeitsstand: Erste Umfrage ist live; eine abgeschlossene Auswertung wird nicht behauptet.
- Abnahmekriterium: Auswertung als nicht repräsentativ einordnen; privates Freitextfeedback nicht veröffentlichen.
- Beleg: https://wirkungsoekonomie.de/umfragen/wirkungsticker-feedback/

### TIC-12 · Projektauftrag, Konzept und Chronik im Institut dokumentieren
- Arbeits-/Belegdatum: 2026-09-06
- Status: Erledigt
- Verantwortlich: Natalie Weber
- Auftrag: Bisherige Produktarbeit rückblickend in die Institutswerkstatt einordnen.
- Ergebnis/Arbeitsstand: Nachtrag mit belegbaren Terminen und Zuständigkeit Natalie Weber erstellt.
- Abnahmekriterium: Entwicklung, Veröffentlichung und laufende Arbeit sind unterscheidbar.
- Beleg: https://wirkungsoekonomie.de/news/

## Verbindungen

- Öffentliches Angebot: https://wirkungsoekonomie.de/wirkungsticker/
- Institutsprojekt: https://institut.wirkungsoekonomie.de/projekte/wirkungsticker
- Projektwerkstatt mit Aufgaben: https://institut.wirkungsoekonomie.de/werkstatt/wirkungsticker

## Quellen und Ergebniszugänge

- [Erste Implementierung, lokal 03.09.2026](https://github.com/sustynats/wirkungsoekonomie.de/commit/8090868b1b)
- [Veröffentlichungsübersicht](https://wirkungsoekonomie.de/news/)
- [Architektur und Betrieb](https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/ops/WIRKUNGSTICKER.md)
- [Quellenintegrität](https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/ops/WIRKUNGSTICKER-SOURCE-INTEGRITY.md)
- [Medien- und Sprachwirkung](https://github.com/sustynats/wirkungsoekonomie.de/blob/main/docs/ops/WIRKUNGSTICKER-MEDIEN-SPRACHWIRKUNG.md)
