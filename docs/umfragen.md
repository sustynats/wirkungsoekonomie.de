# Eigene Umfragen - Architektur und Betrieb

Stand: 4. September 2026. **Backend und Website produktiv, öffentliche Umfrage geprüft.**

- Erste Umfrage: https://wirkungsoekonomie.de/umfragen/wirkungsticker-feedback/
- Übersicht: https://wirkungsoekonomie.de/umfragen/
- Verwaltung: https://wirkungsoekonomie.de/admin/umfragen/ (bestehendes Discord-Konto)

## Architektur und führende Quellen

Die Hauptwebsite wird weiterhin als statische Website mit ihren bestehenden
Templates, Design-Tokens, GitHub-Pages-Workflows und Suchgeneratoren betrieben.
Es gibt keine neue Hosting-Plattform und keinen Vercel-Build für dieses Modul.

Die Umfrage-API erweitert den vorhandenen Node-HTTP-Dienst auf Oracle/OCI
(`/opt/faktencheck-bot`, `faktencheck-bot.service`). Eine eigene SQLite-Datenbank
liegt außerhalb des Webroots und außerhalb des Website-Repositories. Node 22.23.1
enthält das verwendete `node:sqlite`; keine neue kostenpflichtige Datenbank oder
Polling-SaaS wird benötigt. SQLite arbeitet mit WAL, `synchronous=FULL`,
Foreign Keys, `busy_timeout` und atomaren Schreibtransaktionen.

| Quelle | Aufgabe |
| --- | --- |
| `ops/polls/backend/store.mjs` | Schema/Migration, Validierung, Stimmen, Ergebnisse, Zustandsmodell |
| `ops/polls/backend/api.mjs` | API, bestehende Discord-Anmeldung, Admin-Prüfung, CORS, Rate Limits |
| `ops/polls/backend/first-poll.json` | Nur Vorlage für das einmalige Anlegen der ersten Umfrage |
| `content/polls/public-catalog.json` | Generierter öffentlicher Metadaten-Snapshot, **keine Stimmdatenbank** |
| `scripts/polls/sync.mjs` | Öffentliche Metadaten aus Oracle synchronisieren |
| `scripts/polls/pages.mjs`, `build.mjs` | Statische Index-/Detail-/Admin-Seiten, Canonical/OG/Twitter, Sitemap |
| `assets/js/polls.js`, `polls-admin.js` | Leichtgewichtige Abstimmung/Ergebnisse und Verwaltung |
| `assets/css/polls.css` | Responsive Formulare und Ergebnisbalken im bestehenden Design |
| `assets/data/navigation.json` | Einstieg im bestehenden Footer |

Umfragedefinitionen werden im Admin-Bereich auf Oracle gespeichert. Der
bestehende 15-Minuten-Publishing-Job übernimmt ausschließlich veröffentlichte
Metadaten, generiert Seiten und Suchindex und veröffentlicht das geprüfte
Pages-Artefakt. Neue Links und neue Social-Metadaten benötigen deshalb abhängig
von Queue und Build etwa 30 Minuten, bei Störungen länger. Die Verwaltung
unterscheidet ausdrücklich **gespeichert** und **öffentlich veröffentlicht**:
Der öffentliche Link wird anhand der tatsächlich ausgelieferten Umfrage-ID und
Revision geprüft. Status, Abstimmung und Ergebnis-Sichtbarkeit kommen dagegen
bei jedem Aufruf direkt von der API; Pausieren wirkt sofort auf die Stimmabgabe.

Ein API-Ausfall veröffentlicht weder Entwürfe noch einen leeren Ersatzbestand.
Der letzte gültige öffentliche Snapshot bleibt erhalten; die Abstimmung zeigt
eine Fehlermeldung und erfindet keine Ergebnisse. Die API ist nicht vom
GitHub-Publishing-Job abhängig. Stimmen überstehen Deployments und Neustarts.

## Datenmodell

