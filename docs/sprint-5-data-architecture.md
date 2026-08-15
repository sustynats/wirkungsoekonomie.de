# Sprint 5 Data Architecture

Stand: 2026-05-22.

## Ziel

Sprint 5 bereitet echte Daten- und Analysefähigkeit vor, ohne finale WÖk-Bewertungen zu behaupten. Der Scanner zeigt Datenlage, Datenqualität, Quellenstatus, Wirkungspotenziale, Datenlücken, Unsicherheit und WÖk-Gegenfrage.

## Datenquellen

Neu angelegt:

- `content/data/data-quality-levels.json`
- `content/data/external-data-sources.json`
- `content/assistant/approved-corpus.json`
- `content/scanner/source-panel-schema.json`

Vorhandene Scanner-Dateien wurden konsolidiert:

- `content/scanner/scanner-result-schema.json`
- `content/scanner/scanner-privacy-safety.json`
- `content/scanner/text-analysis-templates.json`
- `content/scanner/product-analysis-templates.json`

## Vorbereitete API-Anbindungen

- Open Food Facts: Lebensmitteldaten, Barcode, Labels, Zutaten.
- EPREL: Energiegelabelte Produkte.
- UN SDG Data Portal, Eurostat, World Bank, ILOSTAT, WHO GHO, FAOSTAT: öffentliche Datenräume.
- Bundestag DIP, EUR-Lex: politische und rechtliche Dokumente.

## Rechtlich / lizenzrechtlich unklar

- GS1 / GTIN Lookup und Stammdaten.
- EPD-Datenbanken je Programm.
- CDP, ESG-Ratinganbieter, EcoVadis, RepRisk, Clarity AI: nur öffentliche Methodiken oder öffentlich freigegebene Daten.
- Unternehmensberichte: urheberrechtlich geschützt, daher nur Auszüge und Analyse.

## Nur Link oder manuelle Quelle

- Unternehmenswebsites.
- Wahlprogramm-PDFs.
- Nachhaltigkeitsberichte.
- Kommunale Haushalte.
- DSA-/Plattformtransparenzberichte.

## Lokal verarbeitet im MVP

- Texteingaben im Browser.
- Demo-Ausgaben.
- Rechnerwerte.
- Wissenskarten und Kompassdaten.

## Nicht speichern

- personenbezogene Eingaben.
- vollständige Artikeltexte.
- hochgeladene Dokumente im MVP.
- Screenshots oder Fotos ohne Einwilligung.
- API-Keys im Frontend.

## Backend später nötig

- URL-Abruf mit robots/paywall/urheberrechtlicher Prüfung.
- PDF-Extraktion.
- OCR / Barcode / QR.
- API-Proxy für externe Datenquellen.
- Quellen-Caching mit Lizenzlogik.
- RAG über freigegebenen Corpus.

## MVP ohne Backend

- strukturierte Eingabe.
- Demo-Analyse.
- Datenqualitätsanzeige.
- Quellenpanel.
- WÖk-Gegenfrage.
- Datenlücken und Unsicherheit.

## Später Server / API / RAG

Serverseitig nötig für echte URL-, PDF-, Produkt- und Unternehmensanalyse. RAG darf nur Quellen aus `content/assistant/approved-corpus.json` nutzen, bei denen `allowed_for_assistant` true ist.
