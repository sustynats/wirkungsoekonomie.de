# Tool-Spezifikation: Automatisierungs- und Wirkungseinkommensrechner

Version: v0.1  
Autorin: Natalie Weber  
Referenz: Wirkungsökonomie  
Status: Modellhafte Demo, keine Rechts-, Steuer- oder Sozialberatung.

## Ziel

Der Rechner zeigt, wie Automatisierung die alte Kette Arbeit -> Einkommen -> Steuern/Sozialabgaben -> soziale Sicherung belastet und wie eine wirkungsökonomische Rückkopplung aussehen könnte.

## Module

### 1. Beitragslückenrechner
Inputs:
- Anzahl betroffener FTE
- durchschnittlicher Bruttolohn
- Arbeitgeber-Sozialbeiträge
- Arbeitnehmer-Sozialbeiträge
- erwartete Automatisierungsquote

Outputs:
- wegfallende Lohnsumme
- potenzielle Beitragslücke
- betroffene Sozialbereiche: Rente, Gesundheit, Pflege, Arbeitslosenversicherung

### 2. Maschinenwertschöpfungsbeitrag
Inputs:
- Investition in KI/Robotik/Software
- automatisierte Wertschöpfung
- Produktivitätsgewinn
- Rückkopplungsquote
- Wirkungsfaktor von -3 bis +3 oder normiert 0-1

Arbeitsformel:
MWB = automatisierte Wertschöpfung x Rückkopplungsquote x Wirkungsfaktor-Anpassung

### 3. Transformationsbonus
Inputs:
- Weiterbildungsquote
- interne Versetzungsquote
- Arbeitszeitreduktionsmodell
- Anteil Produktivitätsgewinn an Beschäftigte / Kund:innen / Fonds
- regionale Stabilisierung

Outputs:
- Bonus auf Maschinenwertschöpfungsbeitrag
- Beitrag zum Transformationsfonds
- Wirkungsprofil: entlastend / neutral / verdrängend / extraktiv

### 4. Wirkungseinkommensmodell
Inputs:
- Grunddividende
- Markteinkommen
- Wirkungsbonus
- Wirkungsfondsanteil

Outputs:
- beispielhafte Einkommensarchitektur
- Verteilung zwischen Grundsicherheit, Markt und Wirkung

## Datenquellen

- Destatis und Bundesagentur für Arbeit für Beschäftigung und Sozialversicherung
- IAB Job-Futuromat und IAB-Szenarien für Substituierbarkeit und Tätigkeitswandel
- OECD und ILO für internationale Automatisierungs- und KI-Arbeitsmarktanalysen
- CSRD/ESRS, Jahresabschlüsse, Unternehmenscontrolling für Unternehmensdaten
- WÖk-IDs und Scorecards für Wirkungsfaktor

## Schutzregeln

- Keine Personenbewertung
- Keine Leistungsüberwachung einzelner Beschäftigter
- Nur Modellwerte, keine amtliche Steuerberechnung
- Datenschutz und Transparenz
- Offenlegung von Annahmen und Datenqualitätsstufe

## Website-Integration

Pfad:
/erleben/automatisierungs-wirkungseinkommensrechner/

Kontext-Links:
- /wirkungsfelder/arbeit-einkommen/
- /wirkungsfelder/wirtschaft-unternehmen/
- /wirkungsfelder/rente-soziale-sicherung/
- /werkzeuge/wirkungseinkommensteuer/
- /werkzeuge/wirkungsfonds/
- /werkzeuge/impact-controlling/
