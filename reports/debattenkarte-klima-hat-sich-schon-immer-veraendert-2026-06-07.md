# Debattenkarte importiert

Stand: 2026-06-07

- Titel: Klima hat sich schon immer verändert?
- Slug: klima-hat-sich-schon-immer-veraendert
- Aktion: aktualisiert
- Strukturquelle: `content/wirkungsradar/imports/klimawandel-natuerlich-kein-menschlicher-einfluss.json`
- Redaktionsquelle: `CodeX_Debattenkarte_Klimawandel_natuerlich_WOeK.docx`
- Quellenmodule: 6

## Route

/wirkungsradar/live/klima-hat-sich-schon-immer-veraendert/

## Standardprozess

1. Strukturierte Karte unter `content/wirkungsradar/imports/` ablegen.
2. `CARD_FILE=... node scripts/wirkungsradar/import-single-debattenkarte.mjs` ausführen.
3. `node scripts/wirkungsradar/apply-master-debattenkarten.mjs` ausführen.
4. `npm run check:links && npm run check:search` ausführen.
5. Commit, Push auf `main`, GitHub Pages Deploy abwarten, Live-URL prüfen.
