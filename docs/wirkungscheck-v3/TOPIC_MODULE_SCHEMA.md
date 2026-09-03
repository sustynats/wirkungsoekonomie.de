# Wirkungscheck Bundestag V3 – Schema für Themenmodule

## Ziel

Jedes sichtbare Thema besteht aus versionierten Daten. Die App rendert Fragen,
Vorschauen und Report daraus. Sichtbare Aussagen dürfen nicht als lose
Fallunterscheidungen in `app.js` stehen.

## Modulform

```js
{
  id: "housing",
  version: "1.0.0",
  label: "Wohnen",
  intro: "…",
  objectives: [{ id, label, questionForm, explanation }],
  approaches: [{
    id, label, eligibleObjectives,
    directEffect, notAutomaticallyImplied, nextQuestionReason,
    relevantBottlenecks, relevantFederalRoles, relevantInstruments
  }],
  bottlenecks: [{ id, label, explanation, roles }],
  redLines: [{ id, label, explanation }],
  federalSuccessSignals: [{ id, label, dataStatus, evidenceNote }],
  regionalFeedbackSignals: [{ id, label }],
  optionalConstraints: [{ id, label }],
  officialIndicators: [{ id, status, source, definition, evidenceLimit }],
  reportModules: {
    federalRoleDetails, pathTemplates, correctionTemplates,
    parliamentaryQuestionTemplates, alternativeInterpretations
  }
}
```

## Interne Bundesrollen

| ID | Sichtbare Übersetzung im Report | Funktion |
| --- | --- | --- |
| rules | Rechtsrahmen und Standards | Regeln, Rechte, Zuständigkeiten oder Anforderungen prüfen. |
| finance | Finanzierung und Anreize | Förderung, Vergütung, Kostenverteilung oder steuerliche Anreize prüfen. |
| delivery | Vollzug und Umsetzbarkeit | Verfahren, Personal, Qualifizierung, Zusammenarbeit oder Zugang prüfen. |
| data | Wirkungsdaten und Rückkopplung | Daten, Beobachtung, Prüfpflichten und Korrekturwege prüfen. |

Nutzer:innen wählen diese Rollen nicht. Die Engine leitet sie aus Thema, Ziel,
Ansatz und Engpass ab.

## Datenstatus

| Status | Bedeutung | Öffentliche Verwendung |
| --- | --- | --- |
| `official_verified` | Definition, Quelle, räumliche Ebene und Evidenzgrenze geprüft | nur thematisch passend und mit Grenze |
| `supplementary_required` | kein ausreichender vorhandener Wert | als Datenbedarf nennen |
| `data_gap` | passende Kennzahl nicht vorhanden | klar als Lücke nennen |
| `DATA_UNVERIFIED` | Quelle oder Transformation ungeprüft | nie öffentlich ausspielen |

## Regel für neue Themen

Ein neues Thema darf erst sichtbar werden, wenn Ziele, Ansätze,
Sofortreaktionen, Engpässe, rote Linien, Erfolgssignale,
Praxisrückmeldungen, Bundesrollen, Datenstatus, Reportpfade und mindestens ein
Korrekturtrigger redaktionell freigegeben sind.
