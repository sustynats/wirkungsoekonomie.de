# Uncertainty

Ungewissheit bleibt getrennt von Wirkungsgröße: `data_quality`,
`causal_quality` und `model_quality` sind eigenständige Dimensionen. Ein Effekt
wird nicht heimlich mit einem Confidence-Wert multipliziert.

Wo fachlich herleitbar, speichern Calculation Records `lower_bound`,
`central_estimate` und `upper_bound`. Wo das nicht herleitbar ist, erfindet das
System keine ±10%-Bandbreite. Sensitivitäten und Break-even-Punkte entstehen
ausschließlich aus dokumentierten Parametern und Formeln.
