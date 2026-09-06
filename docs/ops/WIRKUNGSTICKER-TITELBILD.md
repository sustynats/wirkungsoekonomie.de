# Wirkungsticker: Titelbildsystem (Editorial Symbolbild und Wirkungskarte)

Ein gemeinsames WÖk-Designsystem für Titel- und Share-Bilder des Wirkungstickers mit zwei gleichberechtigten Darstellungsmodi. Beide Modi teilen Rahmen, Branding, Rubrik, Überschriftenlogik, Farben, Schriften, Abstände und Fußzeile; sie unterscheiden sich nur in der rechten bzw. oberen Bildzone: extern generiertes Symbolbild (`editorial`) oder Wirkungskarte aus Analysedaten (`impact_card`).

Leitidee: **Nachricht verstehen → Fakten prüfen → Wirkung einordnen.** Kein Boulevard, keine Alarmoptik, keine Kampagnenkommunikation. Editorial Symbolbild = visuelle Übersetzung des Themas; Wirkungskarte = visuelle Übersetzung der Analyse.

Der ursprüngliche Designschritt umfasst Designsystem, Rendering, Vorschauen und Dokumentation. Seit dem Folgepaket vom 4. September ist die automatische Pipeline ergänzt: siehe [Betrieb, Backfill und Authentifizierungsgrenzen](WIRKUNGSTICKER-TITELBILD-PIPELINE.md). Die nachstehenden Entwurfsangaben bleiben als Designvertrag erhalten.

## Speicherort und Entry Point

| Was | Pfad |
|---|---|
| Rendering-Kern (beide Modi, Presets, Safe Areas) | `scripts/news/title-image/index.mjs` |
| Textmaß und Zeilenumbruch | `scripts/news/title-image/text.mjs` |
| Glyphenbreiten der Markenfonts (generiert) | `scripts/news/title-image/font-metrics.json` |
| Messseite für die Glyphenbreiten (nur bei Fontwechsel nötig) | `scripts/news/title-image/measure-fonts.html` |
| Rasterizer-Adapter SVG → PNG | `scripts/news/title-image/rasterize.mjs` |
| Neutrale Platzhaltermotive für Vorschauen | `scripts/news/title-image/placeholders.mjs` |
| Vorschau-Generator und Galerie | `scripts/news/title-image/preview.mjs` |
| Vorschauen (SVG, PNG, `index.html`, `report.json`) | `scripts/news/title-image/previews/` |
| Icons und Dimensionslogik (geteilt mit den Ticker-Seiten) | `scripts/news/visuals.mjs` |

Entry Points:

```js
import { renderTitleImage, renderTitleImageFromStory, storyToTitleInput, SIZES, SAFE_AREAS, describeSystem } from "./scripts/news/title-image/index.mjs";
import { rasterize, availableRasterizers } from "./scripts/news/title-image/rasterize.mjs";

const result = renderTitleImage(input, { size: "og", fonts: "embed" });
// result = { svg, width, height, mode, size, layout: { headlineSize, lines, truncated, safeAreas }, warnings }

const png = await rasterize(result.svg, { width: result.width, height: result.height, outFile: "wirkungsticker/<slug>/titelbild-og.png" });
```

`renderTitleImageFromStory(story, { mode, image, size })` bildet eine Ticker-Akte (interner Datensatz aus `data/news/stories.json` oder öffentlicher Datensatz aus `wirkungsticker/data/stories.json`) automatisch auf die Eingaben ab und liest optional ein künftiges Feld `story.title_image = { mode, src, focus }`.

## Rendering-Technologie und Entscheidung

