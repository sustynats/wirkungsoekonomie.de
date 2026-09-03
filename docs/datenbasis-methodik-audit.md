# Datenbasis-Methodik Audit

Stand: 2026-05-21

## Erstellte Seite

- Neue Seite: `/methodik/datenbasis.html`
- Titel: `Datenbasis und Methodik der Wirkungsökonomie`
- Funktion: vertiefender Methodik- und Nachweisbereich, nicht als prominente Landingpage angelegt.

## Eingebundene Quellen

Das Quellenregister enthält kurze eigene Beschreibungen und offizielle Links zu:

- SDGs
- SDG+
- CSRD
- ESRS
- GRI
- EU-Taxonomie
- NACE
- Digitale Produktpässe / ESPR
- Lieferkettendaten
- Produktdaten
- EPDs
- ILO
- WHO
- IPCC
- IPBES
- nationale Statistikquellen

## Externe Standards

Externe Standards werden nicht gespiegelt oder längere Originaltexte kopiert. Die Seite verweist auf offizielle Quellen, insbesondere UN, EUR-Lex, GRI, Eurostat, ILO, WHO, IPCC, IPBES und nationale Statistikportale.

## Datenstrukturen

Angelegt wurden:

- `/content/methodik/data-sources.json`
- `/content/methodik/indicator-mapping.json`
- `/content/methodik/scoring-rules.json`

Diese Dateien bereiten ein maschinenlesbares Quellenregister, ein Indikator-Mapping und einfache Scoring-Regeln vor.

## Beispielindikatoren

Auf der Seite sichtbar umgesetzt:

- `WOK-PLANET-KLIMA-001`: Treibhausgasemissionen pro Produkteinheit

Zusätzlich in der Datenstruktur vorbereitet:

- Recyclinganteil
- existenzsichernder Lohn
- institutionelles Vertrauen

## Rechtliche Hinweise

Ergänzt wurde der Hinweis, dass die Seite Methodik und Datenlogik dokumentiert, aber keine amtliche Steuerfestsetzung, gesetzliche Bewertung oder Behördenprüfung ersetzt.

## Interne Links

Verlinkt wurden:

- Workflow: `/workflow.html`
- Modellseite: `/modell.html`
- Glossar: Wirkung, WÖk-ID, Scorecard, NWI, Reverse Merit Order, Wirkungssteuer
- Downloads: `/downloads.html`
- Vergleichsseite: `/vergleich.html`
- Akademie: `/akademie.html`
- Narrativanalyse: `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`
- Footer-Link `Methodik` in den statischen HTML-Footern

## Suche und Sitemap

- Neuer Suchindex-Eintrag: `methodik-datenbasis`
- Ergänzte Suchbegriffe: Datenbasis, Methodik, Wirkungsdaten, CSRD, ESRS, GRI, NACE, DPP, Benchmark, Datenqualität, WÖk-ID
- Sitemap-Eintrag ergänzt: `https://wirkungsoekonomie.de/methodik/datenbasis.html`

## Offene Punkte

- Weitere Beispielrechnungen können später aus konkreten Produkt- und Unternehmensdaten ergänzt werden.
- Die JSON-Strukturen sind vorbereitet, aber noch kein öffentliches Methodik-API.
- Filter sind clientseitig umgesetzt und bewusst einfach gehalten.
