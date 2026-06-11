# Phase-2-Diskursarchitektur

Stand: 2026-05-23

Phase 1 implementiert keine Kommentare, keine Authentifizierung, keine Datenbank und keine serverseitige Logik. Sie bereitet nur stabile Andockpunkte vor.

## Identifikatoren

Spätere Kommentare sollen an diese Felder andocken:

- `documentId`
- `sectionId`
- `version`
- `contentHash`

## Zukünftiges API-Schema

```text
GET /comments?documentId=&sectionId=&version=
POST /comments
```

Die API gehört nicht auf GitHub Pages. Sie muss später auf einem separaten Server laufen.

## Kommentar-Metadaten

- `commentType`: Frage, Korrektur, Ergänzung, Kritik, Quellenhinweis
- `status`: offen, geprüft, übernommen, abgelehnt, archiviert
- `moderation`: pending, visible, hidden, escalated
- `authorRole`: öffentlich, Expert:in, Redaktion, Wirkungsrat

## Discord-Rollenmapping

Discord OAuth kann später externe Rollen liefern. GitHub Pages speichert keine Kommentar- oder Authentifizierungsdaten.

## UI-Hinweis

Phase-1-Seiten dürfen nur einen deaktivierten Hinweis zeigen:

> Diskurs zu diesem Abschnitt wird in einer späteren Phase aktiviert.

