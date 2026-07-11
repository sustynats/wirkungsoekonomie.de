# IA-Infra Handoff: Taxonomie, Link-CI, Frag die WOek

Stand: 2026-07-11

## Content-Taxonomie

- Generator: `scripts/site/build-site-taxonomy.mjs`
- Datenquelle: `content/taxonomy/site-map.json`
- Befehl: `npm run taxonomy:build`
- Schema je Eintrag: `{ url, title, rubrik, sammlung, typ }`

Die Rubrik- und Typisierung wird aus URL-Struktur und vorhandenen Search-Metadaten abgeleitet. Claude kann Portalseiten datengetrieben gegen `content/taxonomy/site-map.json` bauen.

## Link-Integritaet

- Check/Report: `scripts/quality/check-site-links.mjs`
- Report: `reports/site-link-integrity.md`
- Befehl: `npm run check:site-links`

Der Check meldet interne Broken Links, Waisenseiten und doppelte Seitentitel. Er ist aktuell als Reporting-Gate gedacht, nicht als harter Blocker, weil die bestehende Site Altlasten enthaelt.

## Frag die WOek

- Gemeinsames Browser-Modul: `assets/js/woek-ai-client.js`
- Genutzt von: `app/` und `woek-ki/`

Das Modul kapselt API-Basis, `POST /api/woek-ai`, generische JSON-Requests und `POST /api/feedback`. Damit kann die Website einen einzigen Einstieg zeigen, waehrend die PWA-Shell stabil bleibt und `woek-ki/` spaeter sauber auf `app/?mode=woek` oder `app/#frag-die-woek` umgezogen werden kann.
