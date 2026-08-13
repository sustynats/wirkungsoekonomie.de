# Wahlkreis-Wirkungscheck — Komponenten

Version 1.0 · Stand 2026-08-13 · Lane: Claude (Design/UX) · Umsetzung: Codex

Props sind framework-neutral notiert. Der Prototyp ist Vanilla JS mit
`data-`-Attributen; eine spätere React-Umsetzung kann dieselben Namen übernehmen.

Konventionen für alle Komponenten:

- Zustände liegen auf ARIA-Attributen, nicht auf Klassen
  (`aria-checked`, `aria-pressed`, `aria-expanded`, `aria-disabled`, `aria-current`).
- Jede Komponente ist ohne Maus vollständig bedienbar.
- Keine Komponente kodiert Bedeutung allein über Farbe.
- Keine Komponente enthält Wertung, Rangfolge oder Belohnung.

---

## 1. Basis

### 1.1 `Button`

| Prop | Typ | Default | Beschreibung |
|---|---|---|---|
| `variant` | `primary \| secondary \| quiet \| link \| danger` | `secondary` | siehe `DESIGN_SYSTEM.md` 6.2 |
| `size` | `md \| sm` | `md` | `md` = 48px, `sm` = 44px. Keine kleinere Grösse |
| `fullWidth` | boolean | `false` | unter 48rem für Primary/Secondary immer `true` |
| `iconStart` / `iconEnd` | Icon | — | dekorativ, `aria-hidden` |
| `disabledReason` | string | — | setzt `aria-disabled="true"` und liefert den Grund bei Aktivierung |
| `onActivate` | fn | — | reagiert auf Klick, Enter und Leertaste |

Regeln: genau ein `primary` pro Screen. `danger` ausschliesslich für
„Alle lokalen Daten löschen". `link` nur inline im Fliesstext.
Nie `disabled` ohne `disabledReason`.

### 1.2 `Badge`

| Prop | Typ | Beschreibung |
|---|---|---|
| `label` | string | z. B. „Bund", „3 bis 5 Jahre" |
| `kind` | `plain \| evidence` | `evidence` ergänzt das Segmentzeichen |
| `evidence` | `hoch \| mittel \| begrenzt \| datenluecke \| annahme` | nur bei `kind="evidence"` |

Badges sind nie nach Wertung eingefärbt. Alle `plain`-Badges sehen identisch aus.

### 1.3 `EvidenceMark`

Segmentzeichen plus Wort. Die einzige zulässige Darstellung von Belegbarkeit.

| Prop | Typ | Beschreibung |
|---|---|---|
| `level` | `hoch \| mittel \| begrenzt \| datenluecke \| annahme` | Stufe |
| `showLabel` | boolean, Default `true` | Wort ausblenden nur, wenn es unmittelbar daneben steht |
| `explain` | boolean, Default `false` | macht das Zeichen zum Auslöser eines Popovers mit der Stufendefinition |

Markup: `<span role="img" aria-label="Belegbarkeit: mittel">` mit
`<svg aria-hidden="true">`. Leere Segmente mit 1.5px Kontur in `--wc-scale-3`.

### 1.4 `Trustline`

Reihe kurzer Angaben mit Trennpunkt. Kein Häkchen-Icon, keine Fläche.

| Prop | Typ |
|---|---|
| `items` | `string[]`, 4 bis 6 |

Semantisch eine `<ul>` mit `list-style: none`, Trennpunkte über `::before`
mit `aria-hidden`.

### 1.5 `SectionHeader`

| Prop | Typ |
|---|---|
| `eyebrow` | string, optional |
| `title` | string |
| `intro` | string, optional, max 2 Sätze |
| `level` | `2 \| 3`, Default `2` |

---

## 2. Antwortkomponenten

### 2.1 `OptionTile` — Grundform aller Auswahlflächen

