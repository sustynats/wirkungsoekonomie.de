# Bezahlte Redaktionsaufrufe: ein Versuch pro Verarbeitungsschritt

Stand: 13.09.2026

Eine reguläre neue Nachricht besitzt zwei getrennte redaktionelle Aufträge:

1. Artikel und MPD-Wirkungsprofil erstellen.
2. Die fachliche Bewertung unabhängig prüfen.

Jeder dieser unveränderlich gebundenen Aufträge darf höchstens einen neuen
kostenpflichtigen Modellaufruf auslösen. Ein neuer Prompt, ein anderes
Wissensprofil oder ein Reparaturpaket erlaubt keinen weiteren bezahlten Versuch.
Ein unbekannter Aufrufausgang bleibt eine Sperre, bis er geklärt ist.

Gespeicherte Ergebnisse bleiben unter ihrem ursprünglichen Schlüssel abrufbar.
Transport-, Import- und Infrastrukturfehler werden mit dieser Antwort erneut
geprüft. Fehlende Fakten, Quellen, Faktoren oder Urteile werden dabei nicht
softwareseitig ergänzt. Ein fachlich negatives Prüfergebnis bleibt negativ;
es löst keine weitere kostenpflichtige Nachfrage aus.

Der Server setzt die Aufrufgrenze anhand seines dauerhaften Journals durch.
Sein authentifizierter Health-Endpunkt meldet die tatsächlich implementierte
Ausführungspolitik. Der Worker verlangt diese Bestätigung vor dem
Dropbox-Preflight. Eine ältere Serverversion besteht den Preflight nicht.

Nicht verwendbare Ergebnisse bleiben mit Prüffehlermeldung im privaten
Aufmerksamkeitsstatus. Sie verdrängen im normalen Lauf keine frischen Aufträge.
Nach einer versionierten technischen Korrektur darf die bereits bezahlte
Antwort erneut kostenlos validiert werden. Das Journal und seine Kosteneinträge
bleiben erhalten.

Die Begrenzung verändert kein Publikations- oder Freigabegate. Ein zugestellter
Output ist noch keine Veröffentlichung. Persönliche Beiträge benötigen
weiterhin die abschließende menschliche Freigabe.

Zwei Modellaufrufe sind keine Kostengarantie: Suchzugriffe innerhalb eines
Prüfaufrufs werden zusätzlich abgerechnet. Das Ziel von ungefähr fünf Cent
bezieht sich auf den gesamten Aufwand je tatsächlich veröffentlichtem
regulärem Artikel, einschließlich Prüfung und nicht verwendbarer Aufrufe.
Die gemessenen Stückkosten sind getrennt von der Aufrufgrenze auszuweisen.

## Wiederanlauf

- Quellgebundene, aktuelle Eingabe vor dem Aufruf vollständig vorbereiten.
- Tests, Build, Serverpolitik und echtes Bridge-Read/Write prüfen.
- Einen begrenzten Durchlauf bis zur öffentlichen Artikelseite verfolgen.
- Zwei Modellaufrufe, Quellenprüfung, MPD, Import, ACK und Auslieferung prüfen.
- Erst danach den vorhandenen serverseitigen Timer wieder aktivieren.

Der vorhandene Runner kann mit `--job-id=<vorhandene Job-ID>` auf genau einen
Auftrag begrenzt werden. Das lässt Frischeprüfung, Ausschlüsse, serverseitige
Kostenbegrenzung und vollständige Inhaltsprüfung unverändert. Ohne diesen
Parameter bleibt die normale LIFO-Auswahl aktiv.

Historische Reparaturen erhalten keine neuen bezahlten Aufrufe. Ein wirklich
neues Ereignisupdate bleibt ein neuer Auftrag mit eigener Quellenbindung; es
darf nicht als Umgehung für einen fehlgeschlagenen unveränderten Auftrag dienen.
