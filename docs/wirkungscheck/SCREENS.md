# Wahlkreis-Wirkungscheck - Screens und Zustände

Version 1.0 · Stand 2026-08-13 · Lane: Claude (Design/UX) · Umsetzung: Codex

Jeder Screen ist mit Route, Zweck, Zuständen, Fokusziel und Prototyp-Status
gelistet. `S-xx` sind stabile IDs für den Handoff.

Legende Prototyp-Status:
**voll** = im Prototyp interaktiv gebaut ·
**statisch** = im Prototyp als Ansicht vorhanden, ohne volle Logik ·
**spez** = nur spezifiziert, im Prototyp nicht gebaut

---

## Übersicht

| ID | Screen | Route | Prototyp |
|---|---|---|---|
| S-01 | Landing | `/` | voll |
| S-02 | Methodik | `/methodik` | statisch |
| S-03 | Vertrauen & Datenschutz | `/vertrauen` + Drawer | voll (Drawer) |
| S-04 | Wahlkreis-Auswahl | `/start` | voll |
| S-05 | Survey Intro | `/befragung` | voll |
| S-06 | Kernfrage | `/befragung?frage=n` | voll |
| S-07 | Adaptive Frage | `/befragung?frage=9` | voll |
| S-08 | Freitext | `/befragung?frage=10` | voll |
| S-09 | Antworten prüfen | `/befragung/pruefen` | voll |
| S-10 | Ergebnis wird erstellt | `/ergebnis` (Zwischenzustand) | voll |
| S-11 | Report Overview | `/ergebnis` | voll |
| S-12 | Handlungspfad Detail | `/ergebnis/pfad/:id` | statisch |
| S-13 | Herleitungs-Drawer | Overlay, `?herleitung=` | voll |
| S-14 | Wirkpfad | Overlay | voll |
| S-15 | Quellen | Popover / Sheet | voll |
| S-16 | Sensitivität | Abschnitt in S-11 | voll |
| S-17 | Politik-Kit | Abschnitt in S-11 | voll |
| S-18 | Forschungs-Opt-in | Abschnitt in S-11 | voll |
| S-19 | Veröffentlichungs-Opt-in | `/ergebnis/teilen` | statisch |
| S-20 | PDF-Vorschau | `/ergebnis/pdf` | statisch |
| S-21 | Fehler | Overlay / Seite | statisch |
| S-22 | Offline / Wiederholen | Banner + Seite | statisch |
| S-23 | Sitzung abgelaufen | `/start?abgelaufen=1` | statisch |
| S-24 | Fokus- und Tastaturzustände | querschnittlich | voll |

---

## S-01 Landing

**Zweck:** In unter zehn Sekunden klären: wer fragt, warum, wie lange, was kommt heraus.
**Fokus beim Laden:** Skip-Link, danach `h1`.

| Zustand | Darstellung |
|---|---|
| Standard | Hero, sechs Inhaltsblöcke, Abschluss-CTA |
| Laufende Sitzung erkannt | zusätzlicher Block über dem Hero: „Sie haben eine begonnene Befragung. [Fortsetzen] [Neu beginnen]" |
| Fertiger Report vorhanden | Block: „Ihr Report vom 13.08.2026 ist gespeichert. [Report öffnen] [Neue Befragung]" |
| JavaScript deaktiviert | Landing und Methodik bleiben lesbar, Start-Button erklärt, dass die Befragung JavaScript benötigt |

Der Wiederaufnahme-Block steht **über** dem Hero, weil eine begonnene Befragung
die wichtigere Handlung ist als eine neue.

---

## S-02 Methodik

**Zweck:** Erklären, wie aus Angaben und Daten eine Empfehlung wird.
**Aufbau:**

1. In einem Satz
2. Die vier Schritte: Angaben, Wahlkreisdaten, Regelwerk, Herleitung
3. Was das Regelwerk ist und was es nicht ist (deterministisch, regelbasiert,
   keine Wahrscheinlichkeitsaussage, keine KI-Generierung von Empfehlungen)
4. Evidenzstufen mit `EvidenceMark`-Legende
5. Umgang mit Datenlücken
6. Grenzen des Verfahrens, ausdrücklich als eigener Abschnitt
7. Methoden-Version und Änderungsstand
8. Kontakt für methodische Kritik

Abschnitt 6 ist Pflicht. Ein Methodikkapitel ohne Grenzen ist Werbung.

