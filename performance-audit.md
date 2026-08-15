# Performance-Audit

Stand: 2026-05-19

## Umgesetzte Optimierungen

- Blogübersicht auf leichte WebP-Thumbnails umgestellt.
  - 27 LinkedIn-Vorschaubilder liegen unter `assets/img/linkedin/thumbs/`.
  - Die Originalbilder bleiben unverändert erhalten und werden nicht gelöscht.
- Wiederkehrende große Bilder zusätzlich als WebP bereitgestellt:
  - `assets/img/book/cover.webp`
  - `assets/img/blog/2026-05-17-massstabskrise.webp`
- Bereits vorhandene moderne Formate bevorzugt:
  - Hero-Systemgrafik nutzt WebP statt PNG.
  - Modellgrafik nutzt WebP statt PNG.
- Lokale `<img>`-Tags haben `width` und `height`, damit Layout-Shifts reduziert werden.
- Bilder unterhalb des oberen Seitenbereichs erhalten `loading="lazy"`.
- Bilder erhalten `decoding="async"`, sofern nicht bereits gesetzt.

## PDF-Downloads

- PDFs werden weiterhin nur verlinkt.
- Keine PDF-Datei wird automatisch eingebettet oder per HTML preload geladen.
- Besonders große Datei:
  - `assets/pdf/die-neue-ordnung-des-wohlstands.pdf` ca. 82 MB
  - bleibt als Download verlinkt, nicht eingebettet.

## CSS und JS

- Das Projekt nutzt weiterhin eine zentrale CSS-Datei: `assets/css/style.css`.
- Seitenlogik bleibt getrennt:
  - `assets/js/main.js` für Navigation, Blogfilter, Downloadsfilter, Analytics-Consent und Artikel-TOC.
  - `assets/js/erleben.js` nur auf `erleben.html`.
  - `assets/js/scorecard-dashboard.js` nur auf `scorecard-dashboard.html`.
- Keine zusätzlichen globalen Bibliotheken wurden eingeführt.

## Nicht gelöscht, nur Kandidaten für spätere Prüfung

Folgende Assets wirken aktuell nach HTML-Referenzen nicht direkt eingebunden, können aber als Quellen, Fallbacks, Arbeitsstände oder Archivmaterial wichtig sein. Daher wurden sie nicht entfernt:

- ursprüngliche PNG/JPG-Versionen der auf WebP umgestellten Bilder
- Buchgrafiken unter `assets/img/book/image*.png` und `assets/img/book/image*.jpeg`
- Originalbilder unter `assets/img/linkedin/`
- `assets/data/scorecard-examples.json` wird nicht aus HTML referenziert, kann aber von JavaScript oder künftigen Demos benötigt werden

Empfehlung: Vor jeder späteren Löschung eine eigene Asset-Verwendungsprüfung über HTML, JS, CSS, JSON-LD und Markdown durchführen.
