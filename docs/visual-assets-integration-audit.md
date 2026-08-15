# Audit: WÖk Visual Assets Integration

Stand: 2026-05-22

## 1. Uebernommene Dateien

Asset-Zielordner:

- `/assets/visuals/woek/`

Uebernommen wurden 14 PNG-Dateien und 14 WebP-Versionen:

- `woek_01_kompass_mensch_planet_demokratie`
- `woek_02_grundkreislauf_wirkung`
- `woek_03_von_daten_zur_steuerklasse`
- `woek_04_reverse_merit_order`
- `woek_05_wirkung_vs_wirkungspotenzial`
- `woek_06_soziale_marktwirtschaft_update`
- `woek_07_politik_reparaturstaat_wirkungsarchitektur`
- `woek_08_unternehmen_change_roadmap`
- `woek_09_scanner_ergebnislogik`
- `woek_10_evidenzraum_quellenarchitektur`
- `woek_11_wohnen_wirkungsraum`
- `woek_12_kondratieff_zyklen` (aktualisierte Kondratieff-Grafik im Format 1536 x 1024)
- `woek_13_medien_sprache_wirkpfad`
- `woek_14_wirkungseinkommen_wirkungsrente_konzept`

## 2. Manifest und Registry

Uebernommen wurden:

- `/docs/visuals/woek_visual_assets_manifest.md`
- `/content/visuals/woek_visual_assets_manifest.json`

Neu angelegt wurde:

- `/content/visuals/visual-source-registry.json`

Die Registry dokumentiert pro Visual:

- `visual_id`
- PNG-Datei
- WebP-Datei
- Zielseiten
- Visual-Typ
- Erstellungsart
- Konzeptbasis
- Hinweise zu Lizenz, Logos, Personen und Datenpraezision
- Alt-Text

## 3. Eingebundene Bilder und Seiten

| Visual | Seite(n) | Einsatz |
|---|---|---|
| `woek_01_kompass_mensch_planet_demokratie` | `/`, `/ordnung/` | Kompasslogik und Ordnungsmaßstab |
| `woek_02_grundkreislauf_wirkung` | `/modell.html` | Grundkreislauf der Wirkungsökonomie |
| `woek_03_von_daten_zur_steuerklasse` | `/modell.html` | Daten -> Bewertung -> Steuern/Preise/Kapital |
| `woek_04_reverse_merit_order` | `/modell.html` | Schutzregel und Nichtkompensation |
| `woek_05_wirkung_vs_wirkungspotenzial` | `/modell.html` | Begriffstrennung Wirkung vs. Wirkungspotenzial |
| `woek_06_soziale_marktwirtschaft_update` | `/ordnung/` | Soziale Marktwirtschaft als Ordnungsupdate |
| `woek_07_politik_reparaturstaat_wirkungsarchitektur` | `/fuer/politik.html` | Reparaturstaat vs. Wirkungsarchitektur |
| `woek_08_unternehmen_change_roadmap` | `/fuer/unternehmen.html` | Roadmap wirkungsorientierter Unternehmensfuehrung |
| `woek_09_scanner_ergebnislogik` | `/kompass.html`, `/scanner.html` | Scanner-Ergebnislogik |
| `woek_10_evidenzraum_quellenarchitektur` | `/evidenz/`, `/quellen/` | Evidenzraum und Quellenarchitektur |
| `woek_11_wohnen_wirkungsraum` | `/fuer/mieter.html` | Wohnen als Wirkungsraum |
| `woek_12_kondratieff_zyklen` | `/wissen/sechster-kondratieff.html` | 6. Kondratieff als Deutungsfolie |
| `woek_13_medien_sprache_wirkpfad` | `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` | Sprache als Wirkungspotenzial |
| `woek_14_wirkungseinkommen_wirkungsrente_konzept` | `/fuer/wirkungseinkommen.html`, `/fuer/rente.html` | Konzeptstatus Einkommen/Rente |

## 4. Alt-Texte und Captions

Alle eingebundenen Visuals verwenden Alt-Texte aus dem Manifest oder eine sinngleiche, manifestkonforme Formulierung.

Alle eingebundenen Visuals haben sichtbare Captions mit `woek-visual-caption`. Die Captions erklaeren die Grafik und vermeiden falsche Datenpraezision.

## 5. Einbindung

Alle Visuals werden als `<picture>` eingebunden:

- WebP-Quelle via `<source type="image/webp">`
- PNG-Fallback via `<img>`
- `loading="lazy"`
- `decoding="async"`
- `width="1600"`
- `height="900"`
- Klasse `woek-visual`

## 6. CSS und Mobile

Neue CSS-Klassen:

- `.woek-visual`
- `.woek-visual-caption`
- `.woek-visual-figure`
- `.woek-visual-scroll`

Breite Prozessgrafiken sind mobil in einem horizontal scrollbaren Container:

- `woek_03_von_daten_zur_steuerklasse`
- `woek_08_unternehmen_change_roadmap`
- `woek_12_kondratieff_zyklen`

Weitere Mobile-Varianten sind optional sinnvoll, aber nicht zwingend. Die meisten Visuals sind 16:9; die aktualisierte Kondratieff-Grafik liegt im Format 1536 x 1024 vor und bleibt mobil im Scrollcontainer, ohne hart beschnitten zu werden.

## 7. WebP

WebP-Versionen wurden fuer alle 14 PNGs erzeugt. Die WebP-Dateien sind kleiner als die PNG-Dateien.

## 8. Konsistenzpruefung

Geprueft wurde:

- JSON-Manifest ist valide.
- Visual-Registry ist valide.
- Alle referenzierten PNG- und WebP-Pfade existieren.
- Suchindex wurde neu gebaut.
- Zielgruppen-Seiten wurden ueber `tools/generate_fuer_pages.py` regeneriert.

## 9. Offene Punkte

- Fuer sehr schmale Mobilgeraete koennen spaeter dedizierte Mobile-Varianten fuer Prozessgrafiken erstellt werden.
- Eine Lightbox fuer Detailansicht waere ein sinnvolles spaeteres Komfort-Feature.
- Falls neue Visuals erzeugt werden, gelten die Prompt- und Rechte-Regeln aus dem Manifest: keine fremden Logos, keine realen Personen, keine markenfremden Stile, keine falsche Datenpraezision.
