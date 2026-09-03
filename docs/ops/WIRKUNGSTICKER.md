# Wirkungsticker: Betrieb und Architektur

Der Wirkungsticker veröffentlicht als eigenständiges Produkt unter `/wirkungsticker/` eine kleine Zahl quellengebundener Wirkungsnachrichten. Die stabilen Detailadressen liegen unter `/wirkungsticker/<story-slug>/`, die Feeds unter `/wirkungsticker/feed.xml`, `/wirkungsticker/feed.atom` und `/wirkungsticker/feed.json`. Alte Ticker-Adressen unter `/news/` leiten auf die neuen Ziele weiter oder liefern vorübergehend einen kompatiblen Feed. `/news/` selbst bleibt ausschließlich das Portal „Neues aus der Wirkungsökonomie“ mit einem eigenen RSS-Feed unter `/feeds/neuigkeiten.xml`.

Der Ticker nutzt keine neue Datenbank und keinen neuen KI-Anbieter: Der kanonische Zustand liegt versioniert in `data/news/`, die Analyse läuft über die bestehende Oracle-WÖk-KI (`/api/woek-ai`), die Auslieferung über den vorhandenen statischen GitHub-Pages-Build.

## Datenfluss

1. `content/news/source-registry.json` definiert freigegebene amtliche RSS-/Atom-Feeds. Der Import akzeptiert nur HTTPS, prüft Host und DNS gegen private Adressen, begrenzt Redirects, Laufzeit und Datenmenge und übernimmt ausschließlich Feed-Metadaten und Kurztexte.
2. `scripts/news/run.mjs` normalisiert URLs und Texte, dedupliziert unveränderte Einträge, bildet zeitlich und semantisch begrenzte Story-Cluster und berechnet lokal Relevanz, Themen, Dimensionen, Status und Analyseart.
3. Nur Primärquellen-Storys oberhalb der dynamischen Budgetschwelle gehen in einem kleinen Batch an die bestehende WÖk-KI. Quelleninhalte sind als `UNTRUSTED_SOURCE_DATA` gekapselt. Die KI darf nur gelieferte Claims verwenden.
4. Das automatische Qualitätsgate prüft Schema, Claim-Ledger, Primärquelle, Unsicherheit, Kausalitätsgrenzen, Terminologie, ungestützte Zahlen, Textübernahme, HTML und verbotene Personen-/Parteienbewertungen. Fehler schließen die Veröffentlichung aus (`fail closed`).
5. `scripts/news/build.mjs` erzeugt die Ticker-Übersicht unter `/wirkungsticker/`, Storyseiten, RSS, Atom, JSON Feed und eine öffentliche reduzierte JSON-Datei. Frühere Storyversionen bleiben im internen versionierten Datensatz erhalten.

Die Übersicht zeigt zunächst höchstens zehn Karten und lädt weitere Ergebnisse in Zehnerschritten nach. Eine lokale Suche filtert die bereits veröffentlichten Ticker-Inhalte ohne zusätzlichen Dienst; für die Suche über die gesamte Website wird derselbe Begriff an die bestehende WÖk-Suche übergeben. Die Themenfilter brechen innerhalb der verfügbaren Breite um und erzeugen keinen horizontalen Scrollbereich.

Jede Detailseite trennt den Faktencheck vom Folgencheck und formuliert beide als lesbare Einordnung aus. Nach dem Prinzip „Wahrheit zuerst“ beginnt der Faktencheck mit dem belastbar bestätigten Sachverhalt; erst danach folgen ausdrücklich markierte Behauptungen, offene Punkte und Prüfgrenzen. So soll bloße Wiederholung keinen falschen Wahrheitseindruck erzeugen. Der Faktencheck nennt außerdem Primärquellen- und Claim-Ledger-Basis sowie Evidenzgrad. Der Folgencheck setzt bei diesem gesicherten Ausgangspunkt an und formuliert Wirkmechanismus, mögliche Folgen erster bis dritter Ordnung sowie Risiken und Gegenläufe. Er bleibt als Analyse gekennzeichnet, nicht als Wirkungsnachweis.

## Installierbare Web-App und Meldungen

`wirkungsticker/manifest.webmanifest` macht ausschließlich den Wirkungsticker als eigenständige Web-App installierbar. Die vorhandenen WÖk-App-Icons werden wiederverwendet; `wirkungsticker/sw.js` übernimmt innerhalb des klar begrenzten `/wirkungsticker/`-Scopes Offline-Cache, Ticker-Abgleich und optionale Meldungen. Das allgemeine Portal `/news/` gehört weder zum App-Scope noch zum App-Cache.

Das Installationsangebot erscheint auf Smartphones, solange die App nicht installiert und die Einladung nicht für 30 Tage ausgeblendet wurde. Chromium-basierte Browser erhalten den nativen Installationsdialog; Safari erklärt den manuellen Weg über „Teilen → Zum Home-Bildschirm“.