| Prop | Typ | Beschreibung |
|---|---|---|
| `id` | string | stabile Antwort-ID, landet in den Daten |
| `label` | string | Hauptbeschriftung |
| `hint` | string, optional | eine Zeile Erläuterung |
| `mode` | `single \| multi` | steuert Glyph und ARIA-Rolle |
| `checked` | boolean | Auswahlzustand |
| `disabled` | boolean | mit `disabledHint`, nie ohne Grund |
| `disabledHint` | string | z. B. „Höchstens 5 Themen auswählbar" |

Markup `single`: `role="radio"` in `role="radiogroup"`.
Markup `multi`: `role="checkbox"` in `role="group"` mit `aria-describedby`
auf den Auswahlhinweis.

Mindesthöhe 64px, Innenabstand 16px/20px, Label 600, Hint `--wc-ink-muted`.
Glyph links: Kreis bei `single`, Quadrat bei `multi`, gefüllt mit Häkchen bei Auswahl.

**Verboten:** native kleine Radio Buttons oder Checkboxen als sichtbares
Hauptdesign. Das native Element darf existieren, muss dann aber visuell
vollständig durch die Fläche ersetzt sein.

### 2.2 `SingleSelect`

| Prop | Typ |
|---|---|
| `name` | string, Frage-ID |
| `options` | `{id, label, hint?}[]` |
| `value` | string \| null |
| `onChange` | fn |

Pfeiltasten wechseln innerhalb der Gruppe, Tab verlässt sie (Radiogroup-Standard).
Keine Vorauswahl.

### 2.3 `MultiSelect`

Wie `SingleSelect`, zusätzlich:

| Prop | Typ | Beschreibung |
|---|---|---|
| `max` | number, optional | Höchstzahl |
| `min` | number, Default `1` | Mindestzahl für Pflichtfragen |

Bei Erreichen von `max` werden nicht gewählte Kacheln `disabled` mit `disabledHint`.
Ein Zähler `3 von 5 gewählt` steht über der Gruppe und ist `aria-live="polite"`.
Die Kacheln verschwinden nie und springen nie um.

### 2.4 `PriorityRanker` — Top 3

| Prop | Typ | Beschreibung |
|---|---|---|
| `pool` | `{id,label}[]` | Auswahl aus der Vorfrage |
| `ranked` | `string[]` | geordnet, max 3 |
| `max` | number, Default `3` | |
| `onChange` | fn | |

Bedienung:

| Weg | Interaktion |
|---|---|
| Buttons | `↑`, `↓`, `Entfernen` je Zeile; `Aufnehmen` im Pool |
| Tastatur | `Alt+Pfeil auf/ab` auf der fokussierten Zeile |
| Zeiger | Drag am Griff, `touch-action: none` nur auf dem Griff |

Nach jeder Änderung `aria-live="assertive"`:
„Verkehr und Erreichbarkeit ist jetzt Position 1 von 3."

Positionen werden als `1.`, `2.`, `3.` dargestellt, ohne Medaille, ohne Farbe,
ohne Grössenunterschied zwischen den Rängen.

### 2.5 `LikertGrid`

| Prop | Typ | Beschreibung |
|---|---|---|
| `rows` | `{id,label,hint?}[]` | 5 Zeilen |
| `scale` | `{value:1..5,label}[]` | beschriftete Stufen |
| `value` | `Record<string,number>` | |

Ab 48rem Matrix mit sticky Kopfzeile. Darunter je Zeile ein eigener Block mit
volltextigen Optionen. Jede Zeile ist eine `radiogroup` mit `aria-labelledby`.
Keine Mittelvorauswahl. Stufen tragen immer Wörter, nie nur Zahlen.

### 2.6 `TimeAxis`

| Prop | Typ |
|---|---|
| `options` | `{id,label,hint}[]`, genau 3 |
| `value` | string \| null |

Horizontal ab 37.5rem, darunter vertikal. `role="radiogroup"`.
Haltepunkte sind vollwertige Antwortflächen; die Achslinie ist dekorativ
(`aria-hidden`). Kein Slider, keine Zwischenwerte.

### 2.7 `TopicCardGrid`

Themenkarten für Frage 1.

| Prop | Typ |
|---|---|
| `topics` | `{id,label,hint,field}[]` |
| `selected` | `string[]` |
| `max` | number |

