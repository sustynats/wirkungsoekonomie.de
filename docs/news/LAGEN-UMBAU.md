# Umbau: drei Lagen am Tag statt Stundenjagd

Natalies Entscheidung vom 17.09.2026. Der Wirkungsticker veröffentlicht nicht
mehr laufend Einzelmeldungen, sondern dreimal täglich eine redaktionelle Lage.
Gesammelt und recherchiert wird weiter permanent; **veröffentlicht wird
gebündelt**.

> Nicht mehr: Was ist seit einer Stunde irgendwo erschienen?
> Sondern: Was hat sich seit dem letzten Update wirklich verändert – und was
> davon ist wirkungsrelevant?

## 1. Was der Umbau löst und was nicht

Ehrlich zuerst, damit niemand sich täuscht: **die Ausfälle vom 17.09.2026 hätte
dieser Umbau nicht verhindert.** Eine ungültige Workflow-Eingabe, eine
Sperrkollision zweier gleichzeitig gestarteter Läufe, eine fehlende Vorgabe im
Auftragsweg, die Verwechslung von Ereignis- und Herausgabezeit — alle vier wären
auch in einem Drei-Lagen-Prozess aufgetreten.

Was er löst:

- **Der Produktionsdruck fällt weg.** Keine Stundenquote, also kein Anreiz,
  künstlich Meldungen zu erzeugen. Die Auswahl entscheidet über eine Schwelle,
  nicht über eine Zahl.
- **Der Prozess bekommt Luft.** Ein zweistündiger Hänger zwischen Mittags- und
  Abendlage ist unsichtbar. Am 17.09. war er sofort sichtbar und schmerzhaft.
- **Weniger Fläche für Folgefehler**: weniger Dubletten, weniger widersprüchliche
  Zwischenstände, weniger halbfertige Wirkungsanalysen, weniger Bilder, weniger
  Datenbankobjekte.
- **Fachlich besser.** Um 09:13 ist oft nicht klar, was passiert ist. Um 12:00
  liegen Primärquelle, Behördenreaktion und zwei unabhängige Berichte vor. Erst
  dann lässt sich Fakt, offener Punkt und Wirkungsrisiko trennen.

Was er **erschwert**: Ein Fehlschlag kostet nicht mehr eine Meldung, sondern eine
ganze Lage. Die Robustheitsanforderung steigt (Abschnitt 5).

## 2. Die Lagen

| Lauf | Zeit (Berlin) | Fenster |
|---|---|---|
| Morgenlage | 06:00 | seit 18:00 des Vortags (Abend + Nacht) |
| Mittagslage | 12:00 | seit 06:00 |
| Abendlage | 18:00 | seit 12:00 |

Außerplanmäßig **nur** bei echten Breaking-Ereignissen (Abschnitt 6).

Pro Lauf **keine feste Zahl**: typischerweise 8–12 Themencluster, Obergrenze 15,
keine Untergrenze. Waren vormittags nur sechs Dinge wichtig, sind es sechs.

Eine Lage darf ausdrücklich sagen: *„Seit 12 Uhr gab es zu diesem großen Thema
keine belastbare neue Entwicklung."* Das ist journalistisch wertvoller als ein
künstlich erzeugter Artikel und wird als Inhalt behandelt, nicht als Leerstelle.

## 3. Auswahl: redaktioneller Filter statt Reichweite

Auswahlgröße:

```
Neuigkeit × Materialität × MPD-Relevanz × Evidenz × Veränderung seit letztem Lauf
```

**Medienreichweite ist ausdrücklich kein Kriterium.** Natalie am 17.09.: „Es
dürfen aber insbesondere bei Technologie spannende Themen nicht unter den Tisch
fallen, nur weil nicht alle Medien darüber berichten."

Das ist keine Meinung gegen die Messung, sondern deckungsgleich mit ihr: eine
Auswertung am 17.09.2026 hat gezeigt, dass veröffentlichte und zurückgehaltene
Meldungen dieselbe Quellenbreite-Verteilung haben (je rund 83 % Einzelquelle).
Quellenbreite ist damit **kein** Relevanzindikator und darf nicht als Hilfsgröße
einfließen — weder positiv noch negativ.

Verbindlich:

- Kein Kriterium, das Quellenanzahl, Agenturaufkommen oder Medienresonanz als
  Relevanzersatz verwendet.
