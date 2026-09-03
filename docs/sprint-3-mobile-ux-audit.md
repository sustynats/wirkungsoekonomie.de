# Sprint 3 Mobile-UX-Audit

Stand: 2026-05-22.

## Geprüfte Bereiche

- `/kompass.html`
- `/scanner.html`
- `/suche.html`
- `/anwendungen.html`
- `/downloads.html`
- `/audio/`

## Ergebnis

Die bestehenden Layouts nutzen responsive Grids und vorhandene Mobile-Regeln:

- Kompass: Themen, Fragen und Antwortkarten stapeln unter 920px.
- Scanner: Modi und Demos wechseln auf zwei Spalten und dann eine Spalte.
- Suche: Filterspalte fällt unter 900px in eine Einspaltenansicht.
- Downloads: Kartenraster ist bereits responsiv.
- Audio: nutzt bestehende Karten- und Audio-Komponenten.

## Behobene Punkte

- Kompass-Startfragen sind als Linkleiste statt als lange Textwand angelegt.
- Scanner-Modi sind als Karten mit Status und kurzer Beschreibung aufgebaut.
- Audio-Player sind zentral auffindbar und bleiben native Browser-Controls.

## Offene Punkte

Vor Sprint 4 sollte mit Browser-Screenshots bei 390px und 1280px geprüft werden:

- Kompass-Antwortkarten mit langen Wirkungspfaden
- Scanner-Demo-Karten
- Suchfilter und Ergebnisliste
- Downloadfilter mit vielen Pills
- Audio-Karten und Playerbreite
