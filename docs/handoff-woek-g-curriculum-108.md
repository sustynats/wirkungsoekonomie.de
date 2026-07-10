# Handoff: WÖk-G Curriculum 2.0 · 108er-Outline

Stand: 2026-07-10

## Kanonische Datenquelle

- Quelle: `content/academy/woek-g-curriculum.json`
- Öffentlicher Export: `public/data/woek-g-curriculum.json`
- Build: `npm run academy:curriculum`
- Check: `npm run check:curriculum`

Die Datei ist die Single Source für Akademie, Website-Beschreibungen und Claudes Skriptarbeit. Claude schreibt Skripttexte gegen `titel` und `lernziel`; Codex hält Codes, Module, Progression und Status stabil.

## Struktur

- 108 Vorlesungen: `V01` bis `V108`
- 5 Studienabschnitte:
  - Teil 1 · Grundlagen
  - Teil 2 · Wirkungsfelder
  - Teil 3 · WÖMM
  - Teil 4 · WÖMS-Orientierung
  - Teil 5 · Praxisprojekt + Abschluss
- Status:
  - `V01` bis `V36`: `active`
  - `V37` bis `V108`: `planned`

## 2.0-Themen

Aufgenommen sind die bestätigten 2.0-Themen:

- `V47` Stranded Assets, Transitionsrisiko und Refinanzierungsresilienz
- `V58` Wirkung von Worten, Narrativen und Frames
- `V55` Gesundheit als Wirkungsfeld
- `V56` Wohnen, Stadt und Daseinsvorsorge
- `V97` Das Wirkungsökonomische Managementmodell (WÖMM)
- `V98` Das Methodensystem im Überblick (WÖMS)
- `V99` Wirkungsrealisierungsarchitektur: Deliverables sind nicht Wirkung

## Tiefe

Das Grundstudium behandelt WÖMM und WÖMS auf Orientierungstiefe:

- WÖMM: Kompass, Managementfelder, Wirkungsrad, Entscheidungstore, Reifegrade, Realisierungslogik.
- WÖMS: 152 Methoden, 16 Kategorien, Canvas-Prinzip, Workshop-Journeys und Schutzregeln als Überblick.

Die Methoden-Tiefe bleibt Fortbildung/Coach. Der Coach- und Multiplikator:innen-Strang hat weiterhin `Modul 0 = WÖMM-Grundlagen` als vorgelagerte gemeinsame Grundlage.

## Progression

Jede Vorlesung enthält `bautAuf`. Der Check sichert:

- alle 108 Codes vorhanden,
- keine unbekannten oder selbstreferenziellen `bautAuf`-Verweise,
- Pflichthemen vorhanden,
- `V47` baut auf `V46` und `V33`,
- `V98` benennt den WÖMS-Überblick mit 152 Methoden.
