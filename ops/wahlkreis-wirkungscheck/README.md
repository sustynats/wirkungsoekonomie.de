# Wahlkreis-Wirkungscheck: Betrieb

Diese Konfiguration betreibt zwei getrennte Systeme auf einem Linux-Server:

- **CiviCRM** ist die dauerhafte, zugriffsgeschützte Kontakt- und Dialogdatenbank. Dort liegen
  nur Kommunikations- und Prozessdaten wie Abgeordnete, Kontaktquelle, Einladung, Rückmeldung,
  gewünschter Dialog und vereinbarte nächste Schritte.
- **LimeSurvey** ist die geschlossene Befragung. Es erhält ausschließlich neutrale, zufällige
  Zugangspässe. Es kennt weder Namen noch E-Mail-Adressen oder den Einladungsstatus.

Ergänzend arbeitet ein eigener **Analytics-Dienst** mit separater PostgreSQL-Datenbank. Er enthält
nur strikt zugelassene Nutzungsereignisse und Tagesaggregate, nie Kontakt- oder Antwortdaten.
Die öffentliche statische Website und die Institut-App werden nicht verändert.

## Bewusste Daten- und Produktgrenze

Weder CRM noch Umfrage führen einen Personen-, Fraktions- oder Gesinnungsscore. Der Report
beschreibt ausschließlich die Angaben der jeweils teilnehmenden Person, die verwendeten Daten,
Modellannahmen und mögliche Handlungsoptionen. Rückmeldungen werden als Vorgänge dokumentiert,
nicht als politische Bewertung.

Für die Startphase bleibt die Verbindung bewusst getrennt und prüfbar:

1. Aktuelle Bundestags-Stammdaten in CiviCRM importieren und gegen die offizielle Quelle prüfen.
2. Der noch zu implementierende Einladungsdienst erstellt einen kryptografisch zufälligen,
   gehashten Einladungs-Token und versendet die personalisierte Nachricht über IONOS SMTP.
3. Nach Einlösung gibt der Einladungsdienst nur einen neutralen, zufälligen Zugangspass an
   LimeSurvey weiter. Die Umfrage ist geschlossen und kennt keine Personendaten.
4. Der Einladungsdienst speichert höchstens den Einlösungsstatus. Antworten oder ein Rückschluss
   auf einzelne Antworten gelangen nicht in CiviCRM.

Eine automatische Synchronisation wird erst ergänzt, wenn das Datenmodell, die Umfrage,
Löschfristen und die Rechtsgrundlage final freigegeben sind. So entsteht keine unkontrollierte
Übernahme politisch sensibler Antworten ins CRM.

## Lokaler Start

Voraussetzung ist Docker Compose. Die lokale Umgebung bindet ausschließlich `127.0.0.1`:

```bash
cd ops/wahlkreis-wirkungscheck
./scripts/create-local-env.sh
./scripts/preflight.sh
docker compose -f compose.yml -f compose.local.yml up -d --build
```

Danach:

- CiviCRM-Installation: <http://localhost:8081>
- LimeSurvey: <http://localhost:8082>
- LimeSurvey-Administration: <http://localhost:8082/index.php/admin>

Der isolierte Analytics-Dienst wird für lokale Tests bewusst nur auf ausdrückliche Aktivierung
gestartet:

```bash
./scripts/extend-local-env.sh
docker compose --profile analytics -f compose.yml -f compose.local.yml up -d --build
```

Dann ist ausschließlich der Health-Check unter <http://localhost:8083/healthz> erreichbar.
Der Ereignis-Endpunkt wird erst von der künftigen Survey-/Report-Anwendung genutzt und sammelt
ohne deren Integration keine Daten.

Bei der CiviCRM-Ersteinrichtung sind als Datenbankwerte einzutragen:

| Feld | Wert |
| --- | --- |
| Datenbank-Server | `crm-db` |
| Datenbank | Wert von `CRM_DB_NAME` |
| Benutzer | Wert von `CRM_DB_USER` |
| Passwort | Wert von `CRM_DB_PASSWORD` |
| Sprache | Deutsch |

Das CiviCRM-Administrationskonto wird in diesem Installationsdialog bewusst separat gewählt und
in einem Passwortmanager abgelegt. Der lokale LimeSurvey-Admin-Zugang steht in der nicht
versionierten `.env`.

Zum Beenden der lokalen Dienste:

```bash
docker compose -f compose.yml -f compose.local.yml down
```

`down` löscht keine Daten. Nur `down --volumes` würde die Testdaten unwiederbringlich entfernen.

## Produktionsbereitstellung

Auf dem Server liegt diese Konfiguration in einem privaten Verzeichnis. Dort:

1. Docker Engine und Docker Compose installieren.
2. Eine `.env` mit `./scripts/create-local-env.sh` erzeugen; Domains und Betreiberadresse anpassen.
3. DNS ausschließlich für `crm.wirkungsoekonomie.de` und `umfrage.wirkungsoekonomie.de` auf den
   Server zeigen lassen. Für beide sind A/AAAA-Records nötig; keine URL-Unterpfade verwenden.
