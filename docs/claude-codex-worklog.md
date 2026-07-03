# Claude ↔ Codex — Gemeinsames Arbeitslog

Kurzlog für die Zwei-Agenten-Arbeit an der WÖk (Website / Akademie / Institut / Kern).
**Format je Eintrag:** Datum · Rolle · Was gemacht · Commit/Pfad · Geprüft · Offen für den anderen.
**Lanes:** Codex = QS / Kern / Daten / CI / Generatoren / Deploy / wissenschaftliche Skripte · Claude = Design / UI-UX / Folien / TTS / Audio / Video.
**Prozess:** kein direkter `main`-Push für live-relevante Änderungen → Branch + PR + Preview + grüne Checks + Abnahme.

---

## 2026-07-03

### Codex → Claude · Video-Skripte-Handoff (offen für Claude)
- Video-Handoff: `docs/CODEX-HANDOFF-videoskripte.md`
- Tier-1-Video-Skripte: `docs/video-skripte/`
- **Offen für Claude:** Sprechertext, Audio-QS, Video-Rendering, Ablage unter `assets/video/<slug>.mp4`.

### Codex · Website Content-QS + Deploy-Wurzelfix (live)
- WS3: interne Redaktions-/Spec-Reste entfernt (werkzeuge-Stubs, Apfel-Doku „interne Dokumentation", „8. Online-Darstellung"-Produktionsspec) — generatorbasiert, URL-erhaltend. Audit: `reports/content-cleanup-findings.md`.
- **Deploy-Wurzelfix:** GitHub Pages von `legacy` → **`build_type: workflow`**. Jetzt liefert `deploy.yml`/`_site` aus; reine Quellen-/Generator-Fixes gehen automatisch live (kein Output-HTML-Commit nötig). Der ~324-Dateien-Rückstand (Legacy servierte veraltetes committetes HTML) ist aufgelöst.
- **Geprüft:** `bash scripts/quality/url-baseline-diff.sh` = 0 removed (4624/4624); Live-Stichproben HTTP 200; Fonts/Fixes live.
- **Offen (Codex):** CI-Gates noch aufsetzen — Website-PR-Check mit Suchindex-Build, Privacy-/Leak-Scan, `url-baseline-diff` als Gate.

### Codex · Institut-Teaser-Seite (live via PR)
- Neue öffentliche Seite `/institut/` + Footer-Link „WÖk-Institut" (Gruppe Lernen). Generatorbasiert.
- **Pfade:** `scripts/site/build-institut-teaser.mjs` (neu), `assets/data/navigation.json`, `package.json`.
- **Commit:** PR #70 → squash-merged auf `main` (`dda16982f5`). CTA „Am Institut mitwirken" → `institut.wirkungsoekonomie.de/bewerbung`.
- **Geprüft:** Generator läuft, Preview ok, additiv (nur neue URL `/institut/`, keine entfernt). Live-Verifikation nach Deploy.
- **Offen für Claude:** optionaler Ton-/Design-Feinschliff der Teaser-Copy (bewusst faktisch gehalten).

### Codex (in Claudes Lane, hiermit übergeben) · Design-Refresh (live)
- Selbst-gehostete Schriften **Inter + Source Serif 4** (woff2, DSGVO-konform) + Typo-/Responsive-Layer als reversibler Override-Block am Ende von `assets/css/style.css`; Fonts in `assets/fonts/`.
- **Commit:** `19fb09f664`. Vorher waren die im CSS referenzierten Fonts nicht geladen (System-Fallback).
- **Hinweis:** Das ist Claudes Design-Lane — von Codex nur committet, weil vom Nutzer direkt beauftragt.
- **Offen für Claude:** Design gehört ab jetzt Claude; kann darauf aufsetzen oder anpassen. Codex fasst Design-/App-UX-/Folien-/TTS-/Video-Dateien nicht mehr an.
