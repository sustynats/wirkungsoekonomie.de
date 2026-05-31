# Rollback To Pre Relaunch Backup Report

## Aktueller Zustand gesichert

Ja.

- Branch-Marke: `broken-relaunch-state-20260531-1927`
- Commit: `96a6a3665`
- Ungetrackte Dateien: `.codex-backup/current-untracked-state-20260531-1927.tar.gz`

## Gefundene Backup-Kandidaten

- `backup/main-before-woek-id-register-live-20260531-084643` bei `7a9a15d0a`
- Tag `glossar-stable-2026-05-30` bei `5b858b58e`
- Dateisystembackup `.codex-backup/backup-20260531-063308`
- Stash `stash@{0}` aus `standardize-dossier-layouts`

## Gewaehlter Backup-Stand

`backup/main-before-woek-id-register-live-20260531-084643` bei Commit `7a9a15d0a`.

## Build-Ergebnis des Backups

Build erfolgreich im Worktree `../woek-restore-check-backup-branch`.

## Production-Rollback moeglich

Ja, per Git-Restore-Variante:

1. Branch `restore-pre-relaunch` von `7a9a15d0a` erstellen.
2. Build ausfuehren.
3. Als Recovery-Stand deployen.

Ein Production-Rollback wurde in dieser Phase nicht ausgefuehrt, weil der Live-Stand zuletzt 1.195/1.195 alte Inventar-URLs mit HTTP 200 geliefert hat. Rollback bleibt vorbereitet.

## Wiederhergestellte / vorhandene Bereiche im Restore-Kandidaten

- Glossar-Detailseiten
- Hoverdefinitionen
- Querverlinkungsdaten
- Bibliothek
- Konzepte und Dossiers
- Fuer-wen-/Zielgruppenbereich
- Wirkungsfelder
- Demos und Werkzeuge
- Daten-/Registergrundlagen
- Alte Routen

## Noch fehlende / separat zu behandelnde Bereiche

- WÖk-ID-Register v2.1 liegt nach dem Restore-Kandidaten und muss bei Rollback separat, nicht-destruktiv nachgezogen werden.
- Spaetere Hotfixes nach `7a9a15d0a` duerfen nur einzeln und baseline-geprueft uebernommen werden.

## Gesetzte Schutzbaseline

- `docs/site-baseline-pre-relaunch.json`
- `docs/site-baseline-pre-relaunch-summary.md`

## Naechste Schritte

- Keine weitere Relaunch-Optimierung.
- Bei erneutem live sichtbarem Inhaltsverlust sofort Rollback auf `7a9a15d0a` oder Deployment-Rollback.
- Vor jeder spaeteren Verbesserung Route-/Dokument-/Glossar-/Fuer-wen-/Suchindex-Diff gegen Baseline ausfuehren.

