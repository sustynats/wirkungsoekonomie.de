# Wirkungswahl-Kompass: Betrieb und Release

## Öffentliche Route

`/werkzeuge/wirkungswahl-kompass/`

Der Kompass ist über die Startseite und „Praxis & Tools“ öffentlich erreichbar. Er ist klar als „in unabhängiger Prüfung“ markiert: ein öffentlich nutzbarer, programm- und quellenbasierter redaktioneller Entwurf. Die Seite trägt bis zum Abschluss der unabhängigen Zweitprüfung, des Stellungnahmeverfahrens und der juristischen Prüfung weiterhin `noindex, follow`; das begrenzt die eigene Suchmaschinenaufnahme, nicht die öffentliche Nutzbarkeit über die Website-Navigation. Sie lädt bewusst nicht `assets/js/main.js`, damit weder Analytics noch Besucher-IDs oder politische Antworten übertragen werden.

Nutzende können ihr Prioritätenprofil ausdrücklich als lokale Merkkarte in „Mein Wirkungsraum“ speichern, als PNG/PDF/SVG laden oder per Web-Share bzw. Zwischenablage teilen. Die Merkkarte enthält nur bis zu vier priorisierte Wirkungsfelder sowie technische Metadaten für die Karte; keine einzelnen Antworten, Parteien, Nähewerte oder Vergleiche. Der Kompass startet weder eine Konto- noch eine Server-Synchronisierung. Eine gegebenenfalls später im Wirkungsraum aktivierte Synchronisierung bleibt eine dortige, separate Entscheidung der Nutzenden. Seine eigene Erklärung zur lokalen Speicherung verweist zusätzlich auf die rechtliche Datenschutzerklärung und das Impressum der Website.

## Verbindliche Datenquellen

1. Kontrolliert vorgehaltene Word-Quelldokumente `Wirkungswahl-Kompass_Methodik_Content_UX-Paket_v1.0.docx` und `Wirkungswahl-Kompass_Redaktionelles_Inhaltspaket_v1.0.docx` (nicht im Website-Repository)
2. `content/wirkungswahl-kompass/real-content.schema.json`
3. `content/wirkungswahl-kompass/real-content.json`

Die Word-Originale bleiben außerhalb des Website-Repositorys, weil dessen Release-Prüfung alle dort abgelegten Download-Dateien als potenziell öffentlich behandelt. Der veröffentlichte, schema-geprüfte JSON-Datensatz ist die alleinige Laufzeitquelle des Kompasses.

Politische Texte, Parteizuordnungen, Bandbreiten und Quellen werden nicht im UI geändert. Bei einem bewussten Content-Update wird zuerst der strukturelle Parser ausgeführt, dann wird der resultierende Datensatz redaktionell geprüft und validiert:

```bash
python3 content/wirkungswahl-kompass/parse_editorial.py \
  /pfad/zur/gesicherten/Quelle/Wirkungswahl-Kompass_Redaktionelles_Inhaltspaket_v1.0.docx \
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

Die Browser-Abnahme ist unter `tests/wirkungswahl-kompass/browser_audit.py` dokumentiert. Sie benötigt Playwright und Chromium und prüft Kernrouten, 360/485/768/1440 Pixel, Überlauf, Menüfokus, vollständiges Löschen des lokalen Zustands, A-G-Anonymisierung, alle 36 Vergleichsfragen, die lokale Wirkungsraum-Merkkarte, PNG/PDF/SVG-Downloads, das neutrale Teilen und fehlende Analytics-Requests im Kompass.

## Hosting und Sicherheit

Die statische GitHub-Pages-Umgebung stellt keine konfigurierbaren Response-Header bereit. Deshalb enthält die Seite eine restriktive CSP als Meta-Policy (`default-src 'self'`, keine Objektquellen, keine externen Verbindungen) und bindet keine Drittanbieter-Skripte ein. Die derzeitige eigenständige Seite braucht Inline-Styles und -Skripte; die CSP lässt deshalb nur diese lokalen Inline-Blöcke zu. Für eine spätere Verschärfung auf nonces oder Hashes braucht es eine Hosting-/CDN-Konfiguration mit HTTP-Headern.

Alle Antworten bleiben unter `localStorage["wwk_real_state_v1"]` im Browser. „Kompassdaten löschen“ entfernt nur diesen Schlüssel vollständig. Die opt-in Merkkarte liegt getrennt unter `localStorage["woek_user_space"]`, damit sie in Mein Wirkungsraum sichtbar ist; sie wird durch das Löschen der Kompassantworten nicht versehentlich entfernt. Das Tool sendet keine Antworten, keine Telemetrie und keine Tracker-Anfragen.

## Live-Release und Rollback

Die GitHub-Pages-Produktionsseite wird aus `main` gebaut. Vor einem Release ausschließlich die zum Kompass gehörenden Dateien in einem sauberen Commit bündeln; keine anderen lokalen Änderungen mitveröffentlichen. Nach dem Push den GitHub-Actions-Lauf abwarten und die Live-Route, Quellenlinks, Menüfokus und die Mobile-Ansicht erneut prüfen.

Rollback: den Release-Commit auf `main` per neuem Revert-Commit zurücknehmen und den folgenden Pages-Deployment-Lauf prüfen. Keine Historie umschreiben.

## Gegenüber dem Referenzprototyp ergänzt

- vollständiges Wipe ohne erneutes Anlegen von Local Storage,
- Vergleich zeigt über A-I alle 36 Fragen, auch ohne Antwort,
- A-G bleiben auch in Routen und im Quellenregister verborgen, bis Namen bewusst eingeblendet werden,
- Fokus bleibt bei Antwort- und Wichtigkeitsauswahl erhalten,
- 44-Pixel-Touchziele und kontraststärkere Link-Tokens,
- lokale Merkkarte in Mein Wirkungsraum ohne Antwort- oder Parteidaten,
- neutraler PNG-, PDF- und SVG-Export sowie opt-in Teilen des Prioritätenprofils,
- sichere HTTPS-URL-Gate, engere Datenintegritätsprüfung, `noindex`-Status und trackerfreie Seite.

## Redaktionelle Restfreigabe

Die Seite bleibt bis zum Abschluss der unabhängigen Prüfung ein sichtbar gekennzeichneter redaktioneller Entwurf. Vor Aufhebung von `noindex` und der Prüfkennzeichnung sind die 252 Parteizuordnungen, 36 Wirkungsanalysen, die symmetrische Parteistellungnahme und die juristische Prüfung zu dokumentieren.
