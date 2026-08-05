# Claude ↔ Codex - Gemeinsames Arbeitslog

Kurzlog für die Zwei-Agenten-Arbeit an der WÖk (Website / Akademie / Institut / Kern).
**Format je Eintrag:** Datum · Rolle · Was gemacht · Commit/Pfad · Geprüft · Offen für den anderen.
**Lanes:** Codex = QS / Kern / Daten / CI / Generatoren / Deploy / wissenschaftliche Skripte · Claude = Design / UI-UX / Folien / TTS / Audio / Video.
**Prozess:** kein direkter `main`-Push für live-relevante Änderungen → Branch + PR + Preview + grüne Checks + Abnahme.

---

## 2026-08-05

### Codex · Finales PDF der kooperativen Wirkungsordnung (Release)
- **Was:** Finales 331-seitiges PDF unter `/assets/downloads/woek_grundlagenstudie_kooperative_wirkungsordnung_v0_1.pdf` als separaten, additiven Release veröffentlicht; bestehende Kurse, Reader und Akademie-Assets bleiben unverändert.
- **Geprüft:** SHA-256 der Übergabe stimmt; vollständiger `npm run build` erfolgreich; Release-Diff und `git diff --check` grün.

---

## 2026-07-25

### Codex · Freigegebene Studienskripte als Lesefassungen (Release vorbereitet)
- **Was:** 49 ausschließlich von Claude freigegebene Master sind als verlinkte öffentliche Lesefassungen unter `bibliothek/studienskripte/` erzeugt. Nicht freigegebene Skripte bleiben unveröffentlicht; PDF, Video und Präsentationen sind kein Release-Gate.
- **Geprüft:** vollständiger `npm run build` erfolgreich; alle 49 Freigaben haben Master und Leseseite; `git diff --check` grün.
- **Offen für Claude/Codex:** Finale Medienassets bei eigener Übergabe einzeln ergänzen.

## 2026-07-03

### Codex → Claude · Video-Skripte-Handoff (offen für Claude)
- Video-Handoff: `docs/CODEX-HANDOFF-videoskripte.md`
- Tier-1-Video-Skripte: `docs/video-skripte/`
- **Offen für Claude:** Sprechertext, Audio-QS, Video-Rendering, Ablage unter `assets/video/<slug>.mp4`.

### Codex · Website Content-QS + Deploy-Wurzelfix (live)
- WS3: interne Redaktions-/Spec-Reste entfernt (werkzeuge-Stubs, Apfel-Doku „interne Dokumentation", „8. Online-Darstellung"-Produktionsspec) - generatorbasiert, URL-erhaltend. Audit: `reports/content-cleanup-findings.md`.
- **Deploy-Wurzelfix:** GitHub Pages von `legacy` → **`build_type: workflow`**. Jetzt liefert `deploy.yml`/`_site` aus; reine Quellen-/Generator-Fixes gehen automatisch live (kein Output-HTML-Commit nötig). Der ~324-Dateien-Rückstand (Legacy servierte veraltetes committetes HTML) ist aufgelöst.
- **Geprüft:** `bash scripts/quality/url-baseline-diff.sh` = 0 removed (4624/4624); Live-Stichproben HTTP 200; Fonts/Fixes live.
- **Offen (Codex):** CI-Gates noch aufsetzen - Website-PR-Check mit Suchindex-Build, Privacy-/Leak-Scan, `url-baseline-diff` als Gate.

### Codex · Institut-Teaser-Seite (live via PR)
- Neue öffentliche Seite `/institut/` + Footer-Link „Wirkungsinstitut" (Gruppe Lernen). Generatorbasiert.
- **Pfade:** `scripts/site/build-institut-teaser.mjs` (neu), `assets/data/navigation.json`, `package.json`.
- **Commit:** PR #70 → squash-merged auf `main` (`dda16982f5`). CTA „Am Institut mitwirken" → `institut.wirkungsoekonomie.de/bewerbung`.
- **Geprüft:** Generator läuft, Preview ok, additiv (nur neue URL `/institut/`, keine entfernt). Live-Verifikation nach Deploy.
- **Offen für Claude:** optionaler Ton-/Design-Feinschliff der Teaser-Copy (bewusst faktisch gehalten).

### Codex (in Claudes Lane, hiermit übergeben) · Design-Refresh (live)
- Selbst-gehostete Schriften **Inter + Source Serif 4** (woff2, DSGVO-konform) + Typo-/Responsive-Layer als reversibler Override-Block am Ende von `assets/css/style.css`; Fonts in `assets/fonts/`.
- **Commit:** `19fb09f664`. Vorher waren die im CSS referenzierten Fonts nicht geladen (System-Fallback).
- **Hinweis:** Das ist Claudes Design-Lane - von Codex nur committet, weil vom Nutzer direkt beauftragt.
- **Offen für Claude:** Design gehört ab jetzt Claude; kann darauf aufsetzen oder anpassen. Codex fasst Design-/App-UX-/Folien-/TTS-/Video-Dateien nicht mehr an.

