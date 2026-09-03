# Relaunch-Hotfix: Routen und Sitemap

Stand: 2026-05-31

## Anlass

Bei der Live-Prüfung nach dem Relaunch waren neben dem Glossar weitere erwartbare Kern-URLs auffällig:

- `/verstehen/` lieferte live 404, obwohl `verstehen.html` existiert.
- `/suche/` lieferte live 404, obwohl `suche.html` existiert.
- Die Sitemap enthielt zehn alte, doppelt geschachtelte Werkstatt-Dossier-URLs ohne lokale Alias-Seite.

## Nicht-destruktive Korrektur

Es wurden keine Inhalte gelöscht und keine kanonischen Inhaltsseiten verschoben. Ergänzt wurden nur Redirect-/Alias-Seiten:

- `/verstehen/` -> `/verstehen.html`
- `/suche/` -> `/suche.html`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/wirkung-als-rechtsprinzip/` -> `/werkstatt/dossiers/staat-recht-demokratie/wirkung-als-rechtsprinzip/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/wirkungssteuergesetz-wstg/` -> `/werkstatt/dossiers/staat-recht-demokratie/wirkungssteuergesetz-wstg/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/wirkungsumsatzsteuer-rechtsrahmen/` -> `/werkstatt/dossiers/staat-recht-demokratie/wirkungsumsatzsteuer-rechtsrahmen/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/wirkungseinkommensteuer-westg/` -> `/werkstatt/dossiers/staat-recht-demokratie/wirkungseinkommensteuer-westg/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/wirkungshaushalt/` -> `/werkstatt/dossiers/staat-recht-demokratie/wirkungshaushalt/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/wirkungsrat/` -> `/werkstatt/dossiers/staat-recht-demokratie/wirkungsrat/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/verwaltung-rechtsschutz-korrektur/` -> `/werkstatt/dossiers/staat-recht-demokratie/verwaltung-rechtsschutz-korrektur/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/politische-wirkungspruefung/` -> `/werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/lobbyismus-machtkonzentration/` -> `/werkstatt/dossiers/staat-recht-demokratie/lobbyismus-machtkonzentration/`
- `/werkstatt/dossiers/staat-recht-demokratie/dossiers/buergerbeteiligung-wirkungsdemokratie/` -> `/werkstatt/dossiers/staat-recht-demokratie/buergerbeteiligung-wirkungsdemokratie/`

## Risiko

Die Live-Seite kann zusätzlich noch alte Deploy-Stände enthalten. Die lokale Korrektur stellt sicher, dass diese erwartbaren URLs beim nächsten Deployment nicht mehr als 404 erscheinen.

## Verifikation

- Build ausgeführt: erfolgreich.
- Lokaler Linkcheck: 150897 Links, 0 fehlende Ziele.
- Sitemap gegen lokalen Dateistand geprüft: 729 URLs, 0 fehlende Ziele.
- Suche geprüft: 6635 Einträge, bestanden.
- Größencheck geprüft: 742.4 MB, bestanden.
- Glossar-Routen-Audit ausgeführt: bestanden.
- Glossar-Hover-Audit ausgeführt: bestanden.
- Glossar-Crosslink-Audit ausgeführt: bestanden.
- Glossar-Coverage-Audit ausgeführt: bestanden.
- Glossar-Regression gegen Baseline ausgeführt: 1145 Begriffe, 1447 Detailseiten, 1145 Hover-Einträge, Ergebnis OK.