- `polls`: UUID, stabiler Slug, Titel, Einleitung, Frage, Status, Start/Ende,
  Ergebnis-Sichtbarkeit, Bild, CTA, weiterführender Link, Feedback-Hinweis,
  Veröffentlichungs-/Erstellungs-/Änderungsdatum, optimistische Revision.
- `poll_options`: UUID, Poll-Fremdschlüssel, Beschriftung, Sortierung.
- `votes`: UUID, Poll/Option-Fremdschlüssel, pro Umfrage gepepperte
  Abstimmungskennung, Zeitstempel. `UNIQUE(poll_id, anonymous_vote_identifier)`.
- `poll_feedback`: UUID, Poll-/Vote-Fremdschlüssel, Kommentar (1-1.500 Zeichen),
  Zeitstempel, Status `new`/`read`/`archived`. Höchstens ein Kommentar je Stimme;
  die gewählte Option ist ausschließlich in der geschützten Admin-Ansicht sichtbar.
- `retired_slugs`: veröffentlichte und anschließend gelöschte URLs werden nicht
  für andere Umfragen wiederverwendet.
- Getrennte Datei `abuse.sqlite`: ausschließlich gepepperte zeitfensterbezogene
  Schlüssel, Zähler und Ablaufzeitpunkte. Keine Zuordnung zu konkreten Stimmen.

Statuswerte: `draft`, `scheduled`, `active`, `paused`, `ended`, `archived`.
Start und Ende werden serverseitig geprüft; das Ende ist exklusiv. Ein Entwurf
ist niemals über öffentliche API/Export zugänglich. Archivierte Umfragen
verschwinden aus der Übersicht, behalten aber ihre bestehende Detail-URL.
Ergebnisse bleiben auch dort an die konfigurierte Sichtbarkeit gebunden.

Nach der ersten Stimme sind Frage und Antwortbeschriftungen gesperrt, um alte
Stimmen nicht rückwirkend umzudeuten. Die Reihenfolge darf geändert werden.
Für eine neue inhaltliche Fassung wird die Umfrage dupliziert. Nach der ersten
Veröffentlichung ist der Slug unveränderlich.

Auf ausdrücklichen Ergänzungsauftrag ist optionales **internes** Feedback
implementiert (Schema-Version 2). `feedback_enabled` wird je Umfrage eingestellt;
bei der ersten Wirkungsticker-Umfrage ist es aktiviert. Es gibt keine öffentliche
Kommentarspalte und keine automatische Weitergabe der Kommentare. Eine Stimme
wird unabhängig von Kommentar, Kommentarfehler oder ausgelassenem Feedback
gespeichert. Feedback setzt eine bereits gespeicherte eigene Stimme voraus.

## API

Basis: `https://130.162.217.58.sslip.io` (bestehender eigener API-Dienst).

| Methode/Pfad | Funktion |
| --- | --- |
| `GET /api/polls` und `/api/polls/export` | Nur veröffentlichte Umfragemetadaten, niemals Votes oder Counts |
| `GET /api/polls/{slug}` | Umfrage, eigener Stimmstatus, nur erlaubte Ergebnisse |
| `POST /api/polls/{slug}/vote` | JSON `{ "option_id": "UUID" }`, atomare Abstimmung |
| `GET /api/polls/{slug}/results` | Derselbe serverseitige Sichtbarkeitsschutz |
| `POST /api/polls/{slug}/feedback` | Optionales internes Feedback, JSON `{ "text": "…" }`, Vote-Token erforderlich |
| `GET /api/admin/polls` | Privilegierte Übersicht mit Stimmenzahlen |
| `POST /api/admin/polls` | Umfrage anlegen |
| `GET /api/admin/polls/{id}` | Entwurf/Vorschau einschließlich Ergebnissen |
| `PATCH /api/admin/polls/{id}` | Bearbeiten/Status ändern, aktuelle `revision` erforderlich |
| `POST /api/admin/polls/{id}/duplicate` | Neuer Entwurf mit neuen IDs, ohne Stimmen |
| `DELETE /api/admin/polls/{id}` | Titel und Revision bestätigen, Umfrage einschließlich Stimmen löschen |
| `DELETE /api/admin/polls/{id}/votes` | Nur pausiert/beendet/archiviert, Revision und `STIMMEN LÖSCHEN` bestätigen |
| `GET /api/admin/polls/{id}/feedback?offset=0` | Internes Feedback, 50 Einträge pro Seite |
| `PATCH /api/admin/polls/{id}/feedback/{feedback-id}` | Status `new`, `read` oder `archived` setzen |
| `DELETE /api/admin/polls/{id}/feedback/{feedback-id}` | Bestätigung `FEEDBACK LÖSCHEN`; Stimme bleibt erhalten |

