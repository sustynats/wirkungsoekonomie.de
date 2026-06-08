# Debattenkarte importiert

Stand: 2026-06-07

- Titel: Sind Westdeutsche keine Deutschen?
- Slug: westdeutsche-keine-deutschen
- Aktion: neu ergänzt
- Strukturquelle: `content/wirkungsradar/imports/westdeutsche-keine-deutschen.json`
- Redaktionsquelle: `Eingefügter Text.txt / 5fc15f81-33dd-427b-9e3f-7131009a7ec8`
- Quellenmodule: 6

## Route

/wirkungsradar/live/westdeutsche-keine-deutschen/

## Standardprozess

1. Strukturierte Karte unter `content/wirkungsradar/imports/` ablegen.
2. `CARD_FILE=... node scripts/wirkungsradar/import-single-debattenkarte.mjs` ausführen.
3. `node scripts/wirkungsradar/apply-master-debattenkarten.mjs` ausführen.
4. `npm run check:links && npm run check:search` ausführen.
5. Commit, Push auf `main`, GitHub Pages Deploy abwarten, Live-URL prüfen.