- Eine Einzelquelle mit Primärcharakter (Gerichtsentscheidung, Behördenbescheid,
  Normentwurf, technische Spezifikation, Studie) wiegt mehr als die zwölfte
  Agenturmeldung über dieselbe Aussage.
- Technologie, Infrastruktur, Energie, Digitalisierung und Wissenschaft brauchen
  eine gesicherte Mindestpräsenz je Lage, damit sie nicht systematisch gegen
  lautere Politikthemen verlieren. Umsetzung über die vorhandene
  Kategorienabdeckung (`categoryCoverage`, `balanceEventQueue`), nicht über eine
  Sonderregel je Thema.

## 4. Clustering und Fortschreiben

Ein Ereignis ist ein Cluster, keine vier Meldungen. Schreiben Reuters,
Tagesschau, Handelsblatt und FAZ über dieselbe Sache, entsteht **eine** Karte mit
mehreren Quellen, und die Karte beantwortet: Was ist neu? Was ist gesichert? Was
ist noch offen? Was bedeutet es für Mensch, Planet und Demokratie?

Läuft ein Ereignis weiter, wird **fortgeschrieben, nicht neu geschrieben**:
Gesetz morgens angekündigt, mittags Entwurf, nachmittags Reaktion der Opposition
— ein Ereignis mit aktualisierter Faktenlage und aktualisiertem Wirkungspfad, auf
der Karte „aktualisiert 18:00".

## 5. Was weiterverwendet wird — mit Beleg

Natalies Vorgabe: „Du musst aufpassen, dass Du nichts Kaputtes übernimmst."
Deshalb gilt: **kein Baustein wird ohne Beleg weiterverwendet.** Belege sind
Messungen, keine Annahmen.

