# Relaunch Presence Audit

Stand: 2026-05-31

## Anlass

Nach dem Relaunch wirkte der Footer deutlich kleiner. Zusätzlich hatte der Glossar-Bruch gezeigt, dass eine reine Sichtprüfung nicht reicht. Diese Kurzprüfung hält fest, welche zentralen Bereiche im aktuellen Stand vorhanden und erreichbar sind.

## Lokaler Bestand

| Bereich | Vorhandene HTML-/Index-Routen |
| --- | ---: |
| Für wen | 14 |
| Methoden & Werkzeuge | 92 |
| Wirkungsfelder | 267 |
| Erleben / Demos | 15 |
| Bibliothek | 33 |
| Begriffsdetailseiten | 1447 |
| WÖk-ID Register | 624 |

## Live-Stichprobe

Folgende Zielgruppen- und Werkzeugrouten wurden live mit HTTP 200 geprüft:

- `/fuer/`
- `/fuer/unternehmen.html`
- `/fuer/kommunen.html`
- `/fuer/investoren.html`
- `/fuer/journalismus.html`
- `/fuer/politik.html`
- `/werkzeuge/`
- `/werkzeuge/scorecards/`
- `/werkzeuge/netto-wirkungs-index/`
- `/werkzeuge/t-sroi/`
- `/werkzeuge/woek-ids/`
- `/werkzeuge/wirkungsregister/`
- `/werkzeuge/wirkungsdatenraeume/`
- `/werkzeuge/wirkungsfonds/`

## Footer-Korrektur

Der Footer wurde nicht inhaltlich neu strukturiert, sondern als Orientierungsfläche wieder verbreitert:

- `Methoden & Werkzeuge` ist eine eigene Footer-Gruppe.
- `Erleben` bleibt als Demo-/Rechner-Gruppe erhalten.
- `Für wen` ist wieder als eigene Footer-Gruppe sichtbar.
- Bestehende Routen wurden nicht verschoben oder gelöscht.

## Verifikation

- Build ausgeführt: erfolgreich.
- Lokaler Linkcheck: 215163 Links, 0 fehlende Ziele.
- Suche geprüft: 6656 Einträge, bestanden.
- Größencheck geprüft: 757.6 MB, bestanden.
- Glossar-Routen-Audit ausgeführt: bestanden.
- Glossar-Hover-Audit ausgeführt: bestanden.
- Glossar-Crosslink-Audit ausgeführt: bestanden.
- Glossar-Coverage-Audit ausgeführt: bestanden.
- Glossar-Regression gegen Baseline: 1145 Begriffe, 1447 Detailseiten, 1145 Hover-Einträge, Ergebnis OK.

## Einschätzung

Der Footer war zu stark gekürzt und hat wichtige Einstiegsschichten nicht ausreichend sichtbar gemacht. Die geprüften Bereiche `Für wen`, `Methoden & Werkzeuge`, Wirkungsfelder, Erleben, Bibliothek, Glossar und WÖk-ID Register sind im aktuellen Stand vorhanden. Weitere Detailprüfung sollte über Inventarvergleich erfolgen, nicht über manuelle Sichtprüfung einzelner Navigationselemente.
