# Content-Cleanup — Audit-Findings (WS3)

Stand: 2026-07-03 · Autor: sustynats (Codex)
Grundlagen: `docs/woek-umbau-programm.md` (WS3), `AGENTS.md`, `reports/url-baseline.txt` (4624 URLs).

## Methodik & Schutznetz

- **Ground Truth = frisches Deploy-Ergebnis.** Die im Repo eingecheckten öffentlichen HTML-Dateien
  (`begriffe/`, `werkzeuge/`, `wirkungsfelder/`, `*.html` …) sind **generierte Artefakte**. CI baut
  bei jedem Deploy `npm run build && npm run build:artifact` → `_site` neu. Bereinigt wird daher an
  **Datenquellen/Generatoren**, nicht an hartkodierten Ausgabeseiten (vgl. `AGENTS.md`).
- **URL-Diff-Harness:** `scripts/quality/url-baseline-diff.sh` reproduziert die 4624-URL-Baseline
  exakt aus `_site` (`find _site -name '*.html' | sed 's|^_site||; s|/index.html$|/|' | sort -u`).
  Nach jedem Umbauschritt: `npm run build && npm run build:artifact && bash scripts/quality/url-baseline-diff.sh`
  → „removed" muss **leer** sein.
- **Wichtig — Repo-weite Trefferzahlen sind irreführend.** Die im Auftrag genannten Zahlen (Platzhalter
  ~123, TODO ~20 …) zählen **interne** Verzeichnisse mit (`.claude/` Agent-Cache ≈ 75 Treffer, `docs/`,
  `reports/`, `_internal/`, Build-Skripte) und **veraltete** eingecheckte HTML-Snapshots. Diese sind
  **nicht öffentlich** (per `build:artifact` von der Auslieferung ausgeschlossen) und dürfen nicht
  angefasst werden. Maßgeblich ist der Bestand in `_site`.

## Ergebnis pro Kategorie (frisches `_site`, HTML-only)