---

## S-03 Vertrauen & Datenschutz

Zwei Erscheinungsformen, gleicher Inhalt: Drawer (kurz, überall erreichbar) und
Seite (vollständig, verlinkbar, druckbar).

Neun Abschnitte, feste Reihenfolge:

| # | Abschnitt | Zusammenfassungszeile immer sichtbar |
|---|---|---|
| 1 | Zweck | Wofür dieses Werkzeug gebaut wurde |
| 2 | Betreiber | Wer verantwortlich ist |
| 3 | Daten | Was gespeichert wird. **Standardmässig geöffnet** |
| 4 | Veröffentlichung | Was öffentlich werden kann und nur mit Zustimmung |
| 5 | KI | Wo KI vorkommt und wo nicht |
| 6 | Parteiunabhängigkeit | Finanzierung, Unabhängigkeit, Prüfung |
| 7 | Quellen | Welche Datenquellen genutzt werden |
| 8 | Methodik | Kurzfassung mit Link auf S-02 |
| 9 | Kontakt | Widerspruch, Auskunft, Korrekturhinweis |

Am Ende des Drawers: „Alle lokalen Daten löschen" mit Rückfrage und Angabe,
was gelöscht wird.

| Zustand | Darstellung |
|---|---|
| Standard | Abschnitt 3 offen, Rest geschlossen |
| Aus dem Survey geöffnet | zusätzlicher Satz: „Ihre bisherigen Antworten bleiben erhalten." |
| Nach Löschung | Bestätigung im Drawer, danach Weiterleitung auf S-01 |

---

## S-04 Wahlkreis-Auswahl

**Fokus beim Laden:** `h1`, nicht das Eingabefeld. Automatischer Fokus in ein
Suchfeld unterdrückt auf Mobile den Seitenanfang und öffnet ungefragt die Tastatur.

| Zustand | Darstellung |
|---|---|
| Leer | Suchfeld, drei Beispiel-Chips, Alternative „bundesweit", Datenschutzsatz |
| < 2 Zeichen | Hinweis „Bitte mindestens zwei Zeichen" |
| Suchend | Trefferliste, Zähler in `aria-live` |
| Kein Treffer | Leerzustand mit zwei Auswegen |
| Mehrdeutige PLZ | alle betroffenen Wahlkreise mit Zusatzzeile |
| Gewählt | Bestätigungskarte mit „Ändern", Weiter wird bedienbar |
| Bundesweit gewählt | Bestätigungskarte „Überwiegend landes- oder bundesweite Arbeit" |
| Daten nicht ladbar | Fehlerzustand mit Wiederholen und der Möglichkeit, ohne Wahlkreis fortzufahren |

---

## S-05 Survey Intro

Ein Screen, überspringbar, mit gemerkter Entscheidung.

Inhalt: was gefragt wird (vier Stichpunkte), was nicht gefragt wird
(Name, Fraktion, Kontaktdaten), Dauer, Korrigierbarkeit, Abbruchmöglichkeit.

Der Block „Was wir nicht fragen" ist der wichtigste des Screens und steht
gleichwertig neben „Was wir fragen", nicht darunter im Kleingedruckten.

| Zustand | Darstellung |
|---|---|
| Erstbesuch | vollständig |
| Wiederkehr | übersprungen, direkt Frage 1 |

---

## S-06 Kernfrage

Gilt für Fragen 1 bis 8. Aufbau siehe `UX_SPEC.md` 7.1.

| Zustand | Darstellung |
|---|---|
| Unbeantwortet | Weiter `aria-disabled`, kein Fehler sichtbar |
| Weiter ohne Antwort ausgelöst | `aria-live` nennt den Grund, Fokus auf die Gruppe, Hinweiszeile unter der Gruppe |
| Beantwortet | Auswahl sichtbar, Weiter bedienbar, „Warum fragen wir das?" erscheint |
| Höchstzahl erreicht | nicht gewählte Kacheln gesperrt mit Grund, Zähler aktualisiert |
| Optional, übersprungen | „Überspringen" sichtbar, Antwort bleibt leer |
| Zurückgekehrt | vorherige Antwort gesetzt, Fokus auf `h1`, gewählte Kachel erhält `aria-current` |

Sonderfall Frage 2 (Priorisierung): bleibt immer im Ablauf. Bei genau einer
Auswahl in Frage 1 wird sie zur Bestätigung mit dem Angebot, weitere Schwerpunkte
aufzunehmen.

