# Glossar-Import WÖMS 1.0 und WÖMM 1.0

Stand: 2026-07-10

- Importquelle: `content/glossary/imports/woems-woemm-1.0.json`
- Redaktionsquelle: WÖMS 1.0 und WÖMM 1.0
- Neue Begriffe: 0
- Aktualisierte Begriffe: 99
- Offene Querverweise ohne Glossarziel: 0

## Neu angelegt

- keine

## Aktualisiert

- /begriffe/wirkungsoekonomisches-methodensystem/
- /begriffe/wirkungsoekonomisches-managementmodell/
- /begriffe/wirkungskompass/
- /begriffe/systemlandkarte/
- /begriffe/wirkungsoekonomische-managementarchitektur/
- /begriffe/wirkungsoekonomische-erfolgslogik/
- /begriffe/woemm-betriebssystem/
- /begriffe/woems-methodenkreislauf/
- /begriffe/woems-methodenkarte/
- /begriffe/woems-workshop-journey/
- /begriffe/woems-moderation/
- /begriffe/canvas-mindeststandard/
- /begriffe/woems-methodenregister/
- /begriffe/wirkungssystem-landkarte/
- /begriffe/wirtschaftliche-tragfaehigkeit/
- /begriffe/woems-auftragsklaerung/
- /begriffe/wirkungskompass-ausrichtung/
- /begriffe/systemgrenzen-und-reichweiten-canvas/
- /begriffe/wirkungsempfaenger-und-stakeholder-landkarte/
- /begriffe/wirkungsgrenzen-und-rechtepruefung/
- /begriffe/evidenz-und-annahmenregister/
- /begriffe/entscheidungskontext-und-komplexitaetscheck/
- /begriffe/beteiligungs-und-repraesentationsdesign/
- /begriffe/wirkungszustandskarte/
- /begriffe/wirkungsproblem-canvas/
- /begriffe/problem-und-wirkungsbaum/
- /begriffe/kausalschleifen-und-rueckkopplungsdiagramm/
- /begriffe/bestands-und-flussmodell/
- /begriffe/interdependenz-und-abhaengigkeitsmatrix/
- /begriffe/externalitaeten-und-kostenverlagerungskarte/
- /begriffe/wirkungsordnungen-landkarte/
- /begriffe/zeit-verzoegerungs-und-generationenkarte/
- /begriffe/systemhebel-analyse/
- /begriffe/engpass-und-reverse-merit-analyse/
- /begriffe/wirkungs-systemstresstest/
- /begriffe/wirkpfad/
- /begriffe/wirkmechanismus-canvas/
- /begriffe/wirkungsoekonomische-theory-of-change/
- /begriffe/outcome-und-empfaengerlandkarte/
- /begriffe/beitragsanalyse/
- /begriffe/wirkungshypothesen-register/
- /begriffe/nebenwirkungs-wechselwirkungs-und-rebound-analyse/
- /begriffe/wirkungsszenarien-und-zukunftsbilder/
- /begriffe/wirkungsresilienz-pfade/
- /begriffe/transformationswirkungs-logik/
- /begriffe/referenzrahmen-und-standardmapping/
- /begriffe/wirkungsrelevanz-und-materialitaetsanalyse/
- /begriffe/woek-indikatorenarchitektur/
- /begriffe/kii-design-key-impact-indicators/
- /begriffe/wirkungsdaten-inventur-und-datenflusskarte/
- /begriffe/datenqualitaets-und-evidenzmatrix/
- /begriffe/wirkungsscorecard-und-finalscore/
- /begriffe/nwi/
- /begriffe/t-sroi/
- /begriffe/wirkungsrisiko-matrix/
- /begriffe/wirkungsbilanz-und-leistungszerlegung/
- /begriffe/evaluations-und-lernfragen-design/
- /begriffe/wirkungszielbild/
- /begriffe/wirkungsstrategie-canvas/
- /begriffe/wirkungsziele-und-impact-okr/
- /begriffe/wirkungsportfolio/
- /begriffe/transformationsportfolio/
- /begriffe/wirkungsbudgetierung/
- /begriffe/wirkungskapital-und-investitionsgate/
- /begriffe/wirkungsgovernance-canvas/
- /begriffe/wirkungsrollen-und-verantwortungsmatrix/
- /begriffe/wirkungsentscheidungsmemo/
- /begriffe/wirkungstransformations-roadmap/
- /begriffe/woems-reifegrad-und-faehigkeitsassessment/
- /begriffe/wirkungsproblem-loesungs-fit/
- /begriffe/wirkungsversprechen-canvas/
- /begriffe/wirkungsmodell-canvas/
- /begriffe/wirkungsdesign-doppelschleife/
- /begriffe/wirkungsoptionen-und-ideenportfolio/
- /begriffe/wirkungsprototyp-canvas/
- /begriffe/wirkungsexperiment/
- /begriffe/wirkungs-mvp/
- /begriffe/problem-wirkungs-system-markt-fit/
- /begriffe/produktlebenszyklus-wirkungs-canvas/
- /begriffe/lieferketten-wirkungs-canvas/
- /begriffe/plattform-und-netzwerkeffekt-canvas/
- /begriffe/preis-anreiz-und-rueckkopplungs-canvas/
- /begriffe/wirkungsskalierungs-diffusions-und-exit-canvas/
- /begriffe/organisationswirkungs-canvas/
- /begriffe/wirkungsfuehrungsrad/
- /begriffe/wirkungsorientiertes-operating-model/
- /begriffe/kultur-verhaltens-und-anreizlandkarte/
- /begriffe/macht-abhaengigkeits-und-entscheidungsraumanalyse/
- /begriffe/psychologische-sicherheit-und-wirkungswiderspruch/
- /begriffe/wirkungskompetenz-matrix/
- /begriffe/lern-und-rueckkopplungsarchitektur/
- /begriffe/wirkungstransformations-bereitschaft/
- /begriffe/wirkungspilot-design/
- /begriffe/prozess-und-systemintegration/
- /begriffe/umsetzungs-und-uebergangsschutzplan/
- /begriffe/wirkungsdashboard-und-managementcockpit/
- /begriffe/wirkungsfruehwarn-und-eskalationssystem/
- /begriffe/wirkungsreview-und-lernende-retrospektive/
- /begriffe/wirkungsassurance-audit-und-methodenpruefung/

## Offene Querverweise

- keine

## Standardprozess

1. Redaktionsquelle in eine strukturierte Importdatei unter `content/glossary/imports/` überführen.
2. `GLOSSARY_IMPORT_FILE=... node scripts/glossary/import-glossary-supplement.mjs` ausführen.
3. `npm run glossary:build` ausführen.
4. `npm run check:glossary && npm run check:glossary-alpha && npm run check:hover-definitions && npm run check:search` ausführen.
5. Commit, Push auf `main`, GitHub Pages Deploy abwarten, Live-URLs prüfen.
