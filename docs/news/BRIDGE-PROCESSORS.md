# Redaktionelle Worker und Durchsatz

Stand 11.09.2026. Ergänzung zu Bridge-3; dessen fachliche Schemas und
Veröffentlichungsgates bleiben unverändert. Der alte HH:00-Lauf wird erst nach
einer geprüften Übergabe abgelöst. Ein geöffneter Chat ist kein Verfügbarkeitsnachweis.

## Freigabe des Betriebs

Die Übernahme prüft zuerst Quellenbindung, Lesertext und das native Artikelformat
mit denselben Regeln wie die abschließende Veröffentlichung. Fehler werden vor
dem unabhängigen MPD-Prüfauftrag gesammelt als Reparatur zurückgegeben. Der
Vorabcheck schreibt keinen Artikel und erteilt keine fachliche Freigabe. Die
MPD-Prüfung bleibt an die unveränderte vollständige Ausgabefassung gebunden;
danach laufen sämtliche Veröffentlichungsgates erneut. So verbrauchen einfache
Textfehler nicht erst einen zusätzlichen Redaktionspass, ohne die Quellen- oder
Wirkungsprüfung zu lockern.

Reparaturpakete benennen außerdem den exakten `output_path`. Die native
Nachrichtenbridge erwartet `<job_id>.output.json`, nicht
`<job_id>.repair-N.output.json`. Der verworfene Output liegt vor Zustellung des
Reparaturauftrags bereits unverändert in `90_ERRORS`. Ein unerwartet vorhandener
Output oder ACK wird niemals überschrieben.
Unbekannte Ausgabedateinamen werden als `UNKNOWN_OUTPUT` gemeldet und bleiben
unverändert liegen. Sie werden nicht als Auftragsnummer an den Server geschickt
und dürfen den Import anderer geprüfter Nachrichten nicht abbrechen.

Jeder tatsächliche Automation-Kontext besteht zuerst einen einmaligen Test ohne
Nachrichtenauftrag. Codex-Zugriff, Serverzugriff und ein manueller Chat-Test zählen
nicht als Nachweis für einen Automation-Kontext. Erst nach überprüftem Test darf
dieselbe Automation mit dem redaktionellen Prompt aktiviert werden. Keine
kostenpflichtige Text-API als Ersatz und keine erfundenen Analysen.

Vor **jedem** Redaktionslauf: 98_CONFIG, 00_INBOX, 10_CLAIMED, 20_OUTPUT_READY und
30_ACK vollständig listbar, Bridge-3-Vertrag tatsächlich lesbar; eine kleine eigene
eindeutige JSON-Probe nach 20_OUTPUT_READY schreiben und exakt zurücklesen. Proben
enden auf `.probe.json`, niemals `.output.json`. Vollständiges Leseergebnis,
Kontext-ID, Automation-ID, Shard, Run-ID, Zeitpunkt, Probepfad und Payload-Hash
werden in `95_LOGS/processor-preflight-<run_id>.json` gespeichert. Ein eigener
Upload muss tatsächlich durch das Werkzeug abgeschlossen sein. Datei-Referenz
oder behauptete Uploadfähigkeit reichen nicht. Fehler: `CHATGPT_DROPBOX_UNAVAILABLE`;
kein Claim, kein Verschieben, kein Teiloutput. Auch fehlender Log-Schreibzugriff
verhindert den Start. Bei ausgefallenem Connector den Fehler im Task melden.

Die Referenzfunktionen und ausführbaren Tests stehen in `processor.mjs` und
`tests/news/processor.test.mjs`. Der Adapter einer Preflight-Funktion muss der
Connector des jeweiligen ChatGPT-Workers sein. Ein Serveradapter darf nicht mit
der Identität eines ChatGPT-Workers ausgeführt werden.

## Drei unabhängige Shards

| Worker | Restwert | Startminute pro Stunde |
| --- | --- | --- |
| A | 0 | 00 |
| B | 1 | 20 |
| C | 2 | 40 |

Berechnung: SHA-256 über die vollständige `job_id` in UTF-8; gesamten Hash als
vorzeichenlose Big-Endian-Ganzzahl modulo 3. Beispiel in Python:
`int(hashlib.sha256(job_id.encode('utf-8')).hexdigest(), 16) % 3`.
Keine Rundung über Fließkommazahlen, kein Ersatzhash, keine neue ID.

