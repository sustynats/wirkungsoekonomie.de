# Wirkungscheck Bundestag V3 - deterministische Regelengine

## Eingaben

```text
Thema + Ziel + Ansatz + ein bis zwei Engpässe + ein bis zwei rote Linien
+ bis zu drei Erfolgssignale + Praxisrückmeldung
+ optional bis zu zwei Umsetzungsbedingungen
```

Die Eingaben werden als IDs gespeichert. Freitext dient nur der optionalen
Praxisergänzung und wird nicht als politische Kategorie klassifiziert.

## Ableitung

1. Das Themenmodul definiert zulässige Ziele, Ansätze, Risiken und Signale.
2. Der Ansatz aktiviert einen initialen Wirkpfad.
3. Der Engpass aktiviert eine oder mehrere interne Bundesrollen.
4. Die Kombination Ansatz × Engpass bestimmt die Passung:
   `direct`, `partial`, `not_direct` oder `unclear`.
5. Rote Linien bilden nicht kompensierbare Prüfpfade neben dem Zielpfad.
6. Erfolgssignale werden mit ihrem Datenstatus verknüpft.
7. Die Praxisrückmeldung ergänzt, ersetzt aber nicht die Bundesebene.
8. Ein Korrekturpunkt wird aus Zielsignal, roter Linie und Passung abgeleitet.
9. Der Report erzeugt maximal zwei Bundeshebel und maximal zwei passende
   Instrumente.

## Rollenregeln

| Engpass | Primäre Rolle | Zweite Rolle, falls nötig |
| --- | --- | --- |
| Regeln | rules | data bei fehlender Prüfgrundlage |
| Finanzierung oder Anreize | finance | delivery bei Umsetzungsengpass |
| Personal, Verfahren, Zusammenarbeit, Zugang | delivery | finance bei fehlender Kapazitätsfinanzierung |
| Daten oder unklare Wirkung | data | die zum Ansatz passende Rolle |
| Mehrere Punkte | höchstens zwei konkrete Rollen | keine künstliche Vollständigkeit |
| Noch nicht eindeutig | keine | Klärungsauftrag statt Priorisierung |

## Passungsregeln

- `direct`: Ansatz verändert den gewählten Engpass unmittelbar.
- `partial`: Ansatz kann einen Teil des Engpasses verändern; eine weitere
  Bedingung bleibt offen.
- `not_direct`: Ansatz verändert den Engpass zunächst nicht. Das ist ein
  relevantes Ergebnis, kein Nutzungsfehler.
- `unclear`: Daten reichen für die fachliche Einordnung nicht aus. Der Report
  benennt, was vor einer Priorisierung geklärt werden muss.

## Reportpfad

```text
Bundesentscheidung
→ unmittelbare Veränderung durch den Ansatz
→ offene Umsetzungsbedingung aus dem Engpass
→ Veränderung bei Betroffenen
→ gewähltes Erfolgssignal
```

Zusätzlich:

```text
rote Linie → eigenständige Beobachtung → Korrektur, falls Verschlechterung
```

## Korrekturregeln

- Wenn ein gewähltes Erfolgssignal ausbleibt, ist die Wirkungskette zu prüfen.
- Wenn sich eine rote Linie verschlechtert, wird nicht gegen positive andere
  Signale aufgerechnet.
- Wenn `not_direct`, muss vor einer Ausweitung des Ansatzes der benannte
  Engpass geprüft werden.
- Wenn `data_gap`, wird keine quantitative Behauptung und keine Kurve erzeugt.

## Prüfbarkeit

Jeder Report speichert lokal die Modulversion, IDs der Regeln, Datenstatus und
den erzeugten Wirkpfad. „Warum sehe ich dieses Ergebnis?“ macht diese
Herleitung lesbar. Die Engine darf keine Partei, Person, Fraktion, E-Mail oder
CiviCRM-Information verarbeiten.
