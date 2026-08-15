# Sprint 1 Navigation Audit

Stand: 22. Mai 2026

## Umgesetzt

- Hauptnavigation zentral über `assets/data/navigation.json` stabilisiert.
- Finale Hauptnavigation: Start, Verstehen, Modell, Kompass, Für wen?, Anwendungen, Ordnung, Akademie, Mehr, Suche.
- Scanner ist kein Hauptnavigationspunkt mehr und bleibt unter Anwendungen.
- Quellen ist kein Hauptnavigationspunkt; der öffentliche Bereich heißt Evidenz und liegt unter Mehr sowie im Footer.
- Anwendungen-Menü erweitert: Scanner, Wirkung politischer Sprache, Produkte und Preise, Unternehmen und Management, Lieferketten, Wirkungshaushalt, Wohnen, Wirkungseinkommen, Wirkungsrente, Medien und Demokratie, T-SROI, Gesundheit, Kommunen.
- Footer-Gruppen finalisiert: Verstehen, Werkzeuge & Anwendungen, Lernen, Projekt, Rechtliches.
- Navigation und Footer wurden mit `tools/sync_layout.py` auf die erzeugten HTML-Seiten übertragen.

## Wortumbrüche und Mobile

- Navigationslinks setzen `white-space: nowrap`, `word-break: normal` und `hyphens: manual`.
- Desktop-Navigation schaltet früher auf das Mobile-Menü um: ab unter 1480 px.
- Ziel: keine zerrissenen Wörter in engen iFrame- oder Tablet-Breiten.

## Begründung

Die Navigation folgt jetzt der Denklogik der WÖk:
Verstehen -> Modell -> Orientierung -> Zielgruppen -> Anwendungen -> Ordnung -> Lernen.

Scanner ist Anwendung. Akademie bleibt sichtbarer Kernbestandteil.
