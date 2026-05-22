# Visual Phase 1 Audit

Stand: 22. Mai 2026

## Ziel

Die erste Visual-Phase stattet zentrale Seiten mit kontrollierten, markenkonformen WÖk-SVGs aus. Die Visuals folgen dem Brand Guide: Ivory, Navy, Green, Gold, Coral sparsam, klare Linien, viel Weißraum, keine Clipart-, Stock-, Canva-, Startup- oder KI-Posteroptik.

## Neu erstellte Visuals

| visual-id | Kategorie | Desktop | Mobile |
|---|---|---|---|
| `woek_start_hero_architecture` | hero | `assets/visuals/hero/woek_start_hero_architecture.svg` | `assets/visuals/hero/woek_start_hero_architecture_mobile.svg` |
| `woek_funktionsweise_kreislauf` | model | `assets/visuals/model/woek_funktionsweise_kreislauf.svg` | `assets/visuals/model/woek_funktionsweise_kreislauf_mobile.svg` |
| `woek_wirkung_einfach_flow` | explainer | `assets/visuals/explainers/woek_wirkung_einfach_flow.svg` | `assets/visuals/explainers/woek_wirkung_einfach_flow_mobile.svg` |
| `woek_medien_demokratie_wirkpfade` | flow | `assets/visuals/flows/woek_medien_demokratie_wirkpfade.svg` | `assets/visuals/flows/woek_medien_demokratie_wirkpfade_mobile.svg` |
| `woek_kondratieff_system` | model | `assets/visuals/model/woek_kondratieff_system.jpg` | keine separate Mobile-Version |
| `woek_unternehmen_wirkungsnetz` | flow | `assets/visuals/flows/woek_unternehmen_wirkungsnetz.svg` | `assets/visuals/flows/woek_unternehmen_wirkungsnetz_mobile.svg` |
| `woek_politik_wirkungssteuerung` | flow | `assets/visuals/flows/woek_politik_wirkungssteuerung.svg` | `assets/visuals/flows/woek_politik_wirkungssteuerung_mobile.svg` |
| `woek_buerger_alltag_wirkung` | explainer | `assets/visuals/explainers/woek_buerger_alltag_wirkung.svg` | `assets/visuals/explainers/woek_buerger_alltag_wirkung_mobile.svg` |
| `woek_akademie_lernarchitektur` | model | `assets/visuals/model/woek_akademie_lernarchitektur.svg` | `assets/visuals/model/woek_akademie_lernarchitektur_mobile.svg` |

Zusätzlich wurde `woek_modell_auf_einen_blick_v2` aus dem Legacy-Ordner in die neue Kategorie `assets/visuals/model/` gespiegelt und dort auf `/modell.html` sowie `/buch.html` eingebunden.

Die bisherige generierte Social-/Hero-Datei wurde durch einen gerenderten Export des neuen kontrollierten Hero-SVG ersetzt:

- `assets/img/generated/hero-systemgrafik-wirkungsoekonomie.png`
- `assets/img/generated/hero-systemgrafik-wirkungsoekonomie.webp`

Damit bleiben bestehende OG-/Twitter-Metadaten technisch gültig, zeigen aber nicht mehr auf die alte generische Bildsprache.

## Eingebundene Seiten

- `/`
- `/wirkungsoekonomie.html`
- `/modell.html`
- `/buch.html`
- `/funktionsweise/`
- `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`
- `/wissen/sechster-kondratieff.html`
- `/fuer/politik.html`
- `/fuer/unternehmen.html`
- `/fuer/buergerinnen.html`
- `/akademie.html`

## Einheitliche Einbindung

Neue Seitenvisuals nutzen:

- `figure.woek-system-visual`
- responsives `<picture>`
- Desktop-SVG und Mobile-SVG
- Alt-Text
- Caption
- einheitliche Rahmen, Hintergrund, Schatten und Abstände über `assets/css/style.css`

## Website-Prüfung

Identifiziert:

- Startseite hatte noch ein generiertes Hero-Bild; ersetzt durch kontrolliertes Hero-SVG.
- `/funktionsweise/` war text- und Prozessketten-lastig; ergänzt um systemisches Modellvisual.
- `/wirkungsoekonomie.html` hatte die einfache Wirkungslogik nur textlich; ergänzt um didaktische Flussgrafik.
- Medien/Demokratie brauchte mehrere Wirkungspfade; Phase 1 ergänzt eine übergeordnete Wirkungsflussgrafik.
- Kondratieff-Seite hatte zwischenzeitlich ein zu knappes SVG und einen internen Visual-System-Abschnitt; korrigiert auf das nutzerfreigegebene Kondratieff-Basisvisual und die eigentliche Inhaltsseite.
- Zielgruppen Unternehmen, Politik und Bürger:innen wurden um passende Systemvisuals ergänzt.
- Akademie wurde um eine Lernarchitektur-Grafik ergänzt.

Offen:

- Weitere Unterseiten wie Rente, Wirkungseinkommen, Mieter:innen, Kommunen und Investor:innen sollten in Phase 2 eigene kontrollierte Visuals erhalten.
- Alte PNG-Visuals in `assets/visuals/woek/` sind inhaltlich nützlich, sollten aber schrittweise in kontrollierte SVGs überführt werden.
- Browser-Screenshot-QA bleibt wünschenswert, sobald ein lokaler Playwright-Browser verfügbar ist.

## Technische Checks

- Alle erzeugten SVGs wurden als XML geparst.
- Bearbeitete HTML-Seiten wurden mit Python-HTMLParser geparst.
- `content/visuals/visual-source-registry.json` wurde aktualisiert und validiert.
- Lokale HTTP-Checks lieferten `200 OK` für `/`, `/funktionsweise/`, zentrale SVGs und das gerenderte Social-PNG.
