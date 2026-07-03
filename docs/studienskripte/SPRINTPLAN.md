# Sprintplan Studienskripte

**Stand:** 2026-07-03  
**Arbeitsmodus:** Codex produziert Rohfassungen sprintweise; Claude finalisiert CI/CD, Reader, PDF und Freigabe.

## Grundregel

Pro Vorlesung entstehen drei Artefakte:

| Artefakt | Ablage | Zweck |
|---|---|---|
| Markdown-Master | `content/studienskripte/<slug>.md` | Fuehrende oeffentliche Wissensquelle und Bibliotheksbasis |
| Word-Rohfassung | `docs/studienskripte/word-rohfassungen/<slug>.docx` | Uebergabe an Claude fuer CI/CD-Finalisierung, Satz und PDF |
| App-Spiegel | `woek-akademie-app/content/lehrgaenge/<slug>.md` | Reader, Notizen, Lernfortschritt, PDF-Export |

Echte Pruefungen mit Antwortlogik bleiben geschuetzt in `woek-akademie-app/content/pruefungen/`.

## Markdown-Konventionen fuer Formeln, Bilder und Tabellen

Markdown ist die fachliche Rohquelle, nicht das finale Satzformat. Alles, was Claude spaeter im CI/PDF sauber setzen
muss, wird deshalb eindeutig markiert.

### Formeln

Inline-Formeln werden mit LaTeX in `$...$` geschrieben. Groessere Formeln stehen als Block in `$$...$$`:

```md
Die positive Netto-Wirkung kann modellhaft als gewichtete Summe positiver und negativer Zustandsveraenderungen
verstanden werden:

$$
NW_{pos} = \sum_{i=1}^{n} w_i \cdot \Delta Z_i^{+} - \sum_{j=1}^{m} r_j \cdot \Delta Z_j^{-}
$$

*Hinweis:* Die Formel ist ein didaktisches Modell, kein amtlicher Bewertungsstandard.
```

### Bilder und Diagramme

Bilder liegen als Datei im Asset-Ordner und werden mit Alt-Text eingebunden. Direkt danach folgt eine Caption-Zeile.

```md
![Resonanzfaktoren-Modell](assets/woek-g-v20/resonanzfaktoren-modell.svg)
*Abb. 1: Modellhafte Darstellung gesellschaftlicher Resonanzfaktoren. Quelle: eigene Darstellung, WÖk-Akademie.*
```

Wenn ein Bild noch nicht produziert ist, wird keine Platzhaltergrafik erfunden, sondern eine klare Bildvorgabe notiert:

```md
> **Bildvorgabe:** Sankey- oder Wirkpfadgrafik, die zeigt, wie ein gesellschaftlicher Resonanzfaktor
> von Wahrnehmung ueber Vertrauen zu Handlungsbereitschaft wirkt. Wiederverwenden, falls im Website-Visual-Registry
> bereits ein passendes Wirkpfad-Chart existiert.
```

### Tabellen

Einfache Vergleichs- und Begriffstabellen werden als Markdown-Tabelle geschrieben:

```md
| Begriff | Bedeutung im Skript | Abgrenzung |
|---|---|---|
| Wirkung | tatsaechliche Zustandsveraenderung | nicht Reichweite, nicht Absicht |
| Wirkungspotenzial | plausible Moeglichkeit kuenftiger Wirkung | noch keine beobachtete Wirkung |
| Wirkungsrisiko | Moeglichkeit negativer Zustandsveraenderung | nicht moralische Schuldzuschreibung |
```

Groessere Daten- oder Bewertungsmatrizen koennen zusaetzlich als CSV/JSON im Asset-Ordner liegen und im Skript
referenziert werden.

### Chart-Specs

Wenn ein Chart nicht als fertiges Bild, sondern als Produktionsvorgabe gebraucht wird, bekommt es einen eigenen
fenced block:

````md
```chart-spec
slug: resonanzfaktoren-modell
type: wirkpfad
reuse_first: true
preferred_asset: assets/woek-g-v20/resonanzfaktoren-modell.svg
message: Resonanz entsteht nicht aus Reichweite, sondern aus passender Wahrnehmung, Vertrauen, Anschlussfaehigkeit
  und Handlungsspielraum.
source: WÖk-Grundlagenwerk, Kapitel zu Wirkungstraegern, Wirkungsraeumen und Oeffentlichkeit
```
````