Raster `repeat(auto-fit, minmax(17rem, 1fr))` ab 48rem, darunter einspaltig.
Karten sind `OptionTile` im `multi`-Modus mit zusätzlicher Zeile `field`
(zugehöriges Wirkungsfeld) in `--wc-ink-faint`.

Kein Icon je Thema. Themenicons werden unweigerlich als politische Zeichen
gelesen, und eine gute neutrale Ikonografie für „Migration" oder „Innere
Sicherheit" existiert nicht.

### 2.8 `FreeText`

| Prop | Typ |
|---|---|
| `maxLength` | number, Default 600 |
| `label` | string, sichtbar, nie nur Placeholder |
| `notice` | string, „Bitte keine personenbezogenen Angaben Dritter." |

Zähler ab 500 Zeichen sichtbar, `aria-live="polite"` nur bei 500, 550, 600.
Kein hartes Abschneiden. Textbereich mindestens 5 Zeilen, vertikal skalierbar.

### 2.9 `ConstituencyCombobox`

| Prop | Typ | Beschreibung |
|---|---|---|
| `items` | `{nr,name,land,context,plz[]}[]` | Datensatz |
| `value` | Wahlkreis \| `"bundesweit"` \| null | |
| `minChars` | number, Default 2 | |
| `maxVisible` | number, Default 8 | |

Verhalten, Tastatur und Zustände: `UX_SPEC.md` Abschnitt 6.

ARIA: `role="combobox"` auf dem Input mit `aria-expanded`, `aria-controls`,
`aria-autocomplete="list"`, `aria-activedescendant`. Liste `role="listbox"`,
Einträge `role="option"`. Trefferzahl in einem eigenen `aria-live="polite"`-Bereich.