| Baustein | Beleg | Übernahme |
|---|---|---|
| Ereignis-Clustering über Quellen hinweg | 507–752 zusammengeführte Quelleneinträge je Lauf, 55 Cluster; quellenübergreifende Zusammenführung mit 0 Fehlverbindungen bei 326 Meldungen | ja |
| Fortschreiben (Lageakte, `publication_history`, `updated_stories`) | im Betrieb nachweisbar (z. B. Lauf 09:22: 1 veröffentlicht, 1 aktualisiert) | ja |
| Karten als eigene Objekte mit Quellen und MPD-Profil | heutiger Zustand, 307 Meldungen live | ja |
| Wirkungsbewertung 2.1 inkl. deterministischem Gate | 131 Tests grün | ja |
| Ein bezahlter Versuch je unverändertem Eingabestand | `paidAttemptsExhausted`, Grenze 1 | ja |
| Push-Kette (Kennung aus der Herausgabezeit) | Nachtrag 13:32: `delivered=4, duplicate=false` | ja |
| Selbstheilung | PR #863, Test gegen die echte Workflow-Datei | ja |
| Stundenkontingent / `sharedHourlyRoom` / `editorialReserve` | funktioniert, wird aber **gegenstandslos** | **nein**, wird ersetzt |
| Quotenfüllung („bis 3 erreicht sind") | genau der Mechanismus, der künstlich produziert | **nein**, entfällt |
| `scheduledSlot` (07/12/16/20) | nur Etikett im Nutzungsbericht, nie Veröffentlichungseinheit | umbauen auf 06/12/18 als echte Einheit |
| Nachbesserungsschleife (`ai_repair_calls`) | Ursache teils behoben (PR #868), Restquote wird noch gemessen | **erst nach Messung**, nicht blind übernehmen |
| Redaktionsspur (Meinung & Analyse, Nachgehört/Nachgesehen) | läuft, seit PR #865 sechs erfolgreiche Läufe hintereinander | ja, unberührt |

Offen und **vor** Übernahme zu klären:

1. Restquote der Nachbesserungen und ihre Gründe (Messung läuft seit PR #867).
2. `CLAIM_NUMBER_NOT_IN_EVIDENCE` und `AI_SOURCE_SUMMARY_UNSUPPORTED_NUMBER`:
   inhaltliche Modellfehler, noch ohne Gegenmaßnahme.
3. Kostenerfassung der Redaktionsspur fehlt in `usage.json` (rund 1–2 % des
   Budgets, aber die Summe ist damit nicht vollständig).

## 6. Breaking-Ausnahme: hart begrenzt

Die Ausnahme ist die Tür, durch die die Stundenjagd zurückkommt. Deshalb:

- **Geschlossene Liste deterministischer Auslöser**, kein Modellurteil darüber,
  was „breaking" ist: Kriegsausbruch, Regierungssturz oder Vertrauensfrage,
  Großkatastrophe, Entscheidung eines Verfassungs- oder höchsten Gerichts,
  Rücktritt oder Entlassung eines Regierungsmitglieds, Notlagenbeschluss.
- **Höchstens zwei außerplanmäßige Lagen pro Tag.**
- Alles Zweifelhafte wartet auf die nächste reguläre Lage.
- Jede außerplanmäßige Lage wird im Betriebsbericht mit ihrem Auslöser vermerkt.

## 6a. Was unverändert bleibt (verbindlich)

Natalie am 17.09.2026: „Die Bewertungen bleiben selbstverständlich, nach den
Wirkungspotenzialen und der wirkungsökonomischen Einordnung und Einschätzung."

Der Umbau betrifft **Takt und Bündelung**, nicht die fachliche Substanz. Nichts
aus dieser Liste wird entfernt, ersetzt, vereinfacht oder „vorerst weggelassen":

- **Wirkungspotenziale je Dimension** Mensch, Planet, Demokratie: Stärke 0–5,
  Richtung, Dominanz, Evidenzstufe, Zeitstatus — die Balken und Ringe. Natalie
  am 15.09.: „Balken/Ringe sind der Kern."
- **Nichtkompensation / Reverse Merit Order**: keine gemittelte MPD-Gesamtnote,
  das Ergebnis ist das Minimum der Kernfelder.
- **Wirkungsökonomische Einordnung und Einschätzung**: Befund in Alltagssprache,
  Wirkpfade mit Empfängern, Mechanismus, Bedingung, Raum, Zeit, Ordnungen 1–3,
  Quellenbindung, Annahmen und Grenzen; mindestens eine quellengebundene
  Wirkungsvisualisierung (Kaskade).
- **Folgencheck vor Faktencheck** und das Truth-Sandwich: zu jeder Zahl die Folge.
- **Das deterministische Gate** für die drei modellierten Dimensionen. Eine
  Meldung ohne belastbare Bewertung geht nicht live, sie wartet.
- **Trennung von Relevanz, Tragweite, Eintrittsplausibilität und Evidenz.**
  Offen ist nicht neutral, unsicherer Eintritt ist keine offene Richtung.
- **„Meine Einordnung"** als abschließende persönliche Passage in Meinung &
  Analyse, mit Freigabeschritt.
- **Quellen und Belege** je Karte, Wirkungsakte mit Versionsverlauf.
- **Methodikseite** `/wirkungsticker/methodik/`.

### Bauregel, damit das nicht verloren gehen kann

Die Lage ist ein **Rahmen um die bestehenden Karten, kein neuer Kartentyp.** Die
Lage-Seite und die App-Ansicht rendern die Einträge mit derselben Funktion wie
die heutige Ticker-Liste (`storyCard` / `editorialCard`). Ein Eintrag in einer
Lage ist eine Referenz auf die Wirkungsakte, keine Kopie ihrer Inhalte.

Damit gilt automatisch: keine Lage kann eine Karte ohne Balken, Ringe, Quellen
oder Wirkungsanalyse zeigen, weil es diese Darstellung nirgends gibt. Ein
Regressionstest prüft in Schritt 1b, dass die Lage-Seite dieselben
`data-magnitude`- und Dimensionsmarker enthält wie die Ticker-Liste.

## 7. Oberfläche

Startseite:

```
Morgenlage · 17. September · Stand 06:00
„Das sind die 9 Entwicklungen, die seit gestern Abend wirkungsrelevant geworden sind."
  [ Karte 1 ] [ Karte 2 ] … [ Karte 9 ]
```

Darunter Mittagslage und Abendlage als eigene Abschnitte. Jede Karte bleibt
anklickbar, teilbar, merkbar und behält ihre eigene Quellen- und
Wirkungsanalyse. Kein Sammeltext, der sich nicht teilen lässt.

- **News**: die einzelnen Ereignisse chronologisch, wie heute.
- **Meinung & Analyse**: zu den Top-Clustern jeder Lage jeweils eine Analyse
  (Natalie am 17.09.: „Zu den Top Lagen gibt es dann jeweils eine
  Meinung&Analyse"). Der Freigabeschritt bleibt.
- **Nachgehört / Nachgesehen / Buch & Wirkung**: unberührt, eigener Takt.

Die drei Tagesläufe betreffen die Nachrichtenproduktion, nicht die längeren
redaktionellen Formate.

## 8. Name

Der Produktname bleibt **Wirkungsticker**: getickert werden Wirkungen, nicht
Minuten, und die Einzelereignisse erscheinen weiter chronologisch. Dafür
sprechen auch freigegebenes Logo, fertig produziertes Werbevideo und die
Live-Adresse. Die Ausgaben heißen Morgenlage, Mittagslage, Abendlage.
(Entscheidung liegt bei Natalie; ein Wechsel auf „Die Wirkungslage" wäre die
konsequente Alternative, mit Aufwand an Logo, Video und Adressen.)

## 9. Reihenfolge

Der Ticker läuft während des gesamten Umbaus weiter. Nichts wird vorher
abgeschaltet.

1. **Lage als Datenobjekt und Seite**, zunächst zusätzlich zum heutigen Betrieb.
2. **Auswahl auf Schwelle umstellen**, Obergrenze 15, keine Untergrenze;
   Kategorienabdeckung für Technologie und Infrastruktur.
3. **Cluster-Isolation und Wiederaufsetzen**: ein defektes Cluster darf die Lage
   nicht kippen, ein abgebrochener Lauf setzt beim nächsten Cluster fort, die
   Lage geht mit dem raus, was fertig ist. Pflicht vor Schritt 4.
4. **Stundenbetrieb abschalten**, Startseite und App auf die drei Lagen.
5. **Meinung & Analyse an die Top-Cluster** koppeln.
6. **Breaking-Regel** mit hartem Deckel.

## 10. Kosten

3 Lagen × 8–12 Cluster = 24–36 bezahlte Aufrufe am Tag, statt heute 56. Bei
0,023 USD je Aufruf rund 0,55–0,85 USD täglich. Dabei entstehen mehr
redaktionelle Einheiten als heute (heute landen etwa 17 am Tag live), jede mit
mehreren Quellen statt einer.

## 11. Stand am 17.09.2026, 18:00

Gebaut und eingebracht:

| Schritt | Stand | Beleg |
|---|---|---|
| Lage als Datenobjekt | fertig (#871) | 13 Tests; Fenster lueckenlos, Zeitumstellung in beide Richtungen geprueft |
| Lage-Seite | fertig (#874, #876) | Karten werden mit `storyCard` gerendert, Regressionstest auf woertliche Gleichheit; 0 nicht aufloesbare Verweise auf der gebauten Seite |
| Lagen entstehen von selbst | fertig (#877) | Schritt im Ticker-Lauf vor dem Commit; an den Fenstergrenzen gegen echte Daten geprueft |
| Auswahl nach Relevanz | fertig (#878) | 7 Tests; Medienresonanz ausdruecklich kein Kriterium, reservierte Plaetze nur mit Wirkungsstaerke |
| Startseite und App | fertig (#879) | 3 Tests; Lagen des jUengsten Tages, neueste zuerst, Karten bleiben auf der Lage-Seite |
| Meinung & Analyse je Lage | fertig (#880) | Anker ist der staerkste Eintrag der jUengsten Lage, Tagesdeckel 3, Schwellen bleiben |

### Was ausdruecklich offen ist

**1. Die Analyse findet weiter im Viertelstundentakt statt, nicht zur Lage.**
Der Ticker sammelt und bewertet weiter alle 15 Minuten; gebuendelt wird die
*Veroeffentlichungsflaeche* (die Lage), nicht der bezahlte Aufruf. Natalies
fachliches Argument dafuer, die Bewertung erst zur Lage zu machen („Um 12 Uhr
liegen vielleicht die Primaerquelle, eine Behoerdenreaktion und zwei
unabhaengige Berichte vor"), bleibt richtig.

Der Umstieg ist **an die Nachbesserungsquote gebunden, aus Budgetgruenden**:
15 Cluster je Lauf mal 3 Laeufe = 45 Aufrufe am Tag. Bei der gemessenen Quote
von 1,50 Aufrufen je Meldung werden daraus 68 - rund 1,55 USD am Tag. Der
Monatsrahmen traegt 1,21 USD am Tag. Erst wenn ein Aufruf je Veroeffentlichung
gilt, ist der Umstieg bezahlbar. Das ist Natalies eigene Regel, und sie ist
hier die Sperre.

**2. Die Nachbesserungsquote selbst.** Gemessen 1,50 Aufrufe je Meldung, 50 %
der bezahlten Meldungen brauchen einen zweiten Aufruf. Eine Ursache ist
behoben (#868), eine weitere sichtbar gemacht (#873: ein stiller Rueckfall auf
ein schemafreies Antwortformat nach HTTP 400, dessen Grund weggeworfen wurde).
Der Ablehnungsgrund wird jetzt aufbewahrt; die Reparatur folgt daraus, nicht
aus einer Vermutung.

**3. Technologie: korrigierter Befund.** Ich hatte hier zweimal falsch
geschlossen und schreibe beides hin, weil der falsche Befund sonst
weiterwirkt.

Erst: "Die Quellenliste hat keine Technologiequelle." Falsch - `heise-netzpolitik`
und `heise-security` stehen im Verzeichnis. Dann implizit: es gebe keine
Technikberichterstattung. Auch falsch - Natalie am 17.09.: "Wir hatten nur
Heise, was auch gut ist. Aber auch Spiegel, Handelsblatt, FAZ & Co. haben auch
Technik."

Gemessen gilt: 49 von 363 veroeffentlichten Meldungen (13,5 %) haben
Technikbezug im Text, aber nur 13 tragen ein Techniketikett. Die Knappheit war
zu einem grossen Teil ein **Etikettierungsartefakt**, keine Themenluecke. Die
Ursache stand in `app-pages.mjs`: die Ressortzuordnung sah nur dann in Titel
und Anriss, wenn kein Etikett passte. Eine Meldung mit dem Etikett "Energie"
und dem Titel "Kuenstliche Intelligenz: ..." traf ueber das Etikett schon
Wirtschaft und Klima - der Titel wurde nie gelesen.

Behoben mit einem gemeinsamen Ressortverzeichnis (`scripts/news/themen.mjs`):
Etiketten UND oeffentlicher Text gelten zusammen, und die reservierten Plaetze
der Lage lesen dasselbe Verzeichnis, statt exakte Etikettentexte zu
vergleichen. Gemessen am Bestand: Technik 22 -> 31 Meldungen, Gesellschaft
73 -> 87, keine Meldung verliert ein Thema. Bewusst nicht im Technikmuster:
"Drohne" (4 von 9 neuen Treffern waren Kriegsmeldungen) und "Infrastruktur" als
Muster (holte Kriegsschaeden an Energieanlagen herein); als ausdrueckliches
Etikett bleibt Infrastruktur reserviert.

Offen bleibt die **redaktionelle** Frage, die nur Natalie entscheiden kann:
FAZ und Handelsblatt fehlen im Quellenverzeichnis (80 Quellen). Ein Ausbau um
heise online (Hauptfeed), netzpolitik.org, Golem, BSI oder idw waere moeglich,
ist aber eine Entscheidung ueber die Blattlinie, keine technische.

**4. Breaking-Ausnahme.** Solange die Produktion im Viertelstundentakt laeuft,
erscheinen Ereignisse ohnehin sofort als Karte; die Ausnahme wird erst mit
Punkt 1 gebraucht. Die Regel aus Abschnitt 6 (geschlossene Liste, hoechstens
zwei ausserplanmaessige Lagen am Tag) gilt dann unveraendert.

### Eine Lehre, die im Plan bleiben soll

Am 17.09.2026 hat die erste Lage-Seite den Deploy blockiert: die Karten
verlinkten relativ, was nur von `/wirkungsticker/` aus aufgeht, und der
Link-Check brach mit 23 kaputten Verweisen ab. Ein gescheiterter Build
blockiert **jede** Veroeffentlichung - der Fehler kostete knapp zwei Stunden
ohne neue Meldungen.

Daraus folgt verbindlich: **Vor jeder Aenderung an einer gebauten Seite werden
die Verweise der gebauten Seite geprueft**, nicht nur ihr Aussehen. Und zwar
mit vollstaendigem Arbeitsbaum - im Sparse-Checkout melden 46 Navigationsziele
faelschlich als kaputt, was den echten Befund verdeckt.
