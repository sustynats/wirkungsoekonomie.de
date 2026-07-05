# Arbeitsauftrag Codex: Deployment Hauptdomain-Sanierung P1 + Stranded Assets P2

Stand: 2026-07-05 · Von: Claude (Design/UX-Lane) · Freigabe Natalie: Deploy erst nach P1+P2 — beides ist in diesem PR enthalten.

## Was zu tun ist

1. **PR #91 reviewen und mergen** (`claude/hauptdomain-redesign-p1` → `main`, 8 Commits, thematisch getrennt).
   - Alle PR-Gates wurden lokal grün geprüft (build:search-Artefakte committet, privacy, url-baseline nur Additionen, size 448,5 MB, public-language).
   - Kein URL-Entfall, keine Template-/Header-Änderungen, keine CI-Anpassung nötig.
2. **Deploy läuft nach Merge automatisch** (Pages-Workflow-Modus, deploy.yml baut `_site`).
3. **Nach dem Deploy bitte kurz prüfen (Smoke-Test):**
   - https://wirkungsoekonomie.de/stranded-assets/ — Video spielt, Rechner rechnet (3 Tabs), keine Konsolen-Fehler.
   - https://wirkungsoekonomie.de/verstehen/ausgangslage/ — rendert, Links auf Wirkungsfelder OK.
   - Startseite mobil (375px): kein horizontales Scrollen, Grids einspaltig.
   - blog.html: Filter funktionieren, Archiv-Verweis führt zu blog/linkedin-artikel.html.
   - Ein alter Deep-Link, z. B. /erleben.html#risikolabor → leitet auf /erleben/risiko.html weiter.

## Kontext / Entscheidungen

- **Fonts:** Dein Design-Refresh vom 03.07. (self-hosted Playfair/Source Sans 3) war die Basis; ich habe nur Lücken geschlossen (gold-deep-Kontrastvariante, Mobile-Grids, Lesbarkeit). Kein Konflikt.
- **Positionierung (Natalie, 04.07.):** Leitframe ist Systemresilienz/Risikomanagement; „Nachhaltigkeit" nur noch als Fremdreferenz (ESG/CSRD), nicht als Eigenlabel. Neue Inhalte folgen dem bereits.
- **Video:** assets/video/stranded-assets.mp4 (4,5 Min) über die XTTS-Pipeline mit verschärfter QS produziert (alle 9 Segmente bestanden). Quelle: voice-tts/video-folien/stranded-assets.md.

## Übergabepunkte an deine Lane (QS/Kern/Daten/CI) — nicht deploy-blockierend

1. **API-Fallback-Domain:** `https://130.162.217.58.sslip.io` ist als Fallback in 4 JS-Dateien hartkodiert (assets/js/woek-app.js:5, faktencheck.js:6, woek-community-auth.js:5, woek-community-auth-v2.js:5). Vorschlag: api.wirkungsoekonomie.de als Subdomain auf die Oracle-IP, dann nur Domain im Code. Zusätzlich fehlt am Wirkungscheck (werkzeuge/faktencheck/) ein Datenschutzhinweis, dass Eingaben ans Backend gehen.
2. **Duplicate-Content-Paare:** `sdg-plus.html`+`sdg-plus/` und `downloads.html`+`downloads/` sind beides Vollseiten mit widersprüchlichen/fehlenden Canonicals (kein Redirect-Stub-Paar). Braucht eine Entscheidung, welche Variante führt, + Redirect. `erleben.html`+`erleben/` sind seit diesem PR inhaltsgleich synchronisiert, langfristig gleiche Entscheidung.
3. **Generator-Drift:** `tools/generate_fuer_pages.py` würde bei Re-Run die ausgebauten fuer/-Seiten (investoren/gesundheit/wissenschaft-forschung) überschreiben. Skript nachziehen oder als eingefroren markieren.
4. **CTA-Rest:** ~80 tiefe wirkungsfelder/-Unterseiten haben noch generische „Mehr erfahren"-Labels (bewusst ausgelassen, Priorisierung Root/fuer/erleben/akademie).
5. **url-baseline.txt** bei Gelegenheit neu einfrieren (Additionen: /stranded-assets/, /verstehen/ausgangslage/, 8 erleben/akademie-Unterseiten, /sustynats/ war schon da).
6. **Sprachleitlinien-Check (Idee):** „Nachhaltigkeit als Eigenlabel" als Regel in check-public-language aufnehmen — ~8.900 Altbestands-Treffer in tiefen Ebenen, schrittweise.

## Was Claude als Nächstes plant (nach Merge, eigene Branches)

- Startseiten-P2 (radikale 5-Block-Struktur) + ggf. Nav-Einstieg für Kompass/Vergleich.
- EN-Fassungen der neuen Seiten + Video-EN über die TTS_LANG-Pipeline (Reihenfolge laut EN-Lokalisierungsplan).
- TTS-Marathon (Grundstudium/Fach) wieder anwerfen — war für das Stranded-Assets-Video pausiert bzw. abgestürzt.
