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
Seit 02.10.2026 erhält die zustandslose Formatkorrektur die vollständige
abgewiesene Antwort als nicht vertrauenswürdiges Material. Sie beginnt keine
neue Recherche. Originalantwort und Reparaturantwort werden vor der Ablage
hashgebunden unter `95_LOGS/editorial-answer-*` privat gesichert und zurückgelesen.
Eine zusätzliche Quellenliste eines HOLD bleibt dort erhalten; das unveränderte
HOLD-Urteil wird ohne weiteren Modellaufruf in das bestehende Transportschema
übernommen. Andere Schemaprobleme bleiben prüfpflichtig.

Der Web-fähige Redaktionsworker entfernt den widersprüchlichen werkzeuglosen
Auftragstext ausschließlich aus seiner Prompt-Kopie. Quellen-Nachrecherchen
verlangen einen echten Suchzugriff im bestehenden Suchkontingent. Ausdrücklich
gesperrte Ausgangslinks werden nicht erneut als Textauszug geladen. Eine
Nachrecherche ohne Suchversuch wird nicht als fachlicher Quellen-HOLD zugestellt.
Technische Validierungs-/Verarbeitungsfehler machen den Lauf sichtbar fehlerhaft;
ein begründeter redaktioneller HOLD bleibt dagegen ein privater Klärungszustand,
keine Vorschau und keine Veröffentlichung. Frühere Freigaben, ACKs, Budgets und
fachliche Quellenregeln werden nicht gelockert oder automatisch zurückgesetzt.
Ein privater Discord-Hinweis wird je neuer Vorschaufassung einmal an die
konfigurierte Eigentümerin gesendet. Keine Nachricht in einen öffentlichen Kanal.

Die bestehende fünfminütige Import-/Git-Publikation übernimmt freigegebene Fassungen
unter denselben Locks. Erst der Nachweis des passenden Hash-Markers in der
öffentlichen HTML-Fassung setzt den Redaktionsstatus auf `PUBLISHED`.

## Betrieb

### Automatische Entwuerfe fuer alle beobachteten Sendungen (01.10.2026)

`data/news/show-feeds.json` bleibt die gemeinsame Sendungskonfiguration.
Natalie hat am 01.10.2026 automatische private Analyseentwuerfe fuer jede neue
Folge einer aktiv beobachteten Reihe beauftragt. Ein weiterer Einzelauftrag
oder ein zusaetzlicher Themenfilter ist nicht erforderlich. Dies ersetzt die
seit 26.09.2026 fuer Machtwechsel geltende reine Metadatenbeobachtung.
`observation_only` unterdrueckt daher keine neuen Entwurfsauftraege mehr.
Ausdruecklich deaktivierte Quellen bleiben deaktiviert; Ausschnitte werden
weiterhin nach den vorhandenen Sendungs-/Laengenkriterien unterschieden.

Die Entwuerfe laufen ueber denselben Redaktionsworker, dieselbe private Queue,
Quellenpruefung, Transkriptionsroute und dieselben unveraenderten Mengen- und
Kostenlimits. Neue Folgen werden auch am Tageslimit erkannt. Noch ausstehende
Folgen bleiben als begrenzte Metadaten im bestehenden Beobachtungsspeicher
(`github-episode-pending:<show_id>`) erhalten, wenn sich Feed oder Zeitfenster
spaeter verschieben. Dies ist keine zweite Publikationsqueue. Fehlender
Wortlaut bleibt als Wartezustand sichtbar; Shownotes ersetzen keinen Wortlaut.
Machtwechsel verlangt eine Transkriptgrundlage. Die erlaubte eigene Abschrift
greift erst nach dem bisherigen Wartefenster und innerhalb des Tageslimits.

Seit 02.10.2026 duerfen Nachholfolgen ausserhalb des regulaeren Sieben-Tage-
Fensters (bzw. eines laengeren globalen Fensters) hoechstens ein Viertel der
bestehenden taeglichen Kandidatenplaetze nutzen, mindestens einen. Die langen
Staffelfenster bleiben erhalten. Bereits angelegte automatische Auftraege des
Tages werden dabei mitgezaehlt; weder Zaehler noch Auftraege werden geloescht.
So bleiben Plaetze fuer aktuelle Folgen frei, deren Wortlaut erst spaeter
erscheint. Die gesamte Tagesgrenze und die getrennten Bezahl-/Transkriptions-
grenzen bleiben unveraendert. Zurueckgestellte Episoden werden mit Quelle,
Originaldatum und konkretem Wartegrund im Laufbericht ausgewiesen.

Alte, ausschliesslich technisch erzeugte Metadaten-HOLDs duerfen unter derselben
Job-ID zu einem Entwurfsauftrag werden, sofern noch kein Claim, bezahlter Versuch,
Output, ACK oder menschlicher Review vorliegt. Der vorherige Input-Hash und
HOLD-Grund werden im privaten Auftrag bewahrt. Menschlich bearbeitete Fassungen
und Freigaben werden niemals ersetzt. Bereits beauftragte oder veroeffentlichte
Folgen erzeugen keinen zweiten Artikel. Der normale Worker kann ein fehlendes
INBOX-Paket aus dem bereits gespeicherten Auftrag wiederherstellen.

Jeder Entwurf bleibt `manual_only: true` mit
`publication_intent: final_approval_required`. Erst Natalies fassungsgebundene
Zustimmung erlaubt die Veroeffentlichung. Buch & Wirkung bleibt manuell.
Machtwechsels offizieller RSS-Feed wurde ueber den `rel=alternate`-Link auf
`https://machtwechsel.podigee.io/291-neue-episode` sowie `atom:link rel=self`
bestaetigt: `https://machtwechsel.podigee.io/feed/mp3`.
Der bestehende Robots-Pruefer gilt vor jedem Feedabruf mit seinem regulaeren
Cache; Feed-Weiterleitungen werden nicht automatisch verfolgt.

Aktivierung: Der bestehende GitHub-Redaktionsworker liest `main`. Kein neuer
Scheduler und kein Vercel-Deployment sind erforderlich. Ruecknahme: die einzelne
Quelle auf `enabled: false` setzen; gespeicherte private Auftraege bleiben erhalten.

`scripts/ops/woek-news-editorial.service` nutzt denselben privaten Bridge-Datenpfad.
Nach der Publikationsmetadaten-Reparatur prueft der private Importer eine bereits
bezahlte Nachrichtenrecherche einmal kostenlos erneut, wenn ausschliesslich der
Nachrecherche-HOLD und ein zuvor nicht erkanntes Publikationsdatum die Fortsetzung
blockieren. Der alte HOLD samt Antwort bleibt erhalten. Nur nach erneuter regulaerer
Quellenpruefung entsteht der normale Nachrichtenauftrag; unabhängige Pruefung und
Natalies abschliessende Freigabe bleiben erforderlich.
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

Der Eingabedienst selbst startet keine Text-KI-API und keinen eigenen
ChatGPT-Weckdienst. Entwuerfe verarbeitet der bestehende GitHub-Redaktionsworker
gemaess `docs/ops/WIRKUNGSTICKER-DIREKTBETRIEB.md`; die fruehere Einschraenkung
des ChatGPT-Dateirueckschreibwegs ist keine Sperre dieser aktiven Route.