- **SVG aus Template-Literalen in reinem Node** - derselbe Stil wie `scripts/news/build.mjs`. Das Projekt hat keine npm-Abhängigkeiten; das bleibt so.
- **Deterministischer Zeilenumbruch ohne Browser**: `text.mjs` misst Text über gemessene Glyphenbreiten der Markenfonts (`font-metrics.json`, 6 Schnitte, 190 Zeichen inkl. Umlauten, Gedankenstrichen, Anführungszeichen, plus Kerningpaare, 3 % Reserve). Dadurch sind Zeilenzahl, Schriftgröße und Kürzung reproduzierbar und testbar.
- **Fonts eingebettet**: Standard `fonts: "embed"` bettet die vorhandenen WOFF2-Dateien aus `assets/fonts/` als Data-URI in das SVG ein (ca. 0,8 MB pro SVG, nur Zwischenformat). `fonts: "link"` verlinkt sie relativ (für die Galerie), `fonts: "none"` nutzt Systemfallbacks.
- **PNG über `rasterize.mjs`**, Reihenfolge: `@resvg/resvg-js` (falls installiert), `rsvg-convert`, Chrome/Chromium headless. Auf dem Mac ist Chrome vorhanden (`/Applications/Google Chrome.app`); die Vorschauen entstanden damit. Für GitHub Actions empfiehlt sich `@resvg/resvg-js` als einzelne Dev-Abhängigkeit **oder** Chromium im Runner (`sudo apt-get install chromium-browser`, Variable `WT_CHROME_BIN`). resvg rendert keine WOFF2 aus `@font-face`; dafür einmalig TTF-Kopien der beiden Fonts ablegen (`fontDirs`) oder Chromium verwenden. Beides ist Teil des Codex-Folgeschritts.
- Fehlt jeder Rasterizer, liefert `rasterize()` den Fehler `NO_RASTERIZER`; das SVG bleibt als Ergebnis nutzbar, die Veröffentlichung darf davon nie abhängen.

## Fonts und Farben

Schriften (aus `assets/fonts/`): Source Serif 4 (600, 700) für die Überschrift, Inter (400, 500, 600, 700) für Branding, Rubrik, Meter, Fußzeile. Fallbacks: Georgia/serif bzw. system-ui/sans-serif.

Farben (`PALETTE` in `index.mjs`, abgeleitet aus `assets/css/style.css` und dem Ticker-Hero):

| Rolle | Wert |
|---|---|
| Grund (Verlauf 145°) | `#07152C` → `#102D3A` → `#174F43` |
| Goldakzent (Radial oben rechts, Akzentlinie, Rubrik, Wortmarke „Wirkungsticker“) | `#C89B3C` |
| Text | `#FFFFFF`, gedämpft `rgba(255,255,255,.74)` |
| Dimensionsmeter auf dunklem Grund | Mensch `#B9C7EA`, Planet `#63C08F`, Demokratie `#E1B65C` |
| Status „auf Verfahrensspur“ | `#7ED4A6` |
| Panel Wirkungskarte | Weiß 7 % Fläche, Weiß 16 % Kontur, Radius 18 px |

Die Meter entsprechen den vier Segmenten auf den Ticker-Seiten (gering 1, mittel 2, hoch 3, sehr hoch 4; „offen“ = gestrichelte Leerstufen). Farbe trägt die Identität der Dimension, die Stufe wird über Segmentzahl und Textlabel gelesen, nie über Farbe allein.

## Ausgabegrößen

| Key | Größe | Layout | Einsatz |
|---|---|---|---|
| `og` | 1200 × 630 | landscape | OpenGraph, LinkedIn, X (1,91:1). **Hauptformat** für Share-Bilder. |
| `wide` | 1200 × 675 | landscape | Website, 16:9, Karten. |
| `square` | 1080 × 1080 | square | Social-Posts. |

Alle Maße skalieren über `u = Breite / 1200`; ein eigenes `{ width, height }` ist zulässig (quadratisch → square-Layout, sonst landscape). Für die Website ist 1200 × 675 vorgesehen, für OpenGraph 1200 × 630: identisches Layoutsystem, nur die Höhe unterscheidet sich. Kleine Darstellung: das Bild wird als Vektor bzw. PNG herunterskaliert; die Vorschau-Galerie zeigt jede Variante zusätzlich bei 360 px Breite.

