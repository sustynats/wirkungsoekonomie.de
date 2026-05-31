# Glossary Heart Recovery Report

Stand: 2026-05-31T12:53:56.144Z

## Status

Status: restored technical baseline. Redaktionelle Feinkorrektur bleibt für sensible/mehrdeutige Begriffe offen.

## Baseline

- Letzter guter Commit: `7a9a15d0a`
- Aktueller Commit vor Abschluss: `489d57143`
- Alte Begriffe: 1145
- Wiederhergestellte Begriffe im zentralen Modell: 1145
- Alte Detail-/Alias-Seiten: 1446
- Aktuelle Detail-/Alias-Seiten: 1447
- Fehlende Detailseiten: 0
- Rekonstruierte Platzhalterseiten: 0
- Wiederhergestellte Hoverdefinitionen: 1145
- Wiederhergestellte Suchindexeinträge insgesamt: 6635
- Gesetzte Alias-/Redirect-Seiten für alte Glossar-Rückverweise: 23

## Wiederhergestellte Architektur

- Term-Registry: `assets/data/term-registry.json`
- Zentrales Modell: `content/glossary/terms.json`
- Hoverdaten: `assets/js/glossaryTerms.js`
- Detailseiten: `/begriffe/[slug]/`
- Hub: `/begriffe/` und bestehender `/glossar.html` bleiben Einstieg, nicht Ersatz für Detailseiten.
- Baseline: `docs/glossary-graph-baseline.json`

## Prüfergebnisse

- Build: erfolgreich, 1.145 glossary terms, 1.145 term pages.
- Linkcheck: erfolgreich, 150.897 lokale Links, 0 missing.
- Search: erfolgreich, 6.635 Einträge.
- Size: erfolgreich, 747.7 MB.
- Route-Audit: siehe `docs/glossary-route-audit.md`.
- Hover-Audit: siehe `docs/glossary-hover-audit.md`.
- Crosslink-Audit: siehe `docs/glossary-crosslink-audit.md`.
- Coverage-Audit: siehe `docs/glossary-coverage-report.md`.
- Regression: siehe `docs/glossary-regression-report.md`.

## Risiken

- Das alte Glossar enthält bewusst viele Alias-/Fachbegriffe; Linkdichte muss beobachtet werden.
- Einzelne `-2`-Slugs sind alte Alias-/Dublettenrouten und sollten redaktionell sortiert, aber nicht gelöscht werden.
- Es liegen viele untracked Duplikatdateien im Arbeitsbaum; sie wurden nicht berührt.
- GitHub Actions melden perspektivisch Node-20-Deprecation-Warnungen; das betrifft CI-Pflege, nicht diese Recovery.

## Empfehlung

- Diese Recovery als Schutz-Baseline mergen, bevor weitere IA-/Journey-Arbeiten laufen.
- Danach sensible Begriffe aus `docs/glossary-manual-review.md` redaktionell prüfen.
- Die neuen Audits in CI aufnehmen, damit der Detailseiten-/Hover-Bestand nicht erneut unter Baseline fällt.