| Muster | Treffer `_site` | Bewertung |
|---|---|---|
| `Platzhalter` | 25 Dateien | 20× **False Positive** (Meta-Description der `begriffe/*-2`-Archivseiten „… ohne alte Platzhalter- oder interne Redaktionsdaten"), 5× **echt** (werkzeuge-Stubs) → behoben |
| `[[ … ]]` (Wiki-Links) | 0 HTML | Nur in JS-Arrays (`[["Baumwollanbau", …]]`) — Code, kein Rest |
| `TODO` | 0 | sauber |
| `FIXME` | 0 | sauber |
| `Entwurf:` | 2 Dateien | **echt** (interner Doku-Verweis) → behoben |
| `### ` / `## ` (Markdown-Reste in HTML) | 0 | sauber |
| Kaputte/nicht gerenderte Tabellen (`\| --- \|`) | 0 | sauber |
| Doppelte `Inhaltsverzeichnis` (≥2/Seite) | s.u. | Hohe Zahlen nur in `…Gesamtpaket_Alle_Inhalte…`-Bundles = **gewollt** (bündeln viele Dokumente) |

### Internal-Reference-Sweep (Public-Leak-Prüfung, charakterisiert statt blind entfernt)

| Phrase | Treffer `_site` | Bewertung |
|---|---|---|
| `interne Dokumentation` / `interner Entwurf` / `siehe intern` | je 2 | **echt** — dieselben 2 Apfel-Seiten → behoben |
| `nur intern` | 6 | **legitim** („Wirkung darf nicht **nur intern** gemessen werden" u. ä.) |
| `vertraulich` | 8 | **legitim** (vertrauliche Interviews, Whistleblower-Schutz, Datenbehandlung) |
| `nicht öffentlich` | 113 | **legitim** (Download-Status-Labels „nicht öffentlich"; „ersetzt **nicht öffentliche** Debatte") |

## Behobene Fundstellen (dieser Durchlauf)

1. **werkzeuge-Stubs (5 Seiten):** `werkzeuge/{wirkungsaudit, wirkungsdatenraeume, wirkungsregister,
   oeffentliche-beschaffung, digitale-produktpaesse}`. Der Hero-Satz „Diese Seite ist als **Platzhalter**
   vorbereitet, damit die **Methodenlandkarte** vollständig bleibt" exponierte internes Redaktions-Rationale.
   - **Ursache:** Generator `scripts/portal/build-portal-architecture.mjs:1946`. Ein bereits vorhandener
     Post-Processor `hardenToolPages()` in `scripts/site/apply-2-0-final-consolidation.mjs` sollte den
     Satz ersetzen, greift aber **nicht** — (a) das Skript läuft **nicht** in `npm run build`, und (b) sein
     Regex (`… Methoden & Werkzeuge vollständig …`) ist gegenüber dem tatsächlichen Text (`… Methodenlandkarte …`)
     veraltet.
   - **Fix:** Generator gibt nun direkt die vom Team beabsichtigte Formulierung aus (identisch zum
     Zieltext in `apply-2-0-final-consolidation.mjs:204`): „Diese Orientierungsseite beschreibt den
     aktuellen Arbeitsstand des Werkzeugs …". „In Vorbereitung"-Kennzeichnung bleibt erhalten (AGENTS.md:
     Modelle/Entwürfe bleiben markiert).

2. **Apfel-Wirkungssteuer-Dokument (2 Seiten + 1 Quelle):**
   `dokumente/beispiel-apfel-wirkungssteuer-bonusregel/`, `bibliothek/beispiel-apfel-wirkungssteuer/`,
   Quelle `content/documents/online/beispiel-apfel-wirkungssteuer.inc`. In „Quellen und Referenzen"
   verwiesen 3 Zitationen auf **nicht erreichbare interne Quellen** („siehe interne Dokumentation",
   „interner Entwurf 2025").
   - **Fix:** Verweise entfernt, **Entwurf-Kennzeichnung erhalten** → „WUStG – konzeptioneller Entwurf,
     Kapitel Reverse Merit Order" usw. Quelle **und** beide Ausgabeseiten konsistent bereinigt.

## Offen — Editorial-Entscheidung nötig: `… 2.html`-Duplikate (17 URLs)

macOS-Duplikat-Artefakte („Datei 2.html") liegen im Deploy **und in der Baseline** (17 URLs). Das Team
kennt sie (Launch-QA-Notiz `scripts/quality/build-launch-qa-stage14.mjs`: „Suffixed Duplicate-Dateien …
bleiben erreichbar, sollten aber **nach Launch fachlich bereinigt oder gezielt archiviert** werden").

Inventar (kanonisches Geschwister `*.html` existiert überall):

| Gruppe | Dateien | Delta zu kanonisch |
|---|---|---|
| Release-Downloads `assets/downloads/website-1-0-release/WOeK_Rang24_* 2.html` | 4 | **identisch** — reine Dubletten |
| `referenz/version-1-1/index 2.html` | 1 | **identisch** — bereits Redirect-Stub (von `enhance-reference-ux.mjs` erzeugt) |
| `referenz/teil-15…/`, `teil-17…/index 2.html` | 2 | ~52 Zeilen (vmtl. Header/Layout) |
| `wirkungsfelder/arbeit-einkommen/*/dossier/index 2.html` | 10 | **340–767 Zeilen — substanziell**; teils **mehr** Inhalt als kanonisch (`index 2.html` größer, Extra-Abschnitt „Praxis und Bewertungsweg") |

**Warum NICHT angetastet (Entscheidung dieses Durchlaufs):**

1. **Sie sind verlinkt, nicht verwaist.** `bibliothek/index.html` (generiert von
   `scripts/library/build-full-knowledge-library.mjs`) verlinkt **aktiv** auf die 10 Dossier- und
   2 Referenz-`… 2.html` (Linkziele stammen aus einem Daten-Register, keine Hardcodes). Stubben würde
   funktionierende Bibliotheks-Links brechen.
2. **Sie tragen eigenen Inhalt.** Kanonisch `…/dossier/index.html` (generiert von
   `scripts/portal/build-work-income-automation.mjs`, von der Wirkungsfeld-Seite verlinkt) und
   `…/dossier/index 2.html` (von der Bibliothek verlinkt) sind **zwei verschiedene Seiten** für zwei
   Einstiege. `index 2.html` ist umfangreicher (Extra-Abschnitt „Praxis und Bewertungsweg"). Blindes
   Stubben verstieße gegen **„verlustfrei"**.
3. Alle 17 sind **Baseline-URLs** → Entfernen nur URL-erhaltend zulässig.

Das ist kein „Redaktionsrest", sondern ein **Datenmodell-/Fassungs-Thema** (genau das vom Team unter
„nach Launch fachlich bereinigen" Vermerkte). Es braucht eine dedizierte Aufgabe, nicht diesen
Quality-Sweep.

**Empfohlener Folge-Schritt (separate Aufgabe):** Register + `build-full-knowledge-library.mjs` so
umstellen, dass die Bibliothek auf die **kanonischen** `…/dossier/`-Seiten zeigt; die inhaltlich
wertvollere Fassung je Feld redaktionell bestätigen und in die kanonische Seite überführen; die
`… 2.html`-Route als URL-erhaltenden Archiv-/Redirect-Stub auf das kanonische Geschwister behalten
(Muster `begriffe/*-2`). Diff gegen Baseline = 0.
