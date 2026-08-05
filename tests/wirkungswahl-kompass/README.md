# Wirkungswahl-Kompass: lokale Prüfschritte

Die politische Inhaltsprüfung ist vor jedem Build verpflichtend. Für die Python-Validator-Abhängigkeiten kann eine isolierte virtuelle Umgebung verwendet werden.

```bash
python3 -m venv /tmp/wwk-venv
/tmp/wwk-venv/bin/pip install -r content/wirkungswahl-kompass/requirements-content.txt
/tmp/wwk-venv/bin/python content/wirkungswahl-kompass/validate_content.py content/wirkungswahl-kompass/real-content.json
node tests/wirkungswahl-kompass/check-content.mjs
node tests/wirkungswahl-kompass/check-logic.mjs
node tests/wirkungswahl-kompass/check-accessibility.mjs
/tmp/wwk-venv/bin/python scripts/wirkungswahl-kompass/build-preview.py
```

Die optionale Browserprüfung braucht zusätzlich Playwright und Chromium:

```bash
/tmp/wwk-venv/bin/pip install -r tests/wirkungswahl-kompass/requirements-test.txt
/tmp/wwk-venv/bin/playwright install chromium
/tmp/wwk-venv/bin/python tests/wirkungswahl-kompass/browser_audit.py
```

Sie prüft alle Kernrouten bei 360, 485, 768 und 1.440 Pixeln, globalen horizontalen Überlauf, Konsolenfehler, fehlende externe Requests, Dialog-Fokusverhalten, die lokale Löschung, die datensparsame Merkkarte in Mein Wirkungsraum sowie PNG- und PDF-Downloads.