Die anonyme Browserkennung wird nur als `X-Poll-Vote-Token` gesendet, nie in
URLs. Admin-Anfragen verwenden das bestehende Community-Bearer-Token.
Fehler sind strukturiert (`error`, `code`); interne SQL-/Secret-Details werden
nicht ausgegeben. Eine zweite Stimme liefert 409 plus den bereits gespeicherten
Stimmstatus. Stimmenzahlen aus Client-Parametern werden niemals übernommen.

`always` zeigt Ergebnisse sofort; `after_vote` nur bei nachgewiesener eigener
Stimme; `after_end` erst nach Ende. Diese Regel gilt auch bei direktem API-Aufruf.
Null Stimmen ergeben 0 %, nicht NaN. Eine Nachkommastelle mit größtem Rest sorgt
für eine konsistente Summe von 100 % bei vorhandenen Stimmen.

## Vote-Schutz und Sicherheit

- Erst beim Abstimmen erzeugt der Browser je Umfrage eine zufällige 256-Bit-ID.
  LocalStorage-Schlüssel: `woek_poll_vote:{poll-id}`, Ablauf nach einem Jahr.
  Der Server speichert nur HMAC-SHA256 mit privatem Pepper und Poll-ID.
- Reload und parallele Requests können denselben Identifier nicht zweimal
  verwenden: `BEGIN IMMEDIATE` plus Unique Constraint. Mehrere Umfragen haben
  keine verknüpfbare gemeinsame Abstimmungskennung.
- Pro gepeppertem Netzwerk-Zeitfenster: 180 API-Anfragen/Minute,
  60 Admin-Anfragen/Minute, 12 Vote-Versuche/Minute und 60/Stunde. Geteilte
  Netzwerke können diese Limits gemeinsam erreichen; dies ist ein Kompromiss,
  keine Identifikation einzelner Menschen.
- Feedback hat zusätzlich ein eigenes Limit von 5 Versuchen/Minute und
  20/Stunde sowie genau einem gespeicherten Kommentar je anonymer Stimme.
  Leere und zu lange Kommentare werden abgewiesen. Wiederholte identische
  Übermittlungen nach einem Timeout erzeugen keinen zweiten Kommentar.
- Browserdaten löschen, ein anderes Gerät oder ein anderes Netzwerk können
  den einfachen Schutz umgehen. Das ist keine manipulationssichere Wahlplattform
  und keine repräsentative Stichprobe. Kein Fingerprinting.
- Keine Cookie-Authentifizierung für die Poll-API; `credentials: omit`.
  Schreibende Requests brauchen JSON und exakt erlaubten Origin. Daher keine
  zusätzliche implizit mitsendbare Admin-Session/CSRF-Cookie. Das vorhandene
  Community-Token wird weiterhin nach dessen bestehendem Verfahren validiert.
- CORS nur Hauptdomain und www. HTTPS, kein Wildcard-Origin, kein Token im
  Client-Bundle. Admin: aktuelle Discord-Mitgliedschaft plus Server-Inhaberschaft
  oder Administrator-Berechtigung; optional engere explizite Benutzerliste.
