# Größenbegrenzung wachsender Akten

Der automatische Lauf am 4. September 2026 um 08:36 UTC hielt die erneute
Dormagen-Analyse lokal mit `AI_INPUT_TOO_LARGE` zurück: 13 Quellartikel plus
Claims, Belegkatalog und verwandte Akten passten nicht mehr in das 40.000-Zeichen-
Limit von Oracle. Es war kein HTTP-503 und es wurde dafür kein KI-Aufruf gebucht.
Die bestehende Veröffentlichung blieb erhalten.

`fitAnalysisInput()` fasst jetzt vor einer Belegauswahl ausschließlich identische
und wiederholte Eingabefelder verlustfrei zusammen:

- `source_defaults` und `claim_defaults` enthalten identische Standardfelder.
  Individuelle Angaben gehen vor; Herausgeberrollen und Vorbehalte bleiben erhalten.
- `abstract_claim_id` referenziert einen gelieferten unveränderten Claim nur dann,
  wenn dieser denselben vollständigen Kurztext bereits enthält.
- Alle Quellartikel-URLs, Quell- und Claim-IDs, Claims und Provenienz bleiben im
  Paket. Quellenabhängigkeit wird dadurch nicht zu Unabhängigkeit erklärt.
- Erst danach greift die vorhandene, explizit als unvollständig markierte Auswahl
  exakter Belegpassagen. Der öffentliche und kanonische Datensatz bleibt unverändert.
- Falls die notwendigen Daten weiterhin nicht passen, bleibt die Analyse lokal
  und ohne KI-Kosten zurückgestellt; kein abgeschnittener JSON-Text und keine
  still gelockerten Evidenz-, Relevanz- oder Budgetregeln.

Regression: tatsächliche 13-Quellen-Akte plus fünf verwandte Akten unter dem
39.000-Zeichen-Promptbudget; alle Claims, Quellen, Provenienz und Rollen sind
rekonstruierbar. Der normale Retry-Pfad nimmt die Akte nach Veröffentlichung des
Fixes automatisch erneut auf. Eine neue Version entsteht nur nach bestandener
materieller Neuigkeits- und Evidenzprüfung.
