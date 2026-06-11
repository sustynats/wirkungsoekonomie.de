# Pre-Relaunch Backup Candidates

## Gefundene Backup-Branches

- `backup/main-before-woek-id-register-live-20260531-084643`
  - Commit: `7a9a15d0a`
  - Name deutet auf Sicherung vor dem WÖk-ID-Register-Livegang.
  - Build erfolgreich im Worktree `../woek-restore-check-backup-branch`.

## Gefundene Tags

- `glossar-stable-2026-05-30`
  - Commit: `5b858b58e`
  - Build erfolgreich im Worktree `../woek-restore-check-glossar-stable`.

## Gefundene Stashes

- `stash@{0}: On standardize-dossier-layouts: pre-sprint-2-branch-switch-from-standardize-dossier-layouts`

## Gefundene Backup-Ordner

- `.codex-backup/backup-20260531-063308`
  - 4.137 Dateien.
  - Enthält viele Downloads, Portale, Werkstatt- und Wirkungsfeldseiten.
  - Enthält aber nur ca. 80 Glossar-Detailseiten und ist daher nicht der beste Kandidat fuer eine vollstaendige Glossar-Wiederherstellung.
- `.codex-backup/current-untracked-state-20260531-1927.tar.gz`
  - Sicherung der ungetrackten Dateien aus dem aktuellen Analysezustand.

## Gefundene Deploymentstaende

- GitHub Pages / `origin/main` ist aktuell auf `96a6a3665`.
- Ein expliziter Deployment-Rollback wurde in dieser Phase nicht ausgefuehrt.

## Vermuteter bester Backup-Kandidat

`backup/main-before-woek-id-register-live-20260531-084643` bei Commit `7a9a15d0a`.

## Begruendung

- Enthält den vollstaendigen Glossar-Graphen mit 1.446 Begriffsdetailseiten nach Build.
- Build laeuft erfolgreich.
- Enthält Bibliothek, Konzepte, Wirkungsfelder, Demos, Daten-/Registergrundlagen und zentrale Themen wie Landwirtschaft, Wirkungseinkommen, Wirkungsrente, Wirkungspaedagogik, Wohnen/Miete, Medien, Automatisierung/Maschinen.
- Ist explizit als Backup vor dem WÖk-ID-Register-Livegang benannt.

