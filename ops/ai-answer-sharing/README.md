# KI-Antworten speichern und teilen

Release 2026-09-04. Frontend: `woek-ki/index.html`, englische Generatorquelle
`scripts/i18n/build-english-function-pages.mjs`, gemeinsamer Controller
`assets/js/woek-ai-results.js`, lokaler Bestand in `assets/js/main.js`.

## Datenvertrag

- Jede neue Antwort erhält vor der Anfrage eine eigene ID. Wiederöffnen erzeugt keine neue KI-Anfrage.
- Lokale Antworten werden vollständig gespeichert, nicht nach 6.000 Zeichen gekürzt oder nach 120
  Einträgen still gelöscht. Bei Speichermangel gibt es einen Fehler; vorhandene Daten bleiben erhalten.
- Öffentlich wird erst nach Bestätigung ausschließlich Frage, Antwort und Quellen übertragen. Kein
  Profil, keine Notizen, kein gesamter Wirkungsraum, keine Zugangsdaten.
- Der öffentliche Snapshot liegt beim vorhandenen Oracle-Dienst hinter `/api/share-result`.
  Resultatseiten nutzen `/woek-ki/?share=sr-UUID` beziehungsweise `/en/woek-ai/?share=sr-UUID`.
  Sie benötigen keinen Login. Keine Aufnahme individueller Antworten in Sitemap oder Website-Suche.
- Ein Share ist eine vom Nutzer freigegebene, unveränderliche Momentaufnahme, keine signierte oder
  amtlich geprüfte Fachauskunft. Quellen/Stand und KI-Grenzen bleiben erkennbar.
- Private Speicherung bleibt browserlokal, nicht automatisch geräteübergreifend. Vor Browserwechsel
  die vorhandene Wirkungsraum-Exportfunktion nutzen. Historisch bereits gekürzte Antworten können
  nicht nachträglich rekonstruiert werden.

## Oracle-Patch

`oracle-backend.patch` ist ein eng begrenzter Patch gegen den vor dem Release gelesenen Live-Stand
von `/opt/faktencheck-bot`. Keine lokale, veraltete Bot-Gesamtkopie deployen.

Ausgangs-SHA256:

- `src/services/sharedResultStore.ts`: `879595926c9e776174f42397896ad81711d42a7bf1415c00fa5ed8f37ff46009`
- `src/http/apiServer.ts`: `4f452b36e17eaded12f8c210ad6347a0f3df85e781148e2cf8f120a595d869b4`

KI-Snapshots werden einzeln und atomar in `SHARED_RESULT_FILE.permanent/sr-UUID.json` abgelegt.
Das Verzeichnis gehört dauerhaft zu Backup und Wiederherstellung. Keine TTL und kein LRU-Limit.
Andere Checks behalten ihre bisherige Retention. Noch vorhandene alte KI-Shares werden beim Laden
übernommen, ohne den bisherigen Quellbestand zu löschen. Zuvor abgelaufene/gelöschte Shares können
nicht rekonstruiert werden. Dateinamen werden vor dem Lesen validiert. Der Dienst bestätigt einen
neuen Link erst nach erfolgreichem Schreiben. Zu lange Antworten werden abgelehnt, nicht gekürzt.

Deployment: Ausgangshashes kontrollieren; Source, kompilierte JS-Dateien und bestehenden Share-Bestand
backup-first sichern. Patch anwenden, `npm run build`, `npm test`, `npm run lint`; nur die beiden
geänderten Source-/Dist-Dateien und zugehörigen Tests übertragen. `faktencheck-bot.service` neu starten.
Bei Rollback die zwei Code-Dateien aus dem Backup verwenden, niemals Share-Daten zurückrollen/löschen.
Keine Vercel-Builds oder neuen Speicherdienste erforderlich.

## Prüfungen

`node --test tests/woek-ai-results.test.cjs`: IDs, Wiederöffnen, lange Antworten, Quota-Fehler,
explizite Freigabe, Daten-Allowlist, Link-Wiederverwendung, Clipboard-Fallback, URL-Sanitizing.
Backend-Test `sharedResultStore.test.ts`: Alter/Mengenlimit/Neustart, Altdatenmigration, Pfadschutz,
unveränderte Retention anderer Checks, vollständige Antworten, Schreibfehler.
