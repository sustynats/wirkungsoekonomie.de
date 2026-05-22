# Navigation Final Restructure Audit

Stand: 2026-05-22

## Zentrale Quelle

Die finale Navigation wird zentral aus `assets/data/navigation.json` gerendert.
Der Rollout erfolgt über `tools/sync_layout.py` in die gemeinsamen Templates `templates/header.html` und `templates/footer.html`.

## Finale Hauptnavigation

Die Hauptnavigation folgt jetzt der Denklogik Orientierung -> Verständnis -> Vertiefung -> Evidenz:

1. Start
2. Verstehen
3. Modell
4. Kompass
5. Für wen?
6. Anwendungen
7. Ordnung
8. Akademie
9. Mehr
10. Suche

## Scanner

Der Scanner wurde aus der Hauptnavigation entfernt.
Er ist jetzt der erste und prominenteste Unterpunkt im Anwendungen-Menü.

Begründung: Der Scanner ist ein Wirkungsanalyse-Tool und eine operative Anwendung der Wirkungsökonomie, aber nicht die Hauptidentität des Modells.

## Anwendungen-Menü

Unter Anwendungen stehen jetzt:

- Scanner
- Wirkung politischer Sprache
- Produkte
- Unternehmen
- Lieferketten
- Wirkungshaushalt
- Wohnen
- Wirkungseinkommen
- Rente
- Medien & Demokratie
- T-SROI
- Weitere operative Beispiele

Die Anwendungen-Seite enthält dafür Sprungziele für Produkte, Lieferketten und weitere operative Beispiele.

## Akademie

Akademie bleibt sichtbarer Hauptnavigationspunkt.

Begründung: Die Akademie ist Kompetenzraum, Lernarchitektur, Studienpfad und institutioneller Bildungsraum. Sie signalisiert wissenschaftliche Ernsthaftigkeit und langfristige Wissensarchitektur.

## Mehr-Menü

Das Mehr-Menü enthält jetzt die Vertiefungs- und Projektbereiche:

- Blog / Journal
- Evidenz
- SDG+
- Methodik
- Glossar
- Buch
- Downloads
- Mitmachen
- Über die WÖk

Quellen erscheinen nicht mehr als prominenter Hauptpunkt. Die frühere Quellenlogik ist über Evidenz gebündelt und bleibt über das Mehr-Menü, Footer und Evidenz-/Quellenbereiche erreichbar.

## Footer

Der Footer wurde von einer linearen Linkliste in vier Gruppen umgebaut:

- Verstehen: Wirkung einfach erklärt, Modell, Ordnung, Für wen?
- Werkzeuge & Anwendungen: Scanner, Wirkung politischer Sprache, Produkte, Lieferketten, Wirkungshaushalt
- Lernen: Akademie, Glossar, Methodik, SDG+, Evidenz
- Projekt: Blog / Journal, Buch, Downloads, Mitmachen, Über die WÖk

Impressum und Datenschutz bleiben als separate rechtliche Footer-Zeile erhalten.

## Mobile

Mobile nutzt dieselbe Reihenfolge wie Desktop.
Anwendungen und Mehr sind aufklappbare Bereiche.
Der Scanner steht mobil nicht mehr als eigener Hauptpunkt, sondern als erster Link unter Anwendungen.
Der mobile Menüknopf wurde als klarer Touch-Button stabilisiert; unter sehr kleinen Viewports wird der Drawer auf eine handliche Breite begrenzt, damit keine Navigation horizontal abgeschnitten wird.

## Active State

Active States werden zentral über `data-nav-match` und `assets/js/main.js` gesetzt.
Dropdowns werden aktiv markiert, wenn eine untergeordnete Seite oder ein zugeordnetes Pfadmuster aktiv ist.

## Abweichende Altlasten

Beim Audit wurden vier alte Wissens-Unterseiten mit verkürzter Navigation gefunden:

- `wissen/beispiele/index.html`
- `wissen/methodik/index.html`
- `wissen/themen/index.html`
- `wissen/working-papers/index.html`

`tools/sync_layout.py` wurde erweitert, sodass auch Seiten mit Header, aber bislang ohne Footer, den zentralen Header und Footer erhalten. Diese Seiten verwenden jetzt ebenfalls die finale Navigationslogik.

## Ergebnis

Der finale Header wurde auf 177 HTML-Seiten geprüft. Alle gefundenen Header verwenden dieselbe Primärnavigation:

Start -> Verstehen -> Modell -> Kompass -> Für wen? -> Anwendungen -> Ordnung -> Akademie -> Mehr -> Suche.

Die Navigation führt jetzt:

Verstehen -> Modell -> Orientierung -> Zielgruppen -> Anwendungen -> Ordnung -> Lernen -> Vertiefung/Evidenz.

Die Website wirkt dadurch weniger wie ein Dokumentenarchiv oder Tool-Katalog und stärker wie ein geführter Denkraum der Wirkungsökonomie.