## Eingabefelder (beide Modi)

```js
{
  mode: "editorial" | "impact_card",
  headline: "string, Pflicht",
  category: ["Energie", "Gesundheit"] | "Energie · Gesundheit" | null,   // frei; bekannte Begriffe bekommen ein Icon
  source: "Bundesregierung kompakt" | null,                             // Herausgeber, keine URL
  date: "2026-09-02" | ISO | "02.09.2026" | null,                        // Ausgangsmeldung
  dimensions: { human: "hoch", planet: "mittel", democracy: "offen" } | null,   // Stufen wie im Analyse-Schema; auch { relevance } akzeptiert
  status: "beschlossen" | ... | null,                                    // Verfahrensstand aus dem Analyse-Schema
  analysisType: "ex_ante" | "monitoring" | "ex_post" | null,
  image: { src, focus: "right" | "center" | "left" } | "src" | null,    // nur editorial; Datei-/HTTPS-URL oder Data-URI
  label: "string" | null                                                // Standard: „KI-generiertes Symbolbild“ bzw. „Wirkungskarte · WÖk-Einordnung“
}
```

Optionen: `{ size: "og" | "wide" | "square" | { width, height }, fonts: "embed" | "link" | "none", fontBase }`.

Rückgabe-Warnungen (`warnings`): `EDITORIAL_IMAGE_MISSING` (Motiv fehlt, automatisch Wirkungskarte gerendert), `HEADLINE_TRUNCATED`, `HEADLINE_NEAR_BRAND`, `CATEGORY_ICON_FALLBACK`, `IMPACT_DATA_MISSING` (keine Wirkungswerte und kein Status: Panel wird zum Themen-Symbol), `MODE_INVALID`.

## Gemeinsame Designfamilie

- **Grund**: derselbe Navy-Verlauf wie der Hero der Ticker-Seiten; im Editorial-Modus liegt das Motiv darüber und wird von links unten mit Navy abgedeckt.
- **Branding oben links**: WÖk-Signet (46 u) + „WIRKUNGSÖKONOMIE“ (Inter 600, 15 u, Spationierung) + Trennstrich + „WIRKUNGSTICKER“ in Gold.
- **Textblock unten links** mit goldener Akzentlinie (5 u) links: Rubrik als Kicker (Icon + Versalien in Gold), darunter die Überschrift (Source Serif 4 700, Weiß).
- **Fußzeile**: links Quellen-Icon + „Herausgeber · Ausgangsmeldung Datum“ (gekürzt auf 60 % Breite), rechts eine Kennzeichnungs-Pille.
- **Rubrik**: bis zu drei Begriffe, mit „·“ verbunden; Icon aus `CATEGORY_ICONS` (Politik, Wirtschaft, Klima, Energie, Arbeit, Soziales, Gesundheit, Digitalisierung, KI, Europa, Geopolitik, Finanzen, Bildung, Demokratie, Gesellschaft, Infrastruktur, Technologie, Ressourcen, Sicherheit, Verkehr, Wohnen, Steuern, Umwelt, …); unbekannte Begriffe erhalten das neutrale Meldungs-Icon und werden trotzdem beschriftet.

### Headline-Regeln

- Schriftgrößen (landscape) 62 → 54 → 47 → 41 u; (square) 58 → 50 → 44 → 38 u. Zeilenhöhe 1,12.
- Es wird die **größte** Größe gewählt, bei der der Text ohne erzwungene Worttrennung in höchstens **3 Zeilen** passt. Erst danach werden Trennungen an vorhandenen Bindestrichen zugelassen, dann bei der kleinsten Größe bis zu **5 Zeilen** (landscape) bzw. 4 Zeilen (square).
- Reicht auch das nicht, wird nach der letzten vollständig passenden Zeile mit „ …“ gekürzt und `HEADLINE_TRUNCATED` gemeldet. Empfehlung für die Pipeline: bei Titeln über etwa 90 Zeichen ein kurzes `headline`-Feld liefern (z. B. `title_short` aus der Analyse), statt sich auf die Kürzung zu verlassen.
- Kein Verkleinern unter 41 u (≈ 41 px bei 1200 px Breite); damit bleibt die Überschrift auch bei 360 px Kartenbreite lesbar (≈ 12 px).

