# Wirkungsticker: Push und unabhängiger Taktgeber

Stand: 2026-09-03. Ergänzung zur Zuverlässigkeitsreparatur aus PR #342.

## Web Push

Der Oracle-Dienst unter `https://130.162.217.58.sslip.io/api/news-push` bietet
`GET /config`, `POST /subscribe`, `POST /unsubscribe` und `POST /publish`.
Abonnements bleiben privat in `/opt/faktencheck-bot/data/news-push-subscriptions.json`.
Der VAPID-Privatschlüssel und der Release-Schlüssel stehen nur in der Oracle-
Umgebung; GitHub kennt nur den Release-Schlüssel als `WOEK_NEWS_PUSH_ADMIN_TOKEN`.

Nach einem erfolgreichen ticker-only Pages-Release ruft
`scripts/news/publish-push.mjs` den Dienst auf. Ohne `public_changed` wird nichts
versendet. Die ID aus Story-URL und Änderungszeit dedupliziert erneute Release-
Aufrufe. Der Service Worker ruft beim Push den bereits veröffentlichten Feed ab,
zählt neue oder aktualisierte ungelesene Akten und aktualisiert Notification und
Badge. Öffnen der Übersicht beziehungsweise „Als gelesen“ quittiert den Stand.
Abgelaufene Endpunkte (404/410) werden gelöscht; deaktivieren ist jederzeit möglich.

Die App muss nach diesem Release einmal geöffnet werden. Bestehende Zustimmungen
werden dann mit einem echten Push-Abonnement verbunden. Auf iOS ist dafür die
installierte Home-Screen-Web-App erforderlich. Zustellung und Badge-Anzeige hängen
zusätzlich von Browser-/Betriebssystemunterstützung und Geräteeinstellungen ab.
Periodic Background Sync bleibt nur eine zusätzliche Rückfallebene.

## Oracle-Ausfallreserve für GitHub Cron

GitHub-Schedule-Ereignisse können verspätet kommen oder ausfallen. Der systemd-
Timer `woek-wirkungsticker-clock.timer` prüft alle 15 Minuten den letzten
Laufbeginn im öffentlichen Bericht. Ein Versuch in den letzten zwölf Minuten
unterdrückt einen zusätzlichen Start. Andernfalls erzeugt der Taktgeber einen
leeren Clock-Commit mit dem aktuellen Main-Baum auf dem ausschließlich dafür
verwendeten Branch `codex/wirkungsticker-clock`. Dessen Push startet denselben
Workflow; `main` wird vom Taktgeber nie verändert.

Der Schlüssel `/home/ubuntu/.ssh/woek_wirkungsticker_clock` ist ein eigener
Repository-Deploy-Key mit Schreibrecht, kein persönlicher GitHub-Token. Er liegt
mit Modus 0600 auf Oracle. Die Bare-Partial-Clone-Daten liegen in
`/var/lib/woek-wirkungsticker-clock/repository.git`. Der normale GitHub-Zeitplan
bleibt aktiv. Gemeinsame Workflow-Concurrency, persistente Queue und rollendes
Vier-Aufrufe-Stundenlimit verhindern Überlappung und überhöhten KI-Verbrauch.

Prüfung: `systemctl list-timers woek-wirkungsticker-clock.timer`,
`journalctl -u woek-wirkungsticker-clock.service` und GitHub-Actions-Laufbericht.
Der Taktgeber braucht keinen geöffneten Browser und keinen laufenden Nutzerrechner.
