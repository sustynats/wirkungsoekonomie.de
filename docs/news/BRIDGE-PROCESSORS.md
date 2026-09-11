# Redaktionelle Worker und Durchsatz

Stand 11.09.2026. Ergänzung zu Bridge-3; dessen fachliche Schemas und
Veröffentlichungsgates bleiben unverändert. Der alte HH:00-Lauf wird erst nach
einer geprüften Übergabe abgelöst. Ein geöffneter Chat ist kein Verfügbarkeitsnachweis.

## Freigabe des Betriebs

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

Priorität: urgent/breaking, Updates/Korrekturen und wartende Zweitprüfungen,
critical/very_high, high, reguläre neue Meldungen, historischer Backfill. Altern
erhöht die Priorität schrittweise; normale Jobs verdrängen dadurch keine aktuellen
Updates oder dringenden Aufträge. Die Trennung von Nachrichten und persönlicher
Redaktion sowie deren abschließende Freigabe bleibt bestehen.

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
Queue-Grenze passieren, pro Discovery-Lauf bleibt das vorhandene Batchlimit.
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