Pro Shard genau ein Lauf pro UTC-Stunde, auch bei Sommerzeit-Rückstellung.
Atomare, nicht überschreibbare Slot-Datei in 95_LOGS verhindert doppelte Starts.
Ein Slot mit bestehendem Eigentümer wird nicht wegen seines Alters übernommen.
Startbudget 20 Minuten, zwei Minuten Reserve; höchstens zehn vollständige Jobs.
Ziel fünf bis zehn normale Jobs, vertiefte Recherche darf weniger ergeben. Vor
jedem weiteren Claim prüfen, ob eine vollständige Bearbeitung noch realistisch
ist. Kein Vorab-Claim eines ganzen Batches. Begonnene Arbeit nicht als fertig ausgeben.

Priorität gemäß `manual-first-lifo-2026-09-12`: urgent/breaking, direkte
Nutzeraufträge einschließlich ihrer Nachrecherche, neue Nachrichten mit
Ereignisbeleg aus der letzten Stunde, Updates/Korrekturen
und wartende Zweitprüfungen, critical/very_high, high, reguläre neue Meldungen,
historischer Backfill. Innerhalb der Klasse bestimmt der tatsächliche
Quellenzeitpunkt LIFO. Ein späterer Requeue macht eine alte Meldung nicht aktuell.
Ohne Quellenzeit dient die Eingabezeit als Sortierhilfe, nicht als Aktualitätsbeleg.
Die Trennung von Nachrichten und persönlicher Redaktion sowie deren abschließende
Freigabe bleibt bestehen.

## Claim und Output

Unmittelbar vor jeder Übernahme: ACK, Output und vorhandenen Claim erneut prüfen;
Originalinput lesen, job_id und input_hash mit dem gewählten Auftrag vergleichen.
Nur der erfolgreiche atomare Move ohne Überschreiben von 00_INBOX nach 10_CLAIMED
vergibt Eigentum. Bei Rennen überspringen. Vorhandene Claims nicht stehlen oder
wegen ihres Alters zurücksetzen. Explizite serverseitige Repair-Aufträge behalten
die Originalbindung und verwenden ihren eigenen generationsbezogenen Dateinamen.

Eigentum mit Run-/Kontext-/Automation-ID und Eingabehash in 95_LOGS protokollieren.
Nur eigene vollständig validierte Outputs schreiben; bestehende Outputs und ACKs
niemals überschreiben. Bridge-3-Envelope, native `wirkungsticker.analysis`, Quellen-,
MPD-, Zweitpass- und Publikationsgates bleiben verpflichtend. Jede Ausgabe endet
einzeln atomar in 20_OUTPUT_READY, damit der Importer fertige Arbeit sofort abholt.
Danach nächste passende Aufgabe statt künstlicher Ein-Job-Grenze. Am Laufende
vollständige Job-IDs in `processor-run-<run_id>.json` festhalten.

## Health und Rückstau

Der bestehende Discovery-Monitor schreibt ohne zusätzliche KI-Aufrufe einen
privaten `processor-health-<UTC>.json` nach 95_LOGS. Das bestehende Monitor-API
liefert dessen jüngsten Stand samt Zeitpunkt. Die Felder `processor_available`,
`dropbox_read_ok` und `dropbox_write_ok` beruhen ausschließlich auf frischen,
kontextgebundenen Automation-Belegen; Probedatei und Hash werden zurückgeprüft.
Manueller Test allein schaltet keinen Worker auf verfügbar. `all_shards_available`
unterscheidet einen funktionierenden Shard vom vollständigen Betrieb.

Mehr als zehn offene Jobs: QUEUE_WARNING. Mehr als zwanzig: QUEUE_CRITICAL.
Bei kritischer Queue keine neuen historischen Neubewertungen starten. Kandidaten
werden behalten; aktuelle TOP/HIGH-Meldungen und Updates dürfen die weiche
Queue-Grenze passieren, ebenso tatsächlich neue Quellen aus den letzten drei
Stunden. Pro Discovery-Lauf bleibt das vorhandene Batchlimit.
Discovery, aktuelle Nachrichten und Import werden dafür nicht abgeschaltet.

Eingänge und dauerhafte Abschlüsse werden beim erstmaligen Speichern gezählt;
Wiederholung und Archivierung zählen nicht erneut. Erst nach zwei vollständig
beobachteten Stunden mit mehr Eingängen als Abschlüssen wird
PROCESSING_CAPACITY_INSUFFICIENT gesetzt. Ohne vollständiges Beobachtungsfenster
lauten Stundenwerte `null`, nicht erfundene Nullen. Abschluss bedeutet hier
dauerhafte Übernahme/ACK; ein Staging-ACK ist keine Live-Veröffentlichung.
Zeitpunkte vergangener ChatGPT-Erfolge werden nicht aus Verzeichniszeiten erfunden.