So bleibt fuer Claude eindeutig, was gesetzt, gezeichnet, wiederverwendet oder neu produziert werden soll.

## Sprint 0 · Produktionsschiene

Ziel: Ablage, Export, Status und Handoff so setzen, dass alle folgenden Sprints mechanisch wiederholbar sind.

- [x] Zentrale Master-Ablage `content/studienskripte/`
- [x] Oeffentlicher Bibliotheksbereich `bibliothek/studienskripte/`
- [x] App-Spiegel-Regel
- [x] Geschuetzte Pruefungs-Lane
- [x] Word-Rohfassungs-Export fuer V20
- [x] Commit der Produktionsschiene

## Sprint 1 · G2/G3 Pilotvertiefung

Ziel: alle V1-Vorlesungen als Rohfassungs-Artefakte herstellen und danach V20 als Tiefenskript fertigstellen.

- [x] 56 Markdown-Master in `content/studienskripte/`
- [x] 56 Word-Rohfassungen in `docs/studienskripte/word-rohfassungen/`
- [x] 16 fehlende Grundstudium-App-Spiegel V21-V36 angelegt
- [x] Bibliotheksindex aus `content/studienskripte/index.json` aktualisiert
- [x] V20 im ersten Tiefensprint von Pilotfassung auf ausfuehrliche Zwischenfassung erweitert
- [x] V21-V24 als substanzielle Tiefenskript-Arbeitsfassungen ausbauen (ca. 27 Seiten V21-Render; 50-Seiten-Finalisierung offen)

## Sprint 2 · Grundstudium V21-V24

Ziel: erster echter Viererbatch auf Basis der bestehenden Quelltexte in `woek-akademie-app/docs/lehrgaenge/`.

- [x] `woek-g-v21`
- [x] `woek-g-v22`
- [x] `woek-g-v23`
- [x] `woek-g-v24`
- Output je Skript: Markdown-Master, Word-Rohfassung, App-Spiegel, Mini-Quiz, Glossar, Quellen, Rueckfluss
- Ergebnis: `tiefensprint-arbeitsfassung` mit Website-Referenzmaterial, Fallfenstern, Modellformel, Analysemodell und pruefungsnahen Fallfragen ohne geschuetzte Antwortlogik.
- Hinweis: Diese Fassungen sind substanziell ausgebaut, aber noch nicht als `published` oder Claude-CI/PDF-final markiert.

## Sprint 3 · Grundstudium V25-V28

- [x] `woek-g-v25`
- [x] `woek-g-v26`
- [x] `woek-g-v27`
- [x] `woek-g-v28`
- Output je Skript: Markdown-Master, Word-Rohfassung, App-Spiegel, Mini-Quiz, Glossar, Quellen, Rueckfluss
- Ergebnis: `tiefensprint-arbeitsfassung` mit SDG/SDG+-Referenzmaterial, Wirkungsgrenzen/roten Linien und Reporting-/DPP-Infrastruktur.
- Hinweis: V25 und V28 enthalten extern gepruefte Primaerquellenstaende (UN, EU-Kommission, EFRAG, Eurostat, GRI). Diese Fassungen sind substanziell ausgebaut, aber noch nicht als `published` oder Claude-CI/PDF-final markiert.

## Sprint 4 · Grundstudium V29-V32

- [x] `woek-g-v29`
- [x] `woek-g-v30`
- [x] `woek-g-v31`
- [x] `woek-g-v32`
- Output je Skript: Markdown-Master, Word-Rohfassung, App-Spiegel, Mini-Quiz, Glossar, Quellen, Rueckfluss
- Ergebnis: `tiefensprint-arbeitsfassung` mit WÖk-ID-/Benchmark-/Archetypenlogik, Datenqualitaet/Audit/Unsicherheit, Netto-Wirkung und Scorecard-/Bewertungsprofilen.
- Hinweis: Diese Fassungen sind substanziell ausgebaut, aber noch nicht als `published` oder Claude-CI/PDF-final markiert.

## Sprint 5 · Grundstudium V33-V36

- [x] `woek-g-v33`
- [x] `woek-g-v34`
- [x] `woek-g-v35`
- [x] `woek-g-v36`
- Output je Skript: Markdown-Master, Word-Rohfassung, App-Spiegel, Mini-Quiz, Glossar, Quellen, Rueckfluss
- Ergebnis: `tiefensprint-arbeitsfassung` mit NWI/T-SROI-Abgrenzung, Reverse Merit Order, Nichtkompensation gegen Greenwashing und Scorecard-Lese-/Begruendungslogik.
- Hinweis: Diese Fassungen sind substanziell ausgebaut, aber noch nicht als `published` oder Claude-CI/PDF-final markiert.

