# Glossar-Import Redaktioneller Nachtrag MAGA-Diskursformeln und Denkabbruchformeln

Stand: 2026-07-15

- Importquelle: `content/glossary/imports/maga-diskursformeln.json`
- Redaktionsquelle: Redaktioneller Nachtrag MAGA-Diskursformeln und Denkabbruchformeln
- Neue Begriffe: 0
- Aktualisierte Begriffe: 16
- Offene Querverweise ohne Glossarziel: 0

## Neu angelegt

- keine

## Aktualisiert

- /begriffe/thought-terminating-cliches/
- /begriffe/maga/
- /begriffe/witch-hunt/
- /begriffe/fake-news/
- /begriffe/hoax/
- /begriffe/rigged-election/
- /begriffe/deep-state/
- /begriffe/enemy-of-the-people/
- /begriffe/drain-the-swamp/
- /begriffe/america-first/
- /begriffe/law-and-order/
- /begriffe/radical-left/
- /begriffe/rino/
- /begriffe/cancel-culture/
- /begriffe/patriot-not-a-patriot/
- /begriffe/trump-derangement-syndrome/

## Offene Querverweise

- keine

## Standardprozess

1. Redaktionsquelle in eine strukturierte Importdatei unter `content/glossary/imports/` überführen.
2. `GLOSSARY_IMPORT_FILE=... node scripts/glossary/import-glossary-supplement.mjs` ausführen.
3. `npm run glossary:build` ausführen.
4. `npm run check:glossary && npm run check:glossary-alpha && npm run check:hover-definitions && npm run check:search` ausführen.
5. Commit, Push auf `main`, GitHub Pages Deploy abwarten, Live-URLs prüfen.
