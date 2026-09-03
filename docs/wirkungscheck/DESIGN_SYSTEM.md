# Wahlkreis-Wirkungscheck — Design System

Version 1.0 · Stand 2026-08-13 · Lane: Claude (Design/UX) · Umsetzung: Codex

Dieses Dokument ist die verbindliche visuelle Grundlage des Wahlkreis-Wirkungschecks.
Es leitet sich aus dem Brand Guide Wirkungsökonomie und dem Design des Wirkungsinstituts
(`woek-institut-app/app/globals.css`) ab und härtet beides für ein politisch sensibles,
parteiunabhängiges Befragungsinstrument.

Kein eigenes Markensystem. Keine Neuerfindung der Website. Abweichungen von der
Hauptwebsite sind unten einzeln begründet.

---

## 1. Herleitung und Abgrenzung

### 1.1 Was übernommen wird

| Element | Quelle | Übernahme |
|---|---|---|
| Farbwelt Navy/Ivory/Grün/Gold | Brand Guide §7, `assets/css/style.css` | vollständig |
| Schriftpaar Source Serif 4 + Inter | Live-Website, Institut-App | vollständig |
| Kartenlogik weiß auf Ivory | Institut-App | vollständig |
| Navy-Header mit Gold-Abschluss | Institut-App | angepasst, siehe 1.2 |
| Tonalität und Diagrammstil | Brand Guide §3, §4 | vollständig |
| Radius 12px, weicher Doppelschatten | Institut-App | vollständig |

### 1.2 Was bewusst abweicht

