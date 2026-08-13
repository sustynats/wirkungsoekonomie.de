# Wahlkreis-Wirkungscheck — „Warum wird mir das vorgeschlagen?"

Version 1.0 · Stand 2026-08-13 · Lane: Claude (Design/UX) · Umsetzung: Codex

Das UX-Konzept für die Erklärbarkeit des Ergebnisses. Kernfeature, kein
technisches Detail.

---

## 1. Anspruch

Eine Person muss von jeder einzelnen Empfehlung in höchstens zwei Schritten zu
der Frage kommen: **Warum steht das hier und nicht etwas anderes?** Und dort eine
Antwort finden, die sie einer Fachreferentin, einem Ausschuss oder einer
kritischen Journalistin gegenüber vertreten kann.

Drei Zusagen, die das Interface einlösen muss:

1. **Nichts entsteht aus dem Nichts.** Jede Empfehlung führt auf eine benannte
   Regel, benannte Eingaben und benannte Daten zurück.
2. **Nichts ist stärker formuliert als die Datenlage.** Belegbarkeit steht an
   der Aussage, nicht im Kleingedruckten.
3. **Auch das Nicht-Vorgeschlagene ist erklärbar.** Warum Alternative B nicht
   an erster Stelle steht, ist Teil der Erklärung, nicht Zusatz.

---

## 2. Die drei Ebenen

| Ebene | Ort | Umfang | Auslöser |
|---|---|---|---|
| 1 · Bezugszeile | auf der Empfehlungskarte, immer sichtbar | ein Satz | keiner |
| 2 · Herleitungs-Drawer | Overlay | sechs Abschnitte | Button „Warum wird mir das vorgeschlagen?" |
| 3 · Pfad-Detailseite | eigene Route | vollständig, zitierbar, druckbar | „Wirkungspfad ansehen" oder Link im Drawer |

### Ebene 1 — die Bezugszeile

Auf jeder Empfehlungskarte, direkt unter der Kurzbeschreibung:

> Passt zu Ihrer Angabe: Engpass Verfahren, Handlungsebene Bund

Ohne diese Zeile darf keine Karte gerendert werden. Sie ist der kleinste
mögliche Nachweis, dass die Empfehlung aus der Eingabe stammt und nicht aus
einer Voreinstellung.

Formulierung immer nach dem Muster
`Passt zu Ihrer Angabe: <Angabe>[, <Angabe>]`.
Nie „Für Sie ausgewählt", nie „Empfohlen für Sie", nie „Weil Sie sich für X
interessieren". Der Unterschied ist wesentlich: Das Werkzeug hat nichts über die
Person gelernt, es hat eine Regel auf eine Angabe angewendet.

---

## 3. Der Herleitungs-Drawer

### 3.1 Feste Abschnittsfolge

Die Reihenfolge ist verbindlich und wird nie umsortiert, weil sie die
Beweisführung abbildet: Eingabe, Daten, Regel, Schluss, Robustheit, Abgrenzung.

