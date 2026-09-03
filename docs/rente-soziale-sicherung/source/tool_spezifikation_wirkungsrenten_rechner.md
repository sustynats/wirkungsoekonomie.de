# Tool-Spezifikation: Wirkungsrenten-Rechner und Lebenswirkungs-Konto

Version: v0.1
Status: Arbeitsfassung
Autorin/Referenz: Natalie Weber / Wirkungsökonomie

## Zweck

Der Wirkungsrenten-Rechner macht modellhaft sichtbar, wie eine wirkungsökonomische Rentenlogik aussehen kann. Er ersetzt keine Rentenauskunft, keine Rechtsberatung und keine steuerliche Beratung. Er dient der öffentlichen Verständlichkeit und politischen Diskussion.

## Module

1. Alter-Rente-Vergleich: alte Logik vs. Wirkungslogik.
2. Lebenswirkungs-Konto: Nachweisfelder für Care, Bildung, Pflege, Ehrenamt, Transformation.
3. Lebenswirkungs-Faktor: begrenzter Korridor für anerkannte Wirkleistung.
4. Wirkungsdividenden-Szenario: Ausschüttung aus Wirkungsfonds.
5. Automatisierungs-Entkopplung: Maschinenleistung und Sozialabgabenbasis.
6. Renten-Impact-Fonds: Fondsbeiträge, Rendite, Wirkungsindex, Ausschlusskriterien.

## Eingaben

- Geburtsjahr und Lebensphase
- klassische Beitragsjahre / Einkommenshistorie als vereinfachte Eingabe
- Care- und Pflegezeiten
- Bildungs-, Qualifikations- und Engagementzeiten
- Transformationsbeiträge / gemeinwohlorientierte Tätigkeit
- Fondsparameter: erwartete Wirkungserträge, Ausschüttungsquote, Rücklagenquote
- Automatisierungsparameter: ersetzte menschliche Arbeitszeit, Maschinenwertschöpfung, Rückkopplungsquote

## Arbeitsformel v0.1

B = Basisrente / Würdeebene
A = klassischer Anwartschaftsanteil
LWF = Lebenswirkungs-Faktor, Pilotkorridor 1,00 bis 1,25 für positive Anerkennung
WB = B × (LWF - 1)
WD = Wirkungsdividende aus Fonds
F = Fondsanteil

Rente_modell = B + A + max(0, WB) + WD + F

In der Pilotphase keine negative Personenabsenkung unter die Würdeebene. Negative Wirkung wird primär über Unternehmens-, Produkt-, Kapital- und Steuerinstrumente rückgekoppelt.

## Ausgaben

- Modellrente in Euro
- Zusammensetzung der Bausteine
- Vergleich zur alten Logik
- Wirkungsfelder und SDG-/SDG+-Bezug
- Datenqualitäts-Hinweise
- Politische Ausgestaltungsspielräume

## Datenschutz und Schutzlinien

- keine Speicherung ohne Zustimmung
- keine automatisierte Letztentscheidung
- keine Personenbewertung
- Recht auf Korrektur in realer Umsetzung
- Popover-Hinweis: Modellhafte Demo, keine Rentenauskunft

## Kontextverlinkungen

- /wirkungsfelder/rente-soziale-sicherung/
- /wirkungsfelder/arbeit-einkommen/
- /wirkungsfelder/finanzsystem-kapital/
- /werkzeuge/impact-controlling/
- /werkzeuge/woek-ids/
- /werkzeuge/wirkungseinkommensteuer/
- /werkzeuge/wirkungssteuergesetz/