- Eingaben mit Größenlimits, 2-8 eindeutigen Optionen, sicheren Links;
  parametrisierte SQL-Abfragen und Textausgabe statt ungesichertem HTML.
- `X-Real-IP` wird nur bei ausdrücklich aktiviertem Vertrauen und einer
  Loopback-Verbindung akzeptiert. Der eigene TLS-Proxy muss den Header ersetzen.
  Vom Internet gelieferte X-Forwarded-For-Werte reichen nicht aus.

## Datenschutz und Aufbewahrung

Die Umfrage verlangt keine Namen, E-Mail-Adressen oder Konten. Sie baut keine
externen Tracker ein und vermischt Website-Analytics nicht mit Stimmen.

| Daten | Zweck | Aufbewahrung |
| --- | --- | --- |
| Option, Poll-ID, gepepperte Browserkennung, Stimmzeit | Zählung und einfache Dublettensperre | Bis Löschung der Stimmen oder Umfrage durch Administration |
| Optionaler Kommentar, Stimmverknüpfung, Zeit, Bearbeitungsstatus | Ausschließlich interne Auswertung freiwilligen Feedbacks | Bis einzelne Löschung bzw. Löschung der zugehörigen Stimmen oder Umfrage |
| Zufallstoken im eigenen Browser | Eigene Stimme beim Wiederaufruf erkennen | Ein Jahr oder bis Browserdaten gelöscht werden |
| Gepepperter IP-/Zeitfensterschlüssel und Zähler, separate DB | Technischer Missbrauchsschutz | Maximal eine Stunde plus bis zu fünf Minuten Bereinigungsintervall |
| Öffentliche Umfragemetadaten | Anzeige, Suche, Linkvorschau | Solange veröffentlicht; Git-Verlauf enthält frühere öffentliche Fassungen |
| Konsistente Poll-Backups | Wiederherstellung nach Defekt | Sieben Tage; Anti-Abuse-Daten werden nicht gesichert |

Die Anwendung protokolliert weder Klartext-IP noch Vote-Token, Authorization-
Header oder konkrete Stimmen. Die IP liegt nur flüchtig für die Ableitung des
Abuse-Schlüssels vor. Die produktive Caddy-Konfiguration wurde am 4. September
2026 geprüft: kein Request-Access-Log, eigener Poll-Handler ersetzt `X-Real-IP`
vor der Weitergabe über Loopback. Die übrigen API-Routen blieben erhalten.

Technische Kennungen sind datensparsame Pseudonyme, keine Garantie rechtlicher
Anonymität. Rechtsgrundlage und endgültiger Veröffentlichungstext werden von
der verantwortlichen Betreiberin festgelegt; diese technische Dokumentation
ersetzt keine Rechtsberatung.

### Konkreter Vorschlag für einen ergänzenden Abschnitt der Datenschutzerklärung

> **Online-Umfragen.** Bei der freiwilligen Teilnahme an unseren Online-Umfragen
> speichern wir die ausgewählte Antwort, die zugehörige Umfrage, den Zeitpunkt
> und eine zufällige, je Umfrage kryptografisch abgeleitete
> Browserkennung. Namen oder E-Mail-Adressen werden nicht abgefragt. Die
> Kennung hilft, einfache Mehrfachabstimmungen zu verhindern, und wird im
> Browser für höchstens ein Jahr gespeichert. Zur Missbrauchsbegrenzung werden
> Netzwerkadressen nur flüchtig verarbeitet und als gepepperte zeitlich
> begrenzte Prüfschlüssel in einer getrennten Datenbank vorgehalten; diese
> werden nach höchstens einer Stunde zuzüglich fünf Minuten Bereinigungszeit
> gelöscht. Die Umfragefunktion verwendet kein Fingerprinting und keine
> externen Analyse- oder Polling-Dienste. Stimmen werden bis zur Löschung der
> jeweiligen Umfrage oder ihres Stimmenbestands gespeichert; Sicherungskopien
> laufen nach sieben Tagen aus. Die Verarbeitung erfolgt auf unserer eigenen
> Server-Infrastruktur. Die Umfrageergebnisse sind nicht automatisch
> repräsentativ. Die allgemeinen Kontaktdaten und Betroffenenrechte dieser
> Datenschutzerklärung gelten auch für die Umfragefunktion.

