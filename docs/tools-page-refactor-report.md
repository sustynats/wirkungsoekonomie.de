# Methoden- und Werkzeugseiten-Refactor

Stand: 2026-05-31.

## Ziel

Die Seite `/werkzeuge/` wurde von gemischten A/B-Clustern auf eine fachliche Pipeline mit acht Clustern umgestellt: Begriffe/Zielrahmen, Daten/Operationalisierung, Bewertung/Kennzahlen, Impact Controlling/Transformation, Rückkopplung, Kapital, Governance und Demos.

## Bewegte Kernkarten

- Netto-Wirkung: Cluster A, Bewertungslogik und Zielbrücke.
- Positive Netto-Wirkung: Cluster A, Zielgröße.
- Netto-Wirkungs-Index / NWI: Cluster C, operative Kennzahl.
- T-SROI: Cluster D, Transformationskennzahl und Methode.
- Reverse Merit Order: Cluster C, Bewertungs- und Nichtkompensationslogik.
- Wirkungsrat: Cluster G, Governance und Qualitätssicherung.
- Impact Controlling: Cluster D, Managementinstrument.
- Demos, Rechner und Anwendungschecks: eigener Cluster H, soweit sie nicht explizit als Fachinstrument im Kapital-, Daten- oder Governance-Cluster geführt werden.

## Neue oder sichtbarer gemachte Karten

- Netto-Wirkung
- Positive Netto-Wirkung
- Mensch, Planet, Demokratie
- SDGs / Agenda 2030
- SDG+
- Wirkungsgrenzen
- FinalScore
- WÖk-ID-Register
- SDG+-Register
- Quellenkatalog
- Review-/Versionierungslogik
- Missbrauchsschutz

## Fehlende Detailseiten

Siehe `docs/missing-glossary-terms.md`. Fehlende Zielseiten werden auf der öffentlichen Seite nicht als tote Links ausgespielt, sondern als `In Vorbereitung` oder `Begriffsseite in Rekonstruktion` markiert.

## Prüfergebnisse

- Build: bestanden (`npm run build`).
- Linkcheck: bestanden, 215640 interne Links geprüft, 0 fehlende (`node scripts/quality/check-local-links.mjs`).
- Glossar-Audit: bestanden, 1145 source-backed Terms alphabetisch geprüft (`npm run check:glossary`).
- Hover-Audit: bestanden, Hover-Coverage für 1145 Glossarbegriffe (`npm run check:hover-definitions`).
- Werkzeug-Routen-Audit: 74 bisherige Werkzeugkarten-Ziele geprüft, 0 fehlende Zielseiten.
- Werkzeugdetailseiten nach Build: 67 `werkzeuge/**/index.html`-Routen vorhanden.

## Risiko / offen

- Einige gewünschte neue Karten haben noch keine eigene Detailseite. Sie sind absichtlich ohne harten Link markiert, damit keine 404 entsteht.
- `Wirkungsgrenzen` ist als Begriffsseite in Rekonstruktion markiert und in `docs/missing-glossary-terms.md` dokumentiert.