**Verbindlich:** Die Gesamtzahl der Fragen darf sich während der Befragung nicht
ändern. Eine frühere Fassung liess Frage 2 bei nur einer Auswahl entfallen; der
Fortschritt sprang dadurch beim Auswählen des zweiten Themas von „von 9" auf
„von 10". Ein Fortschritt, der beim Antworten länger wird, widerspricht der
Zusage, dass nichts überrascht. Die einzige zulässige Abweichung der Gesamtzahl
ergibt sich aus der Wahlkreisangabe und steht vor Frage 1 fest.

Die Reihenfolge in Frage 2 ist mit der Auswahlreihenfolge aus Frage 1 vorbelegt
und vollständig änderbar. Damit ist die Frage beantwortbar, ohne dass sie als
Pflichtarbeit erscheint.

Sonderfall Frage 7 (Likert): fünf Zeilen auf einem Screen, jede Zeile Pflicht.
Fehlende Zeilen werden einzeln benannt: „Noch offen: Verwaltungsaufwand."

---

## S-07 Adaptive Frage

Frage 9, nur mit gewähltem Wahlkreis.

Zeigt drei bis fünf Indikatoren des Wahlkreises als Antwortflächen, jeder mit
Wert, Jahr und Quellenauslöser. Gefragt wird, welcher davon aus Sicht der Person
am dringlichsten ist.

Über der Gruppe steht der Grund für die Frage:
„Diese Frage erscheint, weil Sie den Wahlkreis 275 Mannheim gewählt haben."

| Zustand | Darstellung |
|---|---|
| Daten vollständig | 3 bis 5 Indikatoren mit Wert, Jahr, Quelle |
| Einzelne Datenlücke | Indikator erscheint mit `EvidenceMark` „Datenlücke" statt Wert und bleibt wählbar |
| Alle Daten fehlen | Frage entfällt, Hinweis im Report unter „Relevanter Wahlkreiskontext" |
| Gebietsstand abweichend | Zusatzzeile am Indikator, zusätzlich im Quellen-Popover |

---

## S-08 Freitext

Frage 10, optional. Verhalten siehe `COMPONENTS.md` 2.8.

| Zustand | Darstellung |
|---|---|
| Leer | Label, Hinweis zu Drittdaten, „Überspringen" |
| Tippend | Zähler ab 500 Zeichen |
| Über 600 Zeichen | Meldung, Text bleibt erhalten, Weiter bleibt möglich |

---

## S-09 Antworten prüfen

Alle Angaben als Karten mit „Ändern". Optionale Leerstellen als
`Nicht beantwortet · optional`, ohne Mahnung.

| Zustand | Darstellung |
|---|---|
| Vollständig | Primary „Wirkungsreport erstellen" bedienbar |
| Pflichtangabe fehlt | betroffene Karte mit Hinweis und direktem „Ergänzen", Primary gesperrt mit Grund |
| Nach Rückkehr von einer Frage | Fokus auf der geänderten Karte, Änderung über `aria-live` bestätigt |

---

## S-10 Ergebnis wird erstellt

`LoadingSteps` mit vier echten Schritten. Mindestens 900ms, kein Spinner.

| Zustand | Darstellung |
|---|---|
| Normal | Schrittliste, jeder Schritt einmal in `aria-live` |
| Langsam (> 12s) | Zusatzhinweis plus Abbrechen |
| Fehler | Wechsel auf S-21 mit Rückweg zu S-09, Antworten bleiben erhalten |
| Reduced Motion | identisch, da ohnehin keine Animation |

---

## S-11 Report Overview

Elf Abschnitte in der Reihenfolge aus `UX_SPEC.md` 9.1.
**Fokus beim Laden:** Reporttitel.

| Zustand | Darstellung |
|---|---|
| Vollständig | alle Abschnitte |
| Ohne Wahlkreis | Abschnitt 4 wird „Relevanter Bundeskontext", Abschnitt 9 nutzt bundesweite Formulierungen |
| Datenlücken | betroffene Indikatoren mit `EvidenceMark` „Datenlücke" und Erklärung, nie weggelassen |
| Keine Regel greift | statt Pfaden der Hinweistext aus `COPY.md`, übrige Abschnitte bleiben |
| Nur eine Regel greift | ein Pfad plus ausdrücklicher Hinweis, warum nur einer erscheint |
| Sensitivität aktiv | Abschnitt 8 zeigt Ergebnis, Abschnitt 6 bleibt unverändert, Hinweis auf Was-wäre-wenn |
| Druck / PDF | Navigation aus, Drawer-Inhalte ausgeklappt, Quellen als Fussnoten |

