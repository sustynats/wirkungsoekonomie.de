# Glossary Last Good Candidates

## Ergebnis

Empfohlener `last_good_glossary_commit`: `7a9a15d0a` (Fix glossary related term links).

Begründung: Dieser Stand enthält die umfangreiche zentrale `assets/data/term-registry.json` mit 1.145 Term-Objekten, eine Hover-Datei mit 1.145 öffentlichen Begriffen und ca. 1.446 Begriffs-/Alias-Routen unter `/begriffe/`. Neuere Live-Stände ab `2c7192fdb` enthalten nur noch ca. 80 Begriffsdetailseiten.

## Kandidatenvergleich

| Commit | Beschreibung | Term-Registry | public glossary terms | Begriffsseiten | Hover-Einträge |
|---|---|---:|---:|---:|---:|
| 489d57143 | 489d57143 Fix homepage latest journal script | 0 | 80 | 80 | 80 |
| 0d8943acd | 0d8943acd Show latest blog posts on homepage | 0 | 80 | 80 | 80 |
| 2c7192fdb | 2c7192fdb Deploy site restructure and WÖk-ID register explorer | 0 | 80 | 80 | 80 |
| 7a9a15d0a | 7a9a15d0a Fix glossary related term links | 1145 | 1145 | 1446 | 1145 |
| 5b858b58e | 5b858b58e Add Geld and sharpen Kapital glossary terms | 1145 | 1145 | 1446 | 1145 |
| 3f6c7caec | 3f6c7caec Add democracy rule of law glossary cluster | 1142 | 1142 | 1444 | 1142 |
| 04ffd6c70 | 04ffd6c70 Fix glossary filter rendering | 681 | 681 | 987 | 681 |
| 053ad114e | 053ad114e Normalize glossary filter metadata | 681 | 681 | 987 | 681 |
| 1016ee7ec | 1016ee7ec Build filterable glossary architecture | 681 | 681 | 987 | 681 |
| 801504719 | 801504719 Extend glossary architecture | 399 | 399 | 709 | 399 |
| 0506b074d | 0506b074d Audit and normalize glossary hover coverage | 302 | 302 | 618 | 302 |
| ac8fccfcb | ac8fccfcb Restore full glossary registry and term pages | 243 | 243 | 566 | 243 |
| 7e1a40740 | 7e1a40740 Publish current website state | 243 | 80 | 566 | 80 |
| c57c0dc1b | c57c0dc1b Add personal audio introduction | 243 | 243 | 566 | 243 |

## Gefundene Komponenten

- Term-Registry: `assets/data/term-registry.json`
- Hover-Datei: `assets/js/glossaryTerms.js`
- Öffentliche Glossar-Daten: `public/data/glossary.terms.json`
- Glossar-Build: `scripts/glossary/build-glossary-registry.mjs`, `scripts/glossary/build-glossary-pages.mjs`
- Detailseiten/Alias-Routen: `begriffe/*/index.html`
- Suchintegration: über `public/data/glossary.terms.json`, `assets/js/glossaryTerms.js` und den bestehenden Search-Build.

## Empfehlung

`7a9a15d0a` wird als Baseline genutzt. Der Wiederherstellungspfad holt Registry, Hover, Build-Skripte und alte Detailseiten daraus zurück.
