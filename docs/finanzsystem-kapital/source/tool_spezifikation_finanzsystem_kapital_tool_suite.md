# Tool-Spezifikation: Finanzsystem- und Kapitalwirkungs-Tool-Suite

## Ziel
Die Tool-Suite macht sichtbar, wie Kapitalflüsse auf Mensch, Planet und Demokratie wirken. Sie ist keine Anlageberatung, keine Steuerberatung und keine automatische Aufsichtsentscheidung.

## Module

### 1. Kapitalwirkungscheck
Eingaben: Kapitalbetrag, Assetklasse, Branche/NACE, Zweck, Laufzeit, Datenqualität, SDGs/SDG+, rote Linien, Transformationspfad.
Ausgabe: Kapitalwirkungsindex, Risikoprofil, Datenlücken, Tool-Verweise.

### 2. Portfolio-Wirkungsrating
Eingaben: Portfolio-Gewichte, NWI je Position, T-SROI, Resilienzscore, Datenqualität, rote Linien.
Formel v0.1: `KWI = 0.45*NWI + 0.25*T-SROI-Skala + 0.15*Resilienz + 0.10*Datenqualität - 0.25*Rote-Linien-Malus`.

### 3. Wirkungskredit-Rechner
Eingaben: Basiszins, Finanzrisikoaufschlag, Wirkungsbonus, Negativwirkungsaufschlag, Datenqualität.
Formel v0.1: `Zins = Basiszins + Finanzrisikoaufschlag - Wirkungsbonus + Negativwirkungsaufschlag`.

### 4. Wirkungsfonds-Simulator
Eingaben: Einzahlungen aus WUStG, WEstG, Automatisierungsdividende, Kapitalwirkungsaufschlägen, Kapitalsteuern, Sanktionen, EU-/Globalfonds.
Ausgaben: Wirkungseinkommen, Wirkungsdividende, Rentenfonds, Bildungsfonds, Gesundheitsfonds, Transformationsfonds, Resilienzfonds.

### 5. Automatisierungsdividenden-Rechner
Eingaben: Produktivitätsgewinn, Lohnsummeneffekt, Beschäftigungseffekt, Qualifizierungsmaßnahmen, Unternehmenswirkung.
Ausgabe: Modellbeitrag zum Wirkungsfonds und soziale Rückkopplung.

### 6. Versicherbarkeits- und Resilienzcheck
Eingaben: Standort-, Klima-, Lieferketten-, Gesundheits-, Gebäude- und Sozialdaten.
Ausgabe: Versicherbarkeitsprofil, Präventionshebel, Resilienzfonds-Empfehlung.

## Sicherheitsregeln
- Keine Personenbewertung.
- Keine Anlageberatung.
- Keine automatische Kreditablehnung.
- Keine personenbezogene Verhaltenskontrolle.
- Datenqualität und Unsicherheit immer sichtbar machen.
- Rote Linien dürfen nicht kompensiert werden.