### Codex · Website-Release PR #71/#69/#67 (live)
- **Veröffentlicht:** PR #71 `feat/akademie-zwei-zugaenge` (`b1ee3a4`), PR #69 `ci/website-gates` (`523c5c9`), PR #67 `glossary-relations` (`e599087`).
- **Inhalt:** Akademie-Seite mit zwei klaren Zugängen; CI-/Privacy-/URL-Gates für Website-PRs; zentrales Glossar-Beziehungsnetz als `assets/data/glossary-relations.json`.
- **Deploy:** GitHub Pages Workflow `deploy.yml` grün, Run `28674403646`.
- **Geprüft:** `npm run build && npm run build:artifact && bash scripts/quality/url-baseline-diff.sh`; URL-Baseline `4622`, aktuelle URLs `4623`, `removed = 0`, neu/erlaubt: `/institut/`.
- **Live-Smoke:** `/`, `/akademie.html`, `/institut/`, `/begriffe/output/` jeweils HTTP 200; alte Akademie-Metaphrase `0` Treffer; `assets/data/glossary-relations.json` HTTP 200.
- **Privacy:** statische personenbezogene Zertifikats-Detailseiten sind nicht öffentlich erreichbar; Zertifikatsdaten bleiben ueber Backend/geschuetzte Quelle zu verifizieren bzw. berechtigt auszuliefern, nicht aus dem oeffentlichen GitHub-Artefakt.
- **Nicht gemerged:** PR #65 bleibt Claudes Design-Lane; PR #68 ist durch #69 ueberholt; alte/unklare PRs #2/#9/#13/#14/#16 bleiben separat zu triagieren.

