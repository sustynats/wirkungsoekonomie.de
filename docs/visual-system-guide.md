# Visual-System der Wirkungsökonomie

Stand: 2026-05-22

## Verbindlicher Grundsatz

Visuals sind integraler Bestandteil der Wirkungsarchitektur. Wirkungsoekonomie.de verwendet keine zufälligen Einzelbilder, sondern ein konsistentes WÖk-Visual-System.

Jedes neue Visual muss vor Erstellung einer Kategorie zugeordnet, markenkonform geplant, responsiv gedacht, mit Alt-Text versehen und in der Registry dokumentiert werden.

## Designrichtung

Ruhig, hochwertig, wissenschaftlich zugänglich und editorial. Die Visuals sollen komplexe Zusammenhänge klären, nicht dekorieren.

Die visuelle Sprache soll wirken wie:

- hochwertige wissenschaftliche Editorial-Grafik
- ruhige institutionelle Zukunftsarchitektur
- systemische Modellwelt
- modernes Buch-/Journal-Design
- europäische Thinktank-/Universitätsästhetik
- klar, reduziert, souverän

Sie darf nicht wirken wie:

- generische KI-Bilder
- SaaS-Marketing
- PowerPoint-Beratung
- Tech-Bro-Futurismus
- Clipart
- ESG-Stockfotos
- bunte Startup-Infografiken

## Typografie und Layout

- klare Überschriften
- kurze Labels
- großzügige Abstände
- keine Textwüsten in Diagrammen
- Legenden immer sichtbar oder direkt erklärbar
- Überschriften serif-artig, elegant und editorial
- Fließtext modern, neutral und klar lesbar
- keine verspielten, technoiden oder futuristischen AI-Fonts

## Farblogik

- Navy
- Ivory
- Green
- Gold
- Coral nur sehr sparsam
- dunkles Grau für Text
- keine grellen KI-Verläufe
- keine generische SaaS-Optik
- keine Stock-Art-Anmutung
- keine zusätzlichen knalligen Farben

## Visual-Typen

Zulässige Kategorien:

- **Hero-Visual:** atmosphärisch, editorial/cinematic, wenig oder kein Text. KI-Generierung ist erlaubt, wenn keine fachliche Beschriftung im Bild entsteht.
- **Modellgrafik:** Wirkungskreislauf, Wirkungsrad, Reverse Merit Order, Wirkungsarchitektur, Begriffslogik, Systemdiagramme. Nie per KI-Bildgenerator mit eingebettetem Text erzeugen; immer SVG/HTML/Layoutgrafik.
- **Erklärungsgrafik:** Beispiele, Vergleichslogik, Apfel, Wohnen, Rente, Lieferketten, Steuerlogik. Hybrid aus Illustration und gesetztem Text.
- **Wirkungsflussgrafik:** Ursache-Wirkungs-Ketten, SDG-Wirkungspfade, Medienwirkung, Demokratiewirkung, Lieferkettenwirkung.
- **Datenvisualisierung:** Scorecards, Benchmarks, Wirkungsdaten, Radar-Charts, Tax-Logik, Wirkungsordnungen. Nur SVG/HTML/Canvas.

Dateistruktur:

- `assets/visuals/hero/`
- `assets/visuals/model/`
- `assets/visuals/flows/`
- `assets/visuals/explainers/`
- `assets/visuals/data/`
- `assets/visuals/icons/`
- `assets/visuals/rejected/`

Bestehende ältere Visuals in `assets/visuals/woek/` bleiben vorerst erhalten, müssen aber bei neuen Überarbeitungen in die Kategorienlogik überführt oder in der Registry entsprechend klassifiziert werden.

## Bildsprache

Erlaubt:

- Systeme
- Linien
- Netzwerke
- Karten
- Resonanzräume
- Datenstrukturen
- geometrische Abstraktion
- ruhige symbolische Naturbilder
- hochwertige Lichtstimmungen
- topologische Formen
- Kreise
- Rückkopplungen
- Layer
- Wirkungspfade

Nicht erlaubt:

- Hände mit Pflanze
- ESG-Stockbilder
- Businesspeople
- lachende Teams
- Globus in Händen
- generische Nachhaltigkeitsicons
- billige KI-Futuristik
- Cartoon-Optik
- 3D-Icons
- generische Business-Icons

## Responsive Pflicht

Wichtige Visuals benötigen eine Desktop- und eine Mobile-Version. Mobile ist keine bloße Verkleinerung, sondern eine eigene Logik: vertikale Stapelung, größere Labels, reduzierte Segmentzahl, weniger Nebentext.

## Qualitätsregel

Wenn ein Visual aussieht wie generische KI, Canva, PowerPoint oder ESG-Marketing, gilt es als `FAILED VISUAL` und darf nicht öffentlich eingebunden werden. Es wird nach `assets/visuals/rejected/` verschoben oder gelöscht.

## Quellenbasierte Begriffslogik

Systemgrafiken müssen sich direkt auf die führenden Quellen beziehen:

- Führender Begriffsleitfaden
- Die neue Ordnung des Wohlstands
- WStG
- WUStG
- Wirkungsrat
- T-SROI
- SDGs
- Systemmodell

Begriffe dürfen nicht frei umformuliert werden, wenn sie fachlich bereits definiert sind.

## Quellen- und Legendenpflicht

Jedes Visual braucht:

- Visual-ID
- Seite
- Typ
- Quellen- oder Konzeptbasis
- Datenquellen, falls Daten gezeigt werden
- Interpretationsnotiz
- Lizenzhinweis
- Alt-Text
- Caption
- Visual-Kategorie
- Mobile-Version, falls relevant
- Stilprüfung

Register:

- maschinenlesbar: `content/visuals/visual-source-registry.json`
- redaktionell: `docs/visual-registry.md`

## KI-generierte Bilder

KI-generierte Bilder dürfen nicht als Datenvisualisierung ausgegeben werden, wenn sie keine Daten zeigen. Sie sind als Illustrationsgrafik oder Erklärvisual zu behandeln.

Keine Logos, Marken, geschützten Designs oder falsche Datenpräzision.

Texttragende Diagramme, Modellgrafiken, Tabellen, Kreisläufe und Website-Infografiken müssen als kontrolliertes SVG/HTML/Layout gebaut werden. KI-Bildgeneration ist nur für abstrakte Hero-Hintergründe ohne Text, atmosphärische Visuals ohne fachliche Beschriftung oder illustrative Bilder ohne exakte Begriffslogik zulässig.

## Priorisierte Seiten

Besonders hochwertige Visuals sind vorrangig zu planen für:

- Startseite
- Modell
- Wirkung einfach erklärt
- Funktionsweise
- Wirkungskreislauf
- Wirkung vs. Wirkungspotenzial
- Kondratieff
- Wirkungsgesetz
- Wirkungseinkommen
- Rentensystem
- Wohnungsmarkt
- Unternehmen
- Politik
- Medien & Demokratie
- Wirkungskompass
- Akademie
