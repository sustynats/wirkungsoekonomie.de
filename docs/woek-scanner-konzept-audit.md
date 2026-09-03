# Audit: WÖk-Scanner Konzept und MVP-Architektur

Stand: 2026-05-22

## 1. Konzipierte Scanner-Modi

Angelegt in `content/scanner/scanner-modes.json`:

- Text-/Artikel-/Website-Scanner
- Wahlprogramm-Scanner
- Unternehmens-Scanner
- Produkt-Scanner
- Entscheidungs-Scanner
- Foto-/Screenshot-/OCR-Modus
- DPP-ready Scanner als spätere Ausbaustufe

Leitregel: Der Scanner ist kein Chatbot, kein finales Rating und keine amtliche Bewertung. Er liefert wirkungsökonomische Ersteinschätzungen.

## 2. Geprüfte und vorbereitete Datenquellen

Angelegt in `content/scanner/product-data-sources.json`:

- Produktdaten: Open Food Facts, EPREL, GS1 / GTIN / Digital Link, Digital Product Passport / ESPR, EPD-Datenbanken, ÖKOBAUDAT, ProBas / UBA, EU Ecolabel, Blauer Engel, Herstellerdaten
- Unternehmensdaten: Unternehmenswebsite, Geschäftsbericht, Nachhaltigkeitsbericht, CSRD-/ESRS-Bericht, GRI-Index, EU-Taxonomie-Angaben, ESEF/XBRL, ESAP, Handelsregister / Unternehmensregister, CDP, SBTi, TNFD, UN Global Compact, öffentliche ESG-Informationen
- Externe Register: Verknüpfung zum bestehenden `content/sources/external-source-registry.json`

Nicht vorgesehen: proprietäre Scores scrapen, Paywalls umgehen, geschützte ISO-/DIN-Inhalte kopieren oder bezahlte Datenbanken ohne Lizenz verwenden.

## 3. Empfohlene MVP-Stufe

Phase 1 ist empfohlen:

- Artikel-/Website-/Textscanner
- Wahlprogramm-Scanner
- Eingabe über URL oder manuellen Auszug
- keine dauerhafte Speicherung
- Quellenpanel und Unsicherheitsbox verpflichtend

Begründung: Diese Stufe ist technisch schneller, benötigt weniger externe Produktdaten und schließt direkt an die bestehende WÖk-Logik zu Sprache, Medien, Demokratie und SDG+ an.

## 4. Vorgeschlagene UI-Komponenten

- ScannerModeSelector
- ScannerInputPanel
- ScannerResultCard
- ScannerDataQualityBadge
- ScannerImpactPath
- ScannerDataGapList
- ScannerSourcePanel
- ScannerUncertaintyNotice
- ScannerCounterQuestionBox
- ScannerRelatedKnowledgeCards
- ScannerCompassLink

Die öffentliche MVP-Oberfläche wurde als `scanner.html` angelegt.

## 5. Datenschutz- und Rechtsgrenzen

Dokumentiert in `content/scanner/scanner-privacy-safety.json`:

- keine personenbezogenen Daten erforderlich
- Foto-, URL- und Texteingaben nicht dauerhaft speichern
- keine Weitergabe an Dritte ohne Hinweis
- keine sensiblen Dokumente ohne Warnhinweis
- keine Paywall-Umgehung
- keine lange Reproduktion urheberrechtlich geschützter Texte
- keine Rechts-, Steuer-, Anlage- oder Nachhaltigkeitsberatung
- keine finale WÖk-Steuerklasse und keine Produktzertifizierung

## 6. Datenqualitätslogik

Angelegt in `content/scanner/data-quality-levels.json`:

- A = produktbezogene, geprüfte Daten
- B = Hersteller- oder Berichtsdaten, plausibilisiert
- C = offene Datenbank, Label oder Zertifizierung mit begrenztem Scope
- D = Kategorie- oder Branchenbenchmark
- E = Annahme oder unvollständige Daten
- F = keine belastbare Datenbasis

Jede Analyse muss die Datenqualität sichtbar machen.

## 7. Demo-Scans

Angelegt in `content/scanner/scanner-demo-scans.json` und sichtbar in `scanner.html`:

- Regionaler Bio-Apfel vs. Importapfel
- Desinformation und demokratisches Vertrauen
- Fast-Fashion-T-Shirt

Alle drei Beispiele laufen ohne Live-Daten und zeigen nur die Ergebnisstruktur.

## 8. Spätere Funktionen

Vorbereitet, aber nicht MVP:

- URL-Fetching mit robots-/Paywall-Regeln
- OCR und Layout-Erkennung
- Barcode-/QR-Erkennung
- Open Food Facts / EPREL Lookup
- Unternehmensbericht-Auswertung
- DPP-ready Produktanalyse
- RAG-Modus nur mit freigegebenen Wissensbausteinen
- stärkeres WÖk-ID- und Scorecard-Mapping

## 9. Offene Datenquellen und Schnittstellen

Offen zu prüfen:

- Zugriff, Rate Limits und Lizenzbedingungen für Open Food Facts, EPREL und GS1 / Digital Link
- belastbare öffentliche ESAP-Zugänge, sobald verfügbar
- EPD-Datenbank-Lizenzen und Nutzungsgrenzen
- OCR-Anbieter und lokale Verarbeitung
- rechtssichere URL-Fetching-Regeln
- öffentlich nutzbare Unternehmensregister- und Berichtsdaten

## Leitsatz

Der WÖk-Scanner sagt nicht: Dieses Produkt ist gut.

Er zeigt: Welche Wirkung ist erkennbar, welche Daten fehlen, welche SDGs/SDG+-Felder sind betroffen und welcher Wirkungspfad entsteht?
