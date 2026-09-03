# Normalization

Eine Normalisierung in eine WÖk-Klasse braucht eine versionierte
`normalization_rule`: WÖk-ID, Eingabeeinheit, Richtung, veröffentlichte
Schwellen, Skala, Quelle und Geltungszeitraum. Beispielwerte gehören niemals
produktiv in die Regelbasis.

Bei `TARGET_RANGE` und `NON_MONOTONIC` leitet die Engine keine positive oder
negative Richtung aus dem Vorzeichen ab. Erst eine freigegebene
Normalisierungsregel erlaubt die Einordnung.
