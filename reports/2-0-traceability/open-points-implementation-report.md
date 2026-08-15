# Website 2.0 Offene-Punkte-Umsetzung

Stand: 2026-06-06

Quelle:
- `Wirkungsoekonomie_Offene_Punkteliste_Nachtrag_Content_Links.docx`
- `Wirkungsoekonomie_Offene_Punkteliste_Finalisierung_Website_2_0.docx`

## Umgesetzte P0-Korrekturen

| Punkt | Ergebnis | Nachweis |
|---|---|---|
| P0-C02 / P0-01 Karteninventar und Kanonisierung | Kanonisierung neu angewendet: 86 kanonische Narrative, 115 Redirects, 46 Synonyme. Alias-Karten erzeugen keine eigenen Nicht-Redirect-Karten mehr. | `reports/wirkungsradar-canonicalization-report.json` |
| P0-C04 bis P0-C07 öffentliche Artefakte, Rohdateien, interne Arbeitslinks | Public-Artifact-Härtung erweitert. JSON/JS werden validiert und öffentliche Rohdatei-/Arbeitsartefakt-Verweise bereinigt. | `npm run build:artifact`, `npm run check:public-hardening` |
| P0-02 Statuswiderspruch auf `/wirkungsradar/` | Öffentliche Statuslabels von “geprüft v2” / “redaktionell geprüft: ausstehend” auf konsistente 2.0-Sprache geändert. | `scripts/wirkungsradar/build-sprint3-ux.mjs`, `wirkungsradar/index.html` |
| P0-03 Benennung Öffentlicher Wirkungsraum / Debatten-Kompass | Startseiten- und Bridge-Texte auf “Öffentlicher Wirkungsraum” als Dach und “Debatten-Kompass” als Werkzeug korrigiert. “Wirkungsradar” bleibt nur als URL/technischer Alias/Altbegriff erhalten. | `index.html`, `assets/js/main.js` |
| P0-04 Arbeitsreste / Platzhalter | Geprüfte Debattenseiten enthalten keine sichtbaren Treffer für `Masterquelle`, `P0 gerettet`, `redaktionell geprüft: ausstehend`, `Geprüfte Debattenkarten`, `geprüft v2`. | `rg`-Prüfung gegen `wirkungsradar/index.html` und `wirkungsradar/live` |
| P0-06 Quellen und Deeplinks | Wirkungsradar-Quellencheck ist grün: 22 Quellen, 13 Packs. | `npm run check:wirkungsradar-sources` |
| P0-09 Link-/Such-/Downloadhärtung | Suche, Search-Contamination, Assets, Public-Hardening und Public-Language sind grün. | siehe Gate-Liste unten |

## Gate-Ergebnisse

| Gate | Ergebnis |
|---|---|
| `npm run build` | erfolgreich |
| `npm run build:artifact` | erfolgreich, `_site` 658,4 MB laut `check:size`; 669 nicht öffentliche Artefakte entfernt |
| `npm run check:public-hardening` | erfolgreich |
| `npm run check:wirkungsradar-v2` | erfolgreich: 202 Debattenkarten/Detailseiten geprüft |
| `node scripts/quality/check-glossary-public-hardening.mjs` | erfolgreich: 1728 Glossar-Detailseiten geprüft |
| `npm run check:search` | erfolgreich: 7476 Einträge |
| `npm run check:search-contamination` | erfolgreich |
| `npm run check:assets` | erfolgreich |
| `npm run check:size` | erfolgreich: 658,4 MB |
| `npm run typecheck` | erfolgreich |
| `npm run check:links` | erfolgreich, Suchindex neu gebaut |
| `npm run check:public-language` | erfolgreich: 0 sichtbare Findings |
| `npm run check:wirkungsradar-sources` | erfolgreich |
| `npm run check:wirkungsradar-links` | erfolgreich |

## Inventar- und Dublettenstand

- `wirkungsradar/live`: 101 `index.html`-Seiten
- Nicht-Redirect-Live-Seiten: 91
- Redirect-/Alias-Seiten: 10
- Nicht-Redirect-Titel-Dubletten: 0
- Kanonische Narrative laut Report: 86
- Redirects laut Report: 115
- Synonyme laut Report: 46

## Bewusst festgehaltene Grenze

Die beiden offenen Listen enthalten neben P0-Gates auch redaktionelle Tiefenanforderungen an Ursachen, Resonanz, Agenda, Resilienz und alle Debattenkarten. Der aktuelle Build führt die vorhandenen 2.0-Generatoren dafür aus und die technischen Gates sind grün. Eine vollständige manuelle inhaltliche Fachredaktion jeder einzelnen der 86 kanonischen Debattenseiten ist damit nicht behauptet; sie bleibt ein separates redaktionelles Review, wenn jede Seite einzeln gegen Quellen und fachliche Tiefe geprüft werden soll.
