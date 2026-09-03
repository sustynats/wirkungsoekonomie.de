# Wirkungscheck Bundestag V2 – Daten-Audit

**Status:** abgeschlossen für die vorhandene Datei data-2025.js.  
**Entscheidung für V2 Phase 1:** Die Datei darf zur Wahlkreissuche und
-zuordnung verwendet werden. Keiner ihrer fünf Indikatoren wird im Wohn- oder
Gesundheit-und-Pflege-Report als Erfolgssignal, Wirkungsnachweis oder
vergleichende regionale Einordnung angezeigt.

## Audit-Methode

Jeder Wert wurde auf fünf Fragen geprüft:

1. Passt er fachlich zu einem sichtbaren Zustandsmerkmal des Themenmoduls?
2. Ist die Einheit verständlich und korrekt interpretierbar?
3. Ist der Beobachtungszeitpunkt für die jeweilige Fragestellung angemessen?
4. Passt die räumliche Ebene Wahlkreis zu der zu prüfenden Veränderung?
5. Kann aus dem Wert keine unzulässige Kausal- oder Rangfolgenaussage entstehen?

Nur wenn alle fünf Punkte erfüllt sind, kann ein Wert im Report erscheinen.

## Geprüfte Quellen

| Datensatz | Herausgeber | Ebene | Funktion in V2 |
| --- | --- | --- | --- |
| Wahlkreisnamen zur Bundestagswahl 2025 | Die Bundeswahlleiterin | Wahlkreis | Zulässig für Suche und Anzeige des Wahlkreises. |
| Wahlkreise und zugeordnete Gemeinden bei der Wahl zum 21. Deutschen Bundestag, Stand 30.11.2024 | Die Bundeswahlleiterin | Wahlkreis/Gemeinde | Zulässig für Wahlkreiszuordnung und PLZ-Suchhilfe. Eine PLZ ist keine eindeutige Wahlkreisgeometrie. |
| Strukturdaten für die Wahlkreise zum 21. Deutschen Bundestag | Die Bundeswahlleiterin | Wahlkreis | Nur mit indikatorbezogener Freigabe. Beobachtungszeitpunkte sind unterschiedlich. |

Alle drei Quellen werden im Build-Skript
scripts/wahlkreis-wirkungscheck/build-district-data.mjs mit URL, Lizenz und
räumlichem Hinweis dokumentiert. Die Strukturdaten verwenden bei räumlichen
Teilungen rechnerisch abgegrenzte Wahlkreiswerte. Das ist für einen
Wahlkreisvergleich besonders erklärungsbedürftig und kein Ersatz für lokale
Versorgungsdaten.

## Indikator-Audit

| ID | Quelle/Beobachtungszeit | Einheit | Fachliche Aussage | Ergebnis |
| --- | --- | --- | --- | --- |
| housing_completion | Strukturdaten, 2023 | fertiggestellte Wohnungen je 1.000 Einwohner:innen | Bauaktivität/Output | **Nicht anzeigen.** Belegt weder Zugang, Bezahlbarkeit, Bedarfsgerechtigkeit, Barrierefreiheit noch Verdrängungsfreiheit. |
| under3_care | Strukturdaten, 01.03.2023 | Betreuungsquote unter Dreijähriger in Prozent | Kinderbetreuung | **Nicht anzeigen.** Für die beiden Pilotmodule nicht relevant. Mehrere Werte liegen über 100 Prozent; ohne Erklärung wäre das missverständlich. |
| household_income | Strukturdaten, 2021 | Euro je Einwohner:in | aggregiertes Einkommen | **Nicht anzeigen.** Zu alt und nicht als Wohnkosten-, Armuts- oder Zugangswert geeignet; keine Pflegewirkung messbar. |
| employment | Strukturdaten, 30.06.2023 | sozialversicherungspflichtig Beschäftigte je 1.000 Einwohner:innen | Arbeitsort-bezogener Arbeitsmarktwert | **Nicht anzeigen.** Für die Pilotfragen nicht passend und keine Aussage über Arbeitsqualität, Pflegezugang oder Wohnversorgung. |
| unemployment | Strukturdaten, November 2024 | Arbeitslosenquote in Prozent | Arbeitsmarktlage | **Nicht anzeigen.** Kein Fachindikator für die Pilotmodule; nicht als Sozialindex oder regionale Bewertung verwenden. |

## Plausibilitätsbefunde

- Der aktuelle Datensatz enthält 299 Wahlkreise und Deutschland als
  Gesamtwert. Die Wahlkreiszuordnung ist damit technisch vollständig.
