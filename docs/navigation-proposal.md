# Navigation Proposal Sprint 2

Stand: 2026-05-26

## Aktueller Zustand

Die historisch gewachsene Hauptnavigation nutzte parallel `Werkzeuge`, `Erleben`, `Werkstatt`, `Bibliothek`, `Journal` und `Suche`. Das führte zu Überschneidungen:

- `Werkzeuge` und `Erleben` trennten Methode und Demo für Nutzer:innen zu stark.
- `Werkstatt` wirkte intern und konkurrierte mit `Bibliothek`.
- `Journal` war als Hauptpfad weniger wichtig als Verstehen, Ausprobieren und Materialien.

## Zielstruktur

1. Start
2. Verstehen
3. Wirkungsfelder
4. Ausprobieren
5. Akademie
6. Bibliothek
7. Suche

## Umsetzung in diesem Sprint

Risikoarm umgesetzt:

- `assets/js/main.js` schreibt die Headernavigation bereits clientseitig auf die Zielstruktur um.
- `assets/data/navigation.json` wurde auf dieselbe Zielstruktur umgestellt.
- Footer-Gruppen wurden begrifflich vereinfacht: `Ausprobieren` und `Bibliothek` ersetzen die alte Gleichrangigkeit von Werkzeugen/Erleben/Werkstatt.

## Migrationslogik

- `Werkzeuge` + `Erleben` -> `Ausprobieren`
- `Werkstatt` + `Downloads` + `Arbeitsbibliothek` -> `Bibliothek`
- `Journal` bleibt über Footer/Kontext erreichbar, aber nicht mehr als Hauptpfad.
- Kompass, Glossar und SDG-/SDG+ bleiben unter `Verstehen`.

## Offene Nacharbeit

Einige statisch generierte ältere Seiten enthalten im HTML noch alte Headerlinks. Da `main.js` die Headernavigation zur Laufzeit ersetzt, ist das für Nutzer:innen risikoarm. Bei späteren Generatorläufen sollten alle Seitentemplates direkt auf `assets/data/navigation.json` umgestellt werden.