## Modus A: Editorial Symbolbild

Eingabe zusätzlich: `image.src` (Bilddatei ohne Text, ohne Branding; 16:9 oder größer, mindestens 1200 px breit; JPG/PNG/WebP oder Data-URI), optional `image.focus`.

Darstellung: Motiv füllt den gesamten Rahmen (`preserveAspectRatio` slice, Ausrichtung rechts). Darüber liegen drei Verläufe: diagonal von links unten (Navy 96 % → 0 %), ein schmaler dunkler Streifen oben für das Branding und ein Bodenverlauf für die Fußzeile. Seit Template `woek-title-2-overlay` enthält auch das Editorial dasselbe „Wirkung auf“-Panel an derselben Position wie die Wirkungskarte, auf Navy mit 92 % Deckkraft. Die Website-Variante wiederholt weder die HTML-Überschrift noch ein zusätzliches Themen-Icon im Motiv. Alle Text- und Brandingelemente werden programmatisch gesetzt; das Motiv enthält nie Text.

Kennzeichnung: Pille unten rechts mit Funken-Icon und Text **„KI-generiertes Symbolbild“** (Inter 600, 13 u). Sie ist Standard und Pflicht für generierte Motive; nur wenn ein lizenzfreies Originalbild der Quelle verwendet wird, darf `label` überschrieben werden (z. B. „Foto: Europäische Kommission“).

### Safe Areas (Anteile der Bildfläche, x/y/w/h)

Landscape (`og`, `wide`):

| Zone | x | y | w | h | Bedeutung |
|---|---|---|---|---|---|
| `brand` | 0 | 0 | 0,55 | 0,16 | Signet und Wortmarke, oben links |
| `text` | 0 | 0,46 | 0,57 | 0,54 | Rubrik, Überschrift, Quelle, unten links |
| `label` | 0,64 | 0,88 | 0,36 | 0,12 | Kennzeichnung, unten rechts |
| `motifFocus` | 0,08 | 0,18 | 0,48 | 0,28 | Erkennbares Motivdetail oberhalb der Überschrift, links vom Panel |
| `impactPanel` | 0,60 | 0,16 | 0,36 | 0,73 | Rechte Seite für das programmatisch gesetzte Panel freihalten |

Square: `brand` 0/0/0,70/0,10 · `text` 0/0,58/1/0,42 · `label` 0,55/0,93/0,45/0,07 · `motifFocus` 0,08/0,12/0,84/0,42.

Vorgabe seit Prompt `woek-editorial-3-concrete`: Konkretes erkennbares Objekt oder generische Umgebung aus der neutralen Nachricht, natürliche Materialien und Farben statt abstrakter Netzwerke. Identifizierendes Motivdetail links/mittig oberhalb der Überschrift; die Umgebung darf das Bild füllen. Rechte Seite, Textbereich, Branding und Kennzeichnung ruhig halten. Keine Personen, Schrift, Logos oder dokumentarische Nachstellung eines konkreten Ereignisses. Die Zonen liegen maschinenlesbar in `SAFE_AREAS`; neue Vorschauen übernehmen sie in `system.safeAreas`. Bereits gespeicherte Originale werden durch eine Promptänderung nicht automatisch kostenpflichtig ersetzt.

## Modus B: Wirkungskarte

Eingabe: `headline`, `category`, `source`, `date`, `dimensions`, `status`, `analysisType`. Kein Bild.

