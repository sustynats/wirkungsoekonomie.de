# Visual-Asset-Audit

Stand: 2026-05-27

## Ziel

Die öffentlich eingebundenen Inhalts-SVGs wurden durch professionelle Raster-Infografiken ersetzt. Logo, Signet und Favicon bleiben SVG, weil sie technische Markenassets sind und nicht zu den erklärenden Inhaltsgrafiken zählen.

## Ergebnis

- 55 professionelle PNG-Infografiken erzeugt.
- 44 öffentliche SVG-Einbindungen aus Seiten auf PNG umgestellt.
- 56 Referenzen automatisch ersetzt, inklusive `source`-Tags und Registry-Verweisen.
- 0 verbleibende `assets/visuals/*.svg`-Referenzen in HTML, CSS, JS, MJS und JSON.
- Brand-SVGs bleiben unverändert.

## Betroffene Bereiche

- `/modell.html`
- `/kompass.html`
- `/buch.html`
- `/funktionsweise/`
- `/verstehen.html`
- `/wirkungsoekonomie.html`
- `/akademie.html`
- `/anwendungen.html`
- `/glossar.html`
- `/fuer/*`
- `/wissen/sechster-kondratieff.html`
- `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`

## Build-Sicherung

Die neue Build-Stufe `scripts/visuals/apply-professional-visual-assets.mjs` läuft im Full Build nach dem UX-Polish. Sie ersetzt SVG-Einbindungen erneut durch PNGs, falls vorherige Generatoren ältere SVG-Pfade zurückschreiben.

## Nicht geändert

- `assets/img/brand/*.svg`
- Hero-SVGs, sofern sie nicht öffentlich als Inhaltsdiagramm eingebunden sind
- verworfene Visuals unter `assets/visuals/rejected/`
- technische Quell-/Altbestände ohne öffentliche Referenz