> **Optionales internes Feedback.** Nach der Abstimmung kannst Du freiwillig
> einen Kommentar von höchstens 1.500 Zeichen senden. Er wird nicht öffentlich
> angezeigt, sondern mit Deiner anonymen Stimme und einem Zeitpunkt verknüpft
> ausschließlich für die interne Auswertung gespeichert. Die Betreiberin kann
> den Kommentar zusammen mit der gewählten Antwort lesen und löschen. Eine
> Registrierung ist nicht erforderlich. Bitte gib keine Namen, Kontaktdaten
> oder sensiblen Angaben ein. Kommentare bleiben bis zu ihrer Löschung oder
> der Löschung der zugehörigen Stimmen bzw. Umfrage gespeichert; Sicherungen
> laufen nach sieben Tagen aus. Die Stimmabgabe hängt nicht vom Feedback ab.

Der Vorschlag überschreibt die bestehende Datenschutzerklärung **nicht**.
Vor Übernahme Rechtsgrundlage, Serverstandort und tatsächliche Log-Einstellungen
prüfen. Auf jeder Umfrageseite steht zusätzlich ein technischer Kurzhinweis.

## Admin-Bedienung

1. `/admin/umfragen/` öffnen und über das vorhandene Discord-/Community-Konto
   anmelden. Normale Server-Mitgliedschaft allein berechtigt nicht zur Verwaltung.
2. „Neue Umfrage“ wählen. Titel, eindeutigen Slug, Frage und mindestens zwei
   Antworten eingeben. Antworten können mit Auf-/Ab-Schaltflächen sortiert werden.
3. Optional Einleitung, Start/Ende, eigenes Titelbild als Website-/Release-URL,
   CTA und weiterführenden Link ergänzen. Standard: Ergebnisse nach eigener Stimme.
4. Speichern und Vorschau öffnen. Die Vorschau gibt keine echte Stimme ab.
5. Veröffentlichen oder mit zukünftigem Startdatum planen. Den Hinweis zur
   öffentlichen Seitenveröffentlichung abwarten; erst danach den stabilen Link teilen.
6. Bei Bedarf pausieren, fortsetzen, beenden oder archivieren. „Duplizieren“
   erstellt eine neue, unabhängige Umfrage ohne alte Stimmen.
7. Löschaktionen sind ausdrücklich zu bestätigen. Archivierung ist die
   nicht-destruktive Alternative und hält den bisherigen Link erreichbar.
8. Im Bereich „Feedback“ stehen die internen Kommentare mit Datum, Uhrzeit und
   gewählter Antwort. „Als gelesen markieren“, „Archivieren“ und „Als neu
   markieren“ ändern nur den Bearbeitungsstatus. „Feedback löschen“ entfernt nur
   diesen Kommentar, nicht die Stimme. Weiteres Feedback kann nachgeladen werden.

Native Teilen-Funktion ist auf unterstützten Smartphones verfügbar. „Link
kopieren“ funktioniert sonst über Clipboard beziehungsweise ein auswählbares
Linkfeld. Öffentliche HTML-Metadaten sind ohne JavaScript lesbar; das bestehende
CI-Icon ist der Standard für Linkvorschauen, ein eigenes Titelbild überschreibt es.
Externe Plattformen können ihre Vorschaubilder länger zwischenspeichern.

## ENV und bestehende Anmeldung

Siehe `ops/polls/polls.env.example`. Reale Werte ausschließlich in der bestehenden
geschützten Server-Umgebung, nicht in Git, Website-Dateien oder CI-Ausgaben.

