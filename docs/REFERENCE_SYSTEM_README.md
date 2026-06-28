# WÖk-Referenzsystem Phase 1

Stand: 2026-05-23

## Setup

Die bestehende Website ist aktuell eine statische HTML-Website. Phase 1A ergänzt die Referenzstruktur, Datenmodelle und Skripte so, dass sie GitHub-Pages-kompatibel bleiben und die bestehende Suche nicht ersetzen.

## Import

```bash
node scripts/import/inventory.mjs
node scripts/import/all.mjs
```

Für das WÖk-ID-Register:

```bash
python3 scripts/import/xlsx-woek-ids.py
```

## Build

```bash
python3 tools/sync_layout.py
node scripts/glossary/build-glossary-registry.mjs
node scripts/glossary/build-glossary-pages.mjs
node scripts/search/build-woek-search-index.mjs
```

Wenn `npm` verfügbar ist:

```bash
npm run build
```

## Export

```bash
node scripts/export/export-glossary.mjs
```

Pandoc ist lokal derzeit nicht im PATH. Die Export-Skripte sind als statische Hooks vorbereitet.

## Suche

Keine neue Suche bauen. WÖk-Inhalte werden in `assets/search/search-index.json` integriert. Details stehen in `docs/SEARCH_INTEGRATION_NOTES.md`.

## Phase 2

Kommentare, Discord-Login und Datenbank werden nicht implementiert. Vorbereitet werden nur `documentId`, `sectionId`, `version`, `contentHash` und die Dokumentation in `docs/PHASE_2_DISCUSSION_ARCHITECTURE.md`.

## Bekannte Einschränkungen

- Die kanonischen Hauptwerksquellen sind bestätigt: `Natalie-Weber_Die neue Ordnung des Wohlstands.docx` und `Natalie-Weber_Die neue Ordnung des Wohlstands_small.pdf`.
- Die Webfassung unter `/referenz/` ist ein technischer Source-Original-Import aus der DOCX-Fassung und verlinkt auf das vorhandene Repository-PDF.
- Das Repo ist noch keine Astro/Starlight-App. Eine Migration muss als separater technischer Schritt geplant werden, weil sie den bestehenden GitHub-Pages-Build und die Website-Struktur berührt.