```
┌──────────────────────────────────────────────────────┐
│  Warum wird mir das vorgeschlagen?              [×]  │
│  Handlungspfad A · Regel P-03                        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1  IHRE ANGABEN                                     │
│     Priorität           Energie und Netze            │
│     Zustandsziel        Anschlusszeiten verkürzen    │
│     Engpass             Verfahren                    │
│     Handlungsebene      Bund, Land                   │
│     Wirkungshorizont    5 bis 10 Jahre               │
│     Rahmenbedingung     Haushaltsverträglichkeit      │
│                         wichtig                      │
│     Rote Linie          keine angegeben              │
│                                                      │
│  2  WAHLKREISDATEN                          275 Mannheim │
│     Netzanschlussdauer  im Mittel 14 Monate  Quelle  │
│     Antragsstau         +23 % ggü. 2023      Quelle  │
│     Erneuerbaren-Anteil 38 %                 Quelle  │
│     Personalquote       Datenlücke                   │
│                                                      │
│  3  METHODIK                                         │
│     Regel P-03                                       │
│     Wenn der genannte Engpass „Verfahren" ist        │
│     und die Anschlussdauer über dem Bundesmittel     │
│     liegt und die Handlungsebene Bund umfasst,       │
│     dann ist der Verfahrensweg der vorrangige        │
│     Wirkungshebel.                                   │
│     ▮▮▯ Belegbarkeit: mittel                         │
│     Grundlage: 2 Studien, 1 amtliche Zeitreihe       │
│                                                      │
│  4  DARAUS FOLGT                                     │
│     Ihre Angaben und die Wahlkreisdaten zeigen in    │
│     dieselbe Richtung: Nicht die Mittel begrenzen,   │
│     sondern die Dauer. Solange das so ist, erhöhen   │
│     zusätzliche Mittel die Wirkung nur              │
│     unterproportional.                               │
│                                                      │
│  5  WAS WÜRDE DAS VERÄNDERN                          │
│     Läge die Anschlussdauer im Bundesmittel,         │
│     würde Pfad C an die erste Stelle rücken.         │
│     Gewichteten Sie Haushaltsverträglichkeit als     │
│     sehr wichtig, bliebe die Reihenfolge gleich.     │
│                                                      │
│  6  WARUM NICHT ALTERNATIVE B                        │
│     Pfad B (Förderprogramm ausweiten) setzt an den   │
│     Mitteln an. Nach Ihren Angaben sind die Mittel   │
│     nicht der begrenzende Faktor. Pfad B bleibt      │
│     verfügbar und würde vorrangig, wenn sich der     │
│     Engpass verschiebt.                              │
│                                                      │
├──────────────────────────────────────────────────────┤
│  Vollständige Herleitung öffnen · Quellen ansehen    │
└──────────────────────────────────────────────────────┘
```

### 3.2 Abschnitt für Abschnitt

**1 Ihre Angaben.** Definitionsliste, Feldname links, Wert rechts. Jede Zeile ist
anklickbar und führt zur jeweiligen Frage zurück (mit Rückweg in den Report).
Nicht beantwortete Felder erscheinen als „keine angegeben", nicht als Lücke.

Warum zuerst: Wer die eigene Eingabe oben sieht, liest den Rest als Ableitung und
nicht als Behauptung.

**2 Wahlkreisdaten.** Nur die Indikatoren, die diese Regel tatsächlich verwendet.
Kein Datenschaufenster. Jede Zahl mit Quellenauslöser. Nicht verfügbare
Indikatoren stehen ausdrücklich als „Datenlücke" mit einem Satz, was das für die
Aussage bedeutet.

Das Weglassen fehlender Daten wäre die gravierendste Unehrlichkeit dieses
Produkts. Sichtbare Lücken sind Teil der Herleitung.

**3 Methodik.** Drei Elemente:

- Regel-ID in Monospace, zitierbar, stabil über Methoden-Versionen hinweg.
- Die Regel im Klartext als Wenn-Dann-Satz. Keine Formel, kein Pseudocode, aber
  strukturgleich zur implementierten Bedingung.
