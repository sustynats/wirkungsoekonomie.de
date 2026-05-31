# Selected Restore Baseline

## Gewaehlter Stand

- Branch: `backup/main-before-woek-id-register-live-20260531-084643`
- Commit: `7a9a15d0a`
- Worktree: `../woek-restore-check-backup-branch`
- Build: erfolgreich

## Warum dieser Stand

- Vollstaendiger Glossar-Graph nach Build: 1.446 Detailseiten, 1.145 Hoverdefinitionen.
- Stärker als der Dateisystem-Backupordner, der nur ca. 80 Glossar-Detailseiten enthaelt.
- Enthält zentrale Wissens-, Bibliotheks-, Wirkungsfeld-, Demo- und Zielgruppenbereiche.
- Enthält wichtige Themen: Landwirtschaft, Wirkungseinkommen, Wirkungsrente, Wirkungspaedagogik, Wohnen/Miete, Medien/Öffentlichkeit, Automatisierung/Maschinen, SDG/SDG+, NACE, Datenqualitaet.

## Was dort eventuell fehlt

- WÖk-ID-Register v2.1 ist nicht enthalten, weil der Stand vor dem Register-Livegang liegt.
- Einzelne spaetere Hotfixes nach `7a9a15d0a` fehlen und duerfen nur einzeln, nicht-destruktiv und gegen Baseline-Diff uebertragen werden.

## Empfehlung

Production-Rollback: nur wenn live wieder ein kritischer Inhaltsverlust sichtbar wird. Der live Stand wurde separat mit 1.195/1.195 alten Inventar-URLs HTTP 200 geprueft. Als sichere Restore-Basis fuer einen Notfall ist `7a9a15d0a` geeignet.