1. **Ruhigere Überschriftenskala.** Die Hauptwebsite skaliert `h1` bis `3.1rem`.
   Für ein Befragungsinstrument ist das zu laut, und die Kritik an der Hauptdomain
   („Überschriften zu dominant") gilt hier verschärft: Wer eine Frage beantwortet,
   soll die Frage lesen, nicht die Marke. `h1` endet bei `2.5rem`.

2. **Grün ist Interaktionsfarbe, nicht Bewertungsfarbe.** Auf der Hauptwebsite trägt
   Grün Links und Eyebrows. Das bleibt. Grün darf im Wirkungscheck **nie** „gut",
   „hoch", „positiv" oder „empfohlen" bedeuten. Begründung in Abschnitt 3.

3. **Gold ist strukturell, nicht flächig.** Im Institut ist Gold die Primary-Button-Fläche.
   Große Goldflächen wirken neben politischen Inhalten wie Auszeichnung oder Siegel.
   Im Wirkungscheck ist Gold Linie, Marker und Fokusakzent. Primary Button ist Navy.

4. **Kein Analytics, kein `main.js`.** Wie beim Wirkungswahl-Kompass lädt das Werkzeug
   keine Website-Skripte, keine Besucher-IDs, keine Telemetrie. Politische Angaben
   verlassen den Browser nicht ohne ausdrückliche Einwilligung.

5. **Eigene Stylesheet-Datei.** `assets/css/wahlkreis-wirkungscheck.css`, Präfix `wc-`.
   Kein Eingriff in `style.css`, damit die 18.000 Zeilen der Hauptwebsite unberührt bleiben.

---

## 2. Farb-Token

### 2.1 Basis (aus dem Brand Guide, unverändert)

```css
--wc-navy:        #0B1020;  /* Grundton, Überschriften, Primary-Fläche */
--wc-navy-80:     #1A2440;  /* Hover Primary, Navy-Flächen zweite Ebene */
--wc-ivory:       #F6F1EB;  /* Seitengrund */
--wc-ivory-deep:  #EFE7D9;  /* abgesetzte Bänder auf Ivory */
--wc-white:       #FFFFFF;  /* Kartenflächen, Eingabefelder */
--wc-green:       #2F7D5C;  /* ausschliesslich Interaktion, siehe 3.2 */
--wc-green-soft:  #E5F0EA;  /* Auswahlzustand-Fläche */
--wc-gold:        #C89B3C;  /* Struktur- und Fokusakzent */
--wc-gold-soft:   #F1E3C4;  /* Marker „Ihre Angabe" */
--wc-line:        #E8E4DC;  /* Rahmen, Trennlinien */
```

### 2.2 Text und Tinte

```css
--wc-ink:         #1C1F27;  /* Fliesstext. 14.7:1 auf Ivory */
--wc-ink-muted:   #4A505C;  /* Sekundärtext. 7.2:1 auf Ivory */
--wc-ink-faint:   #5F6670;  /* Metadaten, Datenstand. 5.2:1 auf Ivory */
--wc-green-dark:  #235F46;  /* Links im Fliesstext. 6.7:1 auf Ivory */
```

`--wc-ink-faint` ist die unterste zulässige Textfarbe und nur für nicht-essentielle
Metadaten erlaubt. Nie für Labels, nie für Fehlertexte.

Hinweis für die Umsetzung: Der naheliegende Grauwert `#6B7280` (Tailwind gray-500)
erreicht auf Ivory nur 4.31:1 und ist damit **unzulässig**. Auf hellem Ivory-Grund
verschieben sich vertraute Graustufen; jeder neue Grauwert ist gegen `#F6F1EB` zu
prüfen, nicht gegen Weiss.

Die Hauptwebsite nutzt `--muted: #555555`. `--wc-ink-muted` ist leicht ins Blaugraue
verschoben, damit Sekundärtext neben Navy nicht schmutzig wirkt. Das ist die
„mehr Kontrast"-Korrektur aus dem Redesign-Brief.

### 2.2b Randfarben

Ränder zerfallen in zwei Klassen, und die Unterscheidung ist prüfrelevant:

```css
--wc-line:          #E8E4DC;  /* dekorative Trennung: Kartenrand, Sektionslinie */
--wc-border-strong: #808892;  /* Begrenzung bedienbarer Elemente. 3.6:1 weiss, 3.2:1 ivory */
```

WCAG 1.4.11 verlangt 3:1 für die Begrenzung von Bedienelementen. `--wc-line`
erreicht gegen Weiss nur 1.27:1 und darf deshalb **nie** die einzige sichtbare
Begrenzung eines Eingabefelds, einer Antwortfläche, eines Chips oder eines Buttons
sein. Für alles Bedienbare gilt `--wc-border-strong`.

Karten ohne eigene Interaktion dürfen `--wc-line` tragen, weil ihr Rand
dekorativ ist und der Inhalt die Gruppierung ohnehin ausweist.

### 2.3 Neutrale Tinten-Rampe (Belegbarkeit, Datenqualität, Diagramme)

Die zentrale parteineutrale Erfindung dieses Design Systems. Alle Skalen, die eine
Stärke, Sicherheit oder Qualität ausdrücken, laufen über **eine einzige Tinten-Rampe**,
nicht über Farbwechsel.

```css
--wc-scale-4:  #1C1F27;  /* stärkste Stufe */
--wc-scale-3:  #4A505C;
--wc-scale-2:  #8A909C;
--wc-scale-1:  #C3C7CE;
--wc-scale-0:  #E8E4DC;  /* keine Daten */
```

Zusätzlich trägt jede Stufe eine **Form** und ein **Wort** (siehe 4.6). Farbe allein
kodiert nie eine Aussage. Das erfüllt WCAG 1.4.1 und nimmt der Darstellung gleichzeitig
jede Ampel- und damit jede Bewertungsanmutung.

### 2.4 Wirkungsräume Mensch · Planet · Demokratie

Die drei Räume übernehmen die Logo-Zuordnung der Marke (drei überlappende Ringe).
Sie erscheinen **ausschliesslich als 3px-Randlinie links und als Label**, nie als
Flächenfüllung und nie als Balkenlänge.

```css
--wc-mpd-mensch:     #7A6A57;  /* warmes Graubraun, Ivory-Familie. 5.2:1 weiss */
--wc-mpd-planet:     #2F7D5C;  /* Marken-Grün. 5.0:1 weiss */
--wc-mpd-demokratie: #A87F27;  /* abgedunkeltes Marken-Gold. 3.7:1 weiss */
```

Das reine Marken-Gold `#C89B3C` erreicht auf Weiss nur 2.56:1 und ist als
bedeutungstragende Linie unzulässig. Für alle Grafikelemente, die 3:1 erfüllen
müssen, gilt `--wc-gold-ink: #A87F27`. `--wc-gold` bleibt zulässig auf Navy
(7.4:1) und als rein dekorativer Halo.

**Regel:** Diese drei Token dürfen nie in einer Darstellung auftreten, die Räume
miteinander vergleicht oder addiert. Kein Radardiagramm, kein gestapelter Balken,
keine Gesamtpunktzahl. Sie sind Wegweiser, keine Messwerte.

### 2.5 Zustandsfarben

```css
--wc-focus:       #0B1020;  /* Fokusring innen */
--wc-focus-halo:  #C89B3C;  /* Fokusring aussen */
--wc-error:       #8C2F1E;  /* Kontrast 7.4:1 auf Weiss */
--wc-error-soft:  #FBEEEA;
--wc-notice:      #1C1F27;  /* Hinweise sind Tinte, nicht Farbe */
--wc-notice-soft: #F1E3C4;
```

`--wc-error` ist ein gedecktes Oxidrot und wird **nur** für Formularfehler und
technische Störungen verwendet, nie für inhaltliche Aussagen. Ein Wirkungsrisiko
ist kein Fehler und wird nie rot dargestellt.

### 2.6 Verbotene Farben

Kein Token, keine Fläche, kein Diagrammelement und kein Icon darf folgende Werte
oder visuell nahe Nachbarn davon tragen:

| Wert | Assoziation |
|---|---|
| `#E3000F`, `#EE1C25` | SPD |
| `#000000` als Markenfläche mit `#FF9900` | CDU/CSU |
| `#FFED00`, `#FFE500` und `#E5007D` als Paar | FDP |
| `#46962B`, `#008939`, kräftige Signalgrüns | Bündnis 90/Die Grünen |
| `#009EE0`, `#00A0E2` | AfD |
| `#BE3075`, `#E60082` | Die Linke |
| `#FF6600` in Kombination mit Blau | BSW und diverse |
| Schwarz-Rot-Gold als Farbverlauf oder Bandmotiv | Nationalflagge, Wahlkampfanmutung |

### 2.6b Dokumentiertes Restrisiko: Marken-Grün

Das Marken-Grün `#2F7D5C` ist die einzige Farbe im System, die eine Prüfung auf
Parteinähe nicht vollständig ohne Anmerkung besteht. Der Befund im Klartext:

| Farbe | Farbton | Sättigung | Helligkeit |
|---|---|---|---|
| `#2F7D5C` Marken-Grün | 155° | 45 % | 34 % |
| `#46962B` Bündnis 90/Die Grünen | 105° | 55 % | 38 % |
| `#008939` kräftiges Signalgrün | 145° | 100 % | 27 % |

Der Abstand im Farbton beträgt 50 Grad, und die Sättigung liegt deutlich
niedriger. `#2F7D5C` ist ein entsättigtes Tannen- und Petrolgrün mit sichtbarem
Blauanteil, kein Signalgrün. Eine reine RGB-Abstandsmessung meldet dennoch Nähe,
weil sie Farbton und Sättigung nicht trennt.

**Bewertung:** zulässig, weil die Farbe erstens aus dem verbindlichen Brand Guide
stammt und die gesamte Wirkungsökonomie-Website prägt, zweitens ausschliesslich
die Rolle „Interaktion" trägt (2.1, 3.2) und niemals „positiv", „gut" oder
„empfohlen" bedeutet, und drittens nie flächig für Inhalte eingesetzt wird.

**Auflage für die Zweitprüfung:** Dieser Punkt ist der externen
Neutralitätsprüfung ausdrücklich vorzulegen. Sollte sie zu einem anderen Schluss
kommen, ist der Austausch mechanisch möglich: Grün tritt nur in `--wc-green`,
`--wc-green-dark`, `--wc-green-soft` und `--wc-mpd-planet` auf. Ein Wechsel auf
ein Blaugrau oder das Navy der Marke ändert keine Semantik, weil kein Zustand
allein über Farbe kodiert ist.

### 2.7 Kontrastnachweis

Gemessen nach WCAG 2.x Relativluminanz. Diese Tabelle ist Abnahmekriterium.

| Vordergrund | Hintergrund | Ratio | Zulässig für |
|---|---|---|---|
| `--wc-ink` | `--wc-ivory` | 14.67:1 | Text AAA |
| `--wc-ink` | `--wc-white` | 16.47:1 | Text AAA |
| `--wc-ink` | `--wc-green-soft` | 14.11:1 | Text AAA |
| `--wc-ink-muted` | `--wc-ivory` | 7.21:1 | Text AAA |
| `--wc-ink-muted` | `--wc-white` | 8.10:1 | Text AAA |
| `--wc-ink-faint` | `--wc-ivory` | 5.16:1 | Text AA |
| `--wc-ink-faint` | `--wc-white` | 5.80:1 | Text AA |
| `--wc-ivory` | `--wc-navy` | 16.86:1 | Text AAA |
| `--wc-green-dark` | `--wc-ivory` | 6.69:1 | Text AA, Links |
| `--wc-green-dark` | `--wc-white` | 7.51:1 | Text AA, Links |
| `--wc-green` | `--wc-white` | 4.99:1 | Text AA, UI |
| `--wc-green` | `--wc-ivory` | 4.44:1 | **nur** UI/Grafik, kein Text |
| `--wc-green` | `--wc-green-soft` | 4.27:1 | UI/Grafik |
| `--wc-error` | `--wc-white` | 8.27:1 | Text AAA |
| `--wc-error` | `--wc-ivory` | 7.36:1 | Text AAA |
| `--wc-gold` | `--wc-navy` | 7.40:1 | Text AA auf Navy |
| `--wc-gold` | `--wc-white` | 2.56:1 | **nur** dekorativ, nie Text, nie Bedeutung |
| `--wc-gold-ink` | `--wc-white` | 3.66:1 | Grafik/Linie |
| `--wc-gold-ink` | `--wc-ivory` | 3.26:1 | Grafik/Linie |
| `--wc-border-strong` | `--wc-white` | 3.59:1 | Rand Bedienelement |
| `--wc-border-strong` | `--wc-ivory` | 3.19:1 | Rand Bedienelement |
| `--wc-line` | `--wc-white` | 1.27:1 | **nur** dekorative Trennung |
| `--wc-scale-2` | `--wc-white` | 3.21:1 | Grafik |
| `--wc-scale-1` | `--wc-white` | 1.70:1 | nur mit Kontur, siehe 4.6 |

Drei Konsequenzen für die Umsetzung:

1. Grün auf Ivory (4.44:1) ist für Fliesstext unzulässig. Links auf Ivory tragen
   `--wc-green-dark` plus Unterstreichung.
2. Gold ist auf hellem Grund niemals Text und niemals bedeutungstragend.
3. Die hellen Stufen der Tinten-Rampe (`--wc-scale-1`, `--wc-scale-0`) sind allein
   nicht wahrnehmbar und tragen immer eine Kontur in `--wc-scale-3`.

---

## 3. Neutralitätsregeln des visuellen Systems

### 3.1 Kein Ranking, keine Wertung

- Keine Balken, die Optionen oder Personen vergleichen.
- Keine Ordnungszahlen mit Wertungsanmutung. Handlungsoptionen heissen
  **Handlungspfad A, B, C**, nicht „Platz 1, 2, 3", nicht „Top-Empfehlung".
- Keine Sterne, Punkte, Prozentzahlen für Personen oder Parteien.
- Keine Fortschrittsbalken, die „Wirkungsorientierung" messen.
- Kein Badge, kein Abzeichen, kein Siegel, keine Konfetti-, Trophäen- oder Häkchen-Feier.

### 3.2 Grün bedeutet „anklickbar", nicht „richtig"

Grün markiert: Links, Eyebrows, ausgewählte Antwortflächen, aktive Filter.
Grün markiert nicht: hohe Evidenz, positive Wirkung, empfohlene Option, Zielerreichung.

Ein ausgewähltes Antwortfeld ist grün umrandet, weil **Sie** es gewählt haben,
nicht weil es die bessere Antwort wäre. Damit dieser Unterschied auch ohne Farbe
trägt, führt die Auswahl zusätzlich eine 3px-Linke-Kante und ein Häkchen-Glyph
mit `aria-hidden`, während `aria-checked` den Zustand semantisch transportiert.

### 3.3 Ikonografie

Erlaubt: geometrische Linienzeichen, Pfeile, Kreise, Segmente, Klammern,
Schichten, Knoten und Kanten.
Verboten: Fäuste, Megafone, Flaggen, Landkarten mit Parteieinfärbung, Waagen mit
Siegerneigung, Daumen, Sprechblasen mit Emotion, Herzen, Blätter, Hände mit Erde,
Personenpiktogramme mit erkennbarer Rolle (Krawatte, Rednerpult).

Icons sind einfarbig `currentColor`, 1.5px Strichstärke, 24×24 Raster,
`stroke-linecap: round`. Sie sind immer von Text begleitet und tragen
`aria-hidden="true"`.

### 3.4 Bildsprache

Keine Fotos von Menschen. Keine Symbolbilder aus Politik oder Parlament.
Zulässig sind ausschliesslich abstrakte Systemgrafiken im Diagrammstil der Marke:
reduziert, wenige Farben, klare Linien, viel Weissraum.

---

## 4. Typografie

### 4.1 Schriften

```css
--wc-font-heading: "Source Serif 4", Georgia, "Times New Roman", serif;
--wc-font-body:    "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--wc-font-mono:    ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
```

Self-hosted wie auf der Hauptwebsite, `font-display: swap`.
Mono ausschliesslich für Regel-IDs, Methoden-Version und kopierbare Codes.

### 4.2 Skala

Basis 17px auf Desktop, 16px auf Mobile. Bewusst einen Tick über der Website-Basis:
Der Report ist ein Lesedokument.

| Rolle | Klasse | Grösse | Zeilenhöhe | Schnitt | Familie |
|---|---|---|---|---|---|
| Seitentitel | `.wc-h1` | `clamp(1.75rem, 3.2vw, 2.5rem)` | 1.15 | 600 | Serif |
| Abschnitt | `.wc-h2` | `clamp(1.35rem, 2.4vw, 1.75rem)` | 1.2 | 600 | Serif |
| Karte, Unterabschnitt | `.wc-h3` | `clamp(1.1rem, 1.6vw, 1.25rem)` | 1.3 | 600 | Serif |
| Fragentitel | `.wc-question` | `clamp(1.3rem, 2.6vw, 1.75rem)` | 1.25 | 600 | Serif |
| Fliesstext | `.wc-body` | `1.0625rem` | 1.65 | 400 | Sans |
| Lead | `.wc-lead` | `1.1875rem` | 1.6 | 400 | Sans |
| Antwortlabel | `.wc-option-label` | `1.0625rem` | 1.4 | 600 | Sans |
| Antworthilfe | `.wc-option-hint` | `0.9375rem` | 1.5 | 400 | Sans |
| Eyebrow | `.wc-eyebrow` | `0.75rem` | 1.3 | 700, `0.12em` gesperrt, Versalien | Sans |
| Badge | `.wc-badge` | `0.8125rem` | 1.2 | 600 | Sans |
| Metadaten | `.wc-meta` | `0.875rem` | 1.5 | 400 | Sans |
| Regel-ID | `.wc-rule-id` | `0.8125rem` | 1.4 | 400 | Mono |

Keine Schriftgrösse unter `0.75rem`. Keine gesperrten Versalien in Fliesstextlänge.

### 4.3 Zeilenlänge

| Kontext | max-width |
|---|---|
| Fliesstext, Fragetext | `68ch` |
| Lead | `62ch` |
| Antwortfläche Label | `56ch` |
| Report-Kartentext | `62ch` |
| Tabellenzelle | keine Begrenzung, Container scrollt |

### 4.4 Satzregeln

- Überschriften `text-wrap: balance`, Fliesstext `text-wrap: pretty`.
- `hyphens: auto` mit `lang="de"`, weil deutsche Komposita sonst reissen.
- Zahlen in Tabellen `font-variant-numeric: tabular-nums`.
- Keine Gedankenstriche in Form von `–` oder `—` (Brand Guide §4). Trennung über
  Punkt, Komma, Doppelpunkt oder Mittelpunkt `·`.

### 4.5 Badges

Badges sind Kapseln mit 1px Rand, `border-radius: 999px`, `padding: 0.25rem 0.6rem`,
Fläche `--wc-white`, Rand `--wc-line`, Text `--wc-ink-muted`.
Badges sind **nie eingefärbt nach Wertung**. Ein Badge „Bund", „3 bis 5 Jahre" und
„Belegbarkeit: mittel" sehen identisch aus. Nur die Belegbarkeits-Badge führt
zusätzlich das Segmentzeichen aus 4.6.

### 4.6 Belegbarkeit und Unsicherheit

Fünf Stufen, jeweils Wort + Segmentzeichen + Tinte. Nie Farbe allein, nie Ampel.

| Stufe | Wort im UI | Zeichen | Tinte | Bedeutung |
|---|---|---|---|---|
| 4 | Belegbarkeit: hoch | `▮▮▮` | `--wc-scale-4` | mehrere unabhängige Studien oder amtliche Zeitreihe |
| 3 | Belegbarkeit: mittel | `▮▮▯` | `--wc-scale-3` | belastbare Einzelstudien, Übertragbarkeit begrenzt |
| 2 | Belegbarkeit: begrenzt | `▮▯▯` | `--wc-scale-2` | Einzelfälle, Analogieschluss |
| 1 | Datenlücke | `▯▯▯` | `--wc-scale-1` | keine belastbaren Daten für diese Ebene |
| 0 | Modellannahme | `◇` | `--wc-scale-2` | gesetzte Annahme, keine Messung |

Das Segmentzeichen wird als `<svg aria-hidden="true">` gerendert, nie als Unicode,
damit Schriftfallbacks es nicht zerlegen. Der Screenreader liest das Wort.

Jedes Segment ist ein Rechteck 8×14px mit 2px Radius. Gefüllte Segmente tragen die
Tinte der Stufe, leere Segmente sind ungefüllt mit 1.5px Kontur in `--wc-scale-3`.
Ohne diese Kontur wären leere Segmente auf Weiss nicht wahrnehmbar (1.70:1).

Tonalität: Unsicherheit ist eine Eigenschaft der Aussage, keine Warnung. Deshalb
kein Ausrufezeichen-Icon, kein Dreieck, keine Signalfarbe, kein „Achtung".

---

## 5. Raster, Abstände, Radien, Schatten

### 5.1 Abstandsskala

4px-Basis. Nur diese Werte verwenden.

```css
--wc-space-1:  0.25rem;  /*  4px */
--wc-space-2:  0.5rem;   /*  8px */
--wc-space-3:  0.75rem;  /* 12px */
--wc-space-4:  1rem;     /* 16px */
--wc-space-5:  1.5rem;   /* 24px */
--wc-space-6:  2rem;     /* 32px */
--wc-space-7:  3rem;     /* 48px */
--wc-space-8:  4rem;     /* 64px */
--wc-space-9:  6rem;     /* 96px */
--wc-gutter:   clamp(1rem, 4vw, 2.5rem);
--wc-section:  clamp(2rem, 6vw, 4rem);
```

### 5.2 Container

```css
--wc-container:        1120px;  /* Landing, Report */
--wc-container-narrow:  760px;  /* Survey, Fliesstext, Methodik */
--wc-container-drawer:  560px;  /* Transparenz-Drawer Desktop */
```

Der Survey läuft bewusst schmal. Eine Frage soll nie über die halbe
Bildschirmbreite wandern.

### 5.3 Radien

```css
--wc-radius-sm:  6px;   /* Badges innen, kleine Marker */
--wc-radius:     12px;  /* Karten, Antwortflächen, Buttons */
--wc-radius-lg:  16px;  /* Drawer, Modal, Report-Hauptkarten */
--wc-radius-pill: 999px;/* Badge, Chip, Fortschritt */
```

### 5.4 Schatten

```css
--wc-shadow-card:   0 1px 2px rgba(11,16,32,.06), 0 8px 24px rgba(11,16,32,.06);
--wc-shadow-raised: 0 2px 4px rgba(11,16,32,.08), 0 16px 40px rgba(11,16,32,.10);
--wc-shadow-drawer: 0 0 0 1px rgba(11,16,32,.08), -24px 0 60px rgba(11,16,32,.18);
```

Karten im Ruhezustand tragen `--wc-shadow-card`. Hover hebt **nicht** an
(`transform` bleibt `none`): Ein Befragungsinstrument soll nicht wippen. Hover
verstärkt nur Rand und Schatten.

### 5.5 Layout-Regeln

- Alles CSS Grid oder Flex. Keine festen Spaltenbreiten in px ausser den
  `minmax()`-Untergrenzen.
- Mehrspaltigkeit erst ab `min-width: 48rem` und nur mit
  `grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr))`.
  Damit ist der Umbruchfehler der Hauptdomain strukturell ausgeschlossen.
- Jeder horizontal überlaufende Inhalt (Wirkpfad, Tabellen, Chip-Reihen) steckt in
  `.wc-scroll-x { overflow-x: auto; }` mit sichtbarem Rand und Tastaturfokus.
  Der Seitenkörper scrollt nie horizontal.

---

## 6. Komponenten-Grundformen

Vollständige Props und Varianten stehen in `COMPONENTS.md`. Hier nur die visuelle Form.

### 6.1 Flächen

| Fläche | Grund | Rand | Radius | Schatten |
|---|---|---|---|---|
| Seite | `--wc-ivory` | keiner | keiner | keiner |
| Karte | `--wc-white` | 1px `--wc-line` | `--wc-radius` | card |
| Betonte Karte | `--wc-white` | 1px `--wc-line`, links 3px Akzent | `--wc-radius` | card |
| Dunkles Band | `--wc-navy` | unten 3px `--wc-gold` | keiner | keiner |
| Ruhiges Band | `--wc-ivory-deep` | keiner | keiner | keiner |
| Drawer | `--wc-white` | links 1px `--wc-line` | oben/unten links `--wc-radius-lg` | drawer |
| Eingabe | `--wc-white` | 1.5px `--wc-border-strong` | `--wc-radius-sm` | keiner |

### 6.2 Buttons

Mindesthöhe 48px, Mindestbreite Touch 48px, Textgewicht 600.

| Variante | Fläche | Text | Rand | Einsatz |
|---|---|---|---|---|
| `primary` | `--wc-navy` | `--wc-ivory` | keiner | genau ein Primary pro Screen |
| `primary` auf Navy-Band | `--wc-ivory` | `--wc-navy` | keiner | invertiert, damit der Button sichtbar bleibt |
| `secondary` | transparent | `--wc-navy` | 1.5px `--wc-navy` | Zurück, Alternative |
| `quiet` | `--wc-white` | `--wc-ink` | 1px `--wc-line` | Werkzeugleisten, Kopieren |
| `link` | keine | `--wc-green-dark`, unterstrichen | keine | inline, „Warum fragen wir das?" |
| `danger` | `--wc-white` | `--wc-error` | 1.5px `--wc-error` | nur „Alle lokalen Daten löschen" |

Kein Gold-Button. Kein Verlauf. Kein Schlagschatten auf Buttons.

`aria-disabled="true"` statt `disabled`: Der Button bleibt fokussierbar und erklärt
beim Auslösen, was fehlt („Bitte wählen Sie mindestens eine Priorität"). Ein
`disabled`-Button, den niemand erreicht, ist für Tastatur- und Screenreader-Nutzung
eine Sackgasse. Optik im gesperrten Zustand: Fläche `#E9E7E2`, Text `--wc-ink-muted`,
Rand `--wc-border-strong`, `cursor: not-allowed`. Keine Deckkraftsenkung.

### 6.3 Antwortflächen

Die zentrale Komponente des Produkts. Keine kleinen Radio Buttons.

```
┌──────────────────────────────────────────────┐
│ ✓  Bezahlbarer Wohnraum                      │   min-height 64px
│    Mietbelastung, Neubau, Bestandssicherung  │   padding 16px 20px
└──────────────────────────────────────────────┘   Rand 1.5px
```

| Zustand | Rand | Fläche | Zusatz |
|---|---|---|---|
| Ruhe | 1.5px `--wc-border-strong` | `--wc-white` | keiner |
| Hover | 1.5px `--wc-ink-muted` | `#FCFBF8` | keiner |
| Fokus | Fokusring (7.1) | unverändert | keiner |
| Gewählt | 2px `--wc-green` | `--wc-green-soft` | 4px linke Kante `--wc-green`, Häkchen |
| Gewählt + Fokus | Fokusring über grünem Rand | `--wc-green-soft` | wie oben |
| Deaktiviert | 1.5px `--wc-border-strong` | `#F2F0EC` | Text `--wc-ink-muted`, Grund im Hinweistext |

Kein `opacity` auf deaktivierten Flächen. Deckkraft senkt den Kontrast unkontrolliert
unter den Grenzwert. Der deaktivierte Zustand entsteht über eigene Flächen- und
Textwerte, die ihrerseits geprüft sind.

Multi-Select-Flächen tragen ein Quadrat-Glyph, Single-Select ein Kreis-Glyph,
damit die Auswahlart auch ohne Farbe erkennbar ist.

### 6.4 Karten im Report

Empfehlungskarte, Kontextkarte, Kit-Karte teilen sich eine Grundform:
Eyebrow, Titel, Fliesstext, Badge-Reihe, Aktionsreihe. Die Aktionsreihe steht
immer unten, immer links ausgerichtet, immer in der Reihenfolge
Primary, Sekundär, Sekundär.

### 6.5 Fortschritt

Kein Balken mit Prozentzahl. Stattdessen eine Segmentleiste: ein Segment je Frage,
beantwortete Segmente in `--wc-navy`, aktuelles Segment mit Gold-Unterstrich,
kommende Segmente in `--wc-line`. Darunter der Text
`Frage 4 von 10 · noch etwa 3 Minuten`.

Die Zeitangabe ist eine Schätzung, kein Countdown. Sie zählt nicht herunter,
während man liest. Sie aktualisiert sich nur beim Fragenwechsel. Nie „Beeilen Sie sich",
nie eine ablaufende Anzeige.

---

## 7. Zustände und Interaktion

### 7.1 Fokus

```css
:focus-visible {
  outline: 3px solid var(--wc-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(200, 155, 60, .35);
  border-radius: inherit;
}
```

Doppelring aus dunkler Innenlinie und goldenem Halo. Damit ist der Fokus sowohl auf
Ivory, auf Weiss als auch auf Navy sichtbar. Auf Navy-Flächen kehrt sich der
Innenring auf `--wc-ivory`. `outline: none` ohne Ersatz ist im gesamten Projekt verboten.

Die Hauptwebsite setzt an mehreren Stellen `outline: none` und ersetzt den Fokus nur
durch eine Randfarbe. Das wird hier nicht übernommen.

### 7.2 Interaktionsdauern

```css
--wc-dur-fast: 120ms;  /* Farbe, Rand */
--wc-dur-base: 180ms;  /* Fläche, Deckkraft */
--wc-dur-panel: 240ms; /* Drawer, Akkordeon */
--wc-ease: cubic-bezier(.2, 0, .2, 1);
```

Keine Animation länger als 240ms. Keine Bewegung ohne Auslöser durch Nutzende.
Kein Parallax, kein Scroll-Reveal, kein Zahlen-Hochzählen, kein Skeleton-Shimmer.

### 7.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Der Drawer erscheint dann ohne Slide, der Ladezustand ohne rotierendes Element,
stattdessen mit statischem Text und `aria-live="polite"`.

### 7.4 Ladezustand

Der Ergebnis-Ladescreen zeigt keine Animation als Selbstzweck. Er zeigt in Ruhe die
tatsächlichen Rechenschritte als Liste mit Häkchen, weil das Vertrauen aufbaut und
gleichzeitig die Determinismus-Behauptung stützt:

```
Ihre Angaben werden geprüft.          ✓
Wahlkreisdaten werden geladen.        ✓
Regelwerk wird angewendet.            ·
Herleitung wird erstellt.
```

Mindestanzeigedauer 900ms, Höchstdauer bis Ergebnis. Nach 12 Sekunden erscheint der
Hinweis „Das dauert länger als üblich" mit Abbruchmöglichkeit.

---

## 8. Dunkelmodus

Version 1.0 liefert **keinen** Dunkelmodus. Begründung: Die Marke ist auf Ivory
definiert, der Report ist ein Druck- und Lesedokument, und ein zweites Farbsystem
verdoppelt die Neutralitäts- und Kontrastprüfung ohne belegten Bedarf.

`color-scheme: light` wird explizit gesetzt, damit Browser Formularelemente nicht
eigenmächtig invertieren. Ein späterer Dunkelmodus muss die Kontrasttabelle aus 2.7
vollständig neu nachweisen.

Ein Kontrastmodus wird dagegen unterstützt:

```css
@media (prefers-contrast: more) {
  :root { --wc-line: #9BA3AE; --wc-ink-muted: #33383F; --wc-ink-faint: #4A505C; }
}
@media (forced-colors: active) {
  /* Ränder auf ButtonBorder, Auswahl über Outline statt Fläche */
}
```

Im Windows-Kontrastmodus verlieren Flächen ihre Farbe. Deshalb trägt jeder
Auswahlzustand zusätzlich `outline` und jedes Segmentzeichen eine Kontur.

---

## 9. Druck und PDF

Der Report muss als PDF und im Browserdruck sauber sein, weil er in
Ausschussvorbereitung und Wahlkreisarbeit weiterverwendet wird.

- Seitengrund weiss, Tinte schwarz, Ivory-Bänder werden zu 1px-Trennlinien.
- Navigation, Buttons, Drawer-Auslöser und Opt-in-Blöcke `display: none`.
- Drawer-Inhalte werden **ausgeklappt gedruckt**, damit die Herleitung im PDF steht.
- Jede Quelle erscheint im Druck als vollständige Fussnote mit Institution, Kennzahl,
  Jahr, Ebene und URL. Keine reinen „Quelle"-Links.
- Kopfzeile: Wahlkreis, Datenstand, Methoden-Version.
  Fusszeile: „Keine Personenbewertung. Keine Wahlempfehlung." plus Seitenzahl.
- `@page { margin: 18mm 16mm; }`, Kartenumbrüche über `break-inside: avoid`.

---

## 10. Barrierefreiheit als Systemeigenschaft

Ziel WCAG 2.2 AA. Die Regeln, die das Design System selbst garantiert:

1. **Kein Sinn allein durch Farbe** (1.4.1). Belegbarkeit, Auswahl, Fehler und
   Wirkungsräume tragen immer Wort und Form.
2. **Kontrast** (1.4.3, 1.4.11). Tabelle 2.7 ist Abnahmekriterium, auch für
   Rahmen von Eingabefeldern und Auswahlflächen.
3. **Zielgrösse** (2.5.8). Alle interaktiven Flächen mindestens 44×44 CSS-Pixel,
   Antwortflächen mindestens 64px hoch, Abstand zwischen Zielen mindestens 8px.
4. **Fokus sichtbar und nicht verdeckt** (2.4.11, 2.4.13). Sticky Header und
   Sticky Survey-Footer haben `scroll-margin-block` auf allen fokussierbaren
   Elementen, damit nichts unter den Leisten verschwindet.
5. **Keine Drag-only-Interaktion** (2.5.7). Die Top-3-Priorisierung ist primär über
   Buttons und Auswahllisten bedienbar; Drag ist nur eine zusätzliche Möglichkeit.
6. **Bewegung** (2.3.3). Siehe 7.3.
7. **Konsistente Hilfe** (3.2.6). „Vertrauen & Datenschutz" liegt auf jedem Screen
   an derselben Stelle im Footer, zusätzlich im Header ab Tablet.
8. **Eingabehilfe** (3.3.7, 3.3.8). Keine Wiederholung bereits gegebener Angaben,
   kein CAPTCHA, kein Login, kein Gedächtnistest.
9. **Text auf 200 Prozent zoombar** ohne Verlust von Inhalt oder Funktion
   (1.4.4), geprüft bei 320px Breite und 400 Prozent Zoom (1.4.10).
10. **Sprache** `lang="de"` auf `<html>`, `lang="en"` an einzelnen Fremdwortstellen.

Die vollständige Prüfliste steht in `UX_SPEC.md`, Abschnitt „Abnahme".

---

## 11. Datei- und Namenskonventionen

```
werkzeuge/wahlkreis-wirkungscheck/index.html
assets/css/wahlkreis-wirkungscheck.css
assets/js/wahlkreis-wirkungscheck/app.js
assets/js/wahlkreis-wirkungscheck/data-2025.js
assets/js/wahlkreis-wirkungscheck/check-config.js
assets/js/wahlkreis-wirkungscheck/rules.js
docs/wirkungscheck/*.md
```

- CSS-Präfix `wc-` für Token und Klassen. Keine Utility-Klassen ohne Präfix.
- BEM-nah: `.wc-card`, `.wc-card__title`, `.wc-card--recommendation`.
- Zustände als Attribut, nicht als Klasse: `[aria-pressed]`, `[aria-checked]`,
  `[aria-expanded]`, `[data-state]`. Damit ist der visuelle Zustand
  zwangsläufig auch der semantische.
- IDs von Fragen, Regeln, Indikatoren und Quellen sind stabil und im Markup als
  `data-question-id`, `data-rule-id`, `data-indicator-id`, `data-source-id`
  hinterlegt, damit die spätere Engine sie ohne Textabgleich verdrahten kann.

---

## 12. Was dieses System bewusst nicht enthält

- Keine Gamification-Token, keine Fortschrittsbelohnung, keine Punktestände.
- Keine Persönlichkeits- oder Typ-Darstellung.
- Keine Vergleichsansicht zwischen Personen, Wahlkreisen oder Parteien.
- Keine Karte Deutschlands mit Einfärbung.
- Keine Gesamtnote, kein Index, kein Score für Nutzende.
- Keine Social-Media-Sharecards mit personenbezogenem Ergebnis.
- Keine Cookie-Banner, weil keine einwilligungspflichtigen Cookies gesetzt werden.
