# Debattenkarte importiert

Stand: 2026-06-07

- Titel: Wirkungsabwehr: Warum Menschen Wirkung wegrationalisieren
- Slug: wirkungsabwehr-dissonanzrationalisierung
- Aktion: neu ergänzt
- Strukturquelle: `content/wirkungsradar/imports/wirkungsabwehr-dissonanzrationalisierung.json`
- Redaktionsquelle: `Wirkungsabwehr_Dissonanzrationalisierung_CodeX.docx`
- Quellenmodule: 4

## Route

/wirkungsradar/live/wirkungsabwehr-dissonanzrationalisierung/

## Standardprozess

1. Strukturierte Karte unter `content/wirkungsradar/imports/` ablegen.
2. `CARD_FILE=... node scripts/wirkungsradar/import-single-debattenkarte.mjs` ausführen.
3. `node scripts/wirkungsradar/apply-master-debattenkarten.mjs` ausführen.
4. `npm run check:links && npm run check:search` ausführen.
5. Commit, Push auf `main`, GitHub Pages Deploy abwarten, Live-URL prüfen.
