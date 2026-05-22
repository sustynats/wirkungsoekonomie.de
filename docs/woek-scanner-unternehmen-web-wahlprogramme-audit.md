# Audit: WÖk-Scanner für Unternehmen, Web und Wahlprogramme

Stand: 2026-05-22

## 1. Ergänzte Scanner-Modi

Ergänzt wurden:

- Unternehmens-Scanner
- Artikel-/Website-Scanner
- Wahlprogramm-Scanner
- Produkt-Scanner
- Entscheidungs-Scanner
- PDF-, Foto- und Screenshot-Modus als spätere Funktion

Alle Modi folgen derselben Grundlogik: erkennen, Datenlage zeigen, Datenlücken markieren, Wirkungsräume einordnen, SDG-/SDG+-Bezug herstellen, Wirkungspfad zeigen, Quellen nennen und Unsicherheit offenlegen.

Die gemeinsame Ergebnisstruktur ist zusätzlich in `content/scanner/scanner-result-schema.json` dokumentiert.

## 2. Unternehmensscanner

Der Unternehmensscanner erstellt kein finales WÖk-Rating.

Vorgesehenes Ergebnis:

- Unternehmen erkannt: Name, Branche, Region, mögliche NACE-Zuordnung, Tätigkeitsfelder
- Datenlage: Website, Geschäftsbericht, Nachhaltigkeitsbericht, CSRD/ESRS, GRI, EU-Taxonomie, öffentliche ESG-Informationen
- Datenqualität: A bis F
- Wirkungsräume: Mensch, Planet, Demokratie
- Wirkungsfelder: Klima, Energie, Wasser, Biodiversität, Kreislauf, Arbeit, Lieferkette, Gesundheit, Governance, Transparenz, Lobbying, Medien-/Datenmacht
- Wirkungspfad: Geschäftsmodell -> Produkte / Dienstleistungen -> Lieferkette / Kapital / Daten / Ressourcen -> Wirkungspotenziale -> mögliche Zustandsveränderungen -> Datenlücken -> mögliche Bewertung erst nach Prüfung

Standardformulierung: Auf Basis der verfügbaren öffentlichen Daten ergibt sich folgendes Wirkungsprofil. Für eine belastbare WÖk-Bewertung fehlen folgende Daten.

## 3. Genutzte Datenquellen

Vorbereitet wurden:

- öffentliche Primärdaten: Unternehmenswebsite, Geschäftsbericht, Nachhaltigkeitsbericht, CSRD-/ESRS-Bericht, GRI-Index, EU-Taxonomie-Angaben, ESEF/XBRL, ESAP, Register
- ESG- und Nachhaltigkeitsdaten: CDP, SBTi, TNFD, UN Global Compact, Transition Plans, öffentlich zugängliche Ratinginformationen
- Produktdaten: Open Food Facts, EPREL, GS1 / GTIN / Digital Link, DPP / ESPR, EPD, ÖKOBAUDAT, ProBas, Herstellerdaten, Zertifizierungen und Labels

## 4. Umgang mit ESG-Daten

ESG-Daten werden nur als externe Daten- oder Methodikquelle behandelt.

Nicht zulässig:

- proprietäre Scores übernehmen
- ESG-Rating als positive Netto-Wirkung darstellen
- ESG-Konformität mit WÖk-Konformität gleichsetzen
- geschützte Datenbanken scrapen

Zulässig:

- öffentliche Methodiken verlinken
- Grenzen und Perspektive einordnen
- Datenquelle im Quellenpanel nennen
- WÖk-Mapping klar von externer Quelle unterscheiden

## 5. Proprietäre Daten

Bei unklarer Lizenz gilt `link_only`.

Keine Nutzung ohne Lizenz:

- bezahlte ESG-Datenbanken
- proprietäre Ratingdaten
- geschützte ISO-/DIN-/EN-Inhalte
- geschlossene Produktdatenbanken
- Mandanten- oder Beratungsunterlagen

## 6. Artikel- und Website-Analyse

Der Artikel-/Website-Scanner ist keine reine Zusammenfassung.

Analysefelder:

