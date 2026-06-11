# Debattenkarte importiert

Stand: 2026-06-07

- Titel: Die AfD ist für den kleinen Mann da?
- Slug: afd-kleiner-mann-wohlstandsgrundlagen
- Aktion: neu ergänzt
- Strukturquelle: `content/wirkungsradar/imports/afd-kleiner-mann-wohlstandsgrundlagen.json`
- Redaktionsquelle: `CodeX_Debattenkarte_AfD_kleiner_Mann_Wohlstandsgrundlagen.docx`
- Quellenmodule: 10

## Route

/wirkungsradar/live/afd-kleiner-mann-wohlstandsgrundlagen/

## Standardprozess

1. Strukturierte Karte unter `content/wirkungsradar/imports/` ablegen.
2. `CARD_FILE=... node scripts/wirkungsradar/import-single-debattenkarte.mjs` ausführen.
3. `node scripts/wirkungsradar/apply-master-debattenkarten.mjs` ausführen.
4. `npm run check:links && npm run check:search` ausführen.
5. Commit, Push auf `main`, GitHub Pages Deploy abwarten, Live-URL prüfen.