Push-Benachrichtigungen sind ausschließlich Opt-in und über denselben Schalter wieder deaktivierbar. Nach Einwilligung registriert die App, soweit vom Betriebssystem unterstützt, einen periodischen Hintergrundabgleich des öffentlichen JSON Feeds. Ohne Periodic Background Sync werden neue Meldungen beim Öffnen sowie in einer laufenden App-Sitzung erkannt. Der App-Icon-Zähler nutzt die Badging API als progressive Verbesserung. Die Zustellung bei vollständig geschlossener App hängt derzeit von der Hintergrundunterstützung des jeweiligen Betriebssystems ab; ein zentraler Push-Subscription-Dienst wird erst auf der vorhandenen Oracle-Infrastruktur ergänzt und darf keine Abonnements in Git oder Vercel speichern.

## Zeitplan und Idempotenz

`.github/workflows/wirkungsticker.yml` startet stündlich rund um die Uhr und verwirft auch von GitHub verzögert begonnene Zeitpläne nicht. Die Workflow-Concurrency verhindert überlappende Läufe. Gesehene Einträge werden per kanonischer URL und Inhalts-Hash gespeichert; unveränderte Wiederholungen erzeugen weder KI-Aufruf noch neue Version. Nach einem Filterwechsel werden die letzten sieben Tage automatisch erneut geprüft. Neue Meldungen zu einer vorhandenen Story aktualisieren dieselbe lebende Akte, erhalten eine neue Analyseversion und ziehen die Akte wieder an den Anfang der Übersicht.

Jede Quelle ist isoliert. Einzelne Feedfehler werden protokolliert; erst der Ausfall aller Quellen beendet den Lauf. Ein KI-Ausfall oder unvollständiges JSON lässt Storys zurückgestellt und verändert bereits veröffentlichte Versionen nicht.

## Kostensteuerung

Der Standardrahmen liegt bei 5 USD geschätzten KI-Kosten pro Kalendermonat. Ab 70 und 85 Prozent steigen die Relevanzschwellen; ab 95 Prozent werden KI-Aufrufe gestoppt. Pro Lauf können höchstens acht Storys geprüft werden; sie gehen in stabilen Zweierpaketen an den bestehenden Dienst. Bestehende Akten mit einer neuen Entwicklung und länger wartende Kandidaten werden in der Queue priorisiert. Scheitert ein Paket technisch, werden die übrigen Kandidaten ohne weitere Aufrufe zurückgestellt. `data/news/usage.json` protokolliert Anbieter, Modell, konservativ aus Zeichen geschätzte Token und Kosten. Die Sätze für GPT-5.5 sind als konfigurierbare Schätzwerte dokumentiert; maßgeblich bleibt die tatsächliche Abrechnung des bestehenden Oracle-Dienstes.

Konfiguration: `WOEK_NEWS_MONTHLY_AI_BUDGET_USD`, `WOEK_NEWS_MAX_AI_STORIES_PER_RUN`, `WOEK_NEWS_AI_BATCH_SIZE`, `WOEK_NEWS_AI_ENABLED`, `WOEK_NEWS_API_URL`, `WOEK_NEWS_FETCH_CONCURRENCY`, `WOEK_NEWS_AI_TIMEOUT_MS`, `WOEK_NEWS_INPUT_USD_PER_MILLION`, `WOEK_NEWS_OUTPUT_USD_PER_MILLION`.

## Betrieb

```bash
npm run news:test
npm run news:run
npm run news:build
npm run news:validate
```

Ein manueller GitHub-Actions-Lauf ist möglich. Die Pipeline schreibt nur die explizit gelisteten Ticker-, Sitemap-, Suchindex- und Laufreport-Dateien zurück nach `main`; dadurch startet der bestehende Pages-Release. Commits mit `[wirkungsticker]` verwenden dort den schlanken statischen Ticker-Build und erzeugen keine Vercel-Builds. Vor Änderungen am Hosting-Workflow ist weiterhin `npm run check:hosting-cost` auszuführen.

## Qualität und Pflege

- Neue Quellen nur mit dokumentierter Institution, Feed-URL, öffentlicher Zielseite, Typ, Thema, Priorität und ausdrücklich freigegebenen Redirect-Hosts aufnehmen.
- Sekundärquellen bleiben standardmäßig deaktiviert; eine Story braucht mindestens eine Primärquelle.
- Keine Volltexte spiegeln und keine Bezahlschranken umgehen.
- Falsch-positive Zusammenführungen durch Titelähnlichkeit und Zeitfenster werden als neue Korrektur behandelt; historische Versionen werden nicht still überschrieben.
- Tests decken RSS/Atom, Normalisierung, Deduplizierung, Clustering, Relevanzfilter, Prompt Injection, SSRF, Providerfehler, strukturiertes JSON, Qualitätsgate, Budget und Sommerzeit ab.