- Belegbarkeitsstufe plus Grundlage in einem Halbsatz („2 Studien, 1 amtliche
  Zeitreihe").

Der Klartextsatz ist keine Nacherzählung, sondern muss die implementierte
Bedingung eins zu eins abbilden. Wenn die Regel eine Schwelle nutzt, steht die
Schwelle da. Wenn sie eine Annahme setzt, steht die Annahme da.

**4 Daraus folgt.** Zwei bis vier Sätze in normaler Sprache. Der einzige
Abschnitt, der interpretiert, und deshalb der am strengsten formulierte:
konjunktivisch, ohne Handlungsappell, ohne Wertung.

**5 Was würde das verändern.** Zwei bis drei Wenn-Sätze, die zeigen, wie robust
der Schluss ist. Mindestens einer muss eine Änderung nennen und mindestens einer
muss zeigen, wo sich nichts ändert. Eine Sensitivitätsangabe, die nur Änderungen
zeigt, wirkt beliebig; eine, die nur Stabilität zeigt, wirkt geschönt.

**6 Warum nicht Alternative B.** Nennt die konkrete Alternative, den
Ausschluss- oder Nachrangigkeitsgrund und die Bedingung, unter der sie vorrangig
würde. Nie abwertend über die Alternative. Der letzte Satz stellt immer klar,
dass die Alternative verfügbar bleibt.

### 3.3 Was der Drawer nicht enthält

- Keine Wahrscheinlichkeitsangaben in Prozent, solange die Regelbasis
  deterministisch ist. Eine erfundene Zahl wäre schlimmer als keine.
- Keine Gewichtungsbalken, die Scheingenauigkeit erzeugen.
- Keine Erwähnung von Parteien, Fraktionen oder Personen.
- Kein KI-Hinweis, solange die Empfehlung regelbasiert entsteht. Falls je ein
  generativer Anteil hinzukommt, muss er hier stehen, an der Aussage, nicht nur
  in der Datenschutzerklärung.

---

## 4. Die Regel im Klartext

Der Übersetzungsvertrag zwischen Engine und Interface. Codex liefert die Regel
strukturiert, das Interface rendert sie nach festem Muster.

```json
{
  "ruleId": "P-03",
  "conditions": [
    { "field": "q_engpass",  "op": "includes", "value": "verfahren",
      "text": "der genannte Engpass „Verfahren" ist" },
    { "field": "ind_anschlussdauer", "op": ">", "value": "bundesmittel",
      "text": "die Anschlussdauer über dem Bundesmittel liegt" },
    { "field": "q_ebene", "op": "includes", "value": "bund",
      "text": "die Handlungsebene Bund umfasst" }
  ],
  "conclusion": {
    "pathId": "P-03",
    "text": "der Verfahrensweg der vorrangige Wirkungshebel ist"
  },
  "evidence": { "level": "mittel", "basis": "2 Studien, 1 amtliche Zeitreihe" },
  "excludes": [
    { "pathId": "P-07", "reason": "setzt an den Mitteln an",
      "wouldApplyIf": "sich der Engpass auf Finanzierung verschiebt" }
  ]
}
```

Renderregel: `Wenn ` + Bedingungen mit ` und ` verbunden + `, dann ` + Schluss.
Jede Bedingung trägt ihren eigenen `text`, damit die Sprache redaktionell
geprüft werden kann und nicht aus Feldnamen generiert wird.

**Verbindlich:** Fehlt an einer Bedingung der `text`, wird die Regel im Drawer
nicht gerendert, sondern es erscheint „Die Herleitung dieser Regel ist noch nicht
freigegeben." Lieber eine sichtbare Lücke als ein generierter Satz.

---

## 5. Verhalten

| Aspekt | Festlegung |
|---|---|
| Öffnen | Button auf der Karte, Primary-Aktion dieser Karte |
| Darstellung | ab 64rem Drawer rechts 560px, darunter Bottom-Sheet bis 92 vh |
| Fokus | auf die Drawer-Überschrift, Fokusfalle aktiv |
| Schliessen | Escape, Schliessen-Button, Klick auf den Hintergrund, Wischen nach unten (mobil) |
| Fokusrückgabe | auf den auslösenden Button |
| Hintergrund | `inert`, Body-Scroll gesperrt, Scrollposition wird wiederhergestellt |
| URL | setzt `?herleitung=P-03`, Direktaufruf öffnet den Drawer beim Laden |
| Verlauf | Schliessen entfernt den Parameter, Browser-Zurück schliesst den Drawer |
| Druck | ausgeklappt im Fluss, nicht als Overlay |
| Reduced Motion | ohne Slide |
| Mehrere Drawer | nie gleichzeitig. Ein Quellen-Popover aus dem Drawer heraus erscheint als eingebetteter Block, nicht als zweite Ebene |

Der letzte Punkt ist wichtig: Gestapelte Overlays zerstören die Fokusverwaltung
und sind auf dem Smartphone nicht mehr bedienbar. Quellen innerhalb des Drawers
klappen an Ort und Stelle auf.

---

## 6. Sprache der Erklärung

| Statt | Besser |
|---|---|
| Das ist die beste Option für Sie | Auf Basis Ihrer Angaben erscheint dieser Weg vorrangig |
| Studien beweisen | Mehrere Studien sprechen dafür |
| Sie sollten X tun | X ist unter diesen Annahmen prüfenswert |
| Dieser Pfad wirkt am stärksten | Für diesen Pfad ist die Wirkung am besten belegt |
| Alternative B ist schlechter | Alternative B setzt an einem Faktor an, der nach Ihren Angaben derzeit nicht begrenzt |
| Wir empfehlen | Aus Regel P-03 folgt |
| optimal, ideal, alternativlos | vorrangig, prüfenswert, unter diesen Annahmen |

Grundregel: Das Werkzeug spricht über **Regeln und Datenlage**, nie über die
Person und nie in der ersten Person Plural als Ratgeber. „Wir empfehlen" macht
aus einem Regelwerk eine Meinung.

---

## 7. Umgang mit Unsicherheit

### 7.1 An der Aussage, nicht im Anhang

Jede Aussage im Drawer trägt ihre eigene Belegbarkeitsstufe. Eine Regel mit
Stufe „mittel" darf keinen Satz enthalten, der wie Stufe „hoch" klingt.

### 7.2 Fünf Stufen

Definition und Darstellung in `DESIGN_SYSTEM.md` 4.6. Im Drawer erscheint die
Stufe zusätzlich mit ihrer Grundlage in Klartext.

### 7.3 Datenlücken

Drei Pflichtangaben bei jeder Lücke:

1. **Was fehlt.** „Für die Personalquote der Genehmigungsbehörden liegen auf
   Wahlkreisebene keine Daten vor."
2. **Warum.** „Die Erhebung erfolgt nur auf Landesebene."
3. **Was das für die Aussage bedeutet.** „Der Verfahrenshebel stützt sich
   deshalb allein auf die Anschlussdauer."

Eine Lücke ohne Auswirkungssatz ist eine halbe Erklärung.

### 7.4 Modellannahmen

Werden immer als solche benannt, mit der Annahme im Klartext und wer sie gesetzt
hat (Methodik-Version). Nie als Datenwert dargestellt, nie mit Quellenauslöser,
weil es keine Quelle gibt.

---

## 8. Sonderfälle

| Fall | Verhalten |
|---|---|
| Keine Regel greift | Kein Drawer, weil keine Karte. Im Report der Hinweis mit den Angaben, die geprüft wurden, damit sichtbar bleibt, dass gerechnet wurde |
| Nur eine Regel greift | Ein Pfad, Abschnitt 6 erklärt, warum keine Alternative hinterlegt ist |
| Zwei Regeln führen zum selben Pfad | Beide Regel-IDs werden genannt, mit dem Hinweis, dass zwei unabhängige Wege zum selben Ergebnis führen. Das stärkt die Aussage und darf nicht verschwiegen werden |
| Regel greift, Daten fehlen vollständig | Pfad erscheint mit `EvidenceMark` „Modellannahme" und ausdrücklichem Hinweis, dass keine Wahlkreisdaten eingeflossen sind |
| Sensitivität aktiv | Drawer zeigt zusätzlich oben: „Sie sehen die Was-wäre-wenn-Ansicht. Ihre ursprünglichen Angaben sind unverändert." |
| Nutzerin ändert eine Antwort | Report wird neu hergeleitet, offener Drawer schliesst, Hinweis: „Ihr Report wurde auf Basis der geänderten Angabe neu erstellt." |

---

## 9. Prüffragen für die Abnahme

Ein Handlungspfad gilt als transparent erklärbar, wenn alle neun Punkte erfüllt sind:

1. Die Bezugszeile auf der Karte nennt mindestens eine konkrete Eingabe.
2. Der Drawer öffnet in einem Schritt von der Karte aus.
3. Alle sechs Abschnitte sind vorhanden, oder ihr Fehlen ist begründet.
4. Die Regel-ID ist sichtbar und zitierfähig.
5. Die Regel steht als Wenn-Dann-Satz im Klartext und bildet die Bedingung ab.
6. Jeder Datenwert trägt einen Quellenauslöser oder ist als Annahme markiert.
7. Jede Datenlücke nennt was fehlt, warum, und was das bedeutet.
8. Abschnitt 5 enthält mindestens eine Änderung und mindestens eine Stabilität.
9. Abschnitt 6 nennt Alternative, Grund und Bedingung für ihren Vorrang.

Prüfmethode: Der Drawer wird ausgedruckt und einer fachfremden Person vorgelegt.
Wenn sie ohne Rückfrage sagen kann, warum dieser Pfad und nicht ein anderer
vorgeschlagen wurde, ist die Erklärung gelungen.
