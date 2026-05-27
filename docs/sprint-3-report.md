# Sprint 3 Report: Conversion, Visualisierung, Suche und Tool-Reife

Stand: 2026-05-27

## Geaendert

- Neuer Branch: `feature/website-conversion-visuals-tools-search`.
- Startseite: Entscheidungsblock "Was moechtest du als Naechstes tun?" mit fuenf Einstiegen fuer neue Besucher:innen, Einwaende, Demos/Tools, Bibliothek und Mitdenken.
- Startseite: Merksatz als ruhige Quote integriert, ohne den bestehenden Hero umzubauen.
- Projekt-/Ueber-uns-Seite: Rolle der Website als offener Wissens-, Lern- und Anwendungsraum geschaerft; Demos klar als modellhafte Ersteinschaetzungen ausgewiesen.
- Footer/Header: oeffentliche Sprache bereinigt, Header/Footer/Nav mit `data-search-exclude` markiert, Navigation um "Fuer wen?" ergaenzt.
- Kontextfragen: Startseite, Tools, Produktfeld, Unternehmensfeld, Scanner/Folgencheck und Automatisierungsrechner erhalten passendere Related-Questions-Bloecke.

## Visuals

Umgesetzt wurden einfache HTML/CSS-Systemvisuals:

- "Der falsche Preis" auf der Startseite und im Produkt-/Konsumfeld.
- "Daten -> Wirkungsbewertung -> Rueckkopplung -> Lernen" auf der Modellseite.
- "Alte Logik vs. WOek-Logik" auf Wirkungsfeldseiten.
- "Produktwirkung entlang der Kette" im Produkt-/Konsumfeld.
- "Folgencheck" mit Wirkstoff, Wirkungspotenzial, Wirkungspfad, Wirkungsraum und Handlungsoptionen im Scanner.
- "Wirkungseinkommen / Automatisierung" im Automatisierungs- und Wirkungseinkommensrechner.

## Suche

- Suchindex-Generator bereinigt: Hauptinhalt wird bevorzugt, Header/Footer/Nav/Aside/Breadcrumbs/Linkcluster werden entfernt.
- Footer- und Navigationstreffer werden aus Top-Treffern herausgefiltert.
- Leere Suche zeigt kuratierte Einstiege: Was ist Wirkungsökonomie?, In 5 Minuten verstehen, Fragen & Einwände, Begriffe, Wirkungsfelder, Produktwirkung ausprobieren, Bibliothek.
- Fachbegriffe werden ueber kuratierte Routen priorisiert.
- Einwand-Suchen wie "Planwirtschaft" und "Social Credit" priorisieren Fragen & Einwaende.
- Neue Qualitaetspruefung: `check:search-contamination`.

## Tools

- Erleben-Seite startet mit konkreten Default-Beispielen statt Platzhalterwerten.
- Produktwirkung, Medienwirkung, Plattformwirkung, Risiko/Resilienz, Entscheidungskompass und Alltag zeigen Wert, Bedeutung, Relevanz und Grenze der Aussage.
- Automatisierungsrechner startet mit Modellwerten; keine "wird berechnet"-Standardbox.
- "FTE" wurde oeffentlich als "Vollzeitstellen" gefuehrt bzw. erklaert.
- Neue Qualitaetspruefung: `check:tool-default-states`.

## Mobile Smoke

Geprueft mit lokalem Chrome/Playwright gegen `http://127.0.0.1:8765`:

- Desktop: 1440px.
- iPhone-Breite: 390px.
- Android-Breite: 360px.
- Seiten: `/`, `/suche.html`, `/erleben.html`, `/erleben/automatisierungs-wirkungseinkommensrechner/`, `/fragen/`, `/wirkungsfelder/produkte-konsum/`, `/wirkungsfelder/wirtschaft-unternehmen/`, `/begriffe/`, `/downloads.html`, `/modell.html`, `/anwendungen/scanner.html`.
- Ergebnis: keine horizontalen Scrolls, keine Platzhalter-Texte, Toolkarten mobil einspaltig.
- Smoke-Artefakte: `outputs/sprint-3-smoke/report.json` und Screenshots in `outputs/sprint-3-smoke/`.

## Suchbegriffe

Geprueft:

- Wirkung -> Begriff Wirkung.
- Planwirtschaft -> Fragen & Einwaende.
- Social Credit -> Fragen & Einwaende.
- Wirkungseinkommen -> Begriff Wirkungseinkommen.
- Folgencheck -> Begriff Folgencheck.
- Green Deal -> European Green Deal.
- EU-Taxonomie -> EU-Taxonomie.
- Social Taxonomy -> Social Taxonomy.
- Produktwirkung -> Produktwirkung am Apfelbeispiel als empfohlener Einstieg.
- T-SROI -> Begriff T-SROI.

## Pruefungen

Erfolgreich:

- `npm run build`
- `npm run check:size`
- `node scripts/quality/check-local-links.mjs`
- `npm run check:search`
- `npm run check:search-contamination`
- `npm run check:tool-default-states`
- `npm run check:public-language`
- `node scripts/quality/audit-public-ctas.mjs`
- `node scripts/quality/fix-public-self-ctas.mjs --check`
- Mobile smoke check via Playwright/Chrome.

## Restpunkte

- Kein Remote-Deploy ausgefuehrt. Es gibt keinen lokalen Deploy-Befehl; GitHub Pages deployt ueber `.github/workflows/deploy.yml` nach Push auf `main` oder per `workflow_dispatch`. Fuer den Live-Deploy muss der Sprint-Branch gepusht/gemerged oder der Workflow gezielt ausgeloest werden.
- In-App-Browser war in dieser Umgebung nicht verfuegbar; der visuelle Smoke-Test wurde deshalb mit lokalem Chrome/Playwright durchgefuehrt.