Gewählter Zustand: Eingabe wird durch eine Bestätigungskarte ersetzt
(`275 · Mannheim`, Kontextzeile, Button „Ändern"). Der Fokus wandert auf „Ändern".

---

## 3. Erklärung und Transparenz

### 3.1 `WhyWeAsk`

| Prop | Typ |
|---|---|
| `text` | string, 2 bis 4 Sätze |
| `visible` | boolean, erst nach der ersten Antwort |

`<details>`/`<summary>` mit dem Text „Warum fragen wir das?".
Zurückhaltend gestaltet: `--wc-ink-muted`, keine Fläche, kein Rahmen,
kleines Dreieck als `::marker`-Ersatz. Öffnungszustand gilt sitzungsweit.

### 3.2 `ExplainDrawer` — „Warum wird mir das vorgeschlagen?"

Kernkomponente. Vollständige Inhaltsdefinition in `RESULT_EXPLAINABILITY.md`.

| Prop | Typ | Beschreibung |
|---|---|---|
| `pathId` | string | z. B. `P-03` |
| `sections` | siehe unten | feste Reihenfolge, keine Umsortierung |
| `open` | boolean | |

Feste Abschnitte in dieser Reihenfolge:

1. Ihre Angaben
2. Wahlkreisdaten
3. Methodik (Regel im Klartext, Regel-ID, Evidenzstufe)
4. Daraus folgt
5. Was würde das verändern
6. Warum nicht Alternative B

Darstellung: Drawer von rechts ab 64rem (`--wc-container-drawer`, 560px),
darunter Vollbild-Sheet von unten mit Griffleiste.

Verhalten: `role="dialog" aria-modal="true"`, Fokusfalle, Escape schliesst,
Fokus kehrt auf den auslösenden Button zurück, Hintergrund `inert`,
Body-Scroll gesperrt. Setzt `?herleitung=P-03` in der URL, damit die Herleitung
verlinkbar ist. Im Druck wird der Inhalt ausgeklappt ausgegeben.

### 3.3 `SourcePopover`

Ausgelöst durch den Text „Quelle" hinter jedem Datenwert.

| Prop | Typ |
|---|---|
| `institution` | string |
| `metric` | string |
| `year` | string |
| `level` | `Bund \| Land \| Wahlkreis \| Kreis \| Gemeinde` |
| `quality` | `EvidenceMark`-Stufe |
| `url` | string |
| `note` | string, optional, z. B. Gebietsstandabweichung |

Ab 48rem Popover mit Pfeil, darunter Bottom-Sheet.
`role="dialog"`, Escape schliesst, Fokus kehrt zurück.
Externer Link mit `rel="noopener"` und sichtbarem Hinweis „öffnet externe Seite".

**Regel:** Kein Zahlenwert im gesamten Produkt ohne `SourcePopover` oder ohne
ausdrückliche Kennzeichnung als Modellannahme.

### 3.4 `MethodNote`

Kleiner, immer sichtbarer Hinweisblock mit linker Gold-Kante für Sätze wie
„Dieser Report bewertet keine Personen." Kein Icon, keine Signalfarbe.

---

## 4. Report

### 4.1 `RecommendationCard`

Muss auf einen Blick drei Ebenen zeigen: Was, Warum, Wie belastbar.

```
┌─────────────────────────────────────────────────┐
│ HANDLUNGSPFAD A                                 │  Eyebrow
│                                                 │
│ Verfahrensdauer bei Netzanschlüssen verkürzen   │  h3
│                                                 │
│ Kurzbeschreibung in zwei bis drei Sätzen.       │  Body
│                                                 │
│ Passt zu Ihrer Angabe: Engpass Verfahren        │  Warum-Zeile
│                                                 │
│ [ Bund ] [ 3 bis 5 Jahre ] [ ▮▮▯ Belegbarkeit: mittel ]
│                                                 │
│ [ Warum wird mir das vorgeschlagen? ]           │  Primary
│ Wirkungspfad ansehen · Alternativen             │  Sekundär
└─────────────────────────────────────────────────┘
```

| Prop | Typ |
|---|---|
| `pathId` | string, `P-01` … |
| `letter` | `A \| B \| C` |
| `title` | string |
| `summary` | string, 2 bis 3 Sätze |
| `matchReason` | string, ein Satz, beginnt mit „Passt zu Ihrer Angabe:" |
| `badges` | `{level, horizon, evidence}` |
| `onExplain`, `onPath`, `onAlternatives` | fn |

Regeln:

- Der Buchstabe ist keine Rangfolge. Über der Kartengruppe steht der Satz aus
  `UX_SPEC.md` 9.4.
- Keine Karte ist optisch hervorgehoben. Kein „empfohlen", kein Rahmen in Akzentfarbe,
  keine unterschiedliche Grösse.
- Die drei Aktionen stehen immer in derselben Reihenfolge.
- `matchReason` ist Pflicht. Eine Karte ohne sichtbaren Bezug zur Eingabe darf
  nicht gerendert werden.

### 4.2 `LeverList` — Wirkungshebel

| Prop | Typ |
|---|---|
| `items` | `{id, label, degree: 0..3, isBinding: boolean, note?}[]` |
| `conclusion` | string |

Darstellung als Tinten-Segmente plus Wort (`ausreichend adressiert`,
`teilweise adressiert`, `begrenzend`). Der begrenzende Faktor trägt zusätzlich
Fettung, einen Pfeil und `aria-current="true"`.
Kein Farbwechsel, keine Ampel.

**Wichtig:** Die Segmente sehen aus wie `EvidenceMark`, bedeuten aber etwas
anderes. `EvidenceMark` sagt, wie gut eine Aussage belegt ist. Der Hebelgrad sagt,
wie weit ein Faktor adressiert ist. Deshalb ist das Segmentzeichen hier
**dekorativ** (`aria-hidden="true"`) und die Bedeutung steht ausschliesslich im
Wort daneben. Ein Hebel darf nie mit „Belegbarkeit: mittel" beschriftet werden;
das würde Abdeckung und Belegbarkeit verwechseln.

### 4.3 `ImpactPath` — Wirkpfad

| Prop | Typ |
|---|---|
| `stations` | `{title, text, evidence}[]`, genau 4 |
| `risks` | `{text, evidence}[]`, 1 bis 3 |
| `view` | `verlauf \| liste` |

Zwei gleichwertige Ansichten mit Umschalter (`aria-pressed`), Zustand gespeichert.
Diagramm in `.wc-scroll-x`, `role="img"` mit `aria-describedby` auf die
Listenfassung. Unter 64rem, bei `prefers-reduced-motion` und im Druck ist
`liste` der Standard.

Risiken stehen in einem eigenen Block „Risiken und Gegenwirkungen", neutral
gestaltet, nicht rot, nicht als Warnung.

### 4.4 `ImpactSpaces` — Mensch · Planet · Demokratie

| Prop | Typ |
|---|---|
| `spaces` | `{key: mensch\|planet\|demokratie, items: {text, evidence}[]}[]` |

Drei Karten mit 3px linker Kante in der jeweiligen Raumfarbe und Raumnamen als h3.
Wenn `items` leer ist, steht der Leersatz aus `COPY.md`, keine leere Karte.

**Verboten:** Zahl, Balken, Prozentwert, Radardiagramm, Gesamtscore, Vergleich
zwischen den Räumen, Sortierung nach Stärke.

### 4.5 `SensitivityPanel`

| Prop | Typ |
|---|---|
| `chips` | `{id,label}[]`, 4 bis 6 |
| `active` | `string[]`, max 3 |
| `outcome` | `{text, changed: boolean}` |

Chips als Toggle-Buttons mit `aria-pressed`. Ergebnisbereich `aria-live="polite"`,
nennt immer den Grund. Bei `changed: false` erscheint ausdrücklich der Satz, dass
sich nichts ändern würde. Button „Zurücksetzen" immer sichtbar, sobald ein Chip
aktiv ist. Hinweis „Ihre ursprünglichen Angaben bleiben unverändert." steht
dauerhaft im Panel.

### 4.6 `ToolkitCard` — Politik-Kit

| Prop | Typ |
|---|---|
| `kind` | `pruefrage \| indikatoren \| dialogfrage \| ersterschritt` |
| `title` | string |
| `body` | string \| string[] |
| `copyable` | boolean |

Bei `copyable` ein Button „Text kopieren" mit Rückmeldung über `aria-live`
(„Text kopiert"), nicht über einen Toast, der wieder verschwindet.
Kopiert wird reiner Text ohne Formatierung und ohne Quellenlinks im Fliesstext;
Quellen werden als Klartext angehängt.

### 4.7 `ConsentChoice`

| Prop | Typ |
|---|---|
| `question` | string |
| `options` | genau 2, beide `OptionTile` im `single`-Modus |
| `details` | aufklappbare Tabelle „Was genau wird übertragen" |
| `value` | string \| null, **immer initial `null`** |

Beide Optionen identisch gestaltet und gleich gross. Die datensparsame Option
steht zuerst. Keine Vorauswahl, kein vorangekreuztes Feld, keine
Bestätigungsfalle („Sind Sie sicher, dass Sie nicht helfen wollen?").

### 4.8 `ProgressBar`

| Prop | Typ |
|---|---|
| `total` | number |
| `current` | number |
| `answered` | `number[]` |
| `estimate` | string, aus der Tabelle in `UX_SPEC.md` 7.2 |

Segmente sind Buttons für beantwortete Fragen, sonst `aria-disabled`.
`aria-label` je Segment: „Zu Frage 2: Priorisierung. Beantwortet."
Kein Prozentwert, keine Animation der Füllung.

### 4.9 `LoadingSteps`

| Prop | Typ |
|---|---|
| `steps` | `{label, state: pending\|active\|done}[]` |
| `slowAfterMs` | number, Default 12000 |

Statische Liste mit Häkchen, kein Spinner, kein Shimmer.
`aria-live="polite"` meldet jeden Schritt genau einmal.
Nach `slowAfterMs` erscheint der Hinweistext plus Abbruchmöglichkeit.
Mindestanzeigedauer 900ms, damit die Liste nicht aufblitzt.

---

## 5. Rahmen

### 5.1 `AppHeader`

Navy, 3px Gold-Abschluss. Links Signet und Werkzeugname, rechts
„Vertrauen & Datenschutz" ab 48rem, darunter nur im Fuss.
Kein Hauptmenü der Website im Survey: Der Kopf enthält im Survey ausschliesslich
Signet, Werkzeugname und den Vertrauens-Auslöser, damit niemand versehentlich
die Befragung verlässt.

### 5.2 `TrustDrawer`

Neun Abschnitte als Akkordeon: Zweck, Betreiber, Daten, Veröffentlichung, KI,
Parteiunabhängigkeit, Quellen, Methodik, Kontakt.
Jeder Abschnitt hat eine Zusammenfassungszeile, die auch geschlossen sichtbar ist.
„Daten" ist standardmässig geöffnet. Am Ende: Link auf die vollständige Seite und
der Button „Alle lokalen Daten löschen".

### 5.3 `AppFooter`

Betreiber, Impressum, Datenschutz, Methodik, Kontakt, Stand der Daten,
Methoden-Version. Zusätzlich der Neutralitätssatz. Keine Social-Media-Symbole,
keine Newsletter-Anmeldung, kein Spendenaufruf.

### 5.4 `Drawer` / `Sheet` — Grundverhalten

Gemeinsame Basis für `ExplainDrawer`, `TrustDrawer`, `SourcePopover` (mobil),
`ImpactPath` (mobil).

- ab 64rem: seitlich, 560px, `--wc-shadow-drawer`
- darunter: Bottom-Sheet, maximal 92 Prozent der Viewporthöhe, Griffleiste,
  Schliessen per Wischen nach unten **und** per Button
- `role="dialog" aria-modal="true"`, `aria-labelledby` auf die Überschrift
- Fokusfalle, Escape, Rückgabe des Fokus, `inert` auf dem Hintergrund
- Body-Scroll gesperrt, Scrollposition wird beim Schliessen wiederhergestellt
- ohne Slide-Animation bei `prefers-reduced-motion`

### 5.5 `ErrorState`

| Prop | Typ |
|---|---|
| `kind` | `technisch \| offline \| abgelaufen \| keine-regel` |
| `code` | string, optional, zitierfähig |
| `actions` | Button[] , mindestens einer |

Immer drei Angaben: was passiert ist, was das bedeutet, was jetzt zu tun ist.
Kein Stacktrace, keine Schuldzuweisung, kein „Ups".

---

## 6. Komponenten-Zustandsmatrix

| Komponente | Ruhe | Hover | Fokus | Gewählt | Gesperrt | Fehler | Leer |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Button | ✓ | ✓ | ✓ | — | ✓ | — | — |
| OptionTile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| MultiSelect | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| PriorityRanker | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| LikertGrid | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| TimeAxis | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| Combobox | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ |
| FreeText | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| ExplainDrawer | ✓ | — | ✓ | — | — | ✓ | ✓ |
| SourcePopover | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| RecommendationCard | ✓ | ✓ | ✓ | — | — | — | — |
| SensitivityPanel | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| ConsentChoice | ✓ | ✓ | ✓ | ✓ | — | — | — |
| LoadingSteps | ✓ | — | — | — | — | ✓ | — |

„Leer" bei `ExplainDrawer` bedeutet: Regel ohne hinterlegte Alternative. Dann
entfällt Abschnitt 6 und der Grund steht dort ausdrücklich.

---

## 7. Was bewusst fehlt

| Nicht gebaut | Grund |
|---|---|
| Toast / Snackbar | verschwindet, bevor Screenreader und langsame Leser sie erfassen |
| Tooltip auf Hover | auf Touch nicht erreichbar, `title` ist keine Erklärung |
| Modal mit Bestätigungsfrage beim Abbruch | Abbruch ist ein legitimer Wunsch |
| Sticky Call-to-Action-Leiste auf der Landing | Funnel-Anmutung |
| Fortschritts-Prozentzahl | erzeugt Leistungslogik |
| Onboarding-Tour | ein Werkzeug, das eine Tour braucht, ist falsch gebaut |
| Vergleichsansicht mehrerer Reports | Ranking-Risiko |
| Teilen-Buttons für soziale Netzwerke | politisches Ergebnis, keine Kampagne |
