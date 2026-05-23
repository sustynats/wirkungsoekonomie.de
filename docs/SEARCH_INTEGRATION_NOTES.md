# Suchintegration der WÖk-Referenz

Stand: 2026-05-23

## Bestehende Suche

Die Website verwendet derzeit keine Pagefind-, Algolia-, Lunr-, MiniSearch- oder serverseitige Suche. Die Suche ist eine bestehende clientseitige statische JSON-Suche.

Relevante Dateien:

- `suche.html`: bestehende Suchseite und Filter-UI.
- `assets/js/search.js`: Suchlogik, Normalisierung, Synonyme, Filter, Scoring, Ergebnisdarstellung.
- `assets/search/search-index.json`: zentraler Suchindex.
- `assets/search/search-dictionary.json`: Synonyme, Aliasbegriffe und Begriffsassoziationen.
- `assets/search/search-associations.json`: verwandte Suchkontexte.
- `assets/search/search-curated-entrypoints.json`: kuratierte Einstiegsempfehlungen.
- `tools/build_search_index.py`: baut den HTML-Suchindex aus statischen Seiten und Wissenskarten.
- `tools/sync_layout.py`: synchronisiert Header/Footer und ruft anschließend `tools/build_search_index.py` auf.

## Indexstruktur

Der zentrale Index ist ein JSON-Array. Ein Eintrag nutzt derzeit diese Felder:

- `id`
- `title`
- `description`
- `url`
- `section`
- `type`
- `format`
- `impactSpaces`
- `standards`
- `instruments`
- `tags`
- `aliases`
- `body`
- `priority`

Die bestehende Suche nutzt `priority` als Basisgewichtung. Zusätzlich erhalten Titel-, Alias-, Beschreibungs-, Tag-, Standard-, Instrument- und Volltexttreffer unterschiedliche Score-Zuschläge in `assets/js/search.js`.

## Integrationsentscheidung

Für Phase 1 wird keine zweite Suche gebaut. WÖk-Referenzinhalte werden in den bestehenden Suchindex integriert.

Um zusätzliche Referenzmetadaten nicht zu verlieren, wird zusätzlich erzeugt:

- `public/data/woek-search-meta.json`

Diese Metadaten können später durch die bestehende Suche angezeigt werden, ohne die bestehende UI aufzubrechen.

## WÖk-Inhalte

Der Adapter `scripts/search/build-woek-search-index.mjs` erzeugt Suchdokumente aus:

- `src/data/glossary.terms.yml`
- `src/content/docs/**`
- statischen Referenzseiten unter `/referenz/`, `/dokumente/`, `/begriffe/`, `/instrumente/`, `/beispiele/`, `/quellen/`, `/export/`, soweit vorhanden

Die erzeugten Suchtreffer werden in `assets/search/search-index.json` im bestehenden Format ergänzt. Es entsteht keine zweite Suchdatei für die sichtbare Suche.

## WÖk-Mapping

Zusätzliche WÖk-Metadaten werden auf bestehende Felder gemappt:

- `documentType` -> `type` und `format`
- `status` -> `tags`
- `version` -> `tags`
- `relatedTerms` -> `instruments` und `aliases`
- `relatedDocuments` -> `tags`
- `originalPdfUrl` -> `public/data/woek-search-meta.json`
- `sectionId` -> `public/data/woek-search-meta.json`
- `documentId` -> `public/data/woek-search-meta.json`

## Ergebnisgruppen

Die bestehende UI filtert über `section`, `format`, `impactSpaces`, `standards`, `instruments` und `tags`. Für WÖk-Inhalte werden die bestehenden Felder genutzt, ohne eine neue Such-UI zu erzeugen.

Empfohlene WÖk-Labels:

- `Hauptwerk`
- `Arbeitspapier`
- `Begriff`
- `Instrument`
- `Beispiel`
- `Gesetzesentwurf`
- `Technische Leitlinie`
- `WÖk-ID`
- `Quelle`

## Buildbefehle

Aktueller bestehender Website-Build:

```bash
python3 tools/sync_layout.py
```

WÖk-Suchintegration:

```bash
node scripts/glossary/build-glossary-registry.mjs
node scripts/search/build-woek-search-index.mjs
node scripts/quality/check-search-integration.mjs
```

Wenn `npm` in CI verfügbar ist, sind dieselben Schritte über `package.json` abbildbar.

## Einschränkungen

- Lokal ist aktuell kein root-`npm` verfügbar; die Website ist im Bestand eine statische HTML-Site ohne Astro/Starlight-Projektstruktur.
- Der kanonische Hauptwerks-PDF-Name `Natalie-Weber_Die neue Ordnung des Wohlstands_2026.pdf` wurde lokal nicht gefunden. Vor einer führenden Hauptwerksveröffentlichung muss geklärt werden, ob die vorhandene DOCX-Neuauflage oder ein anderes PDF kanonisch ist.
- Die bestehende Suche kann zusätzliche Metadaten nur darstellen, wenn `assets/js/search.js` erweitert wird. Phase 1A erzeugt die Metadaten bereits strukturiert.

