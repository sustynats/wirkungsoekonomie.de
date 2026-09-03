# Handoff Claude → Codex: Wirkungsticker – visuelle Anker, KI-Visuals und Titelbilder

Stand: 2026-09-03 · Branch `claude/wirkungsticker-visual-ux` · Lane: Claude = Templates, CSS, Icons, Titelbildsystem; Codex = Pipeline (`lib.mjs`, `run.mjs`), Qualitätsgate, Workflows, Higgsfield-Anbindung.

## 1. Was Claude geändert hat (bitte nicht zurückbauen)

| Bereich | Datei(en) | Kern |
|---|---|---|
| Visual-Modul | `scripts/news/visuals.mjs` (neu) | Icon-Sprite, Themen-Icons, Dimensionsmeter, Verfahrensstand, Wirkpfad-Grafik, Materialität, Auf-einen-Blick-Leiste; Vertrag + `sanitizeVisuals()` für optionale KI-Visuals unter `analysis.visuals` |
| Templates | `scripts/news/build.mjs` | Übersicht: Toolbar (Suche + Aktualisieren), gruppierte Filter mit Zählern, Karten mit Quelle/Status/Metern, Meldungen direkt nach dem Hero, App- und Methodik-Block unten. Detailseite: Primärquelle als Button, Auf-einen-Blick, Abschnittsnavigation, „Worum geht es?“ (von Codex) → Faktencheck → Analyse → Einordnung (Meter) → Folgencheck (Wirkpfad-Grafik + Risiken) → Bedeutung → Offen; Quellenakte mit Herausgeber-Badges; Versionsverlauf als Zeitleiste |
| Styles/JS | `assets/css/news.css`, `assets/js/news.js`, `assets/js/news-pwa.js` | Filterleiste klebt jetzt unterhalb des Site-Headers (vorher lag sie hinter dem sticky Header), Karten sind ganzflächig klickbar, Zähler pro Filter, „Aktualisieren“ auch in der Toolbar |
| Tests | `tests/news/visuals.test.mjs`, `tests/news/title-image.test.mjs` | laufen in `npm run news:test` mit |
| Titelbildsystem | `scripts/news/title-image/*`, `docs/ops/WIRKUNGSTICKER-TITELBILD.md`, `docs/ops/title-image-previews/` | zwei Modi, SVG-Renderer, Rasterizer-Adapter, Vorschauen, Doku |

Alle Marker, die `scripts/news/validate.mjs` prüft, sind erhalten („Methodik und Qualitätsgate“, „Fakten- &amp; Folgencheck öffnen“, „Ausgangsmeldung vom“, „WÖk-Analyse aktualisiert“, „Worum geht es?“, „Originalquelle ansehen“, Reihenfolge Quelle → Faktencheck → Analyse → Folgencheck, „Erste Ordnung – unmittelbar“, „Risiken, Gegenläufe und Prüfgrenzen“). `npm run news:test`, `news:build`, `news:validate` sind grün.

Hinweis zur Entscheidung „Titelbilder“: keine generischen KI-Fotos als Artikelbilder. Das Titelbildsystem trennt bewusst ein gekennzeichnetes, symbolisches Editorial-Motiv von der Wirkungskarte aus Analysedaten; beides ist Darstellung, nie Beleg.

## 2. Auftrag A: KI-Visuals in der Pipeline aktivieren

Ziel: Sobald eine neue oder materiell aktualisierte Akte analysiert wird, liefert die WÖk-KI optional strukturierte Visual-Daten, die Claude-seitig bereits gerendert werden (Kennzahlen-Kacheln, Balkendiagramm, Termine, Betroffenengruppen, Tendenz je Dimension). Ohne diese Daten rendert die Seite die deterministischen Anker (Meter, Verfahrensstand, Wirkpfad) – also nichts blockiert.

### A1 Prompt erweitern (`scripts/news/lib.mjs`, `buildAnalysisPrompt`)

```js
import { VISUALS_SCHEMA, VISUALS_PROMPT_RULES } from "./visuals.mjs";
// im Schema-Objekt der Analyse:  visuals: VISUALS_SCHEMA,
// vor "Gib ausschließlich valides JSON ohne Markdown aus":  ...VISUALS_PROMPT_RULES,
```

Die Regel „insgesamt höchstens 4200 Zeichen je Analyse“ auf 5000 anheben; `AI_ANALYSIS_TOO_LARGE` (18000) bleibt. Antwortgröße gegen das Upstream-Limit prüfen (Claude-Schätzung: +300 bis +700 Zeichen je Analyse).

### A2 Sanitizer vor dem Gate (`scripts/news/run.mjs`)

Vor `validateAnalysis(analysis, candidate)`:

```js
import { sanitizeVisuals } from "./visuals.mjs";
const { visuals, dropped } = sanitizeVisuals(analysis.visuals, candidate);
analysis.visuals = visuals;               // null, wenn nichts Belegtes übrig bleibt
if (dropped.length) report.visuals_dropped = [...(report.visuals_dropped || []), { story_id: candidate.story_id, dropped }];
```

