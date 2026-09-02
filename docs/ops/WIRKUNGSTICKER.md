# Wirkungsticker: Betrieb und Architektur

Der Wirkungsticker veröffentlicht unter `/news/` eine kleine Zahl quellengebundener Wirkungsnachrichten. Er nutzt keine neue Datenbank und keinen neuen KI-Anbieter: Der kanonische Zustand liegt versioniert in `data/news/`, die Analyse läuft über die bestehende Oracle-WÖk-KI (`/api/woek-ai`), die Auslieferung über den vorhandenen statischen GitHub-Pages-Build.

## Datenfluss

1. `content/news/source-registry.json` definiert freigegebene amtliche RSS-/Atom-Feeds. Der Import akzeptiert nur HTTPS, prüft Host und DNS gegen private Adressen, begrenzt Redirects, Laufzeit und Datenmenge und übernimmt ausschließlich Feed-Metadaten und Kurztexte.
2. `scripts/news/run.mjs` normalisiert URLs und Texte, dedupliziert unveränderte Einträge, bildet zeitlich und semantisch begrenzte Story-Cluster und berechnet lokal Relevanz, Themen, Dimensionen, Status und Analyseart.
3. Nur Primärquellen-Storys oberhalb der dynamischen Budgetschwelle gehen in einem kleinen Batch an die bestehende WÖk-KI. Quelleninhalte sind als `UNTRUSTED_SOURCE_DATA` gekapselt. Die KI darf nur gelieferte Claims verwenden.
4. Das automatische Qualitätsgate prüft Schema, Claim-Ledger, Primärquelle, Unsicherheit, Kausalitätsgrenzen, Terminologie, ungestützte Zahlen, Textübernahme, HTML und verbotene Personen-/Parteienbewertungen. Fehler schließen die Veröffentlichung aus (`fail closed`).
5. `scripts/news/build.mjs` erzeugt Startseite, Storyseiten, RSS, Atom, JSON Feed und eine öffentliche reduzierte JSON-Datei. Frühere Storyversionen bleiben im internen versionierten Datensatz erhalten.

## Zeitplan und Idempotenz

`.github/workflows/wirkungsticker.yml` prüft wegen der Sommerzeit stündlich passende UTC-Kandidaten und führt exakt zu 07:00, 12:00, 16:00 und 20:00 Uhr in `Europe/Berlin` aus. Die Workflow-Concurrency verhindert überlappende Läufe. Gesehene Einträge werden per kanonischer URL und Inhalts-Hash gespeichert; unveränderte Wiederholungen erzeugen weder KI-Aufruf noch neue Version.

Jede Quelle ist isoliert. Einzelne Feedfehler werden protokolliert; erst der Ausfall aller Quellen beendet den Lauf. Ein KI-Ausfall oder unvollständiges JSON lässt Storys zurückgestellt und verändert bereits veröffentlichte Versionen nicht.

## Kostensteuerung

Der Standardrahmen liegt bei 5 USD geschätzten KI-Kosten pro Kalendermonat. Ab 70 und 85 Prozent steigen die Relevanzschwellen; ab 95 Prozent werden KI-Aufrufe gestoppt. Pro Lauf gehen höchstens zwei Storys in einen gemeinsamen Aufruf. `data/news/usage.json` protokolliert Anbieter, Modell, konservativ aus Zeichen geschätzte Token und Kosten. Die Sätze für GPT-5.5 sind als konfigurierbare Schätzwerte dokumentiert; maßgeblich bleibt die tatsächliche Abrechnung des bestehenden Oracle-Dienstes.

Konfiguration: `WOEK_NEWS_MONTHLY_AI_BUDGET_USD`, `WOEK_NEWS_MAX_AI_STORIES_PER_RUN`, `WOEK_NEWS_AI_ENABLED`, `WOEK_NEWS_API_URL`, `WOEK_NEWS_FETCH_CONCURRENCY`, `WOEK_NEWS_AI_TIMEOUT_MS`, `WOEK_NEWS_INPUT_USD_PER_MILLION`, `WOEK_NEWS_OUTPUT_USD_PER_MILLION`.

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
