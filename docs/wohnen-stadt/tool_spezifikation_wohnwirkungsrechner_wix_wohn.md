# Tool-Spezifikation: Wohnwirkungsrechner / WIX-Wohn

**Version:** v0.1
**Stand:** 24. Mai 2026
**Autorin:** Natalie Weber · Wirkungsökonomie

## Ziel

Der Wohnwirkungsrechner ist eine modellhafte Demo. Er zeigt, wie Wohnwirkung sichtbar gemacht werden kann: Mietbelastung, Energie- und Klimawirkung, Sanierungswirkung, Quartierswirkung und politische Ausgestaltung.

Er ist ausdrücklich keine amtliche Einstufung, keine Rechtsberatung, keine Steuerberatung und keine Förderzusage.

## Module

1. Mietbelastungsrechner
2. Energie- und Gebäudescore
3. Sanierungswirkungsrechner
4. Warmmietenneutralitätsprüfung
5. Quartierswirkungscheck
6. WIX-Wohn-Berechnung
7. Politikvariantenansicht
8. Dossier-Export

## Kernformeln

### Mietbelastung

`Mietbelastung = Wohnkosten / verfügbares Haushaltseinkommen`

Wohnkosten können je nach Modus enthalten:
- Bruttokaltmiete
- warme Nebenkosten
- Energiekosten
- sonstige wohnbezogene Pflichtkosten

### WIX-Wohn Arbeitsmatrix v0.1

`WIX-Wohn = 0.35 * KlimaEnergieScore + 0.40 * MietfairnessScore + 0.25 * SozialraumScore`

Rote Linien / Nicht-Kompensation:
- Mietbelastung über 60 Prozent
- gesundheitsgefährdender Schimmel
- aktive Verdrängung
- fehlender Rechtsschutz / Intransparenz
- extreme Energiearmut

### Sanierungswirkung

`CO2_Einsparung = (Endenergie_vor - Endenergie_nach) * Wohnfläche * Emissionsfaktor / 1000`

Der Emissionsfaktor ist als Datenquelle oder Modellannahme zu kennzeichnen.

### Warmmietenneutralität

`Warmmiete_nach = Kaltmiete_nach + Nebenkosten_nach + Energiekosten_nach`

Positive Sozialwirkung liegt nahe, wenn:

`Warmmiete_nach <= Warmmiete_vor`

oder die Differenz sozial ausgeglichen wird.

## Eingaben

- Haushaltseinkommen
- Haushaltsgröße
- Kaltmiete
- Nebenkosten
- Energiekosten
- Wohnfläche
- Energiebedarf vor/nach Maßnahme
- Wärmeträger
- Sanierungskosten
- Umlage / Förderung
- Quartiersdaten: Grün, Hitze, Mobilität, Versorgung, Sozialmix, Barrierefreiheit
- Eigentums-/Vermietungsdaten: Transparenz, Sozialbindung, Leerstand

## Ausgaben

- Mietbelastungsquote
- Mietfairness-Score
- Energie-Score
- Sanierungs-Score
- Sozialraum-Score
- WIX-Wohn
- rote Linien / Warnhinweise
- Handlungsvorschläge
- politische Variantenansicht
- Druckbares Ergebnisdossier

## Datenquellen

- Destatis / Mikrozensus / EU-SILC
- Eurostat Wohnkostenüberbelastung
- BBSR Wohnungsbedarfsprognose
- UBA Emissionsdaten Gebäude
- Energieausweise / Verbrauchsdaten
- kommunale Mietspiegel und Wohnungsmarktberichte
- Sozialraumdaten, Hitze-/Lärm-/Grün-/Mobilitätsdaten
- WÖk-IDs und Scorecards

## Datenschutz

Die Demo soll lokal im Browser funktionieren, keine personenbezogenen Daten speichern und keine Profile erzeugen. Der Rechner bewertet nicht Menschen, sondern Wohn- und Systembedingungen.

## Politische Anschlussfähigkeit

Das Tool muss mehrere Gewichtungsvarianten anzeigen: soziale Gewichtung, ökologische Gewichtung, kommunale Resilienz, Eigentums-/Investitionsperspektive. So bleibt demokratischer Ausgestaltungsspielraum sichtbar.