Wichtig: Der Sanitizer muss **vor** `validateAnalysis` laufen, weil `collectStrings()` sonst unbelegte Zahlen in `visuals` als `AI_UNSUPPORTED_NUMBER` wertet und die ganze Analyse blockiert. Nach dem Sanitizer enthalten die Visuals nur Zahlen, Termine und Gruppen, die in Claims oder Quelltext stehen (gleiche `numberTokens`-Logik wie das Gate). Numerische Chart-Werte prüft der Sanitizer selbst.

### A3 Gate-Ergänzungen (`validateAnalysis`)

- `visuals` darf fehlen oder `null` sein; kein Pflichtfeld.
- Keine Sätze-/Längenprüfung auf `visuals` anwenden (nur Zahlen- und HTML-Prüfung, die über `collectStrings` bereits greifen).
- Tests in `tests/news/wirkungsticker.test.mjs`: Prompt enthält `visuals`, Analyse mit unbelegter Kennzahl wird nach Sanitizer trotzdem veröffentlicht (Kennzahl entfernt), Analyse mit belegter Kennzahl behält sie, `report.visuals_dropped` wird geschrieben.

### A4 Wann die KI welches Visual liefern soll (Prompt-Regeln sind in `VISUALS_PROMPT_RULES`)

| Visual | Bedingung | Nie |
|---|---|---|
| `key_figures` (≤ 3) | mindestens eine materielle Zahl steht wörtlich im Claim/Quelltext (Betrag, Anzahl, Quote, Jahr) | umgerechnete, summierte, geschätzte Zahlen; Zahlen aus Kontextwissen |
| `chart` (Balken, 3–8 Punkte) | Quelle nennt ≥ 3 vergleichbare Zahlen derselben Einheit (Zeitreihe, Kategorien) | gemischte Einheiten, Prognosen der KI |
| `timeline` (≤ 4) | Quelle nennt konkrete Termine/Fristen (Inkrafttreten, Frist, Laufzeit) | erschlossene Termine |
| `affected_groups` (≤ 4) | Betroffene sind aus dem Sachverhalt erkennbar; feste Liste | freie Gruppenbezeichnungen |
| `tendency` je Dimension | immer, wenn eine analytische Tendenz begründbar ist; sonst `offen` | „eingetretene Wirkung“ bei ex ante |

Die Detailseite platziert Kennzahlen, Diagramm und Termine im Abschnitt „Worum geht es?“ (Quellenfakten) und Betroffenengruppen/Tendenz in „Analyse/Einordnung“. Bestehende Akten bekommen Visuals erst bei ihrer nächsten materiellen Aktualisierung; **kein Backfill-Lauf** (Budget), die deterministischen Anker decken sie ab.

## 3. Auftrag B (später, separater Schritt): Titelbilder und Higgsfield

Nicht Teil dieses Handoffs; hier nur die Schnittstelle, damit nichts doppelt gebaut wird. Details in `docs/ops/WIRKUNGSTICKER-TITELBILD.md`.

1. **Datenfeld** `story.title_image = { mode: "editorial" | "impact_card", src?, focus?, generated_at?, reason? }` im internen Datensatz; `storyToTitleInput()` liest es bereits.
2. **Moduswahl** in der Pipeline nach der Analyse (Kriterien in der Doku, Abschnitt „Vorbereitete Entscheidungslogik“); Standard = `impact_card`. Editorial nur, wenn ein neutrales Motiv sicher ist.
3. **Motivgenerierung** (Higgsfield) nur für Editorial: Prompt ohne Text/Logo, Safe-Area-Vorgabe aus `SAFE_AREAS.landscape` („Motivschwerpunkt rechts/mittig; nichts Wichtiges im linken unteren Drittel, linken oberen Streifen und der rechten unteren Ecke“), Ergebnis als Datei unter `wirkungsticker/<slug>/titelbild-motiv.jpg` (oder Release-Asset, siehe Plattform-Architektur).
4. **Rendering im Build**: `renderTitleImageFromStory(story, { size: "og" })` → `rasterize()` → `wirkungsticker/<slug>/titelbild-og.png`; `og:image`/`twitter:image` in `pageShell()` darauf zeigen (aktuell statisches Hero-Bild). Bei `NO_RASTERIZER` oder Fehler: statisches Fallback-Bild behalten, Veröffentlichung läuft weiter.
5. **CI-Rasterizer**: entweder `@resvg/resvg-js` als einzige Dev-Abhängigkeit (plus TTF-Kopien der Fonts) oder Chromium im Runner (`WT_CHROME_BIN`). Vorher `npm run check:hosting-cost`.
6. **Fallback-Kette**: Editorial → (Fehler/Timeout/Prüfung negativ) → Wirkungskarte → (kein Rasterizer) → statisches Bild. Nie blockierend.
7. Optional: Analysefeld `title_short` (≤ 90 Zeichen) für Titel über 90 Zeichen, damit keine Kürzung nötig ist.

## 4. Abnahme

- `npm run news:test && npm run news:build && npm run news:validate` grün.
- Eine Testanalyse mit `visuals` (belegte und unbelegte Zahl) durchläuft Sanitizer und Gate; die Detailseite zeigt die belegte Kennzahl im Abschnitt „Worum geht es?“.
- `reports/wirkungsticker-latest-run.json` enthält `visuals_dropped`, wenn etwas verworfen wurde.
- Kein Vercel-Build, kein neuer Workflow, keine neue Abhängigkeit ohne Rücksprache.
