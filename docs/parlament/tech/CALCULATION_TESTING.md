# Calculation Testing

Die Testbasis prüft mindestens:

- deterministische Formeln und Calculation Hashes;
- Unit-Fehler für inkompatible Werte;
- Richtungslogik ohne Überschreiben der Rohbeobachtung;
- Schwellen-/Normalisierungsregeln anhand ihrer realen Version;
- fehlende Attribution oder Gegenfaktum als Blocker;
- Nichtkompensation und Doppelzählung vor Aggregation;
- Verbot unbestätigter KI-Zahlen;
- Ex-ante-Zeitgrenze für historische Fälle.

`lib/calculation/formula-engine.test.ts` enthält die ersten ausführbaren Tests.
Goldstandard-Fälle werden unter `gold-standard-cases/` um Rohdaten,
Calculation Inputs, erwartete Berechnungen, Aggregation und normative Zuordnung
erweitert. Ziel ist gleiche relevante Berechnung - nicht gleiche Prosa.
