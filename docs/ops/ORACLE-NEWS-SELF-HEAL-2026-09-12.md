# Oracle Nachrichtenbetrieb: begrenzte Selbstheilung

Die Bridge brach am 12.09.2026 um 04:42 und 04:51 UTC mit
`JavaScript heap out of memory` ab. Der private Server las alle Queue-Datensätze
einschließlich großer Staging-Inhalte ein, bevor er die Staging-Daten entfernte.
19 automatische Neustarts lösten diese Ursache nicht. GitHub-Import und Discovery
erhielten abgeschnittenes JSON oder HTTP 502. Die technische Erreichbarkeit allein
belegte zu keinem Zeitpunkt einen funktionierenden Redaktionsdurchsatz.

Die geprüfte Serverkorrektur entfernt Staging bereits in SQLite und beantwortet
Remote-Abfragen mit höchstens 20 Datensätzen pro Seite. Speicher- und CPU-Limits
bleiben bestehen. Die Datenbank wurde über die SQLite-Backup-API gesichert und
mit `integrity_check` geprüft. Bestehende Freigaben und Aufträge bleiben erhalten.

## Unabhängig vom Mac

`woek-news-self-heal.timer` startet auf dem vorhandenen Oracle-Server jede Minute
einen kleinen Python-Prüfer. Es entstehen keine zusätzlichen Ressourcen oder
kostenpflichtigen Aufrufe. Maximal 64 MiB RAM und 10 Prozent einer CPU; kein
dauerhaft laufendes Sprachmodell. Die vorhandenen GitHub- und Oracle-Takte sowie
die ChatGPT-Redaktionsworker bleiben zuständig für die Inhalte.

Der Prüfer kontrolliert Bridge, Redaktionsdienst, kleine SQL-Aggregate, frische
Worker-Belege und alle fünf Minuten den tatsächlichen öffentlichen JSON-Feed.
Neue Nachrichten werden nach `date_published` gezählt; Analysen und Änderungen
alter Beiträge erhöhen diese Zahl nicht. Import-ACK und öffentlich sichtbare
Nachrichten werden getrennt gezählt. Der private Bericht liegt unter
`/var/lib/woek-news-bridge/self-heal/status.json`; das Journal enthält nur
Statuscodes und Reparaturaktionen, keine Manuskripte oder Zugangsdaten.

## Begrenzte automatische Reparaturen

- Nach drei fehlgeschlagenen lokalen HTTP-Prüfungen: Neustart ausschließlich des
  betroffenen bestehenden Dienstes, falls beide echten SQLite-Lanes frei sind.
- Laufende Writer werden nicht über ein Alter oder einen Timeout enteignet.
  Neustartversuche werden vor der Aktion gespeichert: höchstens drei pro Stunde,
  mindestens zehn Minuten Abstand. Auch ein gescheiterter Versuch zählt.
- Bei offener Nachrichtenqueue und seit 90 Minuten fehlender neuer öffentlicher
  Nachricht: eigener Befund `PUBLICATION_STALLED`, auch bei gesunden HTTP-Probes.
  Alle zehn Minuten darf der vorhandene Output-Detektor angestoßen werden. Er
  startet den Import nur für wirklich vorhandene Ausgaben. Keine neue Pipeline.
- Fehlende oder veraltete ChatGPT-Belege bleiben `EDITORIAL_WORKER_STALE`.
  Der Server kann einen fehlenden redaktionellen Artikel nicht durch einen
  Neustart herstellen und behauptet dafür keinen Wiederherstellungserfolg.

Keine Änderung an Queue-Inhalten, Claims, Quellenrechten, Hash-Bindung, MPD,
Publikationsgates oder persönlicher Zustimmung. Quellenfehler und fachliche
Reparaturen bleiben Aufgabe der bestehenden wiederaufnehmbaren Verarbeitung.
Die technische Selbstheilung ist keine Garantie von 15 bis 20 Artikeln je Stunde.
Dieser Durchsatz muss an tatsächlich veröffentlichten Artikeln gemessen werden.

## Installation und Rückfall

Geprüftes Skript commitgebunden nach `/usr/local/lib/woek-news-self-heal/`
installieren, die beiden Unit-Dateien aus `ops/news-self-heal/` nach systemd
übernehmen, `systemd-analyze verify`, einmaligen Testlauf und erst dann
`systemctl enable --now woek-news-self-heal.timer`. Bestehende Units nicht ersetzen.
Bei Problemen nur den neuen Timer deaktivieren; die Nachrichtenpipelines bleiben
unverändert aktiv. Ein Datenbank-Rollback erfolgt nie automatisch.

Validierung: `python3 -m unittest discover -s tests/ops -p 'test_news_self_heal.py'`.
Die Tests prüfen insbesondere echte SQLite-Sperren, Reparaturlimits, ausbleibende
Publikation trotz gesundem Server und die getrennte Zählung von Nachrichten.