- `POLLS_ENABLED=true`: Modul aktivieren, standardmäßig ausgeschaltet.
- `POLLS_DATABASE_PATH`, `POLLS_ABUSE_DATABASE_PATH`: getrennte absolute private Pfade.
- `POLLS_TOKEN_PEPPER`, `POLLS_ABUSE_PEPPER`: zwei verschiedene zufällige Secrets,
  mindestens 32 Zeichen. Token-Pepper unverändert mit Backups sicher aufbewahren;
  ein unvorbereiteter Wechsel würde alte Dublettensperren ungültig machen.
- `POLLS_BACKUP_DIRECTORY`: eigener absoluter privater Sicherungsordner.
- `POLLS_TRUST_LOCAL_PROXY=true`: erst nach Kontrolle des lokalen TLS-Proxys.
- `POLLS_ADMIN_DISCORD_IDS`: optionale engere Liste bestehender Discord-IDs.
- `POLLS_PUBLIC_EXPORT_URL`: optional ausschließlich für den Metadaten-Sync;
  Standard ist der eigene API-Endpunkt. Kein Secret nötig, nur öffentliche Daten.

Discord-Bot-Token, Guild-ID und Signaturprüfung kommen aus der vorhandenen
Backend-Konfiguration. Keine neue Benutzerverwaltung, keine zweite OAuth-App.

## Backend-Integration und Deployment

1. Aktuellen Serverstand frisch lesen, Dienstbenutzer, Node-Version, Proxy und
   bestehende Dateien inventarisieren. Keine alte lokale Backend-Kopie deployen.
2. Backup der betroffenen API-Quelldatei, ihres kompilierten Outputs und der
   Serverkonfiguration erstellen; eine vorhandene Poll-DB konsistent sichern.
3. Inhalt von `ops/polls/backend/` nach `/opt/faktencheck-bot/polls/` übernehmen.
   Der folgende minimale Hook erweitert `src/http/apiServer.ts`:

   ```ts
   import { createPollApi } from "../../polls/api.mjs";
   // Innerhalb startApiServer(), vor createServer():
   const pollApi = createPollApi({
     authenticate: request => readCommunitySessionFromRequest(request, config),
     discordToken: config.token,
     guildId: config.guildId,
   });
   // Als erste Zeile des asynchronen Request-Handlers, vor allgemeinem CORS/OPTIONS:
   if (await pollApi(request, response)) return;
   ```

   Der vorhandene Compiler gibt `dist/src/http/apiServer.js` aus. Deshalb müssen
   dieselben versionierten `.mjs`-Dateien auch in `dist/polls/` liegen. Den Copy-
   Schritt dauerhaft in den bestehenden Backend-Build integrieren, nicht nur
   einmal manuell ausführen. Die beiliegende `.d.mts` beschreibt den TS-Vertrag.
4. Bestehende ENV um neue private Werte ergänzen; Dateirechte restriktiv halten.
   Keine anderen Werte ersetzen. Proxy-Header/Logging gezielt prüfen und anpassen.
5. Im Backend-Verzeichnis ausführen:

   ```sh
   node --env-file=.env polls/manage.mjs migrate
   node --env-file=.env polls/manage.mjs check
   node --env-file=.env polls/manage.mjs seed
   ```

   `seed` überschreibt eine bereits vorhandene erste Umfrage nicht. Migrationen
   sind versioniert und transaktional. Backendsyntax, vorhandene Backend-Tests
   und Compile vor dem Dienstneustart prüfen.
6. Poll-API, Admin-Verweigerung ohne Token und bestehende API-Funktionen prüfen.
   Den Backup-Timer einrichten; siehe nächster Abschnitt.
7. Website: `npm run polls:sync`, Tests, vollständiger bestehender Build mit
   PDF-Verifikation und Artefakt-/Privacy-Checks. Commitgebunden über den
   vorhandenen GitHub-Pages-Workflow veröffentlichen. Keine neuen Vercel-Builds.
