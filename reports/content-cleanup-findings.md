# Content-Cleanup - Audit-Findings (WS3)

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
- **Wichtig - Repo-weite Trefferzahlen sind irreführend.** Die im Auftrag genannten Zahlen (Platzhalter
  ~123, TODO ~20 …) zählen **interne** Verzeichnisse mit (`.claude/` Agent-Cache ≈ 75 Treffer, `docs/`,
  `reports/`, `_internal/`, Build-Skripte) und **veraltete** eingecheckte HTML-Snapshots. Diese sind
  **nicht öffentlich** (per `build:artifact` von der Auslieferung ausgeschlossen) und dürfen nicht
  angefasst werden. Maßgeblich ist der Bestand in `_site`.

## Ergebnis pro Kategorie (frisches `_site`, HTML-only)

| Muster | Treffer `_site` | Bewertung |
|---|---|---|
| `Platzhalter` | 25 Dateien | 20× **False Positive** (Meta-Description der `begriffe/*-2`-Archivseiten „… ohne alte Platzhalter- oder interne Redaktionsdaten"), 5× **echt** (werkzeuge-Stubs) → behoben |
| `[[ … ]]` (Wiki-Links) | 0 HTML | Nur in JS-Arrays (`[["Baumwollanbau", …]]`) - Code, kein Rest |
| `TODO` | 0 | sauber |
| `FIXME` | 0 | sauber |
| `Entwurf:` | 2 Dateien | **echt** (interner Doku-Verweis) → behoben |
| `### ` / `## ` (Markdown-Reste in HTML) | 0 | sauber |
| Kaputte/nicht gerenderte Tabellen (`\| --- \|`) | 0 | sauber |
| Doppelte `Inhaltsverzeichnis` (≥2/Seite) | s.u. | Hohe Zahlen nur in `…Gesamtpaket_Alle_Inhalte…`-Bundles = **gewollt** (bündeln viele Dokumente) |

### Internal-Reference-Sweep (Public-Leak-Prüfung, charakterisiert statt blind entfernt)

| Phrase | Treffer `_site` | Bewertung |
|---|---|---|
| `interne Dokumentation` / `interner Entwurf` / `siehe intern` | je 2 | **echt** - dieselben 2 Apfel-Seiten → behoben |
| `nur intern` | 6 | **legitim** („Wirkung darf nicht **nur intern** gemessen werden" u. ä.) |
| `vertraulich` | 8 | **legitim** (vertrauliche Interviews, Whistleblower-Schutz, Datenbehandlung) |
| `nicht öffentlich` | 113 | **legitim** (Download-Status-Labels „nicht öffentlich"; „ersetzt **nicht öffentliche** Debatte") |

## Behobene Fundstellen (dieser Durchlauf)

1. **werkzeuge-Stubs (5 Seiten):** `werkzeuge/{wirkungsaudit, wirkungsdatenraeume, wirkungsregister,
   oeffentliche-beschaffung, digitale-produktpaesse}`. Der Hero-Satz „Diese Seite ist als **Platzhalter**
   vorbereitet, damit die **Methodenlandkarte** vollständig bleibt" exponierte internes Redaktions-Rationale.
   - **Ursache:** Generator `scripts/portal/build-portal-architecture.mjs:1946`. Ein bereits vorhandener
     Post-Processor `hardenToolPages()` in `scripts/site/apply-2-0-final-consolidation.mjs` sollte den
     Satz ersetzen, greift aber **nicht** - (a) das Skript läuft **nicht** in `npm run build`, und (b) sein
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

## Behoben - `… 2.html`-Duplikate dedupliziert (17 URLs, verlustfrei & URL-erhaltend)

macOS-Duplikat-Artefakte („Datei 2.html") lagen im Deploy **und in der Baseline** (17 URLs). Das Team
kannte sie (Launch-QA-Notiz `scripts/quality/build-launch-qa-stage14.mjs`: „Suffixed Duplicate-Dateien …
bleiben erreichbar, sollten aber **nach Launch fachlich bereinigt oder gezielt archiviert** werden").
Dieser Durchlauf hat den empfohlenen Folge-Schritt umgesetzt.

Inventar (kanonisches Geschwister `*.html` existiert überall):

| Gruppe | Dateien | Delta zu kanonisch |
|---|---|---|
| Release-Downloads `assets/downloads/website-1-0-release/WOeK_Rang24_* 2.html` | 4 | **identisch** - reine Dubletten |
| `referenz/version-1-1/index 2.html` | 1 | **identisch** - bereits Redirect-Stub (von `enhance-reference-ux.mjs` erzeugt) |
| `referenz/teil-15…/`, `teil-17…/index 2.html` | 2 | ~52 Zeilen (nur älteres Layout/„Live-Reference-Hinweis") |
| `wirkungsfelder/arbeit-einkommen/*/dossier/index 2.html` | 10 | ältere Vollseiten-Fassung (~30–47 Zeilen mehr) |

**Fassungsentscheidung (je Feld geprüft, alle 10 Dossiers + 2 Referenzteile):** Die kanonische
`…/dossier/index.html` (Generator `scripts/portal/build-work-income-automation.mjs`) ist die **gepflegte,
substanziell vollständige Fassung** - sie enthält alle Fachabschnitte (Kurzfassung, Datenquellen,
Scorecard, Modellrechnung, Risiken, Tool-Bezug, politische Anschlussfähigkeit, SDG, Quellen) **plus** den
neueren Abschnitt „Dokumentstand und Transparenz". Der scheinbare Mehrinhalt der `… 2.html` ist eine
**ältere Snapshot-Fassung**: der Hero „Praxis und Bewertungsweg", eine explizite Kapitelliste „Passende
Stellen im Buch" und ein „Querverlinkungen"-Block - durchweg **Navigations-Beiwerk, das die kanonische
Seite bereits trägt** (über „Anker im Online-Buch" und „Quellen und Anschlussstellen"). **Kein
substanzieller Text geht verloren**; die alte Fassung bleibt zusätzlich über die Git-Historie zitierfähig.

**Umsetzung (generatorbasiert, kein Hardcode):**

1. **Bibliothek zeigt nur noch kanonisch.** `scripts/library/build-library-versioning-stage9.mjs`
   (erzeugt das Daten-Register `assets/data/library-version-registry.json` per Dateiscan) blendet
   `… 2.html`-Artefakte im Scan aus (`MACOS_DUPLICATE_HTML`). Damit entfallen die 12 doppelten
   „Index"-Einträge im Register; `build-full-knowledge-library.mjs` verlinkt automatisch nur noch die
   kanonischen `…/dossier/`-Seiten (Registereinträge 1509 → 1497).
2. **Suche indexiert die Kopien nicht mehr.** `scripts/search/build-woek-search-index.mjs` schließt die
   `… 2.html`-Routen analog zu `referenz/version*` aus (`INTERNAL_PUBLIC_ROUTE_PATTERNS`).
3. **Route bleibt erreichbar - als Archiv-/Redirect-Stub.** Neuer Post-Processor
   `scripts/quality/archive-macos-duplicate-routes.mjs` (im `build` verdrahtet) überführt jede
   Vollinhalts-Kopie in einen `noindex`-Redirect-Stub auf das kanonische Geschwister
   (`…/dossier/index 2.html` → `./`, `WOeK_… 2.html` → `WOeK_….html`). Bereits vorhandene Stubs
   (z. B. `version-1-1`, Eigentümer `enhance-reference-ux.mjs`) bleiben unangetastet.

**Verifikation:** `npm run build && npm run build:artifact && bash scripts/quality/url-baseline-diff.sh`
→ 4624/4624 URLs, „removed" **leer**, „added" **leer** (0 URL-Verlust). Alle 17 Routen weiter in `_site`;
`bibliothek/index.html`, Register und Suchindex ohne `… 2.html`; 10 kanonische Dossier-Links erhalten.
