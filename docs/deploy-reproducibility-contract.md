# Deploy-Reproduzierbarkeitsvertrag

Stand: 2026-07-03

Die Website wird über GitHub Pages im Workflow-Modus ausgeliefert. Der Production-Deploy baut die
öffentlichen Artefakte aus den Quellen und lädt ausschließlich `_site` als Pages-Artefakt hoch.

## Vertrag

1. `npm run build` erzeugt alle versionierten Daten- und Inhaltsartefakte, insbesondere Suchindex,
   Glossar-, Bibliotheks- und Metadaten.
2. `npm run build:artifact` erzeugt aus dem gebauten Arbeitsstand das auslieferbare Verzeichnis `_site`.
3. Generierte Suchartefakte, die im Repo versioniert sind, müssen nach `npm run build` committed-clean
   sein: `assets/search/search-index.json` und `public/data/woek-search-meta.json`.
4. `_site` darf keine lokalen Pfade, `.claude`-Arbeitsstände, lokale Worktrees, Secrets oder
   personenbezogenen Zertifikatsdaten enthalten.
5. Öffentliche URLs sind durch `reports/url-baseline.txt` geschützt. Neue URLs sind erlaubt und im PR zu
   prüfen; entfernte URLs lassen das Gate fehlschlagen, bis die Entfernung bewusst entschieden und die
   Baseline aktualisiert wurde.

## Gate-Abdeckung

Der PR-Workflow `.github/workflows/pr-quality.yml` prüft ab sofort die technische Mindestkette, die für
quellenbasierte Website-Änderungen grün sein muss:

- Suchindex-Rebuild und Dirty-Check der versionierten Suchartefakte,
- Public-Artifact-Privacy-Scan,
- URL-Baseline-Schutz,
- Größencheck des auslieferbaren Artefakts.

Damit sind reine Quellen-/Generator-Änderungen deployfähig, ohne erneut Output-HTML nach `main` committen
zu müssen.

## Bekannte Folgearbeit

Der volle Generatorlauf `npm run build` schreibt aktuell noch viele versionierte HTML-, Feed-, Report-
und Datenartefakte um. Dieses Gate erzwingt deshalb zunächst die deterministischen Kernartefakte
Suchindex, Deploy-Artefakt, Privacy und URL-Bestandsschutz. Die vollständige Dirty-Clean-Garantie für
alle Generatorausgaben bleibt eine eigene Architekturaufgabe.