Darstellung (landscape): rechts ein Panel (x ab 60 % Breite) mit Titel „WIRKUNG AUF“, drei Zeilen Mensch / Planet / Demokratie (Icon, Label, Stufe als Text, 4-Segment-Meter in Dimensionsfarbe) und darunter zwei Chips: Verfahrensstand (Haken bei Verfahrensspur, Uhr bei „laufende Entwicklung“/„offen“) und Analyseart (Ex ante, Monitoring, Ex post). Square: dasselbe Panel quer über die Bildbreite mit drei Spalten, Text darunter.

Informationsmenge ist bewusst begrenzt: drei Meter, zwei Chips, Rubrik, Überschrift, Herausgeber, Datum. Keine Zahlen, keine Begründungstexte, keine Materialitätsfaktoren - das bleibt der Detailseite vorbehalten.

Verhalten bei fehlenden Werten:

| Fall | Verhalten |
|---|---|
| einzelne Dimension fehlt oder „offen“ | Meter mit gestrichelten Leerstufen und Label „offen“ |
| alle Dimensionen fehlen, Status vorhanden | Panel mit drei offenen Metern und Status-Chip |
| Dimensionen und Status fehlen | kein Panel; großes Themen-Icon als ruhiges Symbol in der rechten Zone, Warnung `IMPACT_DATA_MISSING` |
| Rubrik fehlt | Kicker entfällt, Überschrift rückt nach oben; Icon entfällt |
| Quelle/Datum fehlen | Fußzeile links leer, Kennzeichnung bleibt |
| Status außerhalb der Verfahrensspur | Chip mit Uhr-Icon statt Haken |

Die Wirkungskarte ist zugleich der technische Fallback: `renderTitleImage({ mode: "editorial", image: null, … })` liefert automatisch `mode: "impact_card"` mit `EDITORIAL_IMAGE_MISSING`. Ein fehlendes, verspätetes, abgelehntes oder nicht rasterisierbares Motiv darf eine Veröffentlichung nie blockieren.

## Vorbereitete Entscheidungslogik (noch nicht produktiv)

Das System erwartet später pro Akte ein Feld `title_image` (z. B. `{ mode: "editorial", src: "…/titelbild-motiv.jpg", focus: "right" }` oder `{ mode: "impact_card" }`). `storyToTitleInput()` liest es bereits. Die Wahl trifft Codex in der Pipeline: Editorial nur bei neutral visualisierbaren Themen ohne reale Personen, ohne erfundene Szene und ohne Fehlinterpretationsrisiko; Wirkungskarte bei Gewalt, Opfern, Kindern, ungeklärten Verantwortlichkeiten, Personenbeschuldigungen, politischen Personendarstellungen, unsicherer Generierung, fehlendem neutralem Motiv oder Fehlern der externen Generierung.

## Vorschauen

```bash
node scripts/news/title-image/preview.mjs            # schreibt scripts/news/title-image/previews/
open scripts/news/title-image/previews/index.html
```

Fälle: Referenz „Stärkerer Schutz kritischer Infrastrukturen“, lange Überschrift (2-3 Zeilen), sehr kurze Überschrift, sehr lange deutsche Überschrift (Kürzung), fehlende Kategorie, fehlende Quelle und Datum, fehlende Wirkungswerte, nur eine relevante Dimension, mehrere sehr relevante Dimensionen mit unbekannter Rubrik - jeweils in beiden Modi und allen drei Größen, dazu die Smartphone-Darstellung (360 px) und der Fallback „Editorial ohne Motiv“. `report.json` listet pro Rendering Schriftgröße, Zeilenzahl, Kürzung und Warnungen.

Die Platzhaltermotive sind abstrakte, textfreie Systemgrafiken (`placeholders.mjs`) und stehen nur stellvertretend für spätere Symbolbilder.

## Tests

`tests/news/title-image.test.mjs` prüft Zeilenumbruch und Größenwahl, beide Modi, alle Presets, Safe Areas, Fallback ohne Motiv, fehlende Werte und die Abbildung einer Ticker-Akte. Ausführung über `npm run news:test`.
