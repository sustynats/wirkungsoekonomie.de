# Content Registry - Wiederverwendbare Inhalte

Stand: 2026-08-14. Maschinenlesbare Quellen im Repo (nutzen statt duplizieren): `assets/data/library-version-registry.json` (3196 Einträge, Statussystem), `assets/data/document-library.json`, `assets/data/document-registry.json` (12 kuratierte Kernwerke), `assets/data/blog-index.json` (149), `assets/data/glossary-lookup.json` (2121), `content/quellenarchiv/sources.json` (1024), `assets/search/search-index.json` (28 957).

## Bestände nach Typ (mit Reuse-Hinweis für Erklärungen)

| Typ | Umfang | Ort | reusable_for_explanation |
|---|---|---|---|
| Referenzbuch (Online) | 1670 Dateien, Kapitel + Glossar + Export | `referenz/` (+ `buch.html`, PDF) | ja - kapitelgenau zitierbar |
| Onlinefassungen führender Werke | WÖMM 2.0 (69 Kapitel), WÖMS 2.0, Begriffsleitfaden v1.3 u.a. | `bibliothek/eintraege/<key>/lesen/<NN-slug>/` (1 Kapitel = 1 zitierfähige URL mit Cite-Anker) | ja - bevorzugt für Belege |
| Glossar | 2281 Begriffsseiten, Aliase, Hover-Definitionen | `begriffe/` + Lookup-JSON + `/api/v1/glossary/` | ja - NIE Begriffe neu texten, verlinken |
| Whitepaper/Grundlagen-PDFs | 37 Originale + Lesefassungen | `public/downloads/originals/`, `dokumente/`, `assets/pdf/` | ja, Status prüfen (`reference-manifest.yaml`) |
| Studienskripte (Akademie-Lehrtexte) | u.a. `woek-g-v*`, `wirkungscontrolling-wc-v*`, `demokratie-schuetzen-*` v2-v11 | `content/studienskripte/`, `bibliothek/studienskripte/` | ja - didaktisch aufbereitete Tiefe |
| Journal/Blog | 149 Einträge (162 Dateien; 93 LinkedIn-Importe) + `journal/` (2) | `blog/`, `blog-index.json` | teils - redaktionelle Analysen (AfD-Programm, Wahl-O-Mat-Kritik) |
| Wirkungsradar | 139 Mythen-Checks (+live-Spiegel), 127 Debattenkarten, 18 Resonanzräume, 19 Ursachen, Psychologie-Muster, Antwort-/Host-Playbooks, Workshops, Unterricht | `wirkungsradar/`, `assets/data/wirkungsradar-*.json`, API `/api/v1/wirkungsradar/` inkl. Distribution-Kits + Embeds | **ja - Kern-Reuse fürs Parlament-Portal** (Claim-Prüfmuster) |
| Quellenarchiv | 1024 kuratierte Quellen mit WÖk-Einordnung | `/quellenarchiv/` (Spiegel), SoR Institut-API | ja - Claim-Belege |
| Methodenraum | 152 WÖMS-Methoden, 56 Canvas, 20 Journeys | `methodenraum/`, `public/data/woems-*.json`, API | ja |
| Podcast | 9 Episoden | `podcast/`, Audio via Releases | teils |
| Erklär-Demos | Erleben-Module, Quiz | `erleben/` | ja (interaktiv einbettbar teils) |
| Feeds | RSS: Bibliothek, Journal, Öffentl. Wirkungsraum, Podcast, Quellenarchiv, Start | `feeds/` | Abo-Infrastruktur |
| EN | 7 Seiten | `en/` | Lokalisierung minimal |

## Redaktionsregeln (aus dem Bestand abgeleitet)

1. **Erklärung gesucht? Erst `CONTENT_REGISTRY` + Glossar + Onlinefassungen prüfen** - neuen Text nur als Kontext-Kurzfassung mit Quellenlink (Bootstrap §24).
2. Zitate versionssicher: Onlinefassungs-Kapitel-URLs mit Cite-Ankern verwenden; Dokumentstatus aus `library-version-registry.json` beachten.
3. Blog-URLs sind unantastbar (URL-Regel in SITE-INVENTORY.md: nie löschen, nur Redirects).
4. Neue Inhalte laufen durch die Build-Pipeline (Suchindex/Taxonomie/Nav), sonst scheitert das PR-Gate.
