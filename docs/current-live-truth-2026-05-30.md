# Current Live Truth - 2026-05-30

This file records the agreed current truth for wirkungsoekonomie.de after the cleanup and table hotfix work on 2026-05-30.

## Canonical Live State

- Production site: https://wirkungsoekonomie.de/
- GitHub repository: `sustynats/wirkungsoekonomie.de`
- Canonical branch for production: `main`
- Current production commit: `5a73b4b4cc3e0ae18f5ad9b00709281761423e9e`
- Current local HEAD at time of this note: `5a73b4b4cc3e0ae18f5ad9b00709281761423e9e`
- Last successful deploy workflow: `Deploy static site`, run `26693917962`
- Deploy result: success

## Confirmed Live Fixes

- Public library/download cleanup is live.
  - Wrong raw artifacts such as `.md`, `.zip`, `.json`, Rang15 import/control files and internal package files are no longer public library/download results.
  - Build guards exist for public library artifacts and publication download policy.
- Product/reading table layout fix is live.
  - Wide scorecard tables no longer squeeze headers into broken fragments.
  - The Apfelbeispiel page serves the cache-busted stylesheet `style.css?v=20260530-reading-table-fix`.
- Search page is live and loads successfully.
- GitHub Pages build and deployment are green for the current production commit.

## Important Not Live Yet

The following work exists only as prior feature/WIP context unless explicitly deployed in a later focused package:

- Glossar `Geld`, sharpened `Kapital`, `Kapitalfluss`, `Kapitalwirkung`, `Wirkungskapital`.
- Search index entries for the new `Geld` glossary page.
- Wirkungscontrolling download title correction from `PDF-Download` to the actual document title.
- Broader mobile table/text fixes from the old `feature/glossar-geld-kapital` branch.
- Any old broad Sprint 3/WIP branch content that was not intentionally merged to `main`.

## Operating Rule From Here

- A correction is considered done only after it is committed, pushed to `main`, deployed successfully, and live-checked.
- Local or feature-branch work must be named explicitly as `not live`.
- Deployments should be small and focused; do not bundle unrelated WIP changes.
- Before every deploy, inspect the diff and avoid generated noise unless that generated output is required for the fix.

## Next Recommended Focused Packages

1. Fix the Wirkungscontrolling download title and deploy immediately.
2. Deploy Glossar Geld/Kapital as a separate package, including regenerated glossary/search files and live search verification.
3. Review remaining mobile table/text fixes as targeted CSS or page fixes, not as a broad branch merge.
