# WÖk-Modellvisual v2 Audit

Stand: 22. Mai 2026

## 1. Entfernte / verschobene alte Visuals

Die zuletzt eingebundene KI-Poster-Variante wurde aus der öffentlichen Einbindung entfernt und in den internen Ablehnungsordner verschoben:

- `assets/visuals/rejected/wirkungsoekonomie-modell-auf-einen-blick.ai-poster-rejected.png`
- `assets/visuals/rejected/wirkungsoekonomie-modell-auf-einen-blick.ai-poster-rejected.webp`

Im Projekt wurden keine Dateien mit folgenden Namen gefunden:

- `strategic_overview_of_impact_economy.png`
- `impact_economy_at_a_glance.png`
- `imagegen.png`

Diese Varianten sind nicht öffentlich eingebunden.

## 2. Neue Dateien

Neu erstellt:

- `assets/visuals/woek/woek_modell_auf_einen_blick_v2.svg`
- `assets/visuals/woek/woek_modell_auf_einen_blick_v2_mobile.svg`

Die Grafik ist als kontrolliertes SVG/Layout umgesetzt, nicht als KI-generiertes Textbild.

## 3. Einbindung

Das neue Visual ist eingebunden auf:

- `/modell.html`
- `/buch.html`

Beide Seiten verwenden ein responsives `<picture>`:

- Desktop: `woek_modell_auf_einen_blick_v2.svg`
- Mobile bis 760 px: `woek_modell_auf_einen_blick_v2_mobile.svg`

## 4. Begriffsprüfung

Die Grafik verwendet die verbindlichen Begriffe:

- Wirkung
- Wirkungspotenzial
- Zustandsveränderung
- Wirkungsbewertung
- Netto-Wirkung
- positive Netto-Wirkung
- Wirkungslenkung
- Rückkopplung
- Lernen
- WÖk-ID
- Scorecard
- Schutzregel
- Wirkungsrat
- Mensch
- Planet
- Demokratie
- SDGs
- Agenda 2030
- SDG+

Vermieden wurden weichere Ersatzbegriffe wie `Nutzen` als Ersatz für Wirkung, unscharfe Zielgrößen wie `mehr positive Wirkung` sowie nicht belegte Datenpräzision.

## 5. Mobile Variante

Die Mobile-Variante stapelt die Inhalte vertikal:

- Maßstabswechsel
- Bewertungsräume Mensch, Planet und Demokratie
- Wirkung als Kernbegriff
- achtstufiger Wirkungskreislauf als lesbare Schrittfolge
- Daten- und Rückkopplungsleiste
- Schutzregeln
- Was bleibt

Damit wird die Desktopgrafik nicht lediglich verkleinert.

Technischer Check:

- Desktop-SVG ist als Standardquelle eingebunden.
- Mobile-SVG ist per `<source media="(max-width: 760px)">` eingebunden.
- Lokaler HTTP-Check auf `/modell.html`, `/buch.html` und beide SVG-Dateien liefert `200 OK`.
- SVG-XML und Visual-Registry-JSON wurden erfolgreich validiert.
- Eine Playwright-Sichtprüfung konnte lokal nicht ausgeführt werden, weil im gebündelten Browser-Runtime-Pfad kein Chromium-Executable installiert ist.

## 6. Alt-Text und Caption

Alt-Text wurde auf `/modell.html` und `/buch.html` gesetzt:

> Modellgrafik der Wirkungsökonomie. Sie zeigt den Maßstabswechsel von Kapital, Gewinn, Wachstum und Reichweite zu Wirkung als tatsächlicher Zustandsveränderung. Der Wirkungskreislauf führt von Auslöser, Wirkungspotenzial und Zustandsveränderung über Wirkungsbewertung und Netto-Wirkung zu Wirkungslenkung, Rückkopplung und Lernen. Bewertungsräume sind Mensch, Planet und Demokratie.

Caption wurde auf beiden Seiten gesetzt:

> Das Modell zeigt die Grundlogik der Wirkungsökonomie: Wirkung wird als tatsächliche Zustandsveränderung verstanden, am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet und in Preise, Steuern, Kapital, Haushalte, Management und Entscheidungen zurückgekoppelt.

## 7. Visual Registry

`content/visuals/visual-source-registry.json` wurde ergänzt:

- `visual_id`: `woek_modell_auf_einen_blick_v2`
- `visual_type`: `controlled_svg_model_visual`
- `status`: `approved_after_review_required`
- `created_as`: `controlled_svg_layout`

## 8. Offene Punkte

- Optional können später zusätzlich PNG/WebP-Exports aus den SVGs erzeugt werden, falls einzelne Plattformen SVG nicht optimal rendern.
- Optional kann das Modellvisual auch auf der Startseite oder im Kompass eingebunden werden, wenn die Seite dort mehr erklärende Tiefe braucht.
