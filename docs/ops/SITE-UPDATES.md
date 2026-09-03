# Neues aus der Wirkungsökonomie: Betrieb und Datenfluss

Die öffentliche Seite `/news/` ist die chronologische Deployment- und Veröffentlichungsübersicht der Wirkungsökonomie ab 2026. Sie ist nicht mit dem Wirkungsticker gleichzusetzen; dessen Übersicht liegt unter `/news/wirkungsticker/`.

## Quellen der Wahrheit

- Journal: `assets/data/blog-index.json`
- Bibliothek und öffentliche Publikationen: `assets/data/document-library.json`
- Podcast: `assets/data/podcast-index.json`
- Funktionsstarts, Akademie, Institut, Parlament und andere kuratierte Meilensteine: `content/updates/site-updates.json`

`scripts/site/build-site-updates.mjs` führt diese Quellen zusammen, begrenzt die Chronik auf Einträge ab 2026 und erzeugt:

- `news/index.html`
- `feeds/neuigkeiten.xml`
- `public/data/site-updates.json`
- die Sektion „Neues aus der Wirkungsökonomie“ auf der Startseite

Auf `/news/` werden zunächst zehn Treffer gezeigt; weitere Einträge werden in Zehnerschritten nachgeladen. Die thematischen Filter umbrechen ohne horizontales Scrollen. Eine lokale Seitensuche ergänzt die zentrale Website-Suche.

## Installierbare News-App

Auf Smartphones bietet `/news/` eine eigenständige installierbare Web-App an. `news/manifest.webmanifest` definiert Start-URL und App-Darstellung, `news/sw.js` hält die zuletzt geladene News-Ansicht und den App-Rahmen verfügbar, und `news/offline.html` ist die verständliche Netzfehlerseite. Die Registrierung ist auf `/news/` begrenzt und greift nicht in die vorhandene WÖk-App unter `/app/` ein.

Der Generator läuft im vollständigen Website-Build nach den Journal-, Bibliotheks- und Podcast-Generatoren. Neue Veröffentlichungen gelangen dadurch ohne manuelle Homepage-Karte in die Chronik und unter die neuesten vier Einträge auf der Startseite. Funktionale Deployments benötigen weiterhin einen redaktionell verständlichen Eintrag in `content/updates/site-updates.json`; Git-Commits werden nicht ungeprüft als öffentliche Neuigkeit ausgegeben.

## Abonnements und Discord

Der Wirkungsbrief ist auf `/news/` prominent verlinkt. Der RSS-Feed `/feeds/neuigkeiten.xml` enthält dieselben stabilen Update-IDs wie die Webseite.

`.github/workflows/discord-site-updates-rss.yml` liest diesen Feed und veröffentlicht neue Einträge im Discord-Kanal `website-updates`. Der kanalspezifische Webhook liegt ausschließlich im verschlüsselten Repository-Secret `DISCORD_WEBSITE_UPDATES_WEBHOOK_URL`. Der Veröffentlichungsstand wird getrennt vom Journal auf dem Branch `discord-site-updates-state` geführt; beim ersten Lauf wird nur der neueste Eintrag gesendet, damit die historische Chronik den Kanal nicht flutet.

## Prüfung

```bash
npm run updates:build
npm run updates:check
SITE_UPDATES_FEED_FILE=1 node scripts/discord/publish-site-updates-rss.mjs --dry-run
```
