# IA-Infra Handoff: Footer als Single Source

Stand: 2026-07-11

## Zweck

Der Website-Footer wird ab jetzt aus einer kanonischen Quelle in alle bestehenden HTML-Seiten injiziert. Damit ist eine Footer-Aenderung kuenftig ein Edit an der Quelle statt tausender manueller HTML-Aenderungen.

## Kanonische Quellen

- Template: `templates/footer.html`
- Footer-Daten: `assets/data/navigation.json`
  - `footerGroups`
  - `footerLegal`

## Build-/Sync-Skript

- Skript: `scripts/site/normalize-site-footer.mjs`
- Einzelbefehl: `npm run normalize:footer`
- Build-Integration: `npm run build` fuehrt nach `normalize-site-header.mjs` auch `normalize-site-footer.mjs` aus.

Das Skript ist idempotent und deterministisch:

- ersetzt pro Datei nur den Block `<footer class="footer" ...>...</footer>`
- berechnet relative Link-Praefixe pro HTML-Datei
- rendert Footer-Navigation und Legal-Navigation aus `assets/data/navigation.json`
- gibt die Zahl geaenderter Dateien aus

## Bewusste Ausschluesse

Diese Pfade werden vom Footer-Sync nicht veraendert:

- `templates/**`
- `en/**`
- `methodenraum.html`
- `methodenraum/**`

`methodenraum/**` bleibt damit vollstaendig in Claudes Lane. Die englischen Seiten bleiben bis zur separaten englischen IA-/Footer-Entscheidung unangetastet.

## Hinweise fuer Claude

Fuer die IA-Neustrukturierung bitte Footer-Hubs nicht direkt in Einzel-HTML-Dateien pflegen. Stattdessen:

1. Hubs/Legal-Links in `assets/data/navigation.json` anpassen.
2. Falls Markup-Struktur noetig ist: `templates/footer.html` anpassen.
3. `npm run normalize:footer` oder den normalen Build laufen lassen.

Damit werden alle deutschen Nicht-Methodenraum-Seiten synchronisiert.
