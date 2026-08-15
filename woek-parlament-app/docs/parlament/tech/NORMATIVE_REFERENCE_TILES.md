# Normative Referenzkacheln

Stand: 2026-08-15
Geltung: öffentliche Wirkungsakten, Wirkungschecks, historische Rückblicke und Wahl-/Umsetzungsanalysen

## Zweck

Eine Referenzkachel macht sichtbar, welche Ziele, Schutzgüter oder normativen Anker ein konkreter Wirkpfad berührt. Sie ist **keine Punktzahl**, ersetzt keinen Wirkpfad und erzeugt keinen zusätzlichen Wirkungswert.

Die öffentliche Darstellung trennt drei Gruppen:

1. **SDGs** – die 17 global vereinbarten Ziele der Agenda 2030;
2. **SDG+** – die sieben transparent ausgewiesenen WÖk-Ergänzungen: Demokratie, Medienqualität, Rechtsstaatlichkeit, Diskursfähigkeit, institutionelles Vertrauen, gesellschaftlicher Zusammenhalt und digitale Selbstbestimmung;
3. **Staatsziele, Grundrechte und Schutzaufträge** – der jeweils einschlägige Rechts- und Schutzrahmen. Für Bundesfälle umfasst das unter anderem Grundrechte, die Staatsstrukturprinzipien, tatsächliche Gleichberechtigung, natürliche Lebensgrundlagen, Tierschutz, europäische Einigung und gesamtwirtschaftliches Gleichgewicht.

Die dritte Gruppe wird nicht als „SDG+“ umetikettiert. Sie ist ein eigenständiger normativer Anker. Eine negative Zuordnung ist weder ein Rechtsurteil noch ein zusätzlicher negativer Score.

## Tierschutz und Tierwohl

`GG_ART_20A_ANIMAL_PROTECTION` ist eine eigene Referenz. Tierwohl bewertet die Lebensbedingungen, Gesundheit, Leidvermeidung und Eigenart empfindungsfähiger Tiere. Es ist nicht mit Biodiversität, Artenschutz oder Ökosystemqualität austauschbar.

Bei EU-Fällen kann zusätzlich `AEUV_ART_13_ANIMAL_WELFARE` einschlägig sein. Beide Anker können dieselbe reale Veränderung begründen, aber niemals doppelt zählen.

## Datenvertrag

Ein fachlicher Review nutzt unter `normative_mapping.tile_mappings` ausschließlich IDs aus `normative_reference_catalog` des jeweiligen Fallpakets.

Pflichtfelder je Kachel:

```json
{
  "id": "GG_ART_20A_ANIMAL_PROTECTION",
  "framework": "CONSTITUTIONAL_ANCHOR",
  "direction": "NEGATIVE_RISK",
  "evidence_status": "LIMITED",
  "rationale": "Fallbezogene, quellenbasierte Begründung.",
  "impact_path_refs": ["IP-01"],
  "source_refs": ["SOURCE-01"]
}
```

`source_refs` müssen im `source_manifest` desselben Fallpakets vorhanden sein. Der Import prüft zusätzlich, ob ID, Rahmen, optionale Bezeichnung und Rechtsanker mit dem versionierten Register übereinstimmen.

Zulässige Richtungen:

- `POSITIVE_POTENTIAL`
- `NEGATIVE_RISK`
- `AMBIVALENT`
- `EVIDENCE_OPEN`
- `OBSERVED_POSITIVE`
- `OBSERVED_NEGATIVE`

Ex-ante-Fälle verwenden nur Wirkungspotenzial, Wirkungsrisiko, Ambivalenz oder offene Evidenz. Beobachtete Richtungen setzen eine klar getrennte Ex-post-Grundlage voraus.

## Schutz gegen Scheingenauigkeit

- Ein Mapping begründet keine Kausalität ohne Wirkpfad und Quelle.
- Mehrere Mappings derselben Zustandsveränderung dürfen nicht als mehrere Wirkungen aggregiert werden.
- Staatsziele, Grundrechte und Schutzaufträge können eine Nichtkompensationsprüfung auslösen. Sie werden nicht mit positiven Effekten anderer Bereiche verrechnet.
- Die Darstellung verweist zuerst auf die interne Quelldetailseite; die Originalquelle bleibt dort nachvollziehbar verlinkt.
