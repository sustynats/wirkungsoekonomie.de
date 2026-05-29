# Codex-Anweisung: Rang 5 - Wohnen & Stadt / Wohnwirkungsindex / Wohnwirkungsrechner

Du arbeitest im Repository von www.wirkungsoekonomie.de.

## Ziel

Setze den nächsten Portalbereich **Wohnen & Stadt** um. Die Umsetzung folgt dem verbindlichen Veröffentlichungsstandard:

- Portal-Startseite
- Konzeptpapier online lesbar
- Gesamtdossier online lesbar
- Detailkonzepte je Unterbereich online lesbar
- Einzeldossiers je Unterbereich online lesbar
- Word/PDF-Downloads nur ergänzend als Export/Archiv
- Tool/Demo/Rechner kontextbezogen einbinden
- Buchanker
- SDG-/SDG+-Block
- WÖk-ID-/Indikatorenbezug
- politische Anschlussfähigkeit als Kernbestandteil
- Dossier & Export
- Glossar- und Querverlinkung

## Rückwirkend nachholen

Falls in Rang 1 bis 4 noch Detailkonzepte, Einzeldossiers oder Online-Volltexte fehlen, bitte nachholen und in der Website-Struktur ergänzen:

1. Produkte & Konsum / Wirkungsumsatzsteuer
2. Impact Controlling / T-SROI / NWI / WÖk-IDs / Scorecards
3. Staat, Recht & Demokratie / WStG / Wirkungsrat
4. Wirtschaft & Unternehmen

Dabei gilt: Jedes Unterthema braucht **Detailkonzept + Einzeldossier + Online-Volltext + Download + Dossier-Export**.

## Neue Seitenstruktur

Lege an oder aktualisiere:

- `/wirkungsfelder/wohnen-stadt/`
- `/wirkungsfelder/wohnen-stadt/konzept/`
- `/wirkungsfelder/wohnen-stadt/dossier/`
- `/wirkungsfelder/wohnen-stadt/detailkonzepte/`
- `/wirkungsfelder/wohnen-stadt/dossiers/`
- `/erleben/wohnwirkungsrechner/` oder bestehende Erleben-Struktur entsprechend
- `/werkstatt/arbeitsbibliothek/wirkungsfelder/wohnen-stadt/`

## Unterbereiche

Für jeden Unterbereich eigene Detailkonzept- und Dossierseite:

1. Wohnen als Wirkungsraum
2. Mietwirkung und Bezahlbarkeit
3. Wohnwirkungsindex WIX-Wohn
4. Sanierung, Energie und Warmmietenneutralität
5. Eigentum, Vermietung und Wirkungspflicht
6. Boden, Leerstand und Spekulation
7. Quartier, Stadt und Sozialraumprofil
8. Verdrängung, Gentrifizierung und Teilhabe
9. Kommunale Wohnwirkungspolitik
10. Finanzierung, Förderlogik und Wirkungsfonds
11. Mieterstrom und Energie-Gemeinschaften
12. Gesundes, barrierefreies und resilientes Wohnen

## Politische Anschlussfähigkeit

Auf jeder Portal-, Konzept-, Dossier- und Toolseite muss ein Abschnitt enthalten sein:

**Politische Anschlussfähigkeit und Ausgestaltungsspielraum**

Inhalt:

- Die Wirkungsökonomie ersetzt demokratische Aushandlung nicht.
- Sie macht Wirkungen, Zielkonflikte, Nebenwirkungen und Schutzgrenzen sichtbar.
- Parteien können unterschiedliche Ausgestaltungen wählen: Marktanreize, öffentliche Förderung, kommunale Wohnungswirtschaft, Genossenschaften, Mieterschutz, Eigentumsförderung, Bodenpolitik, Sanierungspflichten, steuerliche Entlastung oder direkte Unterstützung.
- Entscheidend ist, dass Wirkung auf Mensch, Planet und Demokratie transparent wird.
- Kein Portal darf so formuliert sein, als gäbe es nur eine einzig wahre politische Lösung.

## Tool: Wohnwirkungsrechner / WIX-Wohn

Implementiere oder bereite vor:

- Mietbelastungsrechner
- Energie- und Gebäudescore
- Sanierungswirkungsrechner
- Warmmietenneutralitätsprüfung
- Quartierswirkungscheck
- WIX-Wohn-Berechnung
- Politikvariantenansicht
- Dossier-Export

Formel Arbeitsmatrix v0.1:

`WIX-Wohn = 0.35 * KlimaEnergieScore + 0.40 * MietfairnessScore + 0.25 * SozialraumScore`

Rote Linien / Nicht-Kompensation:

- Mietbelastung über 60 Prozent
- gesundheitsgefährdender Schimmel
- aktive Verdrängung
- extreme Energiearmut
- fehlender Rechtsschutz / Intransparenz

Hinweis anzeigen:

„Modellhafte Demonstration. Keine amtliche Einstufung, keine Rechts-, Steuer- oder Förderberatung.“

## Inhaltliche Leitplanken

- Wirkung ist neutral und relational.
- Positive Zielgröße heißt positive Netto-Wirkung für Mensch, Planet und Demokratie.
- Keine Personenbewertung. Bewertet werden Wohnbedingungen, Gebäude, Strukturen, Regeln, Finanzierung und Quartierswirkung.
- SDG+ ist WÖk-Erweiterung, keine offizielle UN-Kategorie.
- Keine politischen Einheitslösungen behaupten.

## Quellen und Verweise

Integriere Quellenblöcke mit:

- Destatis Wohnen in Deutschland
- Destatis / Eurostat Wohnkostenüberbelastung
- BBSR Wohnungsbedarfsprognose
- Umweltbundesamt Emissionsdaten Gebäude
- EU Energy Performance of Buildings Directive
- WÖk Working-Paper Wohnungsmarkt
- Systemmodell der Wirkungsökonomie
- Buchanker Kapitel 70 Wohnen als Wirkungsfaktor
- Begriffsleitfaden

## Website-Komponenten

Nutze vorhandene Komponenten, falls vorhanden:

- SDGRef
- ToolRef
- LawReference
- ReferenceFrameBlock
- ContextualTools
- DossierCard
- PrintButton
- DownloadCard

Keine neue Designarchitektur bauen.

## Mindestlieferung

Am Ende sollen existieren:

- Portal Wohnen & Stadt
- Konzept online
- Gesamtdossier online
- alle 12 Detailkonzepte online
- alle 12 Einzeldossiers online
- Downloadkarten für Word/PDF
- Wohnwirkungsrechner-Spezifikation und, wenn möglich, erste Demo
- SDG-/SDG+-Block
- Buchanker-Block
- politische Anschlussfähigkeit
- Dossier-Export / Druckfunktion
- Glossarverlinkung
- Suchindex / Sitemap aktualisiert

## Abschlussbericht

Bitte berichten:

- neue Seiten
- geänderte Seiten
- erstellte Komponenten
- verlinkte Dokumente
- online lesbare Volltexte
- rückwirkend nachgeholte Detailkonzepte/Dossiers
- offene Punkte
- Build/Test-Ergebnis
- Druckfunktion geprüft
