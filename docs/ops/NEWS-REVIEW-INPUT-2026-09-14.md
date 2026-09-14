# Beschädigte Fachprüfungsaufträge vor dem API-Aufruf abfangen

Ein vorhandener Ölpreis-Auftrag enthielt in `democracy.primary_paths` einen
Pfad und 77 Textfragmente. Daraus erzeugte die Formatbindung 78 Prüfplätze.
Das Antwortschema überschritt dadurch die lokale 40-KB-Grenze. Die Ablehnung
vor dem Provider wurde fälschlich als `budget_blocked` gespeichert und beendete
den ganzen Worker-Lauf.

`reviewPathAddresses` akzeptiert nun nur Arrays von Pfadobjekten. Beschädigte
Aufträge bleiben unverändert erhalten und erhalten vor einem neuen Claim den
Status `preparation_failed` mit `API_EDITORIAL_REVIEW_INPUT_INVALID`. Dieser
Status verbraucht keinen kostenpflichtigen Aufrufplatz; der Lauf setzt mit
weiteren Aufträgen fort. Die private Attention-Liste verhindert wiederholte
Versuche mit demselben beschädigten Auftrag.

Die API unterscheidet einen ungültigen Antwortvertrag ebenfalls von einer
Budgetablehnung. Die 40-KB-Vertragsgrenze, Budgetgrenzen, Aufrufgrenzen und
Publikationsprüfungen bleiben unverändert. Eine reguläre vollständige Prüfung
mit MPD und Mediencheck bleibt innerhalb der Grenze.

Regressionstests verwenden einen beschädigten Pfad mit 77 Textfragmenten,
eine gültige vollständige Medienprüfung und einen übergroßen Antwortvertrag.
Provider und Budgetdienst werden dabei simuliert; keine kostenpflichtigen
Testaufrufe.
