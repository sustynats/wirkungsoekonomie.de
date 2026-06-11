# Stage 12: Suche, Glossar und Querverlinkung

## Ziel

Suche, Glossar und Querverlinkung wurden verbessert, ohne bestehende Inhalte umzuschreiben oder Suchfilter zu entfernen.

## Bestehende Struktur

- `src/data/glossary.terms.yml` bleibt die führende Quelle der Glossarbegriffe.
- `scripts/glossary/build-glossary-registry.mjs` erzeugt Glossar-Registry, Hoverdaten und jetzt zusätzlich ein strukturiertes Glossar-Modell.
- `scripts/glossary/build-glossary-pages.mjs` erzeugt die Begriff-Detailseiten unter `begriffe/`.
- `suche.html`, `assets/js/search.js` und `assets/css/search.css` bilden die bestehende Suche mit Index, Wörterbuch, Kuratierung und Filtern.

## Ergänzungen

- Neues Datenmodell: `assets/data/glossary-model.json`
- Erweiterte Glossar-Linkdaten: `public/data/glossary-term-links.json`
- Erweiterte Hoverdaten: `assets/js/glossaryTerms.js`
- Begriff-Detailseiten erhalten einen Bereich `Verwandte Inhalte` mit:
  - Methoden,
  - Wirkungsfeldern,
  - Demos,
  - Dokumenten,
  - Einwänden.

## Suchvereinfachung

Die Suche behält alle bestehenden Filter. Ergänzt wurde eine sichtbare Einstiegsebene mit Filterchips:

- Begriff
- Werkzeug
- Wirkungsfeld
- Dokument
- Demo
- Einwand

Die bisherigen Detailfilter bleiben erhalten und sind als erweiterte Filter aufklappbar.

## Nicht-destruktive Umsetzung

Es wurden keine bestehenden Suchfilter entfernt, keine Glossarbegriffe gelöscht und keine Detailseiten umbenannt. Die Stage ergänzt strukturierte Metadaten und Crosslinks über Generatoren.
