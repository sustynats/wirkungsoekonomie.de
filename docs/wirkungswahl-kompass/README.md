# Wirkungswahl-Kompass: Betrieb und Release

## Öffentliche Route

`/werkzeuge/wirkungswahl-kompass/`

Der Kompass ist auf der öffentlichen Werkzeugseite verlinkt und bleibt als redaktioneller Arbeitsstand gekennzeichnet. Die Seite trägt bis zum Abschluss der unabhängigen Zweitprüfung, des Stellungnahmeverfahrens und der juristischen Prüfung weiterhin `noindex, nofollow`; das begrenzt nur die Suchmaschinenaufnahme, nicht die öffentliche Nutzbarkeit über die Werkzeugseite. Sie lädt bewusst nicht `assets/js/main.js`, damit weder Analytics noch Besucher-IDs oder politische Antworten übertragen werden.

## Verbindliche Datenquellen

1. `content/wirkungswahl-kompass/source/Wirkungswahl-Kompass_Methodik_Content_UX-Paket_v1.0.docx`
2. `content/wirkungswahl-kompass/source/Wirkungswahl-Kompass_Redaktionelles_Inhaltspaket_v1.0.docx`
3. `content/wirkungswahl-kompass/real-content.schema.json`
4. `content/wirkungswahl-kompass/real-content.json`

Politische Texte, Parteizuordnungen, Bandbreiten und Quellen werden nicht im UI geändert. Bei einem bewussten Content-Update wird zuerst der strukturelle Parser ausgeführt, dann wird der resultierende Datensatz redaktionell geprüft und validiert:

```bash
python3 content/wirkungswahl-kompass/parse_editorial.py \
  content/wirkungswahl-kompass/source/Wirkungswahl-Kompass_Redaktionelles_Inhaltspaket_v1.0.docx \
  content/wirkungswahl-kompass/real-content.json
python3 content/wirkungswahl-kompass/validate_content.py \
  content/wirkungswahl-kompass/real-content.json
```

Der Parser darf nicht als stillschweigende Reparatur verwendet werden: ein Validierungsfehler stoppt den Build.

## Build und Checks

```bash
python3 -m venv /tmp/wwk-venv
/tmp/wwk-venv/bin/pip install -r content/wirkungswahl-kompass/requirements-content.txt
/tmp/wwk-venv/bin/python scripts/wirkungswahl-kompass/build-preview.py
node tests/wirkungswahl-kompass/check-content.mjs
node tests/wirkungswahl-kompass/check-logic.mjs
node tests/wirkungswahl-kompass/check-accessibility.mjs
```

`build-preview.py` schreibt nur `werkzeuge/wirkungswahl-kompass/index.html`. Der Datensatz wird dabei erst nach Schema- und Integritätsprüfung in die eigenständige Seite eingebettet. Das verhindert eine Laufzeitabhängigkeit von nicht deployten `content/`-Dateien.

Die Browser-Abnahme ist unter `tests/wirkungswahl-kompass/browser_audit.py` dokumentiert. Sie benötigt Playwright und Chromium und prüft Kernrouten, 360/485/768/1440 Pixel, Überlauf, Menüfokus, vollständiges Löschen des lokalen Zustands, A–G-Anonymisierung, alle 36 Vergleichsfragen, den neutralen SVG-Export und fehlende Analytics-Requests.

## Hosting und Sicherheit

Die statische GitHub-Pages-Umgebung stellt keine konfigurierbaren Response-Header bereit. Deshalb enthält die Seite eine restriktive CSP als Meta-Policy (`default-src 'self'`, keine Objektquellen, keine externen Verbindungen) und bindet keine Drittanbieter-Skripte ein. Die derzeitige eigenständige Seite braucht Inline-Styles und -Skripte; die CSP lässt deshalb nur diese lokalen Inline-Blöcke zu. Für eine spätere Verschärfung auf nonces oder Hashes braucht es eine Hosting-/CDN-Konfiguration mit HTTP-Headern.

Alle Antworten bleiben unter `localStorage["wwk_real_state_v1"]` im Browser. „Alle lokalen Daten löschen“ entfernt diesen Schlüssel vollständig. Das Tool sendet keine Antworten, keine Telemetrie und keine Tracker-Anfragen.

## Live-Release und Rollback

Die GitHub-Pages-Produktionsseite wird aus `main` gebaut. Vor einem Release ausschließlich die zum Kompass gehörenden Dateien in einem sauberen Commit bündeln; keine anderen lokalen Änderungen mitveröffentlichen. Nach dem Push den GitHub-Actions-Lauf abwarten und die Live-Route, Quellenlinks, Menüfokus und die Mobile-Ansicht erneut prüfen.

Rollback: den Release-Commit auf `main` per neuem Revert-Commit zurücknehmen und den folgenden Pages-Deployment-Lauf prüfen. Keine Historie umschreiben.

## Gegenüber dem Referenzprototyp ergänzt

- vollständiges Wipe ohne erneutes Anlegen von Local Storage,
- Vergleich zeigt über A–I alle 36 Fragen, auch ohne Antwort,
- A–G bleiben auch in Routen und im Quellenregister verborgen, bis Namen bewusst eingeblendet werden,
- Fokus bleibt bei Antwort- und Wichtigkeitsauswahl erhalten,
- 44-Pixel-Touchziele und kontraststärkere Link-Tokens,
- neutraler SVG-Export und opt-in Teilen der Prioritätengrafik,
- sichere HTTPS-URL-Gate, engere Datenintegritätsprüfung, `noindex`-Status und trackerfreie Seite.

## Redaktionelle Restfreigabe

Die Seite bleibt bis zum Abschluss der unabhängigen Prüfung ein sichtbarer redaktioneller Arbeitsstand. Vor Aufhebung von `noindex` und des Arbeitsstand-Hinweises sind die 252 Parteizuordnungen, 36 Wirkungsanalysen, die symmetrische Parteistellungnahme und die juristische Prüfung zu dokumentieren.
