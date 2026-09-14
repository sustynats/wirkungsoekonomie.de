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

## Ergänzung 14.09.2026: Prüfaufruf an den Elternauftrag binden

Die bisherige Grenze galt nur je `job_id`. Eine fachlich veränderte Vorlage
kann in `semantic-review.mjs` eine neue Inhaltsprüfsumme und damit eine neue
Prüfjob-ID erzeugen. Das darf den bereits bezahlten unabhängigen Fachpass des
Elternauftrags nicht erneut kaufen. Neue API-Prüfrequests enthalten deshalb
`parent_job_id` aus der unveränderlichen Bridge-Eingabe. Die Bindung gehört zum
Request-Key und wird vor dem Provideraufruf im privaten Journal gespeichert.
Der Server erlaubt höchstens einen bezahlten Prüfaufruf über alle Kinder
desselben Elternauftrags; auch unbrauchbare Antworten verbrauchen diesen Slot.
Unbekannte Ausgänge bleiben gesperrt. Ein historischer Elternauftrag mit bereits
mehr als einem bezahlten Entwurf erhält keinen weiteren Prüfaufruf.

Die bisherige Grenze von einem Aufruf pro Job bleibt zusätzlich bestehen.
Neue Ereignis- oder ausdrücklich beauftragte Korrektureltern bleiben eigene
Vorgänge; diese Regel behauptet keine Zusammenführung sämtlicher Revisionen
anhand von Titel, URL oder Veröffentlichungs-ID. Neue Eltern dürfen nicht als
automatische Umgehung eines gescheiterten unveränderten Vorgangs angelegt werden.

### Bestandsjournal und sichere Aktivierung

Alte Request-Keys ohne Elternfeld bleiben unverändert lesbar. Vorhandene
Antworten werden unter dem originalen Key mit ursprünglichem Modell, Usage und
Quellenpaket wiederverwendet; kein Output wird auf einen anderen Prüfjob
umgebunden. Der Worker kann einen alten, ausschließlich budgetbedingt abgelehnten
Request mit nachweislich `provider_called:false` nach der Key-Erweiterung wieder
aufnehmen. Ein unbekannter bezahlter Request erhält diese Ausnahme nicht.

Alte bezahlte Prüfjournale speichern keine Eltern-ID. Die private Begleitdatei
`review-lineage.json` im API-Journalverzeichnis ergänzt ausschließlich diese
Zuordnung. `build-review-lineage.mjs` liest die SQLite-Datenbank nur lesend und
verknüpft jeden alten Review über identische `job_id` und `input_hash` mit dem
expliziten `parent_job_id` des gespeicherten `impact_semantic_review`-Inputs.
Archivierte und unbekannt abgeschlossene Aufträge werden ebenfalls berücksichtigt.
Keine ID-Präfixe, Titelähnlichkeiten oder Zeitnähen werden als Identität verwendet.
Kosten- und Antwortjournale werden nicht verändert oder entlastet.

1. Processor-Timer anhalten und einen laufenden bezahlten Aufruf regulär
   abschließen lassen; Runtime, Bridge-Datenbank und Journale sichern.
2. Aus dem geprüften Release zunächst nur auditieren:
   `node scripts/news/bridge/build-review-lineage.mjs --journal-directory=<absoluter-Pfad> --bridge-database=<absoluter-Pfad>`.
   Jeder `UNRESOLVED`-Befund braucht die tatsächliche passende unveränderliche
   Eingabe; niemals eine Beziehung schätzen oder eine Reserve löschen.
3. Nur bei vollständig aufgelöstem Bestand dieselbe Ausführung mit `--write`
   verwenden. Sie legt die vollständige Begleitdatei exklusiv und privat an;
   vorhandene Dateien werden nicht überschrieben. Den Beleg sichern und dessen
   Lesbarkeit durch den API-Dienstbenutzer prüfen.
4. Den geprüften API-Service und Worker zusammen aktivieren. Der authentifizierte
   Health-Endpunkt muss zusätzlich `max_paid_reviews_per_parent:1` melden;
   ein Worker startet gegen eine ältere Policy nicht. GET-Wiederaufnahme und
   alle unveränderten fachlichen Gates prüfen, ohne einen Testtext zu kaufen.

Fehlt für einen alten bezahlten Review eine belastbare Zuordnung, verweigert der
Server neue Prüfaufrufe mit `API_EDITORIAL_LEGACY_REVIEW_LINEAGE_REQUIRED` vor
jeder Reservierung. Bereits gespeicherte Antworten und neue eigenständige
Entwürfe bleiben erreichbar. Dies ist ein offener Migrationsbefund und keine
Budgeterschöpfung. Deshalb die vollständige Zuordnung vor Aktivierung herstellen;
ein einziger ungeklärter Alt-Review darf nicht stillschweigend als kostenlos
oder als fremder Elternvorgang behandelt werden.

Bei Rollback den Processor anhalten; kein älterer Worker darf die neue
Elternbegrenzung umgehen. Keine Kosten- oder Antwortjournale zurücksetzen.
Diese Ergänzung ändert weder Quellenprüfung noch Publikations- oder persönliche
Freigaben. Neue lokale Tests verwenden ausschließlich simulierte Provider.