- Die Betreuungsquote unter Dreijähriger enthält einzelne Werte über 100 Prozent.
  Das kann aus der Datendefinition und räumlichen Abgrenzung folgen, wäre ohne
  diese Erklärung im Check aber irreführend.
- Die Wohnungsfertigstellung hat eine sinnvolle Einheit für Bautätigkeit, aber
  keine ausreichende inhaltliche Nähe zu den V2-Zielen des Wohnmoduls.
- Der Einkommenswert stammt aus 2021 und ist ein Pro-Kopf-Aggregat. Er erlaubt
  keine Aussage über die Tragbarkeit der gesamten Wohnkosten bestimmter
  Haushalte.
- Keiner der vorhandenen Werte bildet die zentralen Zustandsmerkmale des
  Gesundheits- und Pflegemoduls ab.

## Zulässige Datenverwendung in V2

| V2-Funktion | Erlaubte Daten | Bedingung |
| --- | --- | --- |
| Wahlkreis suchen/anzeigen | Wahlkreisnummer, Name, Land, zulässige PLZ-Suchhilfe | Nutzer:in wählt selbst; keine automatische Zuordnung allein aus PLZ. |
| Regionale Rückkopplungsfrage | Gewählte qualitative Antwort | Als praktische Beobachtung kennzeichnen, nicht als amtlichen Wert. |
| Kurzreport Wohnen | Keine der fünf Kennzahlen | Konkrete Datenlücke und benötigte Ergänzungsdaten benennen. |
| Kurzreport Gesundheit und Pflege | Keine der fünf Kennzahlen | Konkrete Datenlücke und benötigte Ergänzungsdaten benennen. |
| Vergleich, Score, Ranking, Trendkurve | Keine | In Phase 1 nicht zulässig. |

## Erforderliche Ergänzungsdaten vor einer späteren Freigabe

### Wohnen

Für eine belastbare Anzeige wären mindestens erforderlich:

- eine klar definierte, regelmäßig aktualisierte Wohnkostenbelastung der
  adressierten Haushalte;
- Daten dazu, ob geförderter oder verfügbarer Wohnraum die definierte Zielgruppe
  tatsächlich erreicht;
- geeignete Informationen über Zugang, Leerstand/Unterauslastung und
  Barrierefreiheit, jeweils mit Definition, räumlicher Passung und
  Datenschutzprüfung;
- eine belastbare Erfassung von Verdrängungs- und Wohnungsverlust-Risiken.

Ein einzelner Bau- oder Bestandswert reicht dafür nicht aus.

### Gesundheit und Pflege

Für eine belastbare Anzeige wären mindestens erforderlich:

- nachvollziehbare Daten zu Zugang und Wartezeiten;
- Daten zu Versorgungsbrüchen und vermeidbaren Krisen, mit fachlicher
  Fallabgrenzung;
- eine datenschutzrechtlich tragfähige Einordnung von Versorgungssicherheit,
  Selbstbestimmung und Belastung von Angehörigen;
- Informationen zur Fachkräftebelastung, die keine ungerechtfertigte
  Überwachung einzelner Beschäftigter ermöglichen.

## Technische Schutzregeln

- Alle Anzeige-Definitionen haben einen expliziten evidence_status.
- Bei Datenlücke rendert die Oberfläche einen erklärenden Satz, keine Null,
  keine leere Kurve und keine Ersatzkennzahl.
- Eine Kennzahl darf nur in einem Themenmodul registriert werden, wenn das
  Daten-Audit sie für genau diesen Zweck freigibt.
- Jede zukünftige Kennzahl dokumentiert Quelle, Abrufdatum, Bezugszeit, Einheit,
  räumliche Ebene, Transformation, Lizenz, bekannte Verzerrung und fachliche
  Nutzungsgrenze.
- Die Build-Zeit-Quelle bleibt versioniert. Ein späterer Live-Abruf im Browser
  ist nicht vorgesehen.
- Es gibt keine Profilbildung, kein Ranking und keine Veränderung eines
  individuellen Reports durch Parteizugehörigkeit oder Personenmerkmale.

## Freigabeentscheidung

**Freigegeben:** Wahlkreissuche und optionale regionale Rückkopplung.  
**Nicht freigegeben:** Automatische regionale Kennzahlen, Kurven, Scores,
Zeitreihen, Vergleiche und alle Wirkungsbehauptungen auf Basis von data-2025.js.

Diese Entscheidung ist kein Verzicht auf regionale Perspektiven. Sie verhindert,
dass unpassende Daten als Evidenz ausgegeben werden. Erst ein neues,
themenbezogenes Audit kann die Freigabe verändern.

