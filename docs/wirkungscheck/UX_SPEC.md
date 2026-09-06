# Wahlkreis-Wirkungscheck - UX-Spezifikation

Version 1.0 · Stand 2026-08-13 · Lane: Claude (Design/UX) · Umsetzung: Codex

Verbindliche Dokumente daneben: `DESIGN_SYSTEM.md`, `COMPONENTS.md`, `COPY.md`,
`RESULT_EXPLAINABILITY.md`, `SCREENS.md`.

---

## 0. Vorbemerkung zur Quellenlage

Ein separates Gesamtkonzept lag zum Zeitpunkt dieser Arbeit weder im Repository
(`docs/`, `content/` ohne Treffer zu „Wahlkreis") noch im Downloads-Ordner vor.
Grundlage dieser Spezifikation ist deshalb der vollständige Auftragstext vom
2026-08-13, ergänzt um:

- Brand Guide Wirkungsökonomie (`BRAND-GUIDE.md`),
- Design der Institut-App (`woek-institut-app/app/globals.css`),
- Design-Token und Komponenten der Live-Website (`assets/css/style.css`),
- den Wirkungswahl-Kompass als nächstliegendes Schwesterprodukt
  (`docs/wirkungswahl-kompass/README.md`), insbesondere dessen Datenschutz- und
  Neutralitätsarchitektur.

Wo ich fachlich entschieden habe, ohne dass der Auftrag es vorgab, steht das
ausdrücklich als **Entscheidung** im Text. Wo eine Freigabe nötig ist, steht
**Klärungsbedarf**.

---

## 1. Produktdefinition

### 1.1 Was das Produkt ist

Ein parteiunabhängiges Befragungs- und Analysewerkzeug für Mitglieder des
Deutschen Bundestages. Teilnehmende geben in etwa fünf Minuten ihre
Wirkungsprioritäten und die Herausforderungen ihres Wahlkreises an und erhalten
einen persönlichen Wirkungsreport mit politischen Handlungsoptionen,
Wirkungsindikatoren und vollständig nachvollziehbarer Herleitung.

### 1.2 Was das Produkt nicht ist

Keine Wahlhilfe, keine Bewertung von Personen, keine Parteianalyse, kein
Persönlichkeitstest, kein Ranking, keine Kampagne, kein Lead-Funnel.

### 1.3 Zielgruppe und Nutzungskontext

| Merkmal | Annahme |
|---|---|
| Primär | MdB und deren Büroleitungen, wissenschaftliche Mitarbeitende |
| Sekundär | Landtagsabgeordnete, kommunale Mandatsträger:innen (spätere Ausbaustufe) |
| Gerät | Häufig Smartphone zwischen Terminen, oft Desktop im Büro |
| Aufmerksamkeit | Fragmentiert, hohe Abbruchneigung, sehr geringe Toleranz für Marketing |
| Vorwissen Wirkungsökonomie | Nicht vorausgesetzt |
| Sensibilität | Sehr hoch. Der Eindruck von Bewertung, Bevormundung oder Parteinähe beendet die Nutzung sofort |

Konsequenz für das Design: Der erste Screen muss in unter zehn Sekunden klären,
wer fragt, warum, wie lange es dauert und was am Ende herauskommt.

### 1.4 Erfolgskriterien der Experience

1. Eine Person versteht vor dem Start, was sie bekommt.
2. Die Befragung ist in etwa fünf Minuten abschliessbar und jederzeit korrigierbar.
3. Jede einzelne Empfehlung ist bis auf die auslösende Regel und die verwendeten
   Daten zurückverfolgbar.
4. Kein Screen legt eine politische Wertung nahe.
5. Der Report ist auf dem Smartphone vollständig lesbar und als PDF zitierfähig.

---

## 2. Grundhaltung der Interaktion

### 2.1 Kein Zeitdruck

Zeitangaben sind Schätzungen. Es gibt keinen Countdown, keine ablaufende Anzeige,
keine Sitzungsuhr im Blickfeld. Der Fortschritt zeigt, wo man steht, nicht wie
schnell man ist.

### 2.2 Antworten sind Angaben, keine Leistungen

Es gibt keine richtigen und falschen Antworten, keine Auswertung der Antwortqualität,
keine Rückmeldung wie „gute Wahl". Bestätigung erfolgt ausschliesslich strukturell:
Die Auswahl ist sichtbar gesetzt, der Weiter-Button wird bedienbar.

### 2.3 Alles ist reversibel

Jede Antwort ist über „Zurück", über die Fortschrittssegmente und über den
Review-Screen erreichbar und änderbar. Auch nach dem Ergebnis führt ein Weg zurück
in die Antworten, der das Ergebnis anschliessend neu herleitet.

### 2.4 Progressive Disclosure

Vertrauensinformationen, Methodik, Quellen und Herleitung sind immer erreichbar,
aber nie im Weg. Erste Ebene: ein Satz. Zweite Ebene: Aufklappen. Dritte Ebene:
eigene Seite oder Drawer.

### 2.5 Datensparsamkeit als Interaktionsprinzip

Es wird nichts erhoben, was der Report nicht braucht. Kein Name, keine
E-Mail-Adresse, keine Partei, keine Fraktion, kein Login. Die Wahlkreis-Angabe
ist optional; „Überwiegend landes- oder bundesweite Arbeit" ist ein
gleichwertiger Weg.

**Entscheidung:** Es wird auch nicht nach der Fraktion gefragt, obwohl das die
Empfehlungen schärfen könnte. Eine Fraktionsangabe würde das Werkzeug für
Teilnehmende sofort als parteibezogene Auswertung lesbar machen und den
Neutralitätsanspruch beschädigen. Handlungsebene und Rahmenbedingungen liefern
die notwendige Differenzierung ohne Parteibezug.

---

## 3. Informationsarchitektur

```
/werkzeuge/wahlkreis-wirkungscheck/
├── (Landing)                     Einstieg, Nutzen, Vertrauen
├── /methodik                     Wie das Ergebnis entsteht
├── /vertrauen                    Vertrauen & Datenschutz (auch als Drawer)
├── /start                        Wahlkreis-Auswahl
├── /befragung                    Survey, Schritte 1 bis 10
│   └── /befragung/pruefen        Review Answers
├── /ergebnis                     Report Overview
│   ├── /ergebnis/pfad/:id        Recommendation Detail
│   ├── (Drawer) Herleitung       Why this result
│   ├── (Drawer) Quelle           Sources
│   ├── (Drawer) Wirkpfad         Impact path
│   └── /ergebnis/pdf             PDF Preview
└── /ergebnis/teilen              Public Sharing Opt-in
```

**Entscheidung Routing:** Der Survey nutzt echte History-Einträge pro Frage
(`?frage=4`), damit der Browser-Zurück-Button das tut, was Nutzende erwarten,
und damit einzelne Fragen verlinkbar bleiben. Der Report nutzt echte Unterseiten
statt reiner Tabs, damit Handlungspfade zitierbar und im neuen Tab öffenbar sind.
Drawer sind keine Routen, aber sie setzen `?herleitung=P-03`, damit ein geteilter
Link die Herleitung mit öffnet.

### 3.1 Persistenz

Antworten liegen ausschliesslich in `localStorage` unter `wc_state_v1`,
analog zum Wirkungswahl-Kompass. Keine Übertragung ohne ausdrückliche Einwilligung
(Abschnitt 12). „Alle lokalen Daten löschen" entfernt den Schlüssel vollständig
und ist von jedem Screen aus über „Vertrauen & Datenschutz" erreichbar.

Der gespeicherte Zustand trägt eine `schemaVersion`. Passt sie nicht, wird der
Zustand verworfen und der Screen „Sitzung abgelaufen" gezeigt, statt inkonsistente
Antworten weiterzuverwenden.

---

## 4. User Journey

### 4.1 Hauptpfad

```
Landing
  │  „Wirkungscheck starten"
  ▼
Wahlkreis-Auswahl ──────────► Alternative: landes-/bundesweit
  │
  ▼
Survey Intro (1 Screen, überspringbar)
  │
  ▼
Frage 1  Wirkungsprioritäten (Themenkarten, Mehrfachauswahl bis 5)
Frage 2  Priorisierung Top 3
Frage 3  Gewünschte Veränderung zu Priorität 1 (Zustandsziel)
Frage 4  Wahrgenommener Engpass (bis 2)
Frage 5  Wirkungshorizont (Zeitachse)
Frage 6  Handlungsebene (Mehrfachauswahl)
Frage 7  Rahmenbedingungen (Likert, 5 Zeilen)
Frage 8  Was darf sich nicht verschlechtern (optional)
Frage 9  Wahlkreiskontext, adaptiv (nur mit Wahlkreis)
Frage 10 Freitext (optional)
  │
  ▼
Antworten prüfen
  │  „Wirkungsreport erstellen"
  ▼
Ergebnis wird erstellt (Ladezustand mit echten Schritten)
  │
  ▼
Wirkungsreport
  ├─ Herleitung öffnen (Drawer)      ← Kernfeature
  ├─ Wirkpfad ansehen (Drawer)
  ├─ Quelle öffnen (Popover/Drawer)
  ├─ Sensitivität ausprobieren
  └─ Politik-Kit
  │
  ▼
Forschungs-Opt-in (erst hier, nach dem persönlichen Nutzen)
  │
  ▼
optional: PDF · optional: Veröffentlichung (separates Opt-in)
```

### 4.2 Zeitbudget

| Abschnitt | Zielzeit |
|---|---|
| Landing lesen und entscheiden | 20 bis 40 Sekunden |
| Wahlkreis wählen | 15 Sekunden |
| Fragen 1 bis 10 | 3.5 bis 4.5 Minuten |
| Antworten prüfen | 20 Sekunden |
| Gesamt bis Report | etwa 5 Minuten |

Der Report selbst ist bewusst nicht zeitbudgetiert. Er darf ausführlich sein.

### 4.3 Adaptive Logik

| Bedingung | Wirkung |
|---|---|
| Kein Wahlkreis gewählt | Frage 9 entfällt, Fortschritt zeigt „9 Fragen". Report ersetzt „Relevanter Wahlkreiskontext" durch „Relevanter Bundeskontext" |
| Nur eine Priorität gewählt | Frage 2 bleibt im Ablauf, wird aber zur Bestätigung mit dem Angebot, weitere Schwerpunkte aufzunehmen |
| Priorität 1 ohne hinterlegte Zustandsziele | Frage 3 fällt auf eine allgemeine Formulierungsliste zurück |
| Engpass „Datenlage" gewählt | Report ergänzt einen Hinweis auf Datenlücken als eigenen Wirkungshebel |
| Rote Linie gesetzt (Frage 8) | Handlungspfade, die dieses Feld belasten, werden nachrangig und der Ausschlussgrund erscheint im Drawer unter „Warum nicht Alternative B" |

Adaptive Fragen sind als solche gekennzeichnet: „Diese Frage erscheint, weil Sie
den Wahlkreis 275 Mannheim gewählt haben." Nutzende sollen nie den Eindruck haben,
das Werkzeug beobachte sie.

---

## 5. Landingpage

### 5.1 Aufbau

| Block | Inhalt | Anmerkung |
|---|---|---|
| Kopfband | Signet, „Wirkungscheck", rechts „Vertrauen & Datenschutz" | Navy, Gold-Abschluss |
| Hero | Eyebrow, H1, Subline, Primary, Secondary, Trustline | Navy-Fläche |
| Was Sie erhalten | 3 Karten: Wirkungsanalyse, Handlungsoptionen, Politik-Kit | Ivory |
| Ablauf | 4 Schritte mit Dauer | Weiss |
| Wie das Ergebnis entsteht | Kurzform der Methodik, Link zur Methodikseite | Ivory-deep |
| Parteiunabhängigkeit | eigener Block, ausdrücklich | Weiss |
| Datenschutz | eigener Block, drei Sätze, Link zum Drawer | Weiss |
| Wer dahintersteht | Betreiber, Kontakt | Ivory |
| Abschluss-CTA | Primary, Dauerangabe | Navy |

### 5.2 Hero

- Eyebrow: `PARTEIUNABHÄNGIGES WIRKUNGSINSTRUMENT`
- H1: **Was soll Politik in Ihrem Wahlkreis tatsächlich verändern?**
- Subline: der im Auftrag vorgegebene Text, unverändert.
- Primary: **Wirkungscheck starten**
- Secondary: **So funktioniert die Methodik**
- Trustline direkt darunter, sechs Punkte, als Liste mit Trennpunkten, nicht als Badges:
  `Parteiunabhängig · Transparent hergeleitet · Datensparsam · Keine Personenbewertung · Quellen nachvollziehbar · Kein Konto nötig`

**Entscheidung:** Die Trustline ist Text, keine Badge-Reihe. Badges mit Häkchen
lesen sich als Werbeversprechen. Ein ruhiger Satz mit Trennpunkten liest sich als
Angabe.

Die Dauerangabe steht direkt unter dem Primary-Button, nicht im Button:
`Etwa 5 Minuten · 10 Fragen · Abbrechen jederzeit möglich`

### 5.3 Responsive

| Breakpoint | Hero |
|---|---|
| < 48rem | einspaltig, Buttons volle Breite, Trustline umbricht in zwei Zeilen |
| ≥ 48rem | einspaltig, Buttons nebeneinander, Trustline einzeilig |
| ≥ 64rem | zweispaltig, rechts eine ruhige Systemgrafik der vier Ablaufschritte |

Keine Bildfläche unter 64rem. Auf kleinen Geräten zählt Textgeschwindigkeit.

---

## 6. Wahlkreis-Auswahl

### 6.1 Verhalten der Combobox

WAI-ARIA Combobox mit Listbox, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
Kein `<datalist>`, weil dessen Darstellung und Screenreader-Verhalten uneinheitlich sind.

| Eingabe | Treffer |
|---|---|
| `Mannheim` | Wahlkreisname und Ortsname |
| `275` | Wahlkreisnummer, exakter Treffer zuerst |
| `68159` | Postleitzahl |
| `Mannh` | Präfix, ab 2 Zeichen |
| `Mannnheim` | Tippfehlertoleranz, Levenshtein-Distanz 1 ab 5 Zeichen |

Ergebniszeile:

```
275 · Mannheim
Baden-Württemberg · umfasst Mannheim ohne Ortsteile Sandhofen und Schönau
```

Nummer und Name sind fett, die Kontextzeile ist `--wc-ink-muted`. Der Suchbegriff
wird im Treffer mit `<mark>` hervorgehoben; `<mark>` erhält eine eigene, geprüfte
Farbe (`--wc-gold-soft`, Text `--wc-ink`), keine Browserdefault-Gelbfläche.

### 6.2 Tastatur

| Taste | Wirkung |
|---|---|
| Pfeil ab/auf | durch Treffer |
| Pos1 / Ende | erster / letzter Treffer |
| Enter | Treffer übernehmen |
| Escape | Liste schliessen, Eingabe behalten; zweites Escape leert die Eingabe |
| Tab | Liste schliessen, Auswahl des aktiven Treffers **nicht** übernehmen |

### 6.3 Zustände

| Zustand | Darstellung |
|---|---|
| Leer | Platzhalter, drei Beispielsuchen als Chips: `Mannheim`, `275`, `68159` |
| Tippend, < 2 Zeichen | Hinweis „Bitte mindestens zwei Zeichen" |
| Treffer | Liste, maximal 8 sichtbar, Rest scrollbar, Zähler `12 Treffer` |
| Kein Treffer | „Kein Wahlkreis gefunden." plus zwei Auswege: Suche ändern, oder ohne Wahlkreis fortfahren |
| Mehrdeutig (PLZ über zwei Wahlkreise) | alle betroffenen Wahlkreise mit Zusatz `PLZ 68159 liegt in zwei Wahlkreisen` |
| Gewählt | Eingabe wird zur Bestätigungskarte mit „Ändern" |

`aria-live="polite"` meldet die Trefferzahl, nicht jeden Tastendruck.

### 6.4 Alternative

Gleichwertig und gleich prominent unter der Suche, nicht als Kleingedrucktes:

> **Überwiegend landes- oder bundesweite Arbeit**
> Dann entfällt der Wahlkreisbezug. Der Report nutzt Bundesdaten und
> bundesweite Wirkungshebel.

Als Antwortfläche gestaltet, nicht als Link.

### 6.5 Datenschutzhinweis an dieser Stelle

Ein Satz unter dem Block, weil die Wahlkreisangabe der einzige potenziell
identifizierende Datenpunkt ist:

> Die Wahlkreisangabe bleibt in Ihrem Browser. Sie wird nur übertragen, wenn Sie
> am Ende ausdrücklich zustimmen.

---

## 7. Survey

### 7.1 Screen-Aufbau

```
┌────────────────────────────────────────────┐
│ Kopf: Signet · Vertrauen & Datenschutz     │  sticky, 56px
├────────────────────────────────────────────┤
│ Fortschrittssegmente                       │  sticky unter Kopf
│ Frage 4 von 10 · noch etwa 3 Minuten       │
├────────────────────────────────────────────┤
│                                            │
│ EYEBROW: WIRKUNGSPRIORITÄTEN               │
│ H1: Fragetext                              │
│ Hilfetext, ein bis zwei Sätze              │
│ Auswahlhinweis: „Mehrfachauswahl, bis 5"   │
│                                            │
│ [ Antwortfläche ]                          │
│ [ Antwortfläche ]                          │
│ [ Antwortfläche ]                          │
│                                            │
│ ▸ Warum fragen wir das?                    │  erst nach erster Antwort
│                                            │
├────────────────────────────────────────────┤
│ Zurück            [ Weiter ]               │  sticky, nur Mobile
└────────────────────────────────────────────┘
```

Eine Frage pro Screen. Ausnahme: Frage 7 (Likert) zeigt fünf Zeilen auf einem
Screen, weil eine Bewertungsmatrix zeilenweise zerlegt ihren Vergleichssinn verliert.

### 7.2 Fortschritt

Segmentleiste plus Text `Frage 4 von 10 · noch etwa 3 Minuten`.
Die Restzeit ist tabelliert, nicht gemessen:

| Verbleibende Fragen | Angabe |
|---|---|
| 9 bis 8 | noch etwa 4 Minuten |
| 7 bis 5 | noch etwa 3 Minuten |
| 4 bis 3 | noch etwa 2 Minuten |
| 2 bis 1 | noch etwa 1 Minute |
| 0 | letzter Schritt |

Beantwortete Segmente sind anklickbar und führen zur jeweiligen Frage zurück.
Sie tragen `aria-label="Zu Frage 2: Priorisierung. Beantwortet."`.

### 7.3 Navigation

| Element | Verhalten |
|---|---|
| Weiter | Primary. Bei fehlender Pflichtantwort `aria-disabled="true"`; Klick fokussiert die Antwortgruppe und meldet den Grund über `aria-live` |
| Zurück | Secondary. Immer aktiv ausser auf Frage 1, dort führt es zur Wahlkreis-Auswahl |
| Überspringen | nur bei optionalen Fragen (8, 10), als Link-Button rechts neben Weiter |
| Enter | löst Weiter aus, sofern der Fokus nicht in einem mehrzeiligen Feld steht |
| Autoadvance | **nicht** implementiert |

**Entscheidung gegen Autoadvance:** Automatisches Weiterspringen nach der Auswahl
spart Zeit, nimmt aber die Korrekturmöglichkeit im Moment der Unsicherheit und
erzeugt Quiz-Anmutung. Beides ist hier ausgeschlossen.

Beim Fragenwechsel wandert der Fokus auf die `<h1>` des neuen Screens
(`tabindex="-1"`), und `aria-live="polite"` meldet `Frage 5 von 10`.
Die Seite scrollt an den Anfang, ohne Scroll-Animation.

### 7.4 Fragenkatalog

Verbindliche IDs für die spätere Engine. Antworttexte stehen in `COPY.md`.

| # | ID | Typ | Pflicht | Antwortdaten |
|---|---|---|---|---|
| 1 | `q_prioritaeten` | Themenkarten, Mehrfachauswahl 1 bis 5 | ja | `string[]` Themen-IDs |
| 2 | `q_top3` | Priorisierung | ja, wenn > 1 aus Q1 | `string[]` genau 3 oder weniger, geordnet |
| 3 | `q_zustandsziel` | Single Select | ja | `string` Ziel-ID |
| 4 | `q_engpass` | Mehrfachauswahl, bis 2 | ja | `string[]` |
| 5 | `q_horizont` | Zeitachse, Single Select | ja | `"wahlperiode" \| "mittelfristig" \| "generation"` |
| 6 | `q_ebene` | Mehrfachauswahl | ja | `("eu"\|"bund"\|"land"\|"kommune")[]` |
| 7 | `q_rahmen` | Likert 5, fünf Zeilen | ja | `Record<string, 1..5>` |
| 8 | `q_rote_linie` | Mehrfachauswahl | nein | `string[]` |
| 9 | `q_wahlkreis_kontext` | Single Select, adaptiv | nein | `string` Indikator-ID |
| 10 | `q_freitext` | Freitext, max 600 Zeichen | nein | `string` |

Frage 7 ist die Gelenkstelle zur Sensitivitätsanalyse: Die dort vergebenen
Gewichte sind genau die Grössen, die im Report probeweise verschoben werden.

### 7.5 Priorisierung Top 3

Kein reines Drag and Drop. Primärbedienung über Buttons.

```
Ihre Auswahl aus dem vorherigen Schritt. Bringen Sie bis zu drei in eine Reihenfolge.

1.  Bezahlbarer Wohnraum            [↑] [↓] [Entfernen]
2.  Verkehr und Erreichbarkeit      [↑] [↓] [Entfernen]
3.  Gesundheitsversorgung           [↑] [↓] [Entfernen]
─────────────────────────────────────────────────────
Nicht priorisiert
    Energie und Netze               [Aufnehmen]
    Fachkräfte                      [Aufnehmen]
```

- Jede Positionsänderung meldet `aria-live="assertive"`:
  „Verkehr und Erreichbarkeit ist jetzt Position 1 von 3."
- Tastatur: Fokus auf der Zeile, `Alt+Pfeil auf/ab` verschiebt zusätzlich zu den Buttons.
- Drag ist optional aktiv, mit `touch-action: none` nur auf dem Griff, nie auf der
  ganzen Karte, damit Scrollen auf dem Smartphone nicht blockiert wird.
- Ordnung ist Rangfolge, nicht Wertung. Der Hilfetext sagt das ausdrücklich:
  „Die Reihenfolge steuert, welchen Wirkungszusammenhang wir zuerst prüfen."

### 7.6 Likert

Fünf Stufen, beschriftet, nicht nur nummeriert:
`sehr wichtig · wichtig · teils · weniger wichtig · nicht wichtig`

- Als `role="radiogroup"` je Zeile mit `aria-labelledby` auf dem Zeilentitel.
- Auf Mobile: Zeilentitel oben, Stufen als volle Breite untereinander mit Text.
  Keine gequetschte 5-Spalten-Matrix unter 48rem.
- Ab 48rem: Matrix mit Kopfzeile, Kopfzeile bleibt beim Scrollen sichtbar.
- Keine Mittelstellung als Vorauswahl. Nichts ist vorbelegt.

### 7.7 Zeitachse (Frage 5)

Horizontale Achse mit drei Haltepunkten, kein Slider.

```
Innerhalb dieser        5 bis 10 Jahre        Generationen-
Wahlperiode                                   aufgabe
   ●───────────────────────○──────────────────────○
```

Als `role="radiogroup"`, Haltepunkte sind Antwortflächen mit Label und
Erläuterungszeile. Auf Mobile wird die Achse vertikal.

**Entscheidung gegen einen Slider:** Ein Schieberegler suggeriert Zwischenwerte,
die die Regelbasis nicht kennt, und ist tastaturseitig fehleranfällig.

### 7.8 Freitext

- Optional, maximal 600 Zeichen, Zähler ab 500 Zeichen sichtbar.
- Hinweis über dem Feld: „Bitte keine personenbezogenen Angaben Dritter."
- Zeichenbegrenzung wird nicht hart abgeschnitten; bei Überschreitung erscheint
  eine Meldung, der Text bleibt erhalten.
- Der Freitext fliesst in Version 1.0 **nicht** in die Empfehlungslogik ein.
  Das steht auch im UI, weil eine unbenutzte Eingabe sonst Erwartungen weckt:
  „Ihr Hinweis wird nicht automatisch ausgewertet. Er erscheint in Ihrem Report
  und, falls Sie zustimmen, in der redaktionellen Auswertung."

### 7.9 „Warum fragen wir das?"

- Erscheint erst, nachdem eine Antwort gegeben wurde. Vorher keine Ablenkung.
- `<details>`/`<summary>`, geschlossen, `--wc-ink-muted`, kein Icon-Kreis, keine Fläche.
- Zwei bis vier Sätze. Kein Link ins Glossar auf dieser Ebene.
- Einmal geöffnet, bleibt der Zustand für die Sitzung erhalten (wer einmal Interesse
  zeigt, bekommt es auf den folgenden Screens offen).
- Nie automatisch geöffnet, nie als Tooltip, nie als Overlay.

---

## 8. Review Answers

Alle Angaben in Karten, je Frage eine Zeile mit „Ändern". „Ändern" springt zur
Frage und kehrt danach zum Review zurück (`?zurueck=pruefen`).

Zusätzlich am Ende:

- Hinweis, was jetzt passiert: „Ihre Angaben werden lokal mit dem Regelwerk
  abgeglichen. Es findet keine Übertragung statt."
- Primary: **Wirkungsreport erstellen**
- Sekundär: **Alle lokalen Daten löschen** (danger), mit Rückfrage.

Optionale, nicht beantwortete Fragen erscheinen als
`Nicht beantwortet · optional`, nicht als Lücke oder Mangel.

---

## 9. Report

### 9.1 Reihenfolge

| # | Abschnitt | Zweck |
|---|---|---|
| 1 | Kopf: Wahlkreis, Datenstand, Methoden-Version, Hinweis „keine Personenbewertung" | Einordnung vor Inhalt |
| 2 | Ihre genannten Prioritäten | Wiedererkennung |
| 3 | Ihre gewünschten Veränderungen | Zustandsziele, nicht Gesinnung |
| 4 | Relevanter Wahlkreiskontext | wenige, belegte Daten |
| 5 | Wirkungshebel | Engpassanalyse |
| 6 | Handlungsoptionen A, B, C | Kern |
| 7 | Mensch · Planet · Demokratie | qualitative Wirkungsräume |
| 8 | Was würde sich ändern, wenn | Sensitivität |
| 9 | Für Ihre politische Arbeit | Politik-Kit |
| 10 | Beitrag zur Gesamtauswertung | Forschungs-Opt-in |
| 11 | Report sichern | PDF, Veröffentlichung |

Begründung der Reihenfolge: Erst spiegeln, was die Person gesagt hat (2 und 3),
dann was der Ort hergibt (4), dann wo es klemmt (5), dann was man tun kann (6).
Die Handlungsoptionen kommen erst, wenn die Grundlage sichtbar ist. Ein Vorschlag
ohne vorher sichtbare Herleitung wäre genau die Blackbox, die ausgeschlossen ist.

### 9.2 Report-Kopf

```
IHR WAHLKREIS-WIRKUNGSREPORT
Wahlkreis 275 · Mannheim

Datenstand 30.06.2026 · Methodik-Version 1.0 · Erstellt am 13.08.2026

Dieser Report bewertet keine Personen und keine Parteien.
Er ordnet Wirkungszusammenhänge auf Basis Ihrer Angaben ein.
```

Der Hinweis steht als eigener Absatz mit linker Gold-Kante, nicht als
kleingedruckte Fussnote.

### 9.3 Wirkungshebel

Darstellung der Engpasslogik. Fachlich stützt sich das auf die Reverse Merit Order
der Wirkungsökonomie: Das schwächste zentrale Feld begrenzt das Ergebnis.

```
WIRKUNGSHEBEL

Nach Ihren Angaben liegt der begrenzende Faktor nicht bei den Mitteln,
sondern bei der Genehmigungsdauer.

  Mittel            ▮▮▮ ausreichend adressiert
  Personal          ▮▮▯ teilweise adressiert
  Verfahren         ▮▯▯ begrenzend            ← hier setzt Pfad A an
  Fläche            ▮▮▯ teilweise adressiert

Solange das Verfahren begrenzt, erhöhen zusätzliche Mittel die Wirkung
nur unterproportional.
```

Die Balken sind Tinten-Segmente, keine Farbskala, und tragen immer das Wort.
Der begrenzende Faktor ist zusätzlich durch einen Pfeil und Fettung markiert.

### 9.4 Handlungsoptionen

Genau drei. Immer drei, nie mehr, nie „Top 3". Benannt als Handlungspfad A, B, C.
Reihenfolge ist Bearbeitungsvorschlag, nicht Rangliste; das steht als Satz darüber:

> Die Buchstaben sind eine Lesereihenfolge, keine Rangfolge. Alle drei Pfade sind
> nach denselben Regeln hergeleitet.

Kartenaufbau siehe `COMPONENTS.md`, Abschnitt Empfehlungskarte.

### 9.5 Mensch · Planet · Demokratie

Drei Karten nebeneinander ab 48rem, gestapelt darunter. Je Karte:
Raumname, 2 bis 4 qualitative Hinweise als Liste, jeweils mit Belegbarkeitszeichen.

Keine Zahl, kein Balken, kein Vergleich zwischen den Räumen. Über dem Block steht
der Zweck ausdrücklich:

> Diese Übersicht ordnet mögliche Wirkungsrichtungen. Sie ist keine Bewertung
> Ihrer Person und keine Gesamtnote.

Wenn für einen Raum keine belastbare Aussage möglich ist, steht das dort:
„Für diesen Wirkungsraum liegen zu Ihrem Schwerpunkt keine belastbaren Angaben vor."
Eine leere Karte ist ehrlicher als eine gefüllte.

### 9.6 Responsive Report

| Breakpoint | Layout |
|---|---|
| < 48rem | eine Spalte, Handlungspfade untereinander, Wirkpfad linear vertikal, Drawer als Vollbild-Sheet von unten |
| 48 bis 64rem | zwei Spalten für MPD und Kit, Pfade weiter untereinander |
| 64 bis 90rem | Inhaltsspalte plus rechte Sprungnavigation (sticky), Pfade untereinander |
| > 90rem | wie oben, Container bleibt bei 1120px, kein Dashboard-Raster |

**Entscheidung:** Auch auf grossen Bildschirmen keine mehrspaltige
Dashboard-Anordnung der Handlungspfade. Drei Karten nebeneinander verleiten zum
Vergleichen und Auswählen wie im Tarifrechner. Untereinander bleibt jeder Pfad ein
eigener Gedanke, und die Herleitung bleibt lesbar.

---

## 10. Wirkpfad

### 10.1 Darstellung

Vier Stationen:

```
politischer Hebel → unmittelbare Veränderung → Folgewirkung → Systemwirkung
```

Jede Station: Titel, ein Satz, Belegbarkeitszeichen.
Seitlich (ab 64rem) beziehungsweise darunter (mobil) ein abgesetzter Block
**Risiken und Gegenwirkungen** mit 1 bis 3 Punkten.

### 10.2 Zwei gleichwertige Darstellungen

Umschalter oben rechts, Zustand wird gespeichert:

| Ansicht | Wann Standard |
|---|---|
| **Verlauf** (Diagramm, horizontal) | ab 64rem |
| **Liste** (nummerierte Schritte untereinander) | unter 64rem, bei `prefers-reduced-motion`, im Druck |

Die Listenansicht ist keine Notlösung, sondern die Referenzdarstellung: Sie enthält
denselben Text. Das Diagramm fügt nur die räumliche Anordnung hinzu.

Das Diagramm liegt in `.wc-scroll-x` mit Tastaturfokus und `aria-label`. Es hat
`role="img"` mit einer vollständigen Textbeschreibung in `aria-describedby`, die
identisch mit der Listenansicht ist.

### 10.3 Was das Diagramm nicht tut

Keine Animation des Flusses, keine Partikel, keine Dickenkodierung der Pfeile nach
Stärke, keine Farbkodierung nach Bewertung. Pfeile sind Pfeile.

---

## 11. Sensitivität

### 11.1 Interaktion

Chips zum Ein- und Ausschalten, jeweils `aria-pressed`. Maximal drei gleichzeitig
aktiv, damit die Aussage überprüfbar bleibt.

```
Was würde sich ändern, wenn

[ Haushaltsverträglichkeit stärker gewichten ]
[ Wirkungshorizont verlängern ]
[ Kommunale Eigenverantwortung höher priorisieren ]
[ Verfahrensbeschleunigung als gesetzt annehmen ]

Ergebnis
Dann würde Handlungspfad B an die erste Position rücken, weil die
Verfahrensdauer dann nicht mehr der begrenzende Faktor wäre.

Ihre ursprünglichen Angaben bleiben unverändert.   [ Zurücksetzen ]
```

### 11.2 Regeln

- Kein Slider. Chips sind diskret und entsprechen den Stufen der Regelbasis.
- Die Sensitivität ändert **nie** die gespeicherten Antworten. Sie ist eine
  Was-wäre-wenn-Ansicht mit eigenem Zustand und sichtbarem Zurücksetzen.
- Der Ergebnissatz erscheint in `aria-live="polite"` und benennt immer den Grund,
  nicht nur die neue Reihenfolge.
- Ändert sich nichts, wird das gesagt: „An der Reihenfolge würde sich nichts ändern.
  Der begrenzende Faktor bleibt die Verfahrensdauer." Kein stiller Nichtzustand.
- Die Chips sind aus Frage 7 abgeleitet, damit erkennbar bleibt, dass hier die
  eigenen Gewichte verschoben werden, nicht fremde Annahmen.

---

## 12. Datenschutz und Einwilligungen

### 12.1 Reihenfolge

Der Report erscheint vollständig, bevor irgendeine Einwilligung erfragt wird.
Der persönliche Nutzen ist erbracht, bevor um etwas gebeten wird.

### 12.2 Forschungs-Opt-in

Position: nach dem Politik-Kit, als eigener Block, nicht als Overlay.
Zwei gleichwertige Antwortflächen, keine vorausgewählt:

```
Möchten Sie mit Ihren Antworten zusätzlich zur Gesamtauswertung beitragen?

[  Nur meinen Report nutzen                                    ]
   Ihre Angaben bleiben in Ihrem Browser. Nichts wird übertragen.

[  Zusätzlich zur Gesamtauswertung beitragen                   ]
   Ihre Angaben werden ohne Namen und ohne Kontaktdaten gespeichert
   und fliessen in aggregierte Auswertungen ein.

▸ Was genau wird übertragen?
```

Der aufklappbare Block listet feldweise auf, was übertragen wird und was nicht.
Kein Fliesstext, eine Tabelle. Details in `COPY.md`.

Beide Flächen sind gleich gross, gleich gestaltet, gleich betont. Die
datensparsame Option steht zuerst.

### 12.3 Veröffentlichungs-Opt-in

Getrennt, später, eigener Screen. Nie im selben Schritt wie 12.2.
Enthält eine Vorschau dessen, was öffentlich sichtbar wäre, mit ausdrücklichem
Hinweis auf Rückschlussmöglichkeiten bei kleinen Wahlkreisen.
Widerruf und Kontaktweg stehen im selben Block.

### 12.4 „Vertrauen & Datenschutz"

Von jedem Screen erreichbar: im Kopf ab 48rem, im Fuss immer, im Survey zusätzlich
im Fortschrittsbereich. Öffnet einen Drawer mit neun Abschnitten
(Zweck, Betreiber, Daten, Veröffentlichung, KI, Parteiunabhängigkeit, Quellen,
Methodik, Kontakt), jeder als aufklappbarer Abschnitt mit einem Satz Zusammenfassung.

Der Drawer ist die kurze Fassung mit Link auf die vollständige Seite. Keine
Datenschutzwand als erste Nutzererfahrung, aber auch keine Verharmlosung: Der
Abschnitt „Daten" ist standardmässig aufgeklappt.

---

## 13. Fehler, Leere, Grenzen

| Fall | Verhalten |
|---|---|
| Pflichtfrage offen | Weiter bleibt `aria-disabled`, Fokus springt zur Gruppe, `aria-live` nennt den Grund. Keine roten Rahmen um alles |
| Freitext zu lang | Meldung unter dem Feld, Text bleibt, Weiter bleibt möglich (Feld ist optional) |
| Wahlkreisdaten unvollständig | Report erscheint, betroffene Indikatoren zeigen „Datenlücke" mit Erklärung. Nie stilles Weglassen |
| Keine Regel greift | Report zeigt statt Pfaden: „Zu dieser Kombination liegt derzeit kein hinterlegter Wirkungspfad vor", plus Prioritäten, Kontext und Kit. Nie eine erfundene Empfehlung |
| Offline | Banner mit Wiederholen. Antworten bleiben lokal erhalten. Der Report ist nach Erstellung offline lesbar |
| Sitzung abgelaufen / Schema alt | Eigener Screen mit zwei Wegen: neu beginnen, oder gespeicherten Report öffnen, falls vorhanden |
| Technischer Fehler | Eigener Screen mit Fehlerkennung zum Zitieren, ohne Stacktrace, mit Kontaktweg |

Fehlermeldungen benennen immer: was passiert ist, was das bedeutet, was jetzt zu
tun ist. Nie nur „Ein Fehler ist aufgetreten."

---

## 14. Responsive Regeln, verbindlich

### 14.1 Breakpoints

```css
/* Basis: Smartphone, keine Media Query      320 bis 599px */
@media (min-width: 37.5rem) { /* grosses Smartphone, kleines Tablet */ }
@media (min-width: 48rem)   { /* Tablet                    768px+ */ }
@media (min-width: 64rem)   { /* Desktop                  1024px+ */ }
@media (min-width: 90rem)   { /* grosser Desktop          1440px+ */ }
```

Mobile first. Jede Regel ist eine `min-width`-Regel. Keine `max-width`-Ketten.

### 14.2 Prüfbreiten für die Abnahme

320, 360, 390, 414, 600, 768, 1024, 1280, 1440, 1920 CSS-Pixel.
Zusätzlich 320px bei 400 Prozent Zoom (WCAG 1.4.10).

### 14.3 Verbindliche Regeln

1. Der Seitenkörper scrollt nie horizontal. Alles Breite steckt in `.wc-scroll-x`.
2. Mehrspaltigkeit nur über `auto-fit`/`minmax`, nie über feste Spaltenzahlen.
3. Sticky-Elemente belegen zusammen höchstens 25 Prozent der Viewporthöhe.
   Unter 400px Höhe (Landscape-Smartphone) wird der Fortschritt statisch.
4. Antwortflächen sind auf Mobile immer volle Breite, nie zweispaltig.
5. Der Survey-Footer ist unter 48rem sticky, darüber im Fluss.
6. Touch-Ziele mindestens 44×44px, Abstand mindestens 8px.
7. `env(safe-area-inset-bottom)` im Sticky-Footer berücksichtigen.
8. Tabellen unter 48rem werden zu Definitionslisten, nicht zu horizontalem Scroll,
   ausser bei echten Datentabellen mit Vergleichsfunktion.

---

## 15. Barrierefreiheit, verbindlich

### 15.1 Struktur

- Genau eine `<h1>` pro Screen. Beim Survey ist das der Fragetext.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`, Drawer als
  `role="dialog" aria-modal="true"`.
- Skip-Link „Zum Inhalt springen" als erstes fokussierbares Element.
- Überschriftenebenen ohne Sprünge. Report: h1 Reporttitel, h2 Abschnitte,
  h3 Karten.

### 15.2 Fokusverwaltung

| Ereignis | Fokus geht nach |
|---|---|
| Fragenwechsel | `<h1>` der neuen Frage |
| Drawer öffnen | Drawer-Überschrift, Fokusfalle aktiv |
| Drawer schliessen | auslösender Button |
| Popover öffnen | erstes Element im Popover |
| Fehler beim Weiter | Antwortgruppe |
| Report geladen | Reporttitel |
| Sensitivitäts-Chip | bleibt auf dem Chip, Ergebnis über `aria-live` |

### 15.3 Screenreader-Ansagen

- Trefferzahl der Wahlkreissuche: `polite`
- Fortschritt beim Fragenwechsel: `polite`
- Positionsänderung in der Priorisierung: `assertive`
- Sensitivitätsergebnis: `polite`
- Ladeschritte des Reports: `polite`, jeder Schritt einmal
- Formularfehler: `assertive`

### 15.4 Was ausdrücklich verboten ist

- `outline: none` ohne gleichwertigen Ersatz
- Bedeutung allein durch Farbe
- `title` als einzige Erklärung
- `placeholder` als einziges Label
- Drag ohne Tastaturalternative
- automatische Weiterleitung ohne Nutzeraktion
- Zeitlimits jeder Art
- `aria-label`, das den sichtbaren Text nicht enthält (WCAG 2.5.3)

---

## 16. Sprache

Verbindlich für alle Texte, Details und Beispiele in `COPY.md`.

**Verwenden:** erscheint · spricht dafür · möglicher Wirkpfad · prüfenswert ·
unter diesen Annahmen · auf Basis Ihrer Angaben · die Datenlage lässt offen

**Vermeiden:** richtig/falsch · gute/schlechte Politik · Sie sollten (ohne Kontext) ·
wissenschaftlich bewiesen (wenn nur Evidenz vorliegt) · optimal · beste Lösung ·
dringend · alternativlos · Handlungsdruck

**Formal:** Siezen durchgehend. Keine Gedankenstriche `-` oder `-` (Brand Guide §4).
Keine Ausrufezeichen. Keine Emojis. Zahlen mit deutschem Tausendertrennzeichen.
Datumsangaben `TT.MM.JJJJ`.

---

## 17. Abnahmeprotokoll

Vor Freigabe des UX-Handoffs zu prüfen. Ergebnis steht in Abschnitt 18.

| # | Prüfung | Kriterium |
|---|---|---|
| 1 | Desktop 1280 und 1440 | kein horizontaler Scroll, Container 1120px, Lesbarkeit |
| 2 | Mobile 320, 360, 390 | kein Überlauf, Sticky-Höhe, Touch-Ziele |
| 3 | Zoom 400 Prozent bei 320px | kein Inhaltsverlust |
| 4 | Tastaturfluss | Landing bis Report ohne Maus, jeder Fokus sichtbar |
| 5 | Fokusfalle im Drawer | Tab bleibt drin, Escape schliesst, Fokus kehrt zurück |
| 6 | Screenreader-Struktur | genau eine h1, Landmarks, keine Ebenensprünge |
| 7 | Erklärbarkeit | jede Empfehlung führt auf Angaben, Daten und Regel-ID |
| 8 | Kein Ranking von Abgeordneten | keine Ordnungszahl, kein Score, kein Vergleich |
| 9 | Parteiassoziation der Farben | Abgleich gegen die Verbotsliste in `DESIGN_SYSTEM.md` 2.6 |
| 10 | Politische Wertung im Text | Abgleich gegen Abschnitt 16 |
| 11 | Quellen-UI an jedem Datenwert | keine Zahl ohne „Quelle" |
| 12 | Datenschutzoptionen verständlich | zwei gleichwertige Flächen, nichts vorausgewählt |
| 13 | Kontrast | Tabelle `DESIGN_SYSTEM.md` 2.7 |
| 14 | Reduced Motion | keine Bewegung ausser Fokusanzeige |
| 15 | Druck | Herleitung ausgeklappt, Quellen als Fussnoten |

---

## 18. Abnahmeergebnis Prototyp

Geprüft am 2026-08-13 am Prototypen unter
`werkzeuge/wahlkreis-wirkungscheck/index.html`, ausgeliefert über einen lokalen
HTTP-Server (nicht `file://`, sonst greift die CSP nicht). Messungen im Browser,
nicht geschätzt. Details und Rohwerte in `SCREENS.md`, Abschnitt „Prüfstand".

| # | Prüfung | Ergebnis |
|---|---|---|
| 1 | Desktop 1280/1440 | bestanden. `scrollWidth == clientWidth`, Sprungnavigation ab 64rem sichtbar |
| 2 | Mobile 320/360/390 | bestanden nach Korrektur. Der Vertrauens-Auslöser im Kopf lief bei 320px 13px über; er ist jetzt erst ab 48rem im Kopf und im Survey im Fortschrittsbereich |
| 3 | Reflow bei 320px | bestanden, kein horizontaler Scroll auf allen sieben Screens und im Drawer |
| 4 | Tastaturfluss | bestanden. Skip-Link, Combobox nach WAI-ARIA, Ranker über Buttons und `Alt+Pfeil`, keine `tabindex > 0`, Tab-Reihenfolge entspricht der DOM-Reihenfolge |
| 5 | Fokusfalle im Drawer | bestanden. Escape schliesst, `inert` wird gesetzt und entfernt, Body-Scroll entsperrt, Fokus kehrt auf den auslösenden Button zurück |
| 6 | Screenreader-Struktur | bestanden. Genau eine `h1` je Screen, keine Ebenensprünge, Landmarks vorhanden |
| 7 | Erklärbarkeit | bestanden. Alle sechs Abschnitte, Regel-ID sichtbar, Datenlücke mit Grund und Auswirkung, Ausschlussgrund für die Alternative |
| 8 | Kein Ranking von Abgeordneten | bestanden. Keine Ordnungszahl, kein Score, keine Hervorhebung einer Empfehlungskarte |
| 9 | Parteiassoziation der Farben | bestanden mit dokumentierter Anmerkung. 15 Farben im Einsatz, alle aus dem Token-Satz. Einziger Prüfpunkt ist das Marken-Grün, siehe `DESIGN_SYSTEM.md` 2.6b |
| 10 | Politische Wertung im Text | bestanden. Treffer der Verbotsliste ausschliesslich in Verneinungen („Keine Wahlempfehlung"), keine Gedankenstriche, keine Ausrufezeichen |
| 11 | Quellen-UI an jedem Datenwert | bestanden. Jeder Indikator im Report und im Drawer trägt einen Quellenauslöser, Datenlücken sind als solche ausgewiesen |
| 12 | Datenschutzoptionen | bestanden. Zwei gleich gestaltete Flächen, keine Vorauswahl, datensparsame Option zuerst |
| 13 | Kontrast | bestanden. 323 textführende Elemente über sechs Screens gemessen, keine Unterschreitung. Ränder von Bedienelementen durchgehend über 3:1 |
| 14 | Reduced Motion | bestanden, Regel vorhanden und geparst; Wirkpfad fällt auf die Listenansicht zurück |
| 15 | Druck | Regeln vorhanden und geparst. **Nicht am Papier geprüft**, siehe offener Punkt 9 |

### 18.1 Im Test gefundene und behobene Fehler

Fünf Befunde, die ohne den Durchlauf im Browser nicht aufgefallen wären:

1. **Fortschritt wuchs während der Befragung.** Die Priorisierungsfrage erschien
   erst ab zwei gewählten Themen, wodurch die Anzeige von „von 9" auf „von 10"
   sprang. Die Frage ist jetzt fester Bestandteil des Ablaufs.
2. **Fortschrittssegmente waren nicht bedienbar.** Das Flexitem war das `li`, die
   `flex`-Angabe stand aber auf dem Button, der dadurch auf 0px Breite schrumpfte.
3. **Vertrauens-Auslöser im Kopf war unsichtbar.** `.wc-btn--secondary` trug Navy
   auf dem Navy-Kopf. Kontrast 1:1.
4. **Hebelgrad war als Belegbarkeit beschriftet.** Die Wirkungshebel nutzten das
   Evidenz-Zeichen und lasen sich als „Belegbarkeit: mittel", gemeint war
   „teilweise adressiert". Abdeckung und Belegbarkeit sind jetzt getrennt.
5. **Touch-Ziele unter 44px.** Sprungnavigation und Fusszeilenlinks lagen bei 41
   beziehungsweise 19 Pixel Höhe.

Zusätzlich korrigiert: der Primary-Button auf dem Navy-Hero war als Goldfläche
ausgeführt und verstiess damit gegen die eigene Regel „kein Gold-Button".

---

## 19. Offene Punkte für Codex und Redaktion

| # | Punkt | Zuständig |
|---|---|---|
| 1 | Regelwerk deterministisch definieren (IDs, Bedingungen, Evidenzstufen) | Codex, Redaktion |
| 2 | Wahlkreisdatensatz 2025er Zuschnitt inklusive PLZ-Zuordnung und Datenstand | Codex |
| 3 | Indikatorenkatalog mit Quelle, Jahr, Ebene, Datenqualität je Kennzahl | Redaktion |
| 4 | Rechtliche Prüfung der Opt-in-Texte und des Veröffentlichungsverfahrens | Natalie, extern |
| 5 | Betreiberangaben, Kontaktadresse, Verantwortliche Stelle | Natalie |
| 6 | Entscheidung, ob und wie ein KI-Anteil vorkommt (Abschnitt „KI" im Drawer) | Natalie, Codex |
| 7 | Freigabe der Themenliste in Frage 1 auf politische Ausgewogenheit | Redaktion |
| 8 | Zweitprüfung der Neutralität analog zum Wirkungswahl-Kompass | extern |
| 9 | Druckabnahme auf Papier und als PDF (Umbrüche, Fussnoten, Seitenzahlen) | Codex |
| 10 | Prüfung mit echten Hilfsmitteln (NVDA, VoiceOver), nicht nur strukturell | Codex |
| 11 | Farbentscheidung Marken-Grün nach externer Prüfung, siehe `DESIGN_SYSTEM.md` 2.6b | Natalie, extern |

**Klärungsbedarf für die Freigabe:** Punkt 7 ist die politisch heikelste Stelle des
gesamten Produkts. Die Auswahl der Themenkarten in Frage 1 setzt implizit den
Möglichkeitsraum. Die Liste im Prototyp ist ein fachlicher Vorschlag entlang der
Wirkungsfelder und ausdrücklich **nicht** freigegeben.