Ab 64rem rechts eine Sprungnavigation über die elf Abschnitte mit `aria-current`
auf dem sichtbaren Abschnitt. Unter 64rem entfällt sie ersatzlos; ein
Inhaltsverzeichnis am Anfang ersetzt sie nicht, weil es den Weg zum ersten
Inhalt verlängert.

---

## S-12 Handlungspfad Detail

Eigene Route je Pfad, damit sie zitierbar ist.

Inhalt: Titel, Langbeschreibung, Wirkpfad in Listenform, Voraussetzungen,
mögliche Gegenwirkungen, Belegbarkeit je Aussage, Quellenliste,
„Warum wird mir das vorgeschlagen?" als eingebetteter, offener Abschnitt
(nicht als Drawer, weil hier Platz ist).

| Zustand | Darstellung |
|---|---|
| Standard | vollständig |
| Direktaufruf ohne Sitzung | Pfad wird ohne persönlichen Bezug gezeigt, mit Hinweis und Angebot, die Befragung zu starten |
| Unbekannte ID | S-21 mit Rückweg zum Report |

---

## S-13 Herleitungs-Drawer

Kernfeature. Vollständige Spezifikation in `RESULT_EXPLAINABILITY.md`.

| Zustand | Darstellung |
|---|---|
| Standard | sechs Abschnitte in fester Reihenfolge |
| Keine Alternative hinterlegt | Abschnitt 6 entfällt, Grund steht dort |
| Datenlücke in der Regel | betroffene Zeile mit „Datenlücke" und Auswirkung auf die Sicherheit der Aussage |
| Modellannahme | Zeile mit `EvidenceMark` „Modellannahme" und der Annahme im Klartext |
| Aus URL geöffnet | Drawer offen beim Laden, Fokus auf Drawer-Überschrift |
| Druck | ausgeklappt im Fluss |

---

## S-14 Wirkpfad

Zwei gleichwertige Ansichten, siehe `COMPONENTS.md` 4.3.

| Zustand | Darstellung |
|---|---|
| Verlauf | Diagramm in `.wc-scroll-x`, Umschalter aktiv |
| Liste | nummerierte Schritte, Standard unter 64rem und bei Reduced Motion |
| Risiken leer | Block entfällt nicht, sondern nennt: „Zu diesem Pfad sind keine belastbaren Gegenwirkungen hinterlegt." |

---

## S-15 Quellen

Popover ab 48rem, Bottom-Sheet darunter.
Felder: Institution, Kennzahl, Jahr, geografische Ebene, Datenqualität, Link, Hinweis.

| Zustand | Darstellung |
|---|---|
| Standard | alle Felder |
| Kein Link vorhanden | Feld entfällt, Hinweis „Nicht online verfügbar" |
| Gebietsstand abweichend | Hinweiszeile |
| Datenqualität eingeschränkt | `EvidenceMark` plus Klartext |

Zusätzlich am Ende des Reports ein vollständiges Quellenverzeichnis, damit der
Report auch gedruckt zitierfähig ist.

---

## S-16 Sensitivität

Siehe `COMPONENTS.md` 4.5.

| Zustand | Darstellung |
|---|---|
| Kein Chip aktiv | Chips plus erklärender Satz, kein Ergebnisbereich |
| 1 bis 3 aktiv | Ergebnissatz mit Grund |
| Höchstzahl erreicht | weitere Chips gesperrt mit Grund |
| Keine Änderung | ausdrücklicher Satz, dass sich nichts ändern würde |
| Zurückgesetzt | Bestätigung über `aria-live` |

---

## S-17 Politik-Kit

Vier Karten: mögliche Prüffrage, drei Wirkungsindikatoren, Frage für den
Wahlkreisdialog, ein erster Schritt.

| Zustand | Darstellung |
|---|---|
| Standard | vier Karten, drei davon kopierbar |
| Kopiert | „Text kopiert" über `aria-live`, Button bleibt sichtbar |
| Zwischenablage nicht verfügbar | Text wird markiert dargestellt mit Hinweis „Bitte mit Strg+C kopieren" |

