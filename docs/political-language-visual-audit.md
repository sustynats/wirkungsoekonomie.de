# Visual-Audit: Wirkung politischer Sprache

Stand: 2026-05-22  
Seite: `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`

## Ergebnis

Keine Grafik wurde gelöscht. Keine Grafik wurde aus der öffentlichen Seite entfernt. Die bestehenden Visuals bleiben eingebunden und wurden methodisch stärker gerahmt: Wirkungsanalyse statt Faktencheck, Wirkungspotenzial statt behaupteter Einzelwirkung, SDG+ als demokratische Erweiterung.

| Datei / Modul | aktuelle Seite | Zweck | fachlich korrekt? | mobil lesbar? | Stil passend? | Status | Begründung |
|---|---|---:|---:|---:|---:|---|---|
| `assets/visuals/flows/woek_medien_demokratie_wirkpfade.svg` | `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` | Hauptfluss politischer Sprache: Frame, Resonanzraum, Wirkungspotenzial, Demokratie | ja | ja, mit separater Mobile-Variante | ja | behalten | Kontrolliertes SVG im WÖk-Stil, keine KI-Posteroptik, mit Alt-Text und Caption. |
| `assets/visuals/flows/woek_medien_demokratie_wirkpfade_mobile.svg` | `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` | mobile Variante des Wirkpfads | ja | ja | ja | behalten | Mobile Darstellung vorhanden; keine horizontale Pflichtscrollstrecke. |
| `assets/visuals/woek/woek_13_medien_sprache_wirkpfad.webp` | `/sdg-plus/medien-demokratie/wirkung-politischer-sprache.html` | ergänzende Wirkungspfadgrafik im bestehenden Visual-System | ja | grundsätzlich ja | ja | behalten / später prüfen | Bestehendes Visual bleibt erhalten. Später kann eine reine SVG-Version ergänzt werden, falls Text in der Rastergrafik auf sehr kleinen Geräten zu fein wirkt. |
| `assets/visuals/woek/woek_13_medien_sprache_wirkpfad.png` | Fallback für WebP | Fallbackgrafik | ja | grundsätzlich ja | ja | behalten | Fallback bleibt nötig, keine Entfernung. |
| JS-generiertes Wirkungsradar in `assets/js/narrative-visualizations.js` | interaktive Detailanalysen | Spinnennetz zur Stärke von Resonanzrisiken | ja | ja | ja | behalten / verbessert gerahmt | Legende erklärt: 0 innen, 5 außen; außen bedeutet stärkeres Wirkungspotenzial, nicht besser. |
| JS-generiertes Mini-Radar | Fallkarten | kompakte Risiko-/Resonanzvorschau | ja | ja | ja | behalten | Enthält Hinweis "Außen = stärker, nicht besser". |
| JS-generiertes Wirkungsnetz | Detailanalyse | Knoten aus Begriff, Frame, Resonanz, Wahrnehmung, Demokratie, Systemfrage, WÖk-Gegenfrage | ja | ja, mit zusätzlicher Pfadliste | ja | behalten / weiter verbessern | Netz bleibt lesbar über Pfadliste; keine unkontrollierte KI-Grafik. |

## Mobile-Hinweise

- Die Hauptgrafik nutzt eine eigene mobile SVG-Variante.
- Radar und Wirkungsnetz werden als responsive SVG gerendert.
- Das Wirkungsnetz besitzt zusätzlich eine textbasierte Pfadliste, damit die Aussage auch bei kleiner Darstellung lesbar bleibt.
- Für spätere QA empfohlen: Screenshots bei 390 px, 768 px und 1440 px Breite prüfen.

## Nicht vorgenommen

- Keine Archivierung nach `/assets/visuals/archive/`, weil keine Grafik ersetzt oder als fehlerhaft bewertet wurde.
- Keine Verschiebung nach `/assets/visuals/rejected/`, weil keine eingebundene Grafik eindeutig unprofessionell, fachlich falsch oder KI-artefaktbehaftet ist.

## Offene Verbesserungen

- Für `woek_13_medien_sprache_wirkpfad` kann später eine kontrollierte SVG-Neufassung erstellt werden, wenn Rastertext in der Mobile-QA zu klein erscheint.
- Für Radarwerte sollte bei fachlicher Freigabe dokumentiert werden, dass es sich um Modell-/Pilotwerte der WÖk-Sprachanalyse handelt, nicht um empirische Messwerte.
