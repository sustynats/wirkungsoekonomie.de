# Calculation Data Model

| Entität | Funktion |
|---|---|
| `measurement_units` | technisch zulässige Einheiten und Dimensionen |
| `formula_registry` | versionierte, freigegebene Formel-ASTs |
| `normalization_rules` | veröffentlichte Schwellen-/Normalisierungsregeln |
| `raw_observations` | unveränderte Quellenwerte mit Zeit- und Raumbezug |
| `derived_metrics` | nachvollziehbar abgeleitete Kennzahlen |
| `calculation_assumptions` | begründete, versionierte Annahmen und Intervalle |
| `calculation_records` | Ergebnisart, Qualität, Gegenfaktum, Snapshot und Hash |
| `calculation_operands` | Baseline, Gegenfaktum, Beobachtung, Reichweite usw. |
| `normative_contributions` | getrennte SDG-/SDG+-/MPD-Einordnung |
| `calculation_aggregations` | Ledger der zulässigen Zusammenführung und Ausschlüsse |
| `historical_decision_reviews` | Ex-ante/Ex-post-Rückblick je Vorgang |
| `calculation_challenges` | konkrete öffentliche oder interne Berechnungswidersprüche |

Die Relation ist absichtlich nicht ein JSON-Blob: Ein Ergebnis kann auf mehrere
Operanden und Annahmen, ein Operand aber auf genau eine Quelle zurückverweisen.
Dadurch lässt sich jedes veröffentlichte Ergebnis bis zu seiner Quelle öffnen.
