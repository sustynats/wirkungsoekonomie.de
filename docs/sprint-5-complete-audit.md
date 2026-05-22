# Sprint 5 Complete Audit

Stand: 2026-05-22.

## 1. Datenquellen-Registry

Erstellt unter `content/data/external-data-sources.json`. Produktdaten, Unternehmensdaten, öffentliche Daten, Politik/Gesetze und Medienquellen sind vorbereitet.

## 2. Datenqualitätsmodell

Erstellt unter `content/data/data-quality-levels.json`. Die Stufen A-F sind definiert und im Scanner sichtbar.

## 3. URL-/Textanalyse

Vorbereitet über Scanner-Oberfläche und `content/scanner/text-analysis-templates.json`. Kein Paywall-Bypass, keine Volltextreproduktion, keine Faktenprüfung behauptet.

## 4. Wahlprogramm-Analyse

Als Sondermodus und Demo ergänzt. Keine Wahlempfehlung, keine Personenbewertung.

## 5. Produktscanner

Datenarchitektur mit Open Food Facts, EPREL, GS1/GTIN, DPP/ESPR, ÖKOBAUDAT, ProBas, PEF/OEF und Labels vorbereitet. Keine finale Steuerklasse.

## 6. Unternehmensscanner

Öffentliches Wirkungsprofil vorbereitet: Website, Berichte, CSRD/ESRS, GRI, EU-Taxonomie, CDP/SBTi/UNGC. Keine finale Bewertung und keine Anlageberatung.

## 7. Quellenpanel

Standardisiert über `content/scanner/source-panel-schema.json` und in der Scanner-Ausgabe sichtbar.

## 8. WÖk-Gegenfrage

In allen Demo-Ausgaben enthalten.

## 9. Datenschutz und Urheberrecht

Regeln ergänzt: keine Speicherung ohne Einwilligung, keine sensiblen Uploads im MVP, keine Paywall-Umgehung, keine langen geschützten Texte.

## 10. RAG-Corpus

Vorbereitet unter `content/assistant/approved-corpus.json`.

## 11. Offene Punkte für Sprint 6

- Redaktionelle Finalisierung und Copy-QA.
- Mobile QA über alle neuen Scannerzustände.
- Performance- und Accessibility-Feinschliff.
- Datenschutzseite für echte API-/Upload-Funktionen erweitern.
- Live-Daten erst nach Backend-, Lizenz- und Quellenprüfung.
