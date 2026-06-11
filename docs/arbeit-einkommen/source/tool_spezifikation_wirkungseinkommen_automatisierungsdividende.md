# Tool-Spezifikation: Wirkungseinkommen- und Automatisierungsdividenden-Simulator

Status: Arbeitsfassung v0.1  
Autorin: Natalie Weber / Wirkungsökonomie

## Zweck

Der Simulator soll modellhaft zeigen, wie Wirkungseinkommen, Automatisierungsdividende und Sozialabgaben-Entkopplung funktionieren könnten. Er ist keine Rechts-, Steuer- oder Sozialberatung und erzeugt keine amtliche Einstufung.

## Module

1. Wirkungseinkommen-Simulator
2. Automatisierungsdividenden-Rechner
3. Sozialabgaben-Entkopplungsrechner
4. Tätigkeitswirkungs-Scorecard
5. Care- und Gemeinwesen-Wirkungscheck

## Eingaben

- Markteinkommen
- Tätigkeitsfeld
- Organisationskontext
- WirkungsScore von -3 bis +3
- Datenqualitätsfaktor
- Region/Branche
- Automatisierungsgrad
- Wertschöpfungszuwachs durch Automatisierung
- Lohnsummenveränderung
- Qualifizierungs- und Übergangskosten

## Ausgaben

- Modellhaftes Wirkungseinkommen = Grunddividende + Markteinkommen + Wirkungsbonus - Wirkungsabzug
- Automatisierungs-Rückkopplungsbeitrag
- Vergleich alte Sozialbeitragslogik vs. neue WÖk-Finanzierungsbasis
- Hinweis auf relevante Wirkungsfelder, Steuern, Fonds und Dossiers

## Berechnungslogik v0.1

Wirkungsbonus = Bonusbasis x max(0, WirkungsScore) / 3 x Datenqualitätsfaktor

Wirkungsabzug = Abzugsbasis x abs(min(0, WirkungsScore)) / 3 x Datenqualitätsfaktor

Automatisierungsrückkopplung = max(0, automatisierungsbedingter Wertschöpfungszuwachs) x Rückkopplungssatz x Sozial-/Wirkungsfaktor

Sozialfinanzierung neu = reduzierte Lohnbeiträge + Wertschöpfungsbeitrag + Wirkungssteuern + Fondsrückflüsse

## Schutzmechanismen

- keine personenbezogene Totalbewertung
- keine private Lebensführungsüberwachung
- Fokus auf Tätigkeits-, Organisations-, Projekt- und Systemkontexte
- Datenminimierung
- Rechtsschutz und Korrekturwege
- klare Arbeitsannahmen statt Scheingenauigkeit

## Website-Integration

Der Simulator wird im Portal /wirkungsfelder/arbeit-einkommen/ eingebunden und verweist auf:
- WEstG
- Wirkungseinkommen
- Sozialabgaben-Entkopplung
- Automatisierung und Maschinenleistung
- Wirkungsfonds
- Rente & soziale Sicherung
- Wirtschaft & Unternehmen