- Thema
- zentrale Aussagen
- Frame / Narrativ
- Wirkungspotenzial
- Resonanzraum
- SDG-/SDG+-Bezug
- Wirkung auf Mensch, Planet, Demokratie
- ausgeblendete Systemfragen
- WÖk-Gegenfrage
- Quellen- und Unsicherheitshinweis

Bei gesperrten oder nicht lesbaren Seiten greift der Fallback: Diese Seite kann nicht automatisch gelesen werden. Bitte füge einen kurzen Textauszug ein.

PDFs, Screenshots und Fotos werden im MVP als Eingabetypen vorbereitet, aber nicht automatisch dauerhaft gespeichert oder vollständig reproduziert.

## 7. Wahlprogramm-Analyse

Der Wahlprogramm-Scanner gibt keine Wahlempfehlung.

Analysefelder:

- zentrale politische Maßnahme
- behauptetes Ziel
- erwartete Wirkung laut Programm
- wirkungsökonomische Prüfung
- relevante SDGs / SDG+
- mögliche positive Wirkung
- mögliche negative Wirkung
- Zielkonflikte
- ausgeblendete Systemfragen
- Datenbedarf
- WÖk-Gegenfrage

Standardhinweis: Diese Analyse ist keine Wahlempfehlung. Sie zeigt wirkungsökonomische Zusammenhänge, Wirkungspotenziale und offene Systemfragen.

## 8. Urheberrecht

Regeln:

- keine langen Artikeltexte speichern
- keine vollständigen PDFs reproduzieren
- keine Paywalls umgehen
- nur kurze Auszüge und Analyse
- Quelle immer anzeigen
- bei geschützten Dokumenten nur Nutzer-Auszug analysieren

## 9. Datenschutz

Regeln:

- keine dauerhafte Speicherung von Foto-, URL- oder Texteingaben im MVP
- keine personenbezogenen Daten erforderlich
- keine Weitergabe an Dritte ohne Hinweis
- bei KI-Nutzung transparent machen
- Uploads mit Dateigrößenlimit und Sensibilitätswarnung

## 10. Quellenklarheit

Jeder Scan braucht ein Quellenpanel:

- Eingabequelle
- interne WÖk-Wissensbasis
- Glossar
- Begriffsleitfaden
- WÖk-Beispiel / Methodikseite
- externe Datenquelle
- Unternehmensbericht
- EU-/UN-/GRI-/ESRS-/CSRD-Quelle
- Datenbank / API

Pro Quelle wird dokumentiert: was sie geliefert hat, Datenstand, Limitierung.

Das verpflichtende Quellenpanel ist als Schema in `content/scanner/scanner-result-schema.json` hinterlegt.

## 11. Umgesetzte MVP-Phase

Umgesetzt wurde die Konzept- und Datenbasis für Phase 1 bis 5 sowie eine statische öffentliche MVP-Oberfläche `scanner.html`.

Aktiv ausgearbeitet:

- Phase 1: Text-/Artikel-/Website-Scanner und Wahlprogramm-Scanner
- Demo-Ergebnisstruktur
- Datenqualität A-F
- Quellen-, Datenschutz- und Rechtsgrenzen
- Verbindung zum WÖk-Kompass

Noch nicht umgesetzt:

- Live-URL-Abruf
- OCR
- Barcode-/QR-Scan
- Produktdaten-API
- Unternehmensbericht-Parsing
- echte WÖk-ID- oder Scorecard-Berechnung

## 12. Offene Punkte

- rechtssichere URL-Fetching-Strategie
- OCR- und Barcode-Technologie auswählen
- API-Keys und Lizenzregeln für Produktdaten prüfen
- Schema für Unternehmensprofile weiter normalisieren
- Freigabelogik für RAG-/KI-Nutzung ergänzen
- Quellenpanel später automatisiert aus dem Quellenregister speisen

## Leitsatz

Der WÖk-Scanner soll nicht sagen: Das ist gut oder schlecht.

Er soll zeigen: Welche Wirkung ist erkennbar, welche Wirkungspotenziale entstehen, welche Daten fehlen, welche SDGs/SDG+-Dimensionen betroffen sind und welche Rückkopplung daraus folgen müsste.
