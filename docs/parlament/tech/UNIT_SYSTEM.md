# Unit System

Jeder Operand verweist auf `measurement_units`. Die Engine verweigert Addition,
Subtraktion, Vergleich und Clamp über unterschiedliche Einheiten. Beispiel:
`EUR + TONNES_CO2E` schlägt technisch fehl.

Einheiten werden nicht still umgerechnet. Eine zulässige Umrechnung ist eine
eigene, nachvollziehbare `calculation_transformation` mit Input, Output,
Version und Parametern. `FACTOR` und `UNITLESS` sind die einzigen skalaren
Einheiten für die freigegebenen Multiplikations-/Divisionsregeln.