---

## S-18 Forschungs-Opt-in

Siehe `UX_SPEC.md` 12.2. Keine Vorauswahl, zwei gleichwertige Flächen.

| Zustand | Darstellung |
|---|---|
| Unbeantwortet | beide Flächen neutral, kein Drängen |
| „Nur meinen Report" | Bestätigung, Block klappt zusammen, jederzeit änderbar |
| „Beitragen" | Bestätigung plus Angabe, was übertragen wurde, plus Widerrufsweg |
| Übertragung fehlgeschlagen | Hinweis, Antworten bleiben lokal, Wiederholen möglich |

---

## S-19 Veröffentlichungs-Opt-in

Eigener Screen, zeitlich getrennt von S-18.

Enthält Vorschau des öffentlich Sichtbaren, Hinweis auf Rückschlussmöglichkeiten
bei kleinen Einheiten, Widerruf, Kontakt.

| Zustand | Darstellung |
|---|---|
| Standard | Vorschau plus zwei Flächen, keine Vorauswahl |
| Zugestimmt | Bestätigung, Widerrufsbutton, Angabe wo es erscheint und ab wann |
| Widerrufen | Bestätigung plus Frist, ab wann die Veröffentlichung entfernt ist |

---

## S-20 PDF-Vorschau

Zeigt den Report in Druckdarstellung mit Kopf- und Fusszeile.

| Zustand | Darstellung |
|---|---|
| Standard | Vorschau, Button „PDF erzeugen" |
| Erzeugung läuft | `LoadingSteps`-Variante mit zwei Schritten |
| Fehlgeschlagen | Hinweis plus Alternative „Über den Browser drucken" |

Der Druck enthält immer: Herleitungen ausgeklappt, vollständige Quellen als
Fussnoten, Datenstand, Methoden-Version, Neutralitätshinweis in der Fusszeile.

---

## S-21 Fehler

| Fall | Inhalt |
|---|---|
| Technisch | was passiert ist, was das bedeutet, was zu tun ist, zitierfähige Kennung, Kontakt |
| Unbekannte Route | Rückweg zum Report oder zur Landing |
| Keine Regel greift | kein Fehlerscreen, sondern der Hinweis im Report (S-11) |

Antworten gehen bei einem Fehler nie verloren. Das steht auch auf dem Screen.

---

## S-22 Offline / Wiederholen

Banner am oberen Rand, nicht modal, verdrängt keinen Inhalt dauerhaft.

| Zustand | Darstellung |
|---|---|
| Offline im Survey | Banner „Keine Verbindung. Ihre Antworten bleiben in diesem Browser gespeichert." |
| Offline beim Report-Erstellen | Ladeschritt hält an, Wiederholen-Button, Antworten bleiben |
| Offline im fertigen Report | Report bleibt lesbar, externe Quellenlinks sind als „offline nicht abrufbar" gekennzeichnet |
| Wieder online | Banner wechselt zu „Verbindung wiederhergestellt" und verschwindet nach der nächsten Interaktion, nicht per Timer |

---

## S-23 Sitzung abgelaufen

Ausgelöst durch Schema-Wechsel oder beschädigten lokalen Zustand.

Zwei Wege, gleichwertig: neu beginnen, oder gespeicherten Report öffnen, sofern
vorhanden. Der Screen sagt ausdrücklich, warum das passiert ist und dass keine
Daten an Dritte gelangt sind.

Keine automatische Weiterleitung. Der Screen wartet auf eine Entscheidung.

---

## S-24 Fokus- und Tastaturzustände

Kein eigener Screen, sondern Abnahmegegenstand über alle Screens.

| Prüfpunkt | Kriterium |
|---|---|
| Fokusring | Doppelring, sichtbar auf Ivory, Weiss und Navy |
| Fokusreihenfolge | entspricht der Leserichtung, keine `tabindex > 0` |
| Skip-Link | erstes fokussierbares Element, sichtbar bei Fokus |
| Sticky-Überdeckung | `scroll-margin-block` verhindert Verdeckung durch Kopf und Fussleiste |
| Drawer | Fokusfalle, Escape, Rückgabe an den Auslöser |
| Combobox | vollständige Tastaturbedienung nach WAI-ARIA-Muster |
| Ranker | Reihenfolge ohne Zeigegerät änderbar |
| Segmentleiste | beantwortete Fragen per Tastatur erreichbar |
| Kein Fokusverlust | nach Zustandswechsel liegt der Fokus nie auf `<body>` |

