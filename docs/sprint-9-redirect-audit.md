# Sprint 9 - Redirect Audit

Datum: 2026-05-22

## Geprüfte alte Pfade

| Pfad | Status | Umsetzung |
|---|---|---|
| `/scanner.html` | ok | Canonical auf `/anwendungen/scanner.html`, `noindex, follow`, Meta-Refresh zur Anwendung |
| `/quellen/` | ok | in `404.html` als Alias auf `/evidenz/`; in `robots.txt` ausgeschlossen; nicht in Sitemap |
| `/sdg-plus/medien-demokratie/` | ok | Redirect-Alias auf `/sdg-plus/medien-demokratie.html` existiert |
| alte Top-Level-Pfade ohne `.html` | ok | 404-Aliaslogik leitet bekannte Pfade weiter |
| politische Sprache | ok | `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` bleibt öffentlich erreichbar |

## Sitemap-Konflikte

- `/scanner.html` aus der Sitemap entfernt.
- `/quellen/` und Unterseiten aus der Sitemap entfernt.
- `/anwendungen/scanner.html`, `/evidenz/` und alle approved neuen Zielgruppen-Seiten in die Sitemap aufgenommen.

## Ergebnis

Der Linkcheck auf 63 Sitemap-Seiten fand 0 fehlende lokale Ziele.