## Danach

1. [x] Grundstudium V01-V19 zu Tiefenskript-Arbeitsfassungen ausbauen.
2. [x] Wirkungsmanagement V1-V10 zu Tiefenskript-Arbeitsfassungen ausbauen.
3. [x] Impact-Controlling V1-V10 zu Tiefenskript-Arbeitsfassungen ausbauen.
4. [ ] Pruefungsfragen-Pools je Vorlesung geschuetzt erweitern.

## Sprint 6 · Grundstudium V01-V09

- [x] `woek-g-v01`
- [x] `woek-g-v02`
- [x] `woek-g-v03`
- [x] `woek-g-v04`
- [x] `woek-g-v05`
- [x] `woek-g-v06`
- [x] `woek-g-v07`
- [x] `woek-g-v08`
- [x] `woek-g-v09`
- Ergebnis: `tiefensprint-arbeitsfassung` auf Basis der lebenden Referenzkapitel zu Maßstabskrise, Kapital, neuer Steuerungslogik, Leistung, Resilienz sowie Mensch/Planet/Demokratie.

## Sprint 7 · Grundstudium V10-V20

- [x] `woek-g-v10`
- [x] `woek-g-v11`
- [x] `woek-g-v12`
- [x] `woek-g-v13`
- [x] `woek-g-v14`
- [x] `woek-g-v15`
- [x] `woek-g-v16`
- [x] `woek-g-v17`
- [x] `woek-g-v18`
- [x] `woek-g-v19`
- [x] `woek-g-v20`
- Ergebnis: `tiefensprint-arbeitsfassung` auf Basis der Referenzkapitel zu Wirkung, Wirkungspotenzial, Wirkungsräumen, Handeln/Unterlassen, Wirkungsordnungen, Nebenwirkungen, Märkten, Medien, Zeit/Generationen und Resonanz.

## Sprint 8 · Wirkungsmanagement V1-V10

- [x] `wirkungsmanagement-v1`
- [x] `wirkungsmanagement-v2`
- [x] `wirkungsmanagement-v3`
- [x] `wirkungsmanagement-v4`
- [x] `wirkungsmanagement-v5`
- [x] `wirkungsmanagement-v6`
- [x] `wirkungsmanagement-v7`
- [x] `wirkungsmanagement-v8`
- [x] `wirkungsmanagement-v9`
- [x] `wirkungsmanagement-v10`
- Ergebnis: `tiefensprint-arbeitsfassung` mit Organisations-, Strategie-, Wesentlichkeits-, Risiko-, Kultur-, Kommunikations- und 90-Tage-Umsetzungsperspektive.

## Sprint 9 · Impact-Controlling V1-V10

- [x] `wirkungscontrolling-wc-v1`
- [x] `wirkungscontrolling-wc-v2`
- [x] `wirkungscontrolling-wc-v3`
- [x] `wirkungscontrolling-wc-v4`
- [x] `wirkungscontrolling-wc-v5`
- [x] `wirkungscontrolling-wc-v6`
- [x] `wirkungscontrolling-wc-v7`
- [x] `wirkungscontrolling-wc-v8`
- [x] `wirkungscontrolling-wc-v9`
- [x] `wirkungscontrolling-wc-v10`
- Ergebnis: `tiefensprint-arbeitsfassung` mit KII/KPI-Stack, Rahmenwerken, WÖk-IDs, Scorecards, Reverse Merit Order, Datenräumen, T-SROI/IoI, CAPEX/OPEX/Einkauf, Audit und Abschlussfall.

## Aktueller Gesamtstand

- 56/56 V1-Vorlesungen stehen als `tiefensprint-arbeitsfassung` im Masterbestand.
- Master: `content/studienskripte/`
- Word-Rohfassungen: `docs/studienskripte/word-rohfassungen/`
- App-Spiegel: `woek-akademie-app/content/lehrgaenge/`
- Umfang: ca. 474k Woerter im Masterbestand.
- Weiter offen: Claude-CI/PDF-Finalisierung und geschuetzte Pruefungs-Pools mit Antwortlogik.