### Claude · Hauptdomain-Redesign P1: erleben.html + akademie.html aufgeteilt (Worktree, uncommitted)
- **Branch:** `claude/hauptdomain-redesign-p1` (Worktree `woek-redesign-p1`), noch nicht committet.
- **erleben.html** 83K → 51K: Landing mit Intro, 4 Teaser-Karten, Kompass, Quiz- und Mini-Werkzeugkasten. Große Simulatoren verbatim verschoben auf neue Unterseiten `erleben/produktwirkung.html` (#simulator + #alltag + #scanner + Abschlusskarten), `erleben/medienwirkung.html` (#medienwirkung + #scorecard-demos), `erleben/plattformen.html` (#plattformwirkung), `erleben/risiko.html` (#risikolabor).
- **akademie.html** 82K → 29,7K: Übersicht mit Modul-Karten; Details verbatim auf `akademie/lernpfad.html` (+Video, Was-ist, Zielgruppen), `akademie/studienstruktur.html` (Studium + Curriculum + Vertiefungen v3.2), `akademie/pruefungen.html` (Prüfungstabelle + FAQ + FAQPage-Schema + App-Sektion), `akademie/weiterbildung.html` (Weiterbildung + Aufbaupfade WÖk-A + Meisterstufe).
- **Deep-Links:** Anker-Weiterleitungs-Skript im Head beider Landings (hash → Unterseite, Query bleibt erhalten) + Stub-IDs auf Teaser-Karten. Extern verlinkte Anker (#simulator ×20, #medienwirkung, #risikolabor, #scanner, `akademie.html#studienstruktur` aus main.js, `#lernpfad` aus glossary-model.json) funktionieren weiter.
- **erleben.js:** unverändert - alle 17 Modul-Inits sind bereits mit `if (!root) return;` geguardet, top-level Konstanten null-sicher; `node --check` grün.
- **Geprüft:** JSON-LD-Parsing, Tag-Balance, Anker-Integrität, alle 10 Seiten HTTP 200 via lokalem http.server, keine relativen Link-Fehler in Unterseiten.
- **Hinweis:** `erleben/index.html` ist KEIN Redirect-Stub, sondern 88K-Vollduplikat von erleben.html (kanonisches `/erleben/`) - unangetastet; sollte später mit der neuen Landing-Struktur synchronisiert werden (Codex/Generator?). `akademie/index.html` ist Redirect-Stub auf akademie.html (unangetastet). Sitemap-Einträge für die 8 neuen URLs offen.

### 2026-07-05 - Claude - Hauptdomain P1+P2 komplett: Sanierung + Stranded-Assets (PR #91, abnahmebereit)
- Status: abnahmebereit. Branch claude/hauptdomain-redesign-p1, PR #91 (8 Commits). Alle PR-Gates lokal gruen (search-Artefakte committet, privacy, url-baseline, size, public-language); voller Build-Testlauf fehlerfrei.
- P1: Gold-Kontrastsystem + 35 Mobile-Grid-Fixes + Heading-Beruhigung (style.css); blog.html 213K->103K + sitemap -13 Stubs; Google-Fonts-CDN aus 94 Blogseiten (DSGVO); Lernpfad verstehen->wirkungsoekonomie->modell->vergleich; index 19->12 Sektionen; erleben/akademie in 8 Unterseiten (Anker-Weiterleitungen); fuer/investoren+gesundheit+wissenschaft ausgebaut; 137 CTAs konkretisiert.
- P2: /stranded-assets/ (Dossier + clientseitiger Rechner Auto/Haus/Unternehmen mit Schwaechstes-Feld-Logik + Erklaervideo 4,5 Min XTTS-QS-bestanden + Transkript); /verstehen/ausgangslage/ (Systemdiagnose); Verlinkung aus 5 Seiten. Positionierung: Resilienz/Risiko-Register (Natalie 04.07.), Nachhaltigkeit nur Fremdreferenz.
- Uebergabe an Codex: docs/claude-codex-arbeitsauftrag-deploy-p1p2.md (Merge+Smoke-Test; nicht blockierend: API-Domain statt Oracle-IP-Fallback, sdg-plus/downloads-Duplikate, generate_fuer_pages-Drift, CTA-Rest in wirkungsfelder-Tiefe, url-baseline neu einfrieren).
- Hinweis: Agenten-Limit (monthly spend) schlug waehrend P2 zu; Stranded-Assets-Teil daher von Claude direkt gebaut und browser-getestet (6 Proberechnungen monoton ueber Szenarien).
- Nachtrag 2026-07-05: 5-Block-Startseite ebenfalls in PR #91 (Commit 953833ca8a): Diagnose/Loesung/Entscheidungsgrid/Vertrauen/Weiterfuehrend, 51K->42K, Link-Check + Gates erneut gruen, Suchindex aktualisiert. Deploy-Freigabe Natalie: P1+P2 komplett.

### 2026-07-25 · Codex · Nachtrag zu PR #171: Suchindex synchronisiert

- Die freigegebenen Studienskript-Lesefassungen aus PR #171 waren bereits in `main`; der PR-Gate meldete ausschließlich fehlende generierte Suchartefakte.
- Nachgeneriert und separat nachzureichen: `assets/search/search-index.json` sowie `public/data/woek-search-meta.json` (nur die neuen öffentlichen Studienskript-Routen und -Abschnitte).
- Vollbuild, Taxonomie-, Privacy-, URL-, Link- und Größenchecks sowie `git diff --check` liefen im frischen Worktree erfolgreich. Keine Reader-, Kurs- oder PDF-Datei wird durch diesen Nachtrag geändert.

### 2026-07-08 · Claude · Presse-/Öffentlichkeitsbereich Natalie Weber strategisch umgebaut
- **Was:** `/w/natalie-weber/` Presse-Bereich weg von „Person buchen" hin zu institutioneller Kommunikation. Presse-Unterseite komplett neu (Öffentliche Kommunikation / Keine personenbezogene Auftrittslogik · Kurzprofil · Institutionelle Kommunikation · Zitate & Statements zur Verwendung · Materialien für Medien · Multiplikator:innen statt Personenkult · Akademie für Multiplikator:innen mit 10-Modul-Raster). Hauptseite: Kontaktsektion → „Öffentliche Kommunikation" + „Presse & Anfragen" (souverän, nicht defensiv, keine privaten Gründe). FAQ +3 (Interviews/Vorträge, Medienanfragen, Multiplikator:innen).
- **Pfad/Quelle:** `scripts/natalie/build-natalie-pages.mjs` (einzige Quelle; neue CSS-Bausteine `.quote/.notice/.modules`), regeneriert 8 `w/natalie-weber/*`-Seiten. Konzept: `docs/akademie-multiplikatoren-konzept.md`.
- **Geprüft:** voller `npm run build` EXIT 0; alle 7 Presse-Sektionen + neue FAQ vorhanden; alte Auftrittsformeln (`Vorträge & Panels`, `Interviews & Gespräche`, `Für Interviews, Vorträge…`) = 0 Treffer; Browser-Sichtprüfung aller Blöcke (Zitate, Materialien, dunkles Vertretungs-Band, 01–10-Modulraster) sauber.
- **Offen für Codex/Kern:** Akademie-App-Integration „Multiplikator:innen für Wirkungsökonomie" (Rollen multiplikator/trainer/fachpartner, Zertifikatsausgabe, Personenverzeichnis über Akademie-API); Rollen-/Rechteverwaltung von Discord auf Plattform holen (Snowflake-ID-Fehler). Claude-Folge-PR: öffentliche Landingpage `/akademie/multiplikatoren/` im Akademie-Farbraum nach Abnahme des Konzepts.