8. Öffentliche erste URL, Suche, Footer, Social-Metadaten, Mobilansicht und Admin
   prüfen. Für echte produktive End-to-End-Tests eine eindeutig bezeichnete
   kurzlebige Testumfrage verwenden; Teststimmen nicht in die echte erste
   Feedback-Umfrage mischen. Produktive Testdaten anschließend gezielt entfernen.

## Backup und Restore

`node --env-file=.env polls/backup.mjs` erzeugt mit `VACUUM INTO` eine konsistente
SQLite-Sicherung auch bei laufendem Dienst. Das Skript rotiert ausschließlich
seine eigenen `polls-<UTC-Zeit>.sqlite`-Dateien nach sieben Tagen. Die
Anti-Abuse-Datei wird niemals gesichert. Rechte: Daten-/Backup-Ordner 0700,
SQLite-Dateien 0600; nur der bestehende Dienstbenutzer darf zugreifen.

Ein täglicher systemd-Timer (`woek-polls-backup.timer`) führt diesen Befehl mit
WorkingDirectory `/opt/faktencheck-bot` und dem Dienstbenutzer `ubuntu` aus.
Timer aktiv, erste Sicherung am 4. September 2026 erfolgreich (`Result=success`).
Zeitplan: 02:20 UTC, bis zu fünf Minuten Streuung. Eine weitere verschlüsselte Kopie
darf nur in den vorhandenen privaten Oracle-Backup-Prozess aufgenommen werden,
nicht in GitHub Releases, Website-Artefakte oder Vercel-Speicher.

Restore erfolgt bewusst nicht über die öffentliche API:

1. Dienst stoppen und aktuellen Datenordner einschließlich WAL/SHM in einen
   genau benannten, privaten Wiederherstellungs-Sicherungsordner verschieben.
   Niemals eine laufende SQLite-Datei allein überschreiben.
2. Die ausgewählte konsistente Sicherung zunächst separat mit
   `PRAGMA integrity_check` und `PRAGMA foreign_key_check` prüfen.
3. Nur die geprüfte Sicherung an den konfigurierten Poll-DB-Pfad kopieren,
   Besitzer und 0600-Rechte wiederherstellen. Den zugehörigen Token-Pepper
   beibehalten. Eine neue leere Anti-Abuse-Datei darf erzeugt werden.
4. Seit dem Sicherungszeitpunkt erfolgte Löschungen erneut anwenden, bevor der
   Dienst öffentlich erreichbar wird. Keine bereits gelöschten Altbestände wieder ausliefern.
5. `manage.mjs check`, Dienststart, API- und Ergebnisprüfung durchführen.
   Danach öffentlichen Metadaten-Snapshot synchronisieren.

Backups sind gegen versehentlichen Defekt, nicht gegen Verlust des gesamten
Servers geschützt, solange keine bestehende externe Oracle-Sicherung sie erfasst.
Off-Host-Status am 4. September 2026: keine zusätzliche externe Sicherung für
diesen neuen Datenbestand eingerichtet oder nachgewiesen. Dies bleibt ein
offener Betriebs-Härtungspunkt; die tägliche Sicherung liegt auf demselben Server.

## Löschen

Der Admin kann eine Umfrage mit Titelbestätigung vollständig löschen. Optionen,
Stimmen und verknüpftes Feedback verschwinden atomar per Fremdschlüssel-Kaskade; ein veröffentlichter
Slug bleibt gesperrt. Der nächste Sync ersetzt die frühere Seite durch einen
inhaltsleeren `noindex`-Hinweis und entfernt sie aus Suche/Übersicht/Sitemap.
Öffentlich bereits verbreitete Screenshots, Suchmaschinen-Caches und Git-Verlauf
lassen sich dadurch nicht rückwirkend entfernen.

Alternativ können nach Pausieren/Beenden die Stimmen einschließlich verknüpftem
Feedback gelöscht werden (Bestätigung `STIMMEN LÖSCHEN`). Browserkennungen werden danach nicht mehr als
abgestimmt erkannt. Alte Backups laufen spätestens nach sieben Tagen aus;
Restore muss zwischenzeitliche Löschungen beachten. Eine gezielte vorzeitige
Backup-Löschung ist nur nach Prüfung konkreter Sicherungsdateien durchzuführen.

