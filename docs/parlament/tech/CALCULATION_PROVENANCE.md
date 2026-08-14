# Calculation Provenance

Jeder Operand führt Quelle, Fundstelle, Beobachtungsdatum, Gebietsebene,
Qualitätsstatus und Transformation. Ein manueller Wert braucht Quelle,
Begründung und Scope. Eine KI-generierte Zahl kann kein produktiver Operand
sein, solange Quelle und redaktionelle Verifikation fehlen.

`calculation_hash` umfasst Operanden, Formel-AST/-version, Annahmen und
Referenzsnapshot. Gleiche Inputs erzeugen denselben Hash und dasselbe Ergebnis.
Bei neuen Daten zeigt der Versionsvergleich, welcher Operand, welche Regel oder
welche Annahme das Ergebnis verändert hat.
