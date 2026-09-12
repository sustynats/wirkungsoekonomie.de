# Private Eingabe und einmalige Freigabe

Adresse: `/admin/redaktion/`. Die statische Anmeldeseite ist `noindex`; Aufträge,
Screenshots, Entwürfe und Entscheidungen sind ausschließlich über die bestehende
Discord-Anmeldung und die zusätzliche serverseitige Eigentümerprüfung erreichbar.
Eine versteckte URL ersetzt keine Authentifizierung.

Der private Dienst läuft auf Oracle, ausschließlich auf Loopback-Port 8788.
Caddy leitet nur `/api/admin/news-editorial*` dorthin. `/internal/*` bleibt ohne
öffentliche Route. Der bestehende Bridge-Dienst erreicht diese Aktionen nur nach
Prüfung des GitHub-Worker-Tokens und des laufenden Import-Locks.

## Ablauf

Freitext, Links und bis zu vier Screenshots erzeugen einen Auftrag in derselben
SQLite-Datenbank und denselben Dropbox-Lifecycle-Ordnern. Der versionierte Vertrag
heißt für neue Aufträge `editorial-request-contract-4.json`. Frühere Verträge bleiben unverändert erhalten. Recherche und vollständiger Entwurf
erfordern keine erste Freigabe. Persönliche Aussagen und Erfahrungen werden nicht
erfunden. Erst die abschließende, an den Vorschau-Hash gebundene Zustimmung erlaubt
eine Veröffentlichung. Zurückgabe erfordert einen Kommentar; eine neue Fassung
hebt die frühere Zustimmung auf. Publizierte Fassungen bleiben unveränderlich.

Manuelle Nachrichten durchlaufen zusätzlich die normalen Quellen-, Analyse- und
unabhängigen semantischen Prüfungen als native Bridge-Jobs. Bis zur finalen
Freigabe erzwingt der Importer privates Staging. Sie dürfen nicht über den
persönlichen Artikeladapter publiziert werden. Bereits erledigte Ereignisse
erhalten keine zweite Nachricht. Nicht ausreichend belegte Quellen bleiben in
der Recherche; die automatische Discovery wird dadurch nicht blockiert.

Ein fehlender Themenbezug oder eine nicht ausreichend verifizierbare Quellenbasis
ist ein redaktioneller HOLD, kein fertiger Artikel. Vertrag 4 enthält hierfür
`hold_output_schema`: Der Worker liefert im bisherigen `job_id.output.json`
eine an Job-ID und Input-Hash gebundene Rückmeldung mit `disposition: hold`,
konkretem Grund und benötigten Angaben. Sie enthält weder Vorschautext noch
fingierte Quellenfreigaben. Der Import speichert die Rückfrage privat, bestätigt
sie mit einem HOLD-ACK ohne Publikations-URL und zeigt sie bei der Einreichung an.
Es wird keine Freigabefassung und keine Veröffentlichung daraus erzeugt.

Danach darf der Worker andere passende Aufträge seines Shards im bestehenden
Laufbudget bearbeiten. Ein Connector-, Dateiexport-, Safety- oder Zugriffsfehler
bleibt dagegen ein Stoppsignal. Gesperrte Dateien werden weder erneut versandt
noch über einen anderen Transport geleitet. Ein redaktioneller HOLD ist keine
Ausweichroute für solche Sperren.

Neue Eingaben werden unter einer eigenen kurzen Intake-Sperre gespeichert.
Eine belegte Discovery-Sperre oder mehr als zwölf offene Rechercheaufträge
verhindern das Absenden nicht. Die spätere Übergabe bleibt durch die bestehende
Discovery-Sperre geschützt und wird idempotent fortgesetzt. Verarbeitungsbudget,
Dateigrenzen, Eigentümerprüfung und finale Freigabe bleiben bestehen.

Fehlerhafte Outputs gelangen mit unverändertem Originalinput in den bestehenden
begrenzten Reparaturprozess; fehlende Outputs verbrauchen keinen Versuch.
Ein privater Discord-Hinweis wird je neuer Vorschaufassung einmal an die
konfigurierte Eigentümerin gesendet. Keine Nachricht in einen öffentlichen Kanal.

Die bestehende fünfminütige Import-/Git-Publikation übernimmt freigegebene Fassungen
unter denselben Locks. Erst der Nachweis des passenden Hash-Markers in der
öffentlichen HTML-Fassung setzt den Redaktionsstatus auf `PUBLISHED`.

## Betrieb

`scripts/ops/woek-news-editorial.service` nutzt denselben privaten Bridge-Datenpfad.
Das Release-Bündel enthält `scripts/news`, `scripts/ops`, `content/news`,
`assets/data/navigation.json` und die Header-/Footer-Templates. Keine `.env` oder
Zugangswerte gehören ins Release. Discord-DM-Konfiguration liegt ausschließlich
in der geschützten privaten Datei `editorial-discord.json` (Modus 0600).

Vor Dienständerungen: SQLite-Backup mit der SQLite-Backup-API, aktuelle
Diensteinheit und Caddy-Konfiguration sichern. Neue Version zunächst über ein
Release-Verzeichnis bereitstellen, Syntax und Speicherbedarf prüfen, dann den
`current`-Link wechseln. Caddy vor Reload validieren. Bei einem Fehler auf den
vorherigen Link und die gesicherte Konfiguration zurückgehen; private Daten bleiben
erhalten. Keine Datenbankrücksetzung bei einem normalen Code-Rollback.

Keine Text-KI-API, kein neuer KI-Anbieter und kein eigener ChatGPT-Weckdienst.
Die derzeitige Einschränkung des automatischen ChatGPT-Dateirückschreibwegs bleibt
separat zu lösen; die Eingabeseite behauptet keinen durchgängigen Cloud-Lauf.
