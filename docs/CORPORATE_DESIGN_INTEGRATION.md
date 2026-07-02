# Corporate-Design-Integration der WÖk-Referenz

Stand: 2026-07-02

## Bestehende CSS- und Designbasis

- Hauptdatei: `assets/css/style.css`
- Navigation: `assets/data/navigation.json`, `templates/header.html`, `templates/footer.html`
- Bestehende Suche: `assets/search/search-index.json`, `assets/js/search.js`, ergänzt über `tools/build_search_index.py` und `scripts/search/build-woek-search-index.mjs`
- Bestehende Interaktion: `assets/js/main.js` für Navigation, Glossar-Hovers und Seitengrundlogik

## Farben

- Navy: `#0B1020`
- Ivory: `#F6F1EB`
- Green: `#2F7D5C`
- Gold: `#9A6F12` (Brand-Gold `#C89B3C`, im Web bewusst fuer WCAG-Kontrast auf Ivory abgedunkelt)
- Coral: `#C85A3C`
- Linien: `#E8E4DC`

## Typografie

- Headlines: `Playfair Display` mit Georgia-Fallback
- Fließtext/UI/Zahlen/Tabellen: `Source Sans 3` mit System-Fallback
- Die Referenz nutzt diese bestehende Hierarchie weiter und begrenzt die Lesespalte stärker als allgemeine Seiten.

## Übernommene UI-Muster

- Hero-Kicker, große Serifentitel, ruhige Ivory-Flächen
- bestehende Button-Klassen `.btn`, `.button`
- Kartenlogik mit 8px Radius und feiner Linie
- grüne Akzentlinien für geprüfte Live-Reference-Hinweise
- Header, Footer und Suche bleiben die vorhandenen Website-Systeme

## Neu ergänzte Referenz-Komponenten

- `ReferencePortal` als gestaltete Portal-Startseite unter `/referenz/`
- `ChapterCard`, `PartCard`, `ChapterReaderLayout`
- `ReferenceContextRail`, `ReadingProgress`, `ChapterMiniMap`
- `VersionRibbon`, `LiveReferenceAddendum`, `SourceCard`, `ExportDock`
- `reference-reader.js` für Lesemodi, lokale Kapitel-Filter, Quellenchips, Bild-Lightbox und Anchor-Copy

## Bewusst nicht eingeführt

- kein generisches Starlight-/Docs-Theme
- keine zweite Suche
- keine neue globale Navigation mit vielen Punkten
- kein Backend, keine Kommentare, kein Login, keine Datenbank
