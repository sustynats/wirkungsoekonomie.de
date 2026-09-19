# Backlog: GitHub Actions Node-20-Deprecation

Prioritaet: P2 / technischer Wartungspunkt

## Titel

GitHub Actions: Node-20-Deprecation-Warnung pruefen und Workflow auf Node 24 vorbereiten

## Kontext

Beim erfolgreichen GitHub-Pages-Deploy des Website-UX-Cleanup-Releases am 2026-05-25 meldete GitHub Actions eine Node-20-Deprecation-Warnung fuer verwendete Actions wie `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-pages-artifact@v3` und `actions/deploy-pages@v4`.

## Einordnung

- Kein Website-Release-Blocker.
- Kein akuter Funktionsfehler.
- Technischer Wartungspunkt fuer die naechste Infrastruktur-/CI-Runde.

## Naechste Schritte

- Workflow `.github/workflows/deploy.yml` pruefen.
- Actions-Versionen auf Node-24-Kompatibilitaet pruefen.
- Falls GitHub empfohlene neuere Major-Versionen bereitstellt, kontrolliert aktualisieren.
- Deploy in einem eigenen CI-/Maintenance-Branch testen.
