# WÖk-Scanner: Konzept und MVP-Architektur

Stand: 2026-05-22

## Ziel

Der WÖk-Scanner ist das Analysewerkzeug neben dem WÖk-Kompass.

Der Kompass hilft, Wirkung zu verstehen. Der Scanner hilft, konkrete Produkte, Texte, Unternehmen, Wahlprogramme, Websites und Entscheidungen wirkungsökonomisch einzuordnen.

Er liefert keine amtlichen Bewertungen, keine Steuerklassen, keine Anlageberatung und keine Zertifizierung.

## MVP-Phasen

1. Text-/Artikel-/Website-Scanner und Wahlprogramm-Scanner mit URL oder manuellem Auszug.
2. Unternehmens-Scanner mit öffentlichen Berichten, CSRD-/ESRS-/GRI-Hinweisen und Quellenpanel.
3. Produkt-Hypothesen-Scanner mit Open Food Facts, EPREL, Produkt-URL und Labels.
4. Foto/OCR/Barcode/QR.
5. DPP-ready Scanner mit stärkerem WÖk-ID- und Scorecard-Mapping.

## Frontend

Die Website nutzt eine ruhige Vollseitenoberfläche:

- Scan-Art auswählen
- Eingabe erfassen
- Ergebnis als Karten darstellen
- Datenqualität sichtbar machen
- Wirkungspfad zeigen
- Datenlücken nennen
- Quellenpanel öffnen
- Glossarbegriffe und WÖk-Kompass verlinken

MVP-Seite: `scanner.html`

## Backend später

Geplante Dienste:

- Scan API
- URL-Fetcher mit robots.txt-, Paywall- und Copyright-Regeln
- OCR-Service
- Barcode-/QR-Service
- Produktdaten-Lookup
- Unternehmensbericht-Parser
- Quellenmapping
- WÖk-Regelwerk
- RAG-System nur mit freigegebenen Wissensbausteinen

## Datenbasis

Scanner-Dateien:

- `content/scanner/scanner-modes.json`
- `content/scanner/product-data-sources.json`
- `content/scanner/text-analysis-templates.json`
- `content/scanner/product-analysis-templates.json`
- `content/scanner/impact-path-templates.json`
- `content/scanner/data-quality-levels.json`
- `content/scanner/scanner-demo-scans.json`
- `content/scanner/scanner-privacy-safety.json`

Verknüpfte Basis:

- `content/kompass/`
- `content/sources/`
- Glossar
- Methodikseiten
- freigegebene Wissenskarten
- führender WÖk-Begriffsleitfaden

## Ergebnislogik

Jeder Scan beantwortet:

1. Was wurde erkannt?
2. Welche Daten liegen vor?
3. Welche Daten fehlen?
4. Welche Wirkungsräume sind betroffen?
5. Welche SDGs / SDG+-Dimensionen sind betroffen?
6. Welche Wirkungspotenziale sind sichtbar?
7. Welcher Wirkpfad ergibt sich?
8. Welche Zielkonflikte bestehen?
9. Welche WÖk-Gegenfrage entsteht?
10. Welche Quellen wurden genutzt?
11. Welche Unsicherheit bleibt?

## Sicherheitslogik

Der Scanner muss immer kennzeichnen:

- keine finale WÖk-Bewertung
- keine finale Steuerklasse
- keine Produktzertifizierung
- keine ESG-Rating-Ersetzung
- keine Wahlempfehlung
- keine vollständige Faktenprüfung
- keine Rechts-, Steuer- oder Anlageberatung

## Kompass-Verbindung

Nach jedem Scan sollen erscheinen:

- verwandte Wissenskarten
- Glossarbegriffe
- Im WÖk-Kompass vertiefen
- Welche Daten fehlen für eine echte Bewertung?
- Wirkungspfad erklären

## Leitsatz

Nicht behaupten, sondern einordnen.