4. Ports 80 und 443 öffnen, Datenbank-Ports geschlossen lassen.
5. `./scripts/preflight.sh production` und dann
   `docker compose --profile production up -d --build` ausführen. Das Profil startet auch den
   isolierten Analytics-Dienst und dessen Retention-Job.
6. HTTPS, beide Login-Seiten, den Analytics-Health-Check, die Abmeldung, Bounce-Verarbeitung und
   eine Testeinladung prüfen.

Caddy verwaltet die TLS-Zertifikate. Die Datenbanken sind ausschließlich im internen
Container-Netzwerk erreichbar. Für CiviCRM empfiehlt sich zusätzlich eine Zugriffsbegrenzung des
Administrationsbereichs über VPN oder feste Büro-IP-Adressen.

## E-Mail über deine Adresse

Die technische Absenderadresse wird nach der Installation im Einladungsdienst konfiguriert;
Passwörter gehören nicht in dieses Repository. Die eingerichtete Adresse ist
`wirkungscheck@wirkungsoekonomie.de`:

- CiviCRM verwaltet Kontakte und Dialogvorgänge, ist aber nicht der Sender dieser Einladung.
- LimeSurvey verschickt für diesen Wirkungscheck keine Einladungen und erhält keine SMTP-Zugangsdaten.

Für beide Anwendungen gelten die IONOS-Daten aus der Einrichtung:

| Einstellung | Wert |
| --- | --- |
| Sichtbarer Absender | `wirkungscheck@wirkungsoekonomie.de` |
| SMTP-Server | `smtp.ionos.de` |
| SMTP-Port | `587` |
| Sicherheit | TLS / STARTTLS |
| Anmeldung | ja, Benutzername ist die vollständige E-Mail-Adresse |
| Rückläufer / IMAP | `imap.ionos.de`, Port `993`, SSL |

Das persönliche IONOS-Mailpasswort wird erst im geschützten Einladungsdienst hinterlegt, nicht in
einer Compose-Datei oder im Repository. Rückläufer können dort über IMAP verarbeitet werden. Als
Reply-To kann zunächst dieselbe Adresse verwendet werden. Voraussetzung sind SPF, DKIM und DMARC
für die absendende Domain sowie ein SMTP-Zugang mit ausreichendem Versandlimit. Für etwa 630
Empfänger ist eine kleine Testtranche vor dem Vollversand sinnvoll.

## Betrieb nach der Ersteinrichtung

- In CiviCRM: Gruppe `Bundestag · 21. Wahlperiode`, Felder für Fraktion, Wahlkreis, Mandat,
  Datenquelle, Abrufdatum und Prüfstatus einrichten. Keine politische Bewertung als Feld.
- In LimeSurvey: geschlossene Umfrage, ein neutraler Zugangspass pro Teilnahme, Abschlussdatum
  und ein kurzes Datenschutz-/Transparenzmodul.
- Im Einladungsdienst: maximal eine sachliche Erinnerung, Sperrlisten, Rückläufer und die
  verpflichtenden Test-/Produktionsfreigaben umsetzen.
- Der vorbereitete CiviCRM-Job-Container wird erst aktiviert, wenn für spätere CRM-interne
  Abläufe eine getrennte, dokumentierte Scheduled-Job-URL existiert.

## Backups, Updates und Wiederherstellung

Ein vollständiges Backup enthält beide Anwendungsdatenbanken, die Analytics-Datenbank sowie
CiviCRM-Privatdateien/Erweiterungen und LimeSurvey-Konfiguration/Uploads:

```bash
./scripts/backup.sh
```

Das erzeugte Backup gehört verschlüsselt außerhalb des Servers gespeichert und muss vor dem ersten
Live-Versand testweise in einer separaten Umgebung wiederhergestellt werden. Vor Updates immer:

1. vollständiges Backup erzeugen und Prüfsummen kontrollieren;
2. Updates zunächst lokal oder auf einer Staging-Instanz testen;
3. Versionsstände im `compose.yml` gezielt anheben, nie blind `latest` verwenden;
4. nach dem Update Mail, Token-Link, Abmeldung, Bounce und Zugriff testen.

## Vor Livegang verbindlich prüfen

- Datenschutzerklärung, Betreiber- und Kontaktangaben, Verzeichnis der Verarbeitungstätigkeiten
  und Löschkonzept fachlich/rechtlich prüfen lassen.
- Rollen und Zugriffe im CRM auf das notwendige Team begrenzen; individuelle Konten, kein
  geteiltes Admin-Passwort, MFA wenn verfügbar.
- Keine Open-/Click-Trackingdaten als Maß für Interesse interpretieren; sie sind technisch
  unzuverlässig und datenschutzsensibel.
- Der Analytics-Collector, Retention-Job, Cohort-Schutz, Rollenmodell und die automatisierten
  Die Analytics-Tests müssen vor seiner Produktivnutzung
  vollständig geprüft sein.
- Exportrechte, Antworttexte und Freigaben beschränken; politische Freitexte benötigen einen
  besonders klaren Zugriffs- und Löschrahmen.
- Abmeldung aus künftigen Rundmails sofort respektieren; eine direkte Antwortadresse anbieten.
