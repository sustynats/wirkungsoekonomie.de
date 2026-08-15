# Versionierung der WÖk-Online-Referenz

Stand: 2026-05-23

## Grundprinzip

Die Online-Referenz trennt Originalfassung, geprüfte Onlinefassung und spätere Live-Referenz. Originaldokumente bleiben zitierfähig und werden nicht stillschweigend überschrieben.

## Versionsebenen

- `2026.0 / source-original`: unveränderte importierte Fassung aus PDF, DOCX, MD oder XLSX.
- `2026.1 / online-reviewed`: erste gegen den führenden Begriffsleitfaden geprüfte Online-Referenzfassung.
- `2026.2+`: spätere fachliche, methodische oder redaktionelle Fortschreibungen.

## Content-States

- `source-original`: unveränderte Quelldokumentfassung.
- `online-reviewed`: gegen den aktuellen Begriffsleitfaden geprüft.
- `live-reference`: aktuell führende Referenzfassung.
- `needs-human-review`: technisch importiert, aber begrifflich oder strukturell noch offen.
- `archived`: historischer Stand.

## Pflichtfelder im Frontmatter

Importierte Inhalte müssen mindestens enthalten:

```yaml
sourceVersion: "2026.0"
webVersion: "2026.1"
contentState: "online-reviewed"
canonicalSourceFile: "..."
sourceHash: "..."
contentHash: "..."
terminologyBase: "WOeK_Begriffsleitfaden_fuehrend_v1.0.md"
terminologyBaseVersion: "1.0"
terminologyBaseDate: "2026-05-21"
reviewStatus: "reviewed"
reviewedAt: "2026-05-23"
reviewedBy: "automated-import-review"
```

## Änderungsprotokoll

Jede Abweichung gegenüber der Originalfassung braucht einen Eintrag mit Änderungstyp, Status, Begründung, Quelle und Datum. Gesetzestexte, technische Leitlinien, Scorecards und Rechenbeispiele werden nicht stillschweigend verändert.

