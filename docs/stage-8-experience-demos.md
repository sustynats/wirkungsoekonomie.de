# Stage 8: Erleben und Demos

Branch: `site-restructure-stage-8-experience-demos`

## Ziel

Der Bereich `Erleben` und die interaktiven Demo-, Rechner-, Scanner- und Dashboard-Seiten erhalten konsistente Schutzlinien und Methodikhinweise. Bestehende URLs bleiben erhalten.

## Inventar der standardisierten Seiten

| Typ | Route | Status |
| --- | --- | --- |
| Erleben-Hub | `/erleben/` | standardisiert |
| Alte Erleben-URL | `/erleben.html` | erhalten |
| Scanner | `/anwendungen/scanner.html` | standardisiert |
| Alte Scanner-URL | `/scanner.html` | erhalten |
| Produktdashboard | `/scorecard-dashboard.html` | standardisiert |
| Produktwirkungsrechner | `/erleben/produktwirkungsrechner/` | standardisiert |
| Medienwirkungscheck | `/erleben/medienwirkungscheck/` | standardisiert |
| Impact-Controlling-Rechner | `/erleben/impact-controlling-rechner/` | standardisiert |
| Unternehmens-Wirkungscheck | `/erleben/unternehmens-wirkungscheck/` | standardisiert |
| Automatisierungs- und Wirkungseinkommensrechner | `/erleben/automatisierungs-wirkungseinkommensrechner/` | standardisiert |
| Wirkungsrenten-Rechner | `/erleben/wirkungsrenten-rechner/` | standardisiert |
| Wohnwirkungsrechner | `/erleben/wohnwirkungsrechner/` | standardisiert |
| Stranded-Asset-Check Wohnen | `/erleben/wohnwirkungsrechner/stranded-asset-check/` | standardisiert |
| Vermieter-Check | `/erleben/wohnwirkungsrechner/vermieter-check/` | standardisiert |
| Wirkungsschule-Check | `/erleben/wirkungsschule-check/` | standardisiert |
| Wirkungsportfolio-Generator | `/erleben/wirkungsportfolio-generator/` | standardisiert |
| Wirkungsförderungs-Check | `/erleben/wirkungsfoerderungs-check/` | standardisiert |
| Fach-Zukunft-Modulgenerator | `/erleben/fach-zukunft-generator/` | standardisiert |

## Gemeinsame Demo-Komponente

- Komponente: `scripts/lib/demo-layout-components.mjs`
- Build-Anwendung: `scripts/portal/apply-demo-governance-stage8.mjs`
- In `package.json` in `build` und `portal:build` eingebunden.

Der Standardblock enthält:

- Was diese Demo zeigt
- Modellannahmen
- Datenqualität / Demo-Werte
- Was diese Demo nicht leistet
- Schutzlinien
- Verwandte Methoden
- Verwandte Dokumente
- Nächster Schritt

## ProtectionNotice

Jede standardisierte Seite erhält eine ProtectionNotice mit:

- nicht amtlich und keine WÖk-Zertifizierung
- keine Rechts-, Steuer-, Anlage-, Kredit-, Versicherungs- oder Förderberatung
- keine Personenbewertung
- keine automatische Entscheidung
- Datenqualität, Annahmen und Unsicherheit sichtbar machen

## Toolnamen

Der sichtbare Name `KPI-Rechner` im Erleben-Hub wurde zu `Wirkungsindikatoren-Demo` geändert. Vorhanden bleiben `KII statt KPI` und `KII-Dashboard`; diese Benennung ist fachlich passend, weil klassische KPI ausdrücklich von Key Impact Indicators abgegrenzt werden.

## Nicht geändert

Reine Methodenseiten unter `/werkzeuge/` bleiben Methodikseiten. Sie werden über die Demo-Blöcke als verwandte Methoden verlinkt, aber nicht in Demo-Seiten umgedeutet.
