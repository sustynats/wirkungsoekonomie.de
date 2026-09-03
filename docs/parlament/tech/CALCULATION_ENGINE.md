# WÖk Calculation & Impact Accounting Engine

Status: **Implementierungsgrundlage.** Die Engine berechnet nur, was mit
Quellen, Einheiten, Gegenfaktum und versionierter Formel methodisch tragfähig
ist. Sie ist kein Score-Rechner und kein KI-Generator für Zahlen.

```text
Quelle → Rohbeobachtung → abgeleitete Kennzahl → Calculation Record
  → Formel/Transformation → Normative Contribution → Nichtkompensations-Gate
  → zulässige Aggregation → Fachvotum
```

## Ergebnisarten

| Typ | Öffentliche Sprache | Mindestbedingung |
|---|---|---|
| `QUANTIFIED_OBSERVED_EFFECT` | beobachtete Zustandsänderung | Quelle, Gegenfaktum, Einheit, Berechnung |
| `QUANTIFIED_EXPECTED_EFFECT` | erwartete Zustandsänderung / Wirkungspotenzial | Szenario und Gegenfaktum, niemals als eingetretene Wirkung |
| `RULE_BASED_ASSESSMENT` | regelgebundene Einordnung | veröffentlichte Regel bzw. Schwelle |
| `NOT_ROBUSTLY_QUANTIFIABLE` | nicht belastbar quantifizierbar | dokumentierte Lücke statt Pseudozahl |

`calculation_records` hält Ergebnis, Qualitätsdimensionen und Referenzsnapshot;
`calculation_operands` hält jeden Wert mit Herkunft, Einheit und Transformation.
Rohwerte in `raw_observations` sind append-only. Korrekturen erzeugen einen
neuen Datensatz mit Verweis auf den ersetzten Wert.

Die zugehörige Rechenfunktion ist `lib/calculation/formula-engine.ts`. Sie
wertet nur einen kleinen, typisierten AST aus; es gibt kein `eval()` und keine
Formelstrings aus Frontend oder Dokumenten. Jede Berechnung erhält aus Inputs,
Formelversion, Annahmen und Referenzsnapshot einen SHA-256-Hash.

## Freigabe-Gates

Eine quantitative Berechnung kann nicht auf `APPROVED` wechseln, wenn ihr ein
aufgelöstes Gegenfaktum fehlt. Ein Attributionsfaktor braucht eine deklarierte
Grundlage. Nicht verifizierte KI-Zahlen können niemals freigegeben werden.
`BOUNDARY_BREACH_SUPPORTED` bleibt vor einer Aggregation separat sichtbar und
kann nicht durch positive Werte anderer Bereiche neutralisiert werden.

Aktuelle Regeln und Referenzen werden nur über
[`reference-manifest.yaml`](../../woek-knowledge/reference-manifest.yaml)
referenziert. Veröffentlichte Berechnungen behalten ihren damaligen Snapshot;
eine neue führende Referenz startet einen Review, kein stilles Rewriting.
