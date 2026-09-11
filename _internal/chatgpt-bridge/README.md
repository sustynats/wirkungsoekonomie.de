# ChatGPT → Dropbox: verschlüsselte Übergabe

Der redaktionelle Worker liest und beansprucht Jobs weiterhin über den bestehenden Dropbox-Connector. GitHub Actions transportiert fertige, **verschlüsselte** Ausgaben nach Dropbox. Der Importer und seine fachlichen Qualitäts- und Freigabegates bleiben zuständig für jede Veröffentlichung.

## Zugriffe und Datenschutz

- Dieses Repository ist öffentlich. Persönliche Entwürfe, Quellenpakete und Redaktionsnotizen dürfen nie unverschlüsselt in Issues stehen.
- Neue Artikeloutputs benötigen den Envelope `bridge_version: 2`. RSA-OAEP-SHA256 schützt den zufälligen AES-256-GCM-Schlüssel. AES-GCM authentifiziert auch Job-ID, Dateiname und Schlüsselkennung. Gzip erfolgt vor der Verschlüsselung.
- Nur der öffentliche Schlüssel in `public-key.pem` wird dem ChatGPT-Worker gegeben. Der private Schlüssel liegt ausschließlich im Repository-Secret `CHATGPT_BRIDGE_PRIVATE_KEY` und im privaten Betriebsbackup.
- Die drei Dropbox-Secrets heißen `DROPBOX_APP_KEY`, `DROPBOX_APP_SECRET`, `DROPBOX_REFRESH_TOKEN`. Sie gehören zu einer separaten Scoped-Access-/Full-Dropbox-App. Angefragte Scopes sind `files.content.read` und `files.content.write`; Dropbox ergänzt `files.metadata.read` als Abhängigkeit.
- Der Workflow prüft vor dem Dropbox-Zugriff, ob Issue-Autor und auslösender Account aktuell Schreibrechte am Repository besitzen. Der normale GitHub-Token genügt; kein zusätzlicher GitHub-PAT für den Receiver.
- Keine Zugangswerte oder entschlüsselten Texte in Logs oder Issue-Kommentaren. Entschlüsselung verleiht keine redaktionelle Veröffentlichungsfreigabe.

## Envelope erstellen

Der Worker benötigt Python mit `cryptography`, das Script `scripts/chatgpt_bridge_crypto.py` und ausschließlich den öffentlichen Schlüssel. Die Encoder-Datei enthält keine Zugangswerte.

```sh
python chatgpt_bridge_crypto.py public-key.pem JOB.output.json JOB.issue.json
```

Die Ausgabe ist ein JSON-Objekt mit `bridge_version`, `job_id`, `destination_filename` und `sealed_payload`. Den kompletten Inhalt von `JOB.issue.json` als reinen Text mit dem verbundenen GitHub-Issue-Werkzeug einstellen. Keine Markdown-Codezäune und kein Datei-Egress nötig.

Issue-Titel: `[CHATGPT-BRIDGE] <job_id>`

Ziel ausschließlich: `/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE/20_OUTPUT_READY/<job_id>.output.json` bzw. `<job_id>.probe.json`.

Maximal 60.000 Bytes Issue-Envelope und 256.000 Bytes entschlüsseltes Output-JSON. Zu große Aufträge nicht abschneiden oder auf mehrere selbst erfundene Jobs aufteilen; in technische Prüfung geben.

## Unveränderlichkeit und Jobbindung

- Output-Job-ID und `input_hash` müssen dem vorhandenen `10_CLAIMED/<job_id>.input.json` entsprechen.
- Ein vorhandenes ACK verhindert eine neue Ausgabe.
- Identische vorhandene Bytes führen zu `already_delivered`; abweichende vorhandene Bytes werden niemals überschrieben.
- Upload verwendet atomar `add`, `autorename: false`, `strict_conflict: true`. Das schützt auch bei gleichzeitigen Versuchen aus unterschiedlichen Issues.
- Erst nach bytegleichem Dropbox-Readback wird das Issue mit `BRIDGE_DELIVERED` kommentiert und geschlossen.
- Bei Fehler bleibt es offen. Keine Ausgabe unter anderem Dateinamen versuchen.
- Existierende Import-, ACK-, Reparatur- und Archivierungsregeln bleiben erhalten.

## Capability-Preflight und Freigabe

Jeder tatsächliche redaktionelle Kontext muss zuerst 98_CONFIG, 00_INBOX, 10_CLAIMED, 20_OUTPUT_READY und 30_ACK lesen. Danach erzeugt er selbst eine eindeutige, harmlose Probe, sendet sie über den verschlüsselten Issue-Weg und liest die geschriebenen Bytes über Dropbox zurück. Kein Claim vor diesem PASS. Ein Codex-API-Test ist kein Nachweis für eine ChatGPT-Automation.

Für eine rein technische Minimalprobe ist weiterhin Version 1 erlaubt, aber ausschließlich mit `payload: {"probe_id":"<job_id>","test_only":true}` und dem dazugehörigen `.probe.json`-Dateinamen. Unverschlüsselte redaktionelle Outputs werden abgewiesen.

## Testfolge vor Nachrichtenbetrieb

1. Unit-Tests: `python -m unittest discover -s tests/bridge -v`.
2. Genau geprüften PR-Stand mit gebundenem Testplan verwenden.
3. Eindeutiges verschlüsseltes Probe-Issue anlegen.
4. Issue → Action → Dropbox-Datei → Bytevergleich → geschlossenes Issue nachweisen.
5. Identische Wiederholung prüfen; keine zweite Dateiversion erzeugen.
6. Im tatsächlichen ChatGPT-Kontext den eigenen Preflight durchführen.
7. Erst danach aktuelle Updates und neue Meldungen bearbeiten; historische Neubewertungen bleiben nachrangig.

Die Vorbereitung aktiviert keine Automation. Nachrichten brauchen weiterhin vollständige Quellen- und Wirkungsprüfung. Persönliche Beiträge bleiben an Natalies Freigabe gebunden.
