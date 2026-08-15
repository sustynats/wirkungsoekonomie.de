# Stage 13: offene Usability-, A11y-, Performance- und SEO-Themen

Stand: 31.05.2026

## Erledigt in Stage 13

- Neuer Branch: `site-restructure-stage-13-usability-a11y-seo`.
- Hauptseiten-Meta-Daten für Start, Verstehen, WÖk auf einer Seite, Wirkungsfelder, Methoden & Werkzeuge, Erleben, Einwände, Pilot starten, Akademie, Bibliothek, Glossar und Mitmachen vereinheitlicht.
- OpenGraph- und Twitter-Meta-Daten für die Hauptseiten ergänzt oder harmonisiert.
- Öffentliche Redirect-Stubs mit genau einer H1 versehen, damit auch Fallback-URLs semantisch sauber bleiben.
- Mobile Navigation verbessert: Tastaturfokus springt beim Öffnen in das Menü, Escape schließt und der Tab-Fokus bleibt im geöffneten Menü.
- Fokuszustände und Lesbarkeitskontrast global verbessert.
- 404-Seite mit Suche und Links zu Start, Verstehen, Methoden & Werkzeuge, Bibliothek, Glossar, Wirkungsfelder und Einwände erweitert.
- Sitemap um neue kanonische Kernrouten ergänzt: `/verstehen/woek-auf-einer-seite/`, `/einwaende/`, `/pilot-starten/`.

## Bewusst offene Punkte

- Download-HTML-Pakete unter `assets/downloads/` enthalten teils mehrere H1-Überschriften, weil sie vollständige Dokumentpakete bündeln. Diese Dateien bleiben als Archiv-/Downloadmaterial unverändert und sollten später separat in eine barriereärmere Webfassung überführt werden.
- Technische Quell-HTML-Dateien unter `docs/**/source-html/` enthalten teils mehrere H1-Überschriften. Sie sind Arbeits-/Quellmaterial und keine primären öffentlichen Landingpages.
- Große Bilddateien existieren weiterhin, vor allem generierte Blog-, LinkedIn- und Buchbilder. Ohne Bildpipeline sollten diese nicht destruktiv überschrieben werden. Empfohlen: WebP/AVIF-Derivate erzeugen, `picture`/`srcset` ergänzen und Originale behalten.
- Ein automatisierter Lighthouse-Lauf ist lokal nur sinnvoll mit laufendem Preview-Server und Browser-Audit. In Stage 13 wurden stattdessen Build, Linkcheck, Browser-Smoke-Test sowie semantische H1-/Meta-/Sitemap-Prüfungen ausgeführt.

## Nächste sinnvolle Checks

- Browser-Test der mobilen Navigation bei 360px, 768px und Desktop.
- Axe/Lighthouse-Audit gegen einen lokalen Preview-Server. Port `8765` war während Stage 13 bereits belegt; der Smoke-Test lief auf `http://127.0.0.1:8766/`.
- Bildpipeline definieren: Original behalten, optimierte Derivate nebenlegen, HTML schrittweise auf `srcset` umstellen.
