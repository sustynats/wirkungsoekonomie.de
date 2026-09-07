# Nachrichtenbetrieb: fehlende Monitor-Abhaengigkeiten

Stand: 7. September 2026, Nachkontrolle ab 20:24 UTC.

## Nachweis

Der letzte abgeschlossene Nachrichtenbericht im Hauptzweig stammt von 18:56 UTC. Die spaetere redaktionelle Erstveroeffentlichung zu internationalen Reaktionen um 19:36 UTC ist live, aber kein Nachweis eines weiterlaufenden automatischen Imports.

GitHub-Lauf `34159035026` besteht alle 581 Nachrichtentests und scheitert anschliessend am bestehenden Monitor-Vertrag: `Monitor checkout is missing scripts/news/publication-update.mjs`. Der Import wird deshalb gar nicht gestartet. Der separate Monitor-Lauf `34159034971` scheitert schon beim Modulimport mit `ERR_MODULE_NOT_FOUND`. `case-files.mjs` importiert inzwischen `publication-update.mjs`; dieses benoetigt seinerseits `reader-copy.mjs`. Beide fehlten im expliziten Sparse-Checkout. Das ist ein technischer Releasefehler, keine Qualitaetsablehnung und kein Budgetstopp.

## Reparatur und Regression

- Beide fehlenden Dateien im bestehenden Monitor-Checkout ergaenzen; der schlanke Checkout und alle Sicherheitspruefungen bleiben erhalten.
- `npm run news:test` fuehrt kuenftig auch die Monitor-Invarianten aus. So prueft der vorhandene Pages-Schnellpfad die Abhaengigkeiten bereits vor einer Auslieferung, nicht erst der naechste Nachrichtenlauf.
- Ein neuer Release-Vertragstest sichert diese Einbindung und die Reihenfolge Test vor Nachrichten-Build.
- Rot reproduziert, nach Reparatur 607 Tests bestanden; Typecheck, Nachrichten-Build, Nachrichten-Validierung sowie beide Hosting-Kostengates bestanden.

Keine Modellanfrage fuer die Tests, keine Aenderung an Nachrichten, Quellenfreigaben, Kostenjournalen, Budget- oder Evidenzgates. Der Wiederanlauf erfolgt ueber den bestehenden Nachrichtenworkflow; keine zweite bezahlte Batch-Anfrage.

## Messstand vor Wiederanlauf

75 offene Pruefungen: 70 Kapazitaet, zwei technische Qualitaetswiederholungen, drei Quellenintegritaets-Holds. Der aelteste Queue-Eintrag war im letzten abgeschlossenen Bericht 1545 Minuten alt; dieser alte Bericht ist keine aktuelle Altersmessung.

Seit der Septemberfreigabe um 13:27 UTC: 23 direkte Nachrichtenlaeufe, 177 KI-Anfragen, 15 Erstveroeffentlichungen und vier Updates. 1,151769 USD einschliesslich Ablehnungen, Fehlversuchen und Updates entsprechen mit dem gespeicherten ECB-Kurs vom 4. September (1,1622 USD/EUR) und 19 Prozent Steuerreserve rund 1,1793 EUR bzw. 7,86 Eurocent je Erstveroeffentlichung. Das ist gemischter Aufhol-/Reparaturbetrieb, keine Rechnung und kein nachgewiesenes Viercent-Routineniveau.

Getrennt: synchrone Vertiefungen 0,935627 USD; acht abgeglichene Batch-Versuche 0,042641 USD, davon sieben angewendete Medienchecks. Keine offene Batch-Kostenreserve in diesem Repository-Stand; der zusaetzliche nicht eingereichte Job ist keine bezahlte Anfrage. Private historische Oracle-Reserven werden dadurch weder freigegeben noch als null angenommen.

Die halbstuendliche Nachkontrolle bleibt notwendig. Ein gruenes Deployment oder ein einzelner Wiederanlauf rechtfertigt weder die Behauptung eines abgearbeiteten Rueckstands noch das Umstellen auf ausschliesslich taegliche Kontrolle.
