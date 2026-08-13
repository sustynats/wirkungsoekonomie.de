# Wirkungscheck Bundestag V3 – Audit der Wahlkreisdaten

**Auditstatus:** Für die V3-Pilotmodule Wohnen sowie Gesundheit und Pflege sind
alle vorhandenen Kennzahlen `DATA_UNVERIFIED` für die öffentliche
Wirkungsdarstellung. Sie dürfen weiter für die Wahlkreissuche genutzt werden,
nicht jedoch als Erfolgs-, Risiko- oder Regionalindikator im Report.

## Datensatz und Buildweg

- Ausgabedatei: `assets/js/wahlkreis-wirkungscheck/data-2025.js`
- Generator: `scripts/wahlkreis-wirkungscheck/build-district-data.mjs`
- Wahlkreisnamen: Die Bundeswahlleiterin, *Wahlkreisnamen zur Bundestagswahl
  2025*, Wahlkreisebene, 299 Wahlkreise.
- Zuschnitt und Verwaltungs-PLZ: Die Bundeswahlleiterin, *Wahlkreise und
  zugeordnete Gemeinden bei der Wahl zum 21. Deutschen Bundestag*, Stand
  30.11.2024. PLZ sind nur Suchhilfe und keine Postleitzahlengeometrie.
- Strukturwerte: Die Bundeswahlleiterin, *Strukturdaten für die Wahlkreise zum
  21. Deutschen Bundestag*, Veröffentlichung 2025. Bei geteilten Kreisen oder
  kreisfreien Städten können Werte rechnerisch abgegrenzt sein.

## Indikatoren

| ID | Originalspalte | Definition und Einheit | Nenner | Ebene und Jahr | Transformation | Eignung für V3 | Evidenzgrenze | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| housing_completion | CSV-Spalte 19 | Fertiggestellte Wohnungen je 1.000 Einwohner:innen | Einwohner:innen | Wahlkreis, 2023 | deutsche Zahlenschreibweise normalisiert | höchstens Bauaktivität | Belegt weder Bezahlbarkeit, Zugang, Bedarfsgerechtigkeit, Barrierefreiheit noch Verdrängungsfreiheit. | DATA_UNVERIFIED |
| under3_care | CSV-Spalte 34 | Betreuungsquote unter Dreijähriger, Prozent | unter Dreijährige nach Quellendefinition | Wahlkreis, 01.03.2023 | normalisiert | keine Eignung für Pilot | Keine Aussage über Pflegequalität, ungedeckten Bedarf oder Versorgung Erwachsener. | DATA_UNVERIFIED |
| household_income | CSV-Spalte 36 | Verfügbares Einkommen privater Haushalte, Euro je Einwohner:in | Einwohner:innen | Wahlkreis, 2021 | normalisiert | keine Eignung für Pilot | Zu alt und keine Wohnkosten-, Armuts-, Pflegezugangs- oder Versorgungskennzahl. | DATA_UNVERIFIED |
| employment | CSV-Spalte 37 | Sozialversicherungspflichtig Beschäftigte je 1.000 Einwohner:innen | Einwohner:innen | Wahlkreis, 30.06.2023 | normalisiert | keine Eignung für Pilot | Arbeitsortbezug; keine Aussage über Arbeitsqualität, Pflegezugang oder Wohnversorgung. | DATA_UNVERIFIED |
| unemployment | CSV-Spalte 46 | Arbeitslosenquote, Prozent | nach Quellendefinition | Wahlkreis, November 2024 | normalisiert | keine Eignung für Pilot | Kein Fachindikator für Wohn- oder Pflegewirkung. | DATA_UNVERIFIED |

## Plausibilitätschecks am vorhandenen Export

Prüfung über alle 299 Wahlkreise am 13.08.2026:

| Kennzahl | Wertebereich | Auffälligkeit | Konsequenz |
| --- | --- | --- | --- |
| housing_completion | 0,2–11,6 | 69 unterschiedliche Werte; keine fachliche Wirkungskennzahl | nicht anzeigen |
| under3_care | 76,5–121,2 % | 6 Werte über 100 % | ohne Quellenerklärung missverständlich; nicht anzeigen |
| household_income | 22.787–119.496 Euro | Beobachtungsjahr 2021 | nicht als aktuelle Kaufkraft- oder Wohnkostenmessung verwenden |
| employment | 249,1–838,5 je 1.000 | Arbeitsortbezug | nicht als Pflege- oder Wohnindikator verwenden |
| unemployment | 2,5–14,8 % | fachfremd für Pilot | nicht anzeigen |

Die Prüfung festigt die Datenentscheidung: Ein amtlicher Wert wird nicht
automatisch zu einem passenden Wirkungsindikator.

## Öffentliche Regel für V3 Phase 1

Für Wohnen und Gesundheit und Pflege zeigt der Report keine Zahl aus
`data-2025.js`. Stattdessen lautet der Hinweis:

> Für diese Frage liegt derzeit keine ausreichend passende Wahlkreiskennzahl
> vor. Eine unpassende Zahl wäre keine verlässliche Antwort.

Der Wahlkreisname und die Wahlkreisnummer dürfen ausschließlich für Suche und
die Beschriftung der Praxisrückmeldung verwendet werden.

## Erforderliche Ergänzungsdaten vor einer späteren Freigabe

### Wohnen

- definierte und aktuelle Wohnkostenbelastung der adressierten Haushalte;
- Zugang zu passendem Wohnraum nach Zielgruppe, Größe, Lage und Bedarf;
- Nutzung von Leerstand, Unterauslastung und gefördertem Wohnraum;
- belastbare Verdrängungs- und Wohnungsverlustindikatoren;
- Barrierefreiheit und Erreichbarkeit nach klarer Definition;
- räumliche Zuordnung, Zeitraum, Datenschutz- und Methodikprüfung.

### Gesundheit und Pflege

- Zugang, Wartezeit und Verlässlichkeit entlang klar abgegrenzter
  Versorgungswege;
- Versorgungsbrüche und belastbare Indikatoren für vermeidbare Krisen;
- passende Informationen zu Angehörigenbelastung und Fachkräftezeit;
- regionale Erreichbarkeit ohne Personenprofilierung;
- datenschutzrechtlich tragfähige Erhebungs- und Auswertungsgrundlage.

Ein neuer Wert wird erst nach Quellenprüfung, Begriffsdefinition, Einheiten-,
Nenner-, Zeitraum-, Raum- und Transformationsprüfung vom Status
`DATA_UNVERIFIED` auf `official_verified` gesetzt.