## Entwicklung und Prüfstand

```sh
npm run polls:test
npm run polls:dev
```

Der Dev-Server bindet ausschließlich `127.0.0.1:8789` und verwendet eine eigene
temporäre **dateibasierte** Testdatenbank in `outputs/poll-acceptance-*`.
`/__test__/login` ist ausschließlich dort ein expliziter synthetischer
Test-Login, nicht Bestandteil des Produktionsservers oder öffentlichen Builds.

Bisher bestanden: 26 automatisierte Store-/API-/HTML-Tests unter Node 26 und
Node 22.23.1, darunter sechs parallele Abstimmungsprozesse mit exakt einer
gespeicherten Stimme. Lokal im Browser geprüft: Tastatur-Abstimmung, Ergebnis,
Reload-Dublettenschutz, Admin-Anlegen/Vorschau/Veröffentlichen/Pausieren,
390-Pixel-Mobilansicht ohne horizontales Überlaufen; keine Browserfehler.

Die Backend-Integration wurde aus einem frischen Server-Snapshot entwickelt und
mit den bestehenden 39 Backend-Tests, Lint und TypeScript-Build geprüft, lokal
und auf dem Server. Backend-Quellstand: `01d59247a3`; private Sicherung der alten
Konfiguration unter `/opt/faktencheck-bot/deploy-backups/polls-01d59247a3/`.
Migration auf Schema 2, Integrität, Foreign Keys, Seed, Dienstneustart und
Backup-Timer sind abgeschlossen. Private Datenpfade:

- `/opt/faktencheck-bot/data/polls/polls.sqlite`
- `/opt/faktencheck-bot/data/polls/abuse.sqlite`
- `/opt/faktencheck-bot/backups/polls/`

`ops/polls/live-smoke.mjs` prüfte über die echte öffentliche HTTPS-API mit einer
separaten kurzlebigen Testumfrage: CORS, Admin-Verweigerung ohne Anmeldung,
Ergebnis-Sichtbarkeit, Stimme ohne Kommentar, zweite Stimme, leeres Feedback,
internes Feedback, Lesen/Archivieren/Löschen und unveränderte Stimmenzahl.
Testumfrage, Optionen, Stimme und Kommentar wurden vollständig gelöscht; nur
die zufällige ehemalige Test-URL bleibt gegen Wiederverwendung reserviert.
Die echte Wirkungsticker-Umfrage blieb bei **0 Stimmen**.

Der vollständige Website-Build mit PDF-Verifikation ist bestanden. Das neue
Artefakt-Gate prüft ausdrücklich, dass die öffentlichen `.js`-Module ausgeliefert
werden, während Backend, Secrets und private Quelldateien nicht im Artefakt liegen.
Pages-Deployment und Live-Browser-Abnahme einschließlich der bestehenden
Discord-Anmeldung sind abgeschlossen. Die echte Administration zeigte eine
aktive Umfrage mit 0 Stimmen. Öffentliche Seite, Module, CTA und Canonical/OG
lieferten HTTP 200; vier Antwortoptionen, verborgene Ergebnisse vor der Stimme
und 390-Pixel-Ansicht ohne horizontales Überlaufen wurden live geprüft. Keine
Browserfehler. Die Abnahme fügte der echten Umfrage keine Teststimmen hinzu.

Erstes vollständiges Pages-Release: `caa7701c0b15ea6985bc17f577d68728463b8980`,
Actions-Lauf `33854959682`, erfolgreich. Die Absicherung der Footer-Verlinkung
auch bei schnellen Ticker-Releases wurde mit `bf41b309d79fc81dad03028ec64287c462f66985`
und erfolgreichem Lauf `33856652944` veröffentlicht. Externe Sicherung bleibt
der oben dokumentierte offene Betriebs-Härtungspunkt.
