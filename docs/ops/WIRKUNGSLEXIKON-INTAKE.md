# Anonyme Narrativmeldungen

Die öffentliche Seite `/wirkungslexikon/narrativ-melden/` sendet an den bestehenden Oracle-Host `https://130.162.217.58.sslip.io/api/wirkungslexikon/narrativ-melden`. Sie erhebt keinen Namen und keine E-Mail-Adresse. Wortlaut, Fundstelle und optionale Kontextangaben werden als ungeprüfter Hinweis gespeichert. Es gibt keine automatische Karte, Quellenbestätigung oder Veröffentlichung.

## Betrieb

- Eigener Dienst `woek-lexikon-intake`, Benutzer `ubuntu`, nur `127.0.0.1:8791`. Caddy leitet ausschließlich den oben genannten Pfad weiter.
- Versionierte Releases unter `/opt/woek-lexikon-intake/releases/<commit>`, atomarer Zeiger `current`.
- Private SQLite-Datenbank `/var/lib/woek-lexikon-intake/reports.sqlite`, Verzeichnis 0700, Datei 0600, WAL und synchrone Schreibsicherung. Keine Nutzerdaten im Website-Repository, in GitHub Releases oder Vercel.
- Verwendet ausschließlich die bereits vorhandene Bot-Konfiguration `/var/lib/woek-news-bridge/editorial-discord.json`. Token und Empfänger nicht protokollieren oder in Übergaben kopieren.
- Systemd: maximal 128 MB RAM, 20 % CPU, schreibgeschütztes System, Schreibzugriff nur auf das private Datenverzeichnis. Keine zusätzliche kostenpflichtige Infrastruktur.

Ein Eingang wird zuerst dauerhaft gespeichert und mit HTTP 202 quittiert. Der bestehende Bot versendet eine private Nachricht an die bereits konfigurierte Redaktionsinhaberin, einschließlich einer Textdatei mit allen Angaben. Erwähnungen und Linkvorschauen sind abgeschaltet. Discord-Ausfälle lassen den Datensatz in der Warteschlange; Wiederholung nach 30 Sekunden bis höchstens einer Stunde. Gleiche Anfragen mit identischer UUID und identischem Inhalt erzeugen keinen zweiten Eingang. Discords Nachrichten-Nonce ergänzt diese Absicherung; nach einem sehr langen mehrdeutigen Ausfall kann eine doppelte Benachrichtigung nicht absolut ausgeschlossen werden. Das Archiv bleibt maßgeblich.

## Missbrauchsbegrenzung und Grenzen

Kein Login oder CAPTCHA. Begrenzte Feldlängen, 64 KiB Übertragungslimit, Honeypot und zehn Übertragungsversuche pro Stunde und Netzwerk. Dafür werden gesalzene Netzwerkkennungen nur im Arbeitsspeicher gehalten, nicht in der Meldungsdatenbank. Caddy wird als lokaler Proxy erkannt; fremde Forwarded-Header werden nicht ungeprüft vertraut. Nur die beiden Website-Origins sind für Browser freigegeben. CORS verhindert keine direkten Skriptaufrufe; weitere Schranken können bei tatsächlichem Missbrauch ergänzt werden.

Maximal 10.000 gespeicherte Meldungen; bei Erreichen der Grenze HTTP 503 statt stiller Löschung. Die Browserseite bewahrt ihre Eingaben bei Fehlern. Ohne JavaScript zeigt sie eine klare Erklärung und den bestehenden Kontaktweg. Technische Verbindungdaten bei Hosting-Anbietern sind von der anonymen Inhaltsmeldung zu unterscheiden. Die Seite benennt die interne Speicherung und Weiterleitung an Discord. Es erfolgt keine pauschale Zusicherung vollständiger technischer Anonymität.

## Prüfen, sichern und zurückrollen

`systemctl status woek-lexikon-intake` und lokaler Abruf von `http://127.0.0.1:8791/healthz`. Den Rückstand mit einer schreibgeschützten SQLite-Abfrage nach `notified_at IS NULL` und `attempts` prüfen. Niemals den Datenbankinhalt oder Bot-Schlüssel in öffentliche Logs schreiben. Vor einer Migration eine konsistente SQLite-Sicherung mit der Backup-API erzeugen und deren Lesbarkeit prüfen; eine laufende WAL-Datenbank nicht durch blindes Kopieren nur der Hauptdatei sichern.

Beim Code-Rollback den `current`-Zeiger auf ein zuvor geprüftes Release setzen und nur diesen Dienst neu starten. Die Datenbank bleibt erhalten. Vor jeder Caddy-Änderung die vorhandene Datei sichern, den Kandidaten validieren und erst dann neu laden. Andere API-Routen und Dienste nicht ersetzen. Erstinstallation am 16.10.2026: Caddy-Sicherung `/etc/caddy/Caddyfile.before-lexikon-intake-20261016T073657`.

Eine klar als technisch bezeichnete Testmeldung wurde am 16.10.2026 mit HTTP 202 angenommen und bei Discord erfolgreich zugestellt. Es wurde keine Nachricht an fremde Personen und kein öffentlicher Kommentar versendet. Die Zustellungsbestätigung bedeutet nicht, dass die Empfängerin die Nachricht bereits gelesen hat. Prüfnachweise und Test-ID liegen in der privaten Übergabe.

## Private Forschungsregister

Die 17 Nachtragskandidaten und vier Ketten, die Breitrecherche mit 73 Kandidaten / 23 Watchlist-Themen / 43 Quellen / vier weiteren Wirkpfaden sowie Methodikentwürfe liegen ausschließlich unter dem privaten `WL_V9_BASE`. Sie verwenden getrennte Snapshot- und Ereignisverzeichnisse. Das technische Redaktionskonto speichert begründete Entwurfsrevisionen und kann keine menschlichen Freigaben setzen. Die bisherigen 180 Karten, 20 Familien und 21 Dossiers bleiben unabhängig.

Start mit `WL_VERSION=9 node scripts/wirkungslexikon/serve.mjs`; Zugriff nur über Loopback und Basic Auth. Zugangsdaten entstehen lokal in `access.json`, gehören weder in Git noch in das Übergabearchiv. Öffentliche Builds lesen ausschließlich die eingefrorene, geprüfte Publikationsrevision. Neue Forschung wird erst nach Quellenreview, Fachreview, ausdrücklicher menschlicher Einzelfreigabe und einem gesonderten Release zur öffentlichen Aufnahme vorgeschlagen.
