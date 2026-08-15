# Tool-Spezifikation: Wirkungsrentenrechner / Sozialabgaben-Entkopplungs-Simulator

Version: v0.1
Status: Konzept- und Demo-Spezifikation
Autorin: Natalie Weber
Referenz: Wirkungsökonomie

## Zweck

Der Wirkungsrentenrechner ist ein modellhaftes Reflexionstool. Er zeigt, wie sich die alte Rentenlogik von Einkommen und Beitragsjahren unterscheidet von einer wirkungsökonomischen Ergänzungslogik, die Care, Pflege, Bildung, Ehrenamt, Transformation, Automatisierung und Wirkungskapital berücksichtigt.

Er ersetzt keine Rentenauskunft, keine Rechtsberatung, keine Steuerberatung und keine Anlageberatung.

## Module

1. Alte Rentenlogik: Erwerbsjahre, Einkommensklasse, Entgeltpunkte nur grob modellhaft.
2. Wirkungsbiografie: Care, Pflege, Bildung, Ehrenamt, demokratisches Engagement, Transformationsarbeit.
3. Automatisierungsmodul: Lohnsumme sinkt, Maschinenleistung steigt, Automatisierungsdividende wird modelliert.
4. Wirkungsfonds-Modul: Rückflüsse aus WUStG, WEstG, Kapitalwirkung und Automatisierung werden simuliert.
5. Datenschutzmodul: zeigt, welche Daten nötig, optional oder unzulässig sind.

## Eingaben

- Geburtsjahr oder Altersgruppe
- Erwerbsjahre in Klassen
- grobe Einkommensklasse
- Care-/Pflegejahre
- Bildungs-/Mentoringjahre
- Ehrenamt / Demokratie / Gemeinwesen
- Tätigkeitsfeld nach WÖk-ID oder vereinfachter Kategorie
- Automatisierungsgrad des Sektors
- Fondsannahme und Wirkungsfaktor

## Ausgaben

- Modellhafte alte Rentenbasis
- Sichtbare Wirkungslücken
- Modellhafte Wirkungsjahre
- Mögliche Ergänzung durch Wirkungsmodul
- Finanzierungsquellen im Wirkungsfonds
- Hinweise zu Datenqualität und Unsicherheit

## Arbeitsformeln

WM = α × WYears × Wi × S

WR = BR + EA + WM + WD

BR = Basis-/Würdesicherung
EA = bestehende Erwerbsansprüche
WM = Wirkungsmodul
WD = Wirkungsdividende

## Schutzlinien

- Keine Personenbewertung.
- Keine Bonitätseinstufung.
- Keine Sanktionierung individueller Lebenswege.
- Keine verpflichtende Lebensdatenerfassung.
- Datenschutz und Rechtsschutz sind Pflicht.
- Ergebnis ist eine Modellanzeige, keine amtliche Festsetzung.

## Datenquellen

- Deutsche Rentenversicherung
- BMAS
- Destatis
- WÖk-IDs
- CSRD/ESRS/GRI Unternehmensdaten
- kommunale Engagement- und Pflegedaten
- Wirkungsfondsannahmen
