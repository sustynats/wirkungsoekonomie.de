# Audit: Wirkungsradare für alle Narrative

Stand: 2026-05-21

## 1. Zentrale Anpassung

Die Radar-Logik wurde zentral in `assets/js/narrative-visualizations.js` angepasst. Die Radare werden nicht pro Einzelkarte gepflegt, sondern aus einer gemeinsamen Komponente gerendert:

- `renderRadar()`
- `renderMiniRadarBlock()`
- `renderRadarPanel()`
- zentrale `radarAxisDefinitions`

Damit erhalten alle aktuellen und künftigen Narrative dieselbe Leselogik.

## 2. Geltung für alle Narrative

Die Anpassung greift für alle Narrative aus `assets/data/narrative-cases.json`, insbesondere:

- Altparteien
- Angst vor AfD-Wahlsieg
- Diktatur der Altparteien / Altparteiendiktatur
- Illegale / kulturfremde / inländerfeindliche Massenmigration
- Remigration / Remigrationslotsen
- Kehrtwende um 180 Grad
- Planwirtschaftliche Energiewende
- Klimadiktatur / Klimaextremismus / Klimapropaganda
- Genderismus / Regenbogenkult / politische Indoktrination
- Zensurbehörden / betreute Meinung / ÖRR-Frame

Neue Narrative übernehmen automatisch Mini-Radar, Detail-Radar, Achsenlogik, Skala, stärkste Ausschläge und Werte-Erklärung, sobald sie Radarwerte in der Datenstruktur enthalten.

## 3. Außen bedeutet nicht besser

Die Seite stellt jetzt an mehreren Stellen klar:

- Mini-Radar: `Außen = stärker, nicht besser`
- Detail-Radar: `Außen bedeutet nicht besser, sondern stärker ausgeprägtes Wirkungspotenzial.`
- Kartenübersicht: kompakter Erklärblock `Wie das Radar zu lesen ist`

Die Radare werden damit als Resonanzprofile gelesen, nicht als Optimierungsdiagramme.

## 4. Skala 0 bis 5

Detail-Radare zeigen:

- `0 innen · 5 außen`
- `Skala: 0 = nicht ausgeprägt · 5 = sehr stark ausgeprägt.`

Mini-Radare zeigen kompakt:

- `0 innen · 5 außen`

## 5. Achsenlabels

Alle Radare nutzen die zentralen Achsen:

- Angst
- Wut
- Misstrauen
- Feindbild
- Kontrollsehnsucht
- Vereinfachung
- Autoritarismuspotenzial
- Diskursverengung
- Demokratierisiko
- Entsolidarisierung

Detail-Radare zeigen kurze Achsenlabels direkt am Radar. Die vollständigen Begriffe und Beschreibungen stehen in Tooltips, Fokus-/Tap-Erklärungen und in der Werte-Tabelle.

## 6. Tooltip / Tap-Erklärungen

Detail-Radare unterstützen:

- Hover auf Achsen/Punkte
- Fokus per Tastatur
- Klick/Tap auf Achsen/Punkte oder Achsenbuttons

Die Erklärung zeigt Achsenname, Wert und Bedeutung. Mini-Radare bleiben ruhig und nicht als verschachtelte interaktive Elemente in den Kartenbuttons umgesetzt; sie tragen aber Titel, Caption und stärkste Ausschläge.

## 7. Werte-Erklärung

Jedes Detail-Radar enthält ein ausklappbares Element:

- `Radarwerte erklären`

Die Tabelle wird automatisch aus `radarAxisDefinitions` und den Radarwerten des aktiven Narrativs erzeugt:

- Achse
- Wert
- Bedeutung

## 8. Mini-Radare

Alle Mini-Radare zeigen jetzt:

- Titel `Resonanzprofil`
- Skala `0 innen · 5 außen`
- Caption `Außen = stärker, nicht besser`
- automatisch berechnete stärkste Ausschläge

Die stärksten Ausschläge werden aus den höchsten Radarwerten berechnet und nicht pro Karte hardcodiert.

## 9. Mobile

CSS wurde angepasst, damit Radar-Tabellen und Beschriftungen responsiv umbrechen und keine interne horizontale Scrollbox im Radarbereich entsteht. Achsenlabels bleiben klein; die vollständige Erklärung liegt zusätzlich in Buttons und im Akkordeon.

## 10. Offene Punkte

- Mini-Radare sind aus Barrierefreiheitsgründen nicht einzeln fokussierbar, weil sie innerhalb der Kartenbuttons liegen. Die interaktive Achsenerklärung ist vollständig in der Detailansicht verfügbar.
- Eine spätere Ausbaustufe könnte Mini-Karten von `button` auf `article + button/link` umbauen, falls Mini-Radare selbst interaktiv werden sollen.