---

## Prüfstand

Messwerte der Abnahme vom 2026-08-13. Prototyp über lokalen HTTP-Server
ausgeliefert, Messung im Browser. Bewertung in `UX_SPEC.md` 18.

### Reflow und Überlauf

| Breite | Landing | Wahlkreis | Survey | Review | Report | Drawer |
|---|---|---|---|---|---|---|
| 320px | kein Überlauf | kein Überlauf | kein Überlauf | kein Überlauf | kein Überlauf | kein Überlauf |
| 1440px | kein Überlauf | kein Überlauf | kein Überlauf | kein Überlauf | kein Überlauf, Sprungnavigation 240px | seitlich 560px |

Vor der Korrektur: 320px ergab `scrollWidth` 333 gegen `clientWidth` 320,
verursacht durch den Vertrauens-Auslöser im Kopf.

### Zielgrössen

| Screen | Ziele unter 44px |
|---|---|
| Landing | 0 |
| Wahlkreis-Auswahl | 0 |
| Survey Intro | 0 |
| Kernfrage | 0 |
| Antworten prüfen | 0 |
| Ergebnis wird erstellt | 0 |
| Report | 0 |

Vor der Korrektur: 10 Sprungnavigationslinks bei 238×41 und 3 Fusszeilenlinks
bei bis zu 136×19; ausserdem 10 Fortschrittssegmente bei 0×44.

### Kontrast

323 textführende Elemente über sechs Screens gemessen, Schwelle 4.5:1
beziehungsweise 3:1 für grossen Text. Unterschreitungen: 0.
Ränder von Bedienelementen gegen Innen- und Aussenfläche geprüft.
Unterschreitungen: 0.

### Farbinventar

15 Farben im Einsatz, alle aus dem Token-Satz, keine Fremdfarbe:

`#0B1020` `#1C1F27` `#235F46` `#2F7D5C` `#4A505C` `#5F6670` `#7A6A57` `#808892`
`#A87F27` `#C89B3C` `#D9D3C9` `#E8E4DC` `#F1E3C4` `#F6F1EB` `#FFFFFF`

Abgleich gegen sieben parteinahe Referenzfarben: ein Prüfpunkt, das Marken-Grün,
dokumentiert in `DESIGN_SYSTEM.md` 2.6b.

### Sprache

Verbotsliste über den gerenderten Text geprüft. Treffer ausschliesslich in
Verneinungen: „Keine Personenbewertung. Keine Wahlempfehlung. Keine Rangliste
von Abgeordneten oder Parteien."
Gedankenstriche `-` oder `-`: 0. Ausrufezeichen: 0.

### Tastatur

| Prüfung | Ergebnis |
|---|---|
| Skip-Link erscheint bei erstem Tab | ja, mit sichtbarem Doppelring |
| `tabindex > 0` | 0 Vorkommen |
| Tab-Reihenfolge | entspricht der DOM-Reihenfolge |
| Combobox Pfeil ab | setzt `aria-activedescendant` auf `district-opt-0` |
| Combobox Enter | übernimmt den Treffer, Fokus wandert auf „Weiter" |
| Drawer Escape | schliesst, `inert` entfernt, Body entsperrt, Fokus zurück auf den Auslöser |
| Ranker | Reihenfolge ohne Zeigegerät änderbar |

### Funktionsdurchlauf

Zehn Fragen in Folge, Fortschritt stabil bei „von 10", Restzeitangabe von
„noch etwa 4 Minuten" bis „letzter Schritt", danach Antworten prüfen, Ladeschritte,
Report. Sensitivität: Höchstzahl drei greift, der Nicht-Änderungs-Fall wird
ausdrücklich benannt, Zurücksetzen funktioniert.

### Nicht geprüft

- Druckausgabe auf Papier und als PDF. Die Regeln sind vorhanden und werden vom
  Browser geparst, das Ergebnis wurde nicht am Dokument abgenommen.
- Prüfung mit echten Screenreadern. Geprüft wurde die Struktur, nicht das
  tatsächliche Vorleseerlebnis in NVDA oder VoiceOver.
- Die Screens S-12 sowie S-19 bis S-23 sind spezifiziert, im Prototyp aber nicht
  interaktiv gebaut.
