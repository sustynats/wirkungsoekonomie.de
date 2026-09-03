# Glossar-Integration Audit

Stand: 2026-05-19

## Integrierte Begriffe

Die zentrale Datenquelle liegt in `assets/js/glossaryTerms.js`. Dort sind diese Begriffe mit Label, Kurzdefinition, Glossarlink, Synonymen, Priorität und erlaubten Kontexten hinterlegt:

- Wirkungsökonomie
- Wirkung
- Mensch, Planet und Demokratie
- Wirkungssteuer
- Wirkungspotenzial
- Netto-Wirkungs-Index / NWI
- Scorecard
- Wirkungsrat
- Wirkungskompetenz
- Wirkstoff
- Reverse Merit Order
- T-SROI
- SDG+
- Wirkungslenkung
- Wirkungshaushalt
- Wirkungseinkommen
- WÖk-ID
- FinalScore
- Archetypen
- Benchmarks
- Wirkungsdatenraum / Wirkungsdatenräume

## Kurzdefinitionen

Für Hover, Fokus und mobile Einblendungen werden ausschließlich kurze Definitionen aus der zentralen Datenquelle verwendet. Die vollständigen Erklärungen bleiben auf der Glossarseite.

## Aktive Seiten

Die Glossarlogik wird über `assets/js/main.js` geladen und verarbeitet Contentbereiche auf:

- Startseite
- Wirkungsökonomie
- Modell
- Anwendungen
- Erleben
- Buch
- Blogübersicht
- Blogartikel
- Akademie
- Downloads
- Mitmachen
- Glossar
- zukünftigen Seiten, sofern sie `assets/js/main.js` laden und einen `main`-Bereich besitzen

Blogartikel sind eingeschlossen, weil sie ebenfalls `assets/js/main.js` laden.

## Bewusst ausgeschlossene Bereiche

Nicht markiert werden:

- Navigation
- Header
- Footer
- Buttons
- Formulare und Labels
- vorhandene Links
- Codeblöcke
- Überschriften
- Inhaltsverzeichnisse
- Blog- und Downloadfilter
- Glossar-Begriffsliste selbst
- Bereiche mit `data-no-glossary`

Dadurch bleibt die Integration ruhig und zerstört keine bestehende HTML-Struktur.

## Ergänzte Glossareinträge und Anker

Der Glossareintrag "Wirkungsökonomie" wurde zuvor ergänzt. Für die automatische Verlinkung wurden zusätzlich eindeutige Anker auf der Glossarseite abgesichert, unter anderem für:

- Wirkungslenkung
- SDG+
- Archetypen
- FinalScore
- Wirkungsdatenraum
- Benchmarks
- Wirkungskompetenz

## Desktop-Hover

Auf Desktop öffnet sich bei Hover oder Tastatur-Fokus eine kleine Glossarkarte mit:

- Begriff
- Kurzdefinition
- Link "Mehr im Glossar"

Escape, Scroll, Resize oder Klick außerhalb schließen die Karte.

## Mobile-Tap

Auf kleinen Viewports öffnet ein Tap auf einen Glossarbegriff ein ruhiges Bottom Sheet. Der erste Tap führt nicht sofort weg. Der Link "Mehr im Glossar" führt gezielt zum vollständigen Glossareintrag.

Das Bottom Sheet schließt über:

- Schließen-Button
- Escape
- Klick außerhalb

## Accessibility

Umgesetzt wurden:

- Tastatur-Fokus für Glossarbegriffe
- `aria-describedby` für Desktop-Hinweise
- `role="tooltip"` für die Desktop-Karte
- `role="dialog"` und `aria-modal="true"` für das mobile Bottom Sheet
- Fokus-Rückgabe nach dem Schließen des Bottom Sheets
- Escape-Schließen
- sichtbare Focus-States
- respektiertes `prefers-reduced-motion`

## Regeln gegen Overlinking

Die automatische Markierung begrenzt die Glossarbegriffe:

- Startseite: maximal 1 Begriff pro Textblock, maximal 6 Begriffe insgesamt
- Glossar: maximal 1 Begriff pro Textblock, maximal 8 Begriffe insgesamt
- normale Seiten: maximal 2 Begriffe pro Textblock, begrenzte Gesamtzahl
- Blogartikel: maximal 2 Begriffe pro Textblock, maximal 26 Begriffe insgesamt
- derselbe Begriff wird pro Abschnitt nur einmal markiert
- bestehende Links werden nicht erneut markiert
- Begriffe werden nicht als Teil anderer Wörter markiert

## Noch fehlende oder optionale Begriffe

Weitere Begriffe können später ergänzt werden, indem sie ausschließlich in `assets/js/glossaryTerms.js` eingetragen werden. Kandidaten:

- Wirkungsrisiko
- Wirkungsdaten
- Wirkungsklassen
- Wirkungsindikator
- Transformationswirkung

## Ergebnis

Das Glossar-System erklärt Begriffe im Lesefluss, ohne die Seite in ein Wiki zu verwandeln. Die erste Ebene bleibt verständlich, Fachbegriffe werden erst bei Bedarf sichtbar und führen zur Vertiefung im Glossar.
