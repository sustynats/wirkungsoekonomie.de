# ChatGPT → Dropbox Bridge

## Zweck

Dieser Bridge-Weg ersetzt `Dropbox.upload_file` für **neu von ChatGPT erzeugte JSON-Dateien**. Der Dropbox-Connector bleibt für Lesen, Auflisten sowie Operationen auf bereits vorhandenen Dropbox-Dateien nutzbar. Neue redaktionelle Outputs werden dagegen als GitHub-Issue übergeben und serverseitig nach Dropbox geschrieben.

Damit liegt kein lokaler `/mnt/data`-Pfad und keine ChatGPT-File-Referenz mehr auf dem Egress-Pfad zu Dropbox.

## Datenfluss

```text
Dropbox 00_INBOX
   │  list/read/claim mit bestehendem Dropbox-Connector
   ▼
ChatGPT Redaktion
   │  create_issue (reiner UTF-8-Text)
   ▼
GitHub Issue  [CHATGPT-BRIDGE] <job_id>
   │  issues: opened/reopened
   ▼
GitHub Action auf vertrauenswürdigem main
   │  JSON validieren → Dropbox API upload → Dropbox API download → Bytevergleich
   ▼
Dropbox 20_OUTPUT_READY/<destination_filename>
   │
   └─ Issue wird erst nach erfolgreichem Read-after-write geschlossen
```

## GitHub-Issue-Vertrag

Titel:

```text
[CHATGPT-BRIDGE] <job_id>
```

Der Issue-Body besteht **nur aus gültigem JSON**, ohne Markdown-Codeblock:

```json
{
  "bridge_version": 1,
  "job_id": "editorial-20260911-001",
  "destination_filename": "editorial-20260911-001.output.json",
  "payload": {
    "job_id": "editorial-20260911-001",
    "status": "ready"
  }
}
```

### Regeln

- `bridge_version` muss `1` sein.
- `job_id` und `destination_filename` dürfen nur sichere ASCII-Zeichen enthalten.
- `destination_filename` muss exakt `<job_id>.output.json` oder `<job_id>.probe.json` sein; ein beliebiger Dropbox-Dateiname ist nicht zulässig.
- Zielverzeichnis ist im Worker fest verdrahtet auf:
  `/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE/20_OUTPUT_READY`
- `payload` wird als UTF-8-JSON mit abschließendem Newline gespeichert.
- Maximale serialisierte Payload-Größe: 55 KB; der komplette Issue-Body ist auf 60 KB begrenzt.
- Wiederholung desselben Jobs ist sicher: Wenn in Dropbox bereits exakt dieselben Bytes liegen, wird der Job als `already_delivered` akzeptiert.
- Ein Issue wird nur nach erfolgreichem Read-after-write geschlossen.
- Bei Fehler bleibt das Issue offen; ein erneuter Lauf kann über einen Actions-Rerun oder durch Wiederöffnen ausgelöst werden.

## Einmalige Einrichtung

Im Repository unter **Settings → Secrets and variables → Actions** diese Repository-Secrets anlegen:

- `DROPBOX_APP_KEY`
- `DROPBOX_APP_SECRET`
- `DROPBOX_REFRESH_TOKEN`

Die Dropbox-App benötigt Zugriff auf den Pfad unter `/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE` und mindestens die für Upload/Download erforderlichen Content-Berechtigungen. Für den hier verwendeten absoluten Dropbox-Pfad ist eine passend konfigurierte Dropbox-App erforderlich.

Secrets niemals in Issues, Commits, Chat-Prompts oder Logdateien eintragen.

## Produktionsregel für ChatGPT

Für neu erzeugte Bridge-Ausgaben gilt ab Aktivierung:

1. **Nie** `Dropbox.upload_file` für generierte Dateien verwenden.
2. Fertigen Output in den oben beschriebenen GitHub-Issue-Envelope einbetten.
3. Issue über die GitHub-API erstellen.
4. Dropbox-Datei über den vorhandenen Dropbox-Leseweg zurücklesen und erst dann den Job fachlich als vollständig behandeln.
5. Bei fehlendem Dropbox-Readback nicht erneut mit anderem Dateinamen senden; denselben `job_id`/Dateinamen idempotent wiederverwenden.

## Preflight nach Aktivierung

Ein Probe-Issue mit einem eindeutigen `job_id` anlegen und folgende Kette prüfen:

```text
ISSUE_CREATED
→ ACTION_SUCCESS
→ DROPBOX_FILE_EXISTS
→ DROPBOX_CONTENT_MATCH
→ ISSUE_CLOSED
```

Erst wenn alle fünf Schritte erfolgreich sind, darf die reguläre Stundenautomation auf diesen Schreibweg umgestellt werden.
