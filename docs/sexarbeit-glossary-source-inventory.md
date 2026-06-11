# Sexarbeit Glossary Source Inventory

Stand: 2026-06-01

## Ziel

Der Begriff `Sexarbeit` wurde als sensibler Glossarbegriff vorbereitet. Die Änderung darf keine bestehenden Glossar-Detailseiten, Hoverdefinitionen, Crosslinks, Suchindex-Einträge oder alten Routen entfernen.

## Baseline vor Änderung

- Zentrale Registry: 1172 Begriffe in `assets/data/term-registry.json`
- Öffentliche Glossardaten: 1172 Begriffe in `public/data/glossary.terms.json`
- Begriff-Detailverzeichnisse: 1474 unter `begriffe/`
- Hoverdefinitionen: 1172 in `assets/js/glossaryTerms.js`
- Bestehende Route `/begriffe/sexarbeit/`: nicht vorhanden
- Bestehende Alias-Routen `/begriffe/prostitution/` und `/begriffe/sex-work/`: nicht vorhanden

## Repo-Fundstellen

Im aktuellen Arbeitsbaum wurden keine vorhandenen Glossar-Detailseiten für `Sexarbeit`, `Prostitution` oder `Sex Work` gefunden. Anschlussfähige Kontextseiten liegen vor allem in:

- `referenz/kapitel-073-migration-und-gesellschaftliche-zugehoerigkeit/`
- `portale/migration-vielfalt/gesamtdossier/`
- `portale/migration-vielfalt/arbeitsmarkt-fachkraefte-demografie/`
- `docs/sdg-sdgplus/_source/website_inhalt_sdg_sdgplus_detailseiten_vertieft_v0_3.md`

Die Git-Historienprüfung war durch lokal defekte Refs eingeschränkt (`refs/heads/fix-mobile-reference-reader-20260531 2`, `refs/remotes/origin/main 2`). Der aktuelle Arbeitsbaum und die gültig lesbaren Quellen wurden geprüft.

## Externe Orientierungsquellen

- OHCHR: Menschenrechtsbezogene Einordnung von Sexarbeit
- UNAIDS: HIV, Gesundheit, Schutz und Rechte im Kontext Sexarbeit
- BMFSFJ: Prostituiertenschutzgesetz und öffentliche Informationen zum Schutzrahmen

Diese Quellen werden als Orientierung genannt. Die Glossarseite ersetzt keine Rechts-, Sozial- oder Gesundheitsberatung.

## Schutzentscheidung

- `autoLinkAllowed: false`
- `maxAutoLinksPerPage: 0`
- `showHover: true`
- Keine sexualisierten Bilder
- Keine Personenbewertung
- Keine Gleichsetzung mit Menschenhandel, Zwangsprostitution, sexueller Ausbeutung oder sexualisierter Gewalt
- Alias-Routen nur für `prostitution` und `sex-work`
