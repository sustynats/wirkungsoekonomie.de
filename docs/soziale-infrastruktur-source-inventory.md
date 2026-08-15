# Soziale Infrastruktur Source Inventory

Stand: 2026-06-01

## Baseline vor Änderung

- Zentrale Registry: 1173 Begriffe in `assets/data/term-registry.json`
- Öffentliche Glossardaten: 1173 Begriffe in `public/data/glossary.terms.json`
- Begriff-Detailverzeichnisse: 1477 unter `begriffe/`
- Hoverdefinitionen: 1173 in `assets/js/glossaryTerms.js`
- Bestehende Route `/begriffe/soziale-infrastruktur/`: nicht vorhanden

## Bestandsprüfung

Es wurde keine bestehende Detailseite `Soziale Infrastruktur` gefunden. Relevante bestehende Anschlussbegriffe und Seiten:

- `/begriffe/daseinsvorsorge/`
- `/begriffe/sexarbeit/`
- `/begriffe/rechtsschutz/`
- `/begriffe/selbstwirksamkeit/`
- `/begriffe/resonanzraum/`
- `/begriffe/wirkungskompetenz/`
- `/begriffe/wirkungsraum/`
- `/begriffe/wirkungsarchitektur/`
- `/begriffe/wirkungshaushalt/`
- `/begriffe/digitale-selbstbestimmung/`
- `/begriffe/social-credit/`

## Fundstellen im Bestand

- `data/sdg_detail_matrix_v0_3.json`: soziale Infrastruktur als Bedingung gegen Armut und für Handlungsfähigkeit.
- `verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/`: Gesundheitsinfrastruktur als Würde- und Sicherheitsbezug.
- `werkstatt/dossiers/staat-recht-demokratie/buergerbeteiligung-wirkungsdemokratie/`: Beteiligung, Resonanz, Teilhabe und Korrekturfähigkeit als demokratische Infrastruktur.
- `begriffe/sexarbeit/`: soziale Infrastruktur als Schutz-, Gesundheits-, Beratungs-, Wohn- und Rechtsschutzkontext.
- `referenz/kapitel-067-bildung/` bis `referenz/kapitel-073-migration-und-gesellschaftliche-zugehoerigkeit/`: Bildung, Gesundheit, Pflege, Wohnen, Kindheit, Kultur und Migration als soziale Wirkungsräume.
- `referenz/kapitel-080-digitalisierung-als-infrastruktur-der-wirkungsoekonomie/` bis `referenz/kapitel-085-dpp-infrastruktur-und-technische-umsetzung/`: Datenräume, Digitalisierung und Infrastrukturbezüge.

## Git-Historie

Die lokale Git-Historienprüfung bleibt durch defekte lokale Refs eingeschränkt (`refs/heads/fix-mobile-reference-reader-20260531 2`, `refs/remotes/origin/main 2`). Der aktuelle Arbeitsbaum und die gültig lesbaren Quellen wurden geprüft.

## Entscheidung

Da keine alte Detailseite gefunden wurde, wird `/begriffe/soziale-infrastruktur/` als neuer eigener Glossarbegriff ergänzt. Verwandte Begriffe wie `Daseinsvorsorge`, `kritische Infrastruktur`, `Care`, `Schutzräume`, `soziale Teilhabe` und `demokratische Infrastruktur` werden nicht synonymisiert.