## Betriebsabnahme

Erst drei echte Automation-Preflights, kollisionsfreie Läufe, sinkende Queue,
erfolgreicher Output-/ACK-Roundtrip, weniger als zehn offene Jobs und normale
Wartezeiten ergeben Betriebs-PASS. Grüne Unit-Tests oder angelegte Zeitpläne allein
sind kein Betriebs-PASS. Historische Claims mit Eigentümerkonflikt bleiben in einer
begründeten Prüfliste; keine Löschung oder automatische Reanalyse derselben Jobs.


## Vorrang aktueller Nutzeraufträge (11.09.2026)

Queue-Policy `lifo-2026-09-11`, Vertrag `processor-contract-2026-09-11-3.json`:
Innerhalb derselben fachlichen Priorität wird der zuletzt eingegangene Auftrag
zuerst verarbeitet. Ein Altersbonus darf diese ausdrücklich beauftragte LIFO-
Reihenfolge nicht verdeckt wieder umdrehen. Breaking/urgent bleibt zuerst,
danach direkte Redaktionsaufträge einschließlich ihrer Revisionen und
Nachrichten-Prüfaufträge, dann Updates/Fachprüfungen, sehr hohe, hohe und normale
neue Nachrichten. Bei kritischer Queue bleibt historischer Backfill pausiert.
Dessen Reparaturen und zweite Prüfungen erben die historische Zuordnung.

Das Originaldatum einer Nachricht und der Inhalt ihrer Quellen ändern sich dadurch
nicht. Bereits laufende Claims bleiben geschützt. Shards, Preflight, unveränderliche
Outputs, Quellenprüfung, unabhängiger Fachpass und finale persönliche Freigabe
bleiben verbindlich. Die Rückkehr zu einer anderen Routinepriorisierung erfordert
eine neue explizite Policy-Version.

## Präzisierung vom 12.09.2026

Die vorstehende Fassung vom 11.09. wird durch Queue-Policy
`lifo-source-2026-09-12`, Vertrag `processor-contract-2026-09-12-4.json`, präzisiert:
Nach Breaking/urgent haben die Nachrichten der letzten Stunde Vorrang. LIFO
bezieht sich bei Nachrichten auf Originalquellen, nicht auf Wiederaufnahme,
Reparatur oder Import. Ältere Nachlieferungen behalten auch öffentlich ihren
ursprünglichen Platz; sie werden nicht als Neu-Meldung angekündigt.
Native Dateiregistrierung, Sicherheitsablehnungen und jede Freigabe bleiben
unverändert. Ein erfolgreiches Preflight zählt weiterhin nicht als Artikel.

## Vorrang direkter Aufträge und Dateiexport vom 12.09.2026

Die ausdrückliche erneute Priorisierung durch Natalie ersetzt die Reihenfolge
der vorstehenden Präzisierung: `manual-first-lifo-2026-09-12`, Vertrag
`processor-contract-2026-09-12-5.json`. Direkte Aufträge und ihre Nachrecherchen
kommen nach Breaking/urgent und vor automatisch erkannten Nachrichten der
letzten Stunde. Innerhalb jeder Klasse bleibt LIFO erhalten.

Ein privates Recherchepaket ohne nutzbare Ereignisquellen ist noch kein fertiger
Artikel. Der Server erzeugt höchstens zwei versionierte Nachrecherchen mit neuer
Job-ID, während ursprünglicher Input, Output und ACK unverändert bleiben.
Danach bleibt der Auftrag zur Klärung gespeichert. Vorübergehende Abruffehler
behalten ihren zeitlich begrenzten Wiederholungsversuch. Die finale Freigabe wird
dadurch nicht ersetzt.

Der geplante Lauf muss sein tatsächlich verfügbares Dateiexport-Werkzeug prüfen:
Eine nur in einer privaten Python-Runtime erzeugte Datei ist kein nachgewiesen
exportierbares Gesprächsartefakt. Die neue harmlose Probe wird über das native
dateiexportierende Werkzeug erstellt (im geprüften manuellen Kontext
`python_user_visible.exec`), anschließend nativ übertragen und zurückgelesen.
Fehlt dieses Werkzeug im geplanten Kontext, keine Artikel claimen. Eine bereits
zurückgewiesene Datei niemals durch anderen Transport oder bloße Neuregistrierung
übertragen; Datei-/Approval-/Safety-Sperren bleiben verbindlich.
