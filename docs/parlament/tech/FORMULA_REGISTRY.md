# Formula Registry

`formula_registry` speichert `expression_ast`, erforderliche Inputs,
Ausgabeeinheit, methodische Grundlage, Version und Referenzsnapshot. Nur eine
Formel mit Status `APPROVED` darf Teil einer freigegebenen Quantifizierung sein.

Erlaubt sind ausschließlich whitelisted Operationen: `ADD`, `SUBTRACT`,
`MULTIPLY`, `DIVIDE`, `MIN`, `MAX`, `CLAMP`, `ABS` und `WEIGHTED_MEAN`.
Gewichtete Mittel sind nur zulässig, wenn die Gewichte selbst eine veröffentlichte
Grundlage besitzen; sie sind kein Default für die Wirkungsbewertung.

Produktive Formeln werden nie im Frontend hardcodiert. Ihre ASTs werden vor der
Ausführung strukturell validiert und ihre Version wird im Calculation Record
gespeichert.
