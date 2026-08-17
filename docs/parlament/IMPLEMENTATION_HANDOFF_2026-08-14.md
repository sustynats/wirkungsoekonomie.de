# Umsetzungshinweise, 2026-08-14: Antwort auf die drei Rückfragen

## 1. UX-Handoff — verfügbar

`docs/parlament/ux/UX_HANDOFF.md` (Stand 2). Enthält: Seitenstruktur (24 nummerierte Komponenten mit CSS-Klassen), Datenfelder und Zustände je Komponente, **Responsive-Regeln** (ein harter Breakpoint 640px, Komponententabelle mobil/desktop, Erste-Viewport-Regel §56, Touch-Ziele ≥44px, kein Hover-only) und **WCAG-2.2-AA-Anforderungen** (ARIA-Zustände, Kontrast- und Farbregeln, Textalternativen für alle Diagramme, Reduced-Motion, Testpflicht inkl. 320px/200%-Zoom).

Ergänzend im selben Ordner: `PRODUCT_EXPERIENCE.md`, `INFORMATION_ARCHITECTURE.md` (Routenbaum), `DESIGN_SYSTEM.md` und der lauffähige Prototyp `prototype/` (4 HTML-Seiten + `prototype.css`). **Der Prototyp ist die verbindliche visuelle Spezifikation** — er ist bewusst statisches HTML/CSS ohne Framework, Datenzugriff oder State-Management, damit er nichts aus deiner App vorwegnimmt.

## 2. Keine Backend-/Datenbank-Duplikation — bestätigt

Die Design-Lane liefert ausschließlich UX-Artefakte: Design-Dokumente und den statischen Prototyp unter `docs/parlament/ux/prototype/`. Kein Datenmodell, keine Migrationen, keine API-Routen, kein Ingestion-Code. `woek-parlament-app/` bleibt die einzige Implementierung. Reale politische Fälle sind im Prototyp bewusst nicht enthalten — alle Beispiele sind als synthetisch gekennzeichnet, redaktionelle Leerstellen tragen `CONTENT_REQUIRED`, fehlende Daten `DATA_GAP`.

## 3. Import-Status der führenden Referenzen

Geprüft am Repo-Stand `origin/main` (2026-08-14). Maschinenlesbar strukturiert = **FULL**, nur Volltext/PDF/HTML = **TEXT**.

| Referenz | Status | Belege |
|---|---|---|
| **WÖMS 2.0** | **FULL** | `content/methods/woems-methoden.json` (kanonisch) → `public/data/woems-methoden.json` → `/api/v1/methods/`: v2.0, Stand 2026-07-10, **152 Methoden / 16 Kategorien**, `sourceSha256 fdfb7cb2…`; `woems-canvas.json`: **208 Canvas** (152 Methoden-Canvas + 56 Varianten); Onlinefassung 245 Kapitelseiten |
| **Master Items v1.3** | **FULL** | XLSX (9 Sheets, 621 Items, 28 Regeln) + `assets/data/woek-id-register.json` v1.3: **621 items**, 47 sources, `source_hash_sha256 fd0af24c…`. Item-Zahl deckungsgleich. Offen: **47 sources (JSON) vs. 50 (XLSX Sheet 07)** |
| **SDG-/SDG+-Referenzrahmen v0.3** | **FULL** | `assets/data/sdg-reference.json`: 24 Einträge (17 offizielle SDGs + 7 SDG+) → `/api/v1/sdg-plus/`; Portal 33 Seiten |
| **Begriffsleitfaden v1.3** | **TEXT** | Volltext `content/documents/online/woek-begriffsleitfaden-fuehrend.inc` (58,6 KB, kumulativ v1.1 + Δv1.2 + Δv1.3 via `scripts/publications/build-begriffsleitfaden-v1.3.py`). Strukturiert bisher nur mein `docs/woek-knowledge/terminology.yaml` (21 Kernbegriffe). **Lücke:** kein maschinenlesbares Mapping Leitfaden-Definition ↔ Glossar-Begriff |
| **T-SROI v1.1** | **TEXT** | `docs/impact-controlling/go10-methodenpapiere/t-sroi-rechenstandard-v1_1.md` (113 Zeilen) + PDF; Rechenlogik nur als Code (`assets/js/impact-calculations.js`). **Lücke:** Parameter/Diskontsätze/Schutz-Gate nicht als Daten — Standard und Implementierung können auseinanderlaufen |
| **WÖMM 2.0** | **TEXT** | PDF (98 S.) + 69 Kapitel-Onlinefassung. **Lücke:** anders als WÖMS 2.0 **keine strukturierte Registry** (Managementfelder/-funktionen, Wirkungsrad, Realisierungsarchitektur nicht maschinenlesbar) |

Vollständig maschinenlesbar in `docs/woek-knowledge/reference-manifest.yaml` unter `machine_readable_import`.

**Korrektur zu einer früheren Angabe:** `/api/v1/methods/` liefert **152** Methoden, nicht 84 — die 84 sind die Teilmenge der Grundmethoden (84 + 68 Realisierungs-/Betriebsmethoden = 152). In `integration-registry.yaml` berichtigt.

## 4. Die „zwei noch nicht inventarisierten führenden Referenzen"

Aufgelöst: Es fehlt keine. Das Statusregister `assets/data/library-version-registry.json` enthält **11 Einträge mit `status: "führend"`**, diese sind **11 Manifestationen von 8 Werken** — drei Werke werden doppelt geführt (Onlinefassung/Bibliotheksseite **und** Download-Asset):

- Buch: `leading-reference-buch-html` + `download-…-die-neue-ordnung-des-wohlstands-pdf`
- Begriffsleitfaden v1.3: `leading-reference-bibliothek-woek-begriffsleitfaden-fuehrend-index-html` + `download-…-v1-3-pdf`
- SDG/SDG+: `download-…-referenzrahmen-…-lesefassung` (v0.3 PDF) + `online-version-verstehen-sdgs-sdgplus-index-html` (führende Onlinefassung „SDGs & SDG+")

Rechnung: 2+1+1+2+1+2+1+1 = 11 ✓. Die Zuordnung liegt jetzt maschinell prüfbar als `registry_id_map` im `reference-manifest.yaml`.

## 5. Drei neue Punkte für deine Liste (in CROSSCHECK.md als A12–A14)

- **A12** Build-Kette `content/methods/` → `public/data/` → `api/v1/` bestätigen (Hashes stimmen aktuell überein).
- **A13** Soll für WÖMM 2.0 eine strukturierte Registry analog `woems-methoden.json` erzeugt werden? (Entscheidung nötig — ohne sie bleibt die Managementarchitektur für Produkte unzugänglich.)
- **A14** T-SROI-Parametrisierung: Rechenstandard v1.1 als Daten hinterlegen, damit Code und Standard nicht driften.

Dazu unverändert offen aus dem ursprünglichen Auftrag: die öffentlich sichtbare Zertifikats-API (`akademie…/api/certificates/{id}` existiert im Akademie-Repo nicht) und die KWI-Quelle (SDG-Portal seit 30.06.2026 abgeschaltet).
