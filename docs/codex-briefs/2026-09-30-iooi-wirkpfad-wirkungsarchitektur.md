# Codex-Brief: IOOI, Wirkungspfad und WÖk-Wirkungsarchitektur klar trennen

**Stand:** 30.09.2026  
**Repository:** `sustynats/wirkungsoekonomie.de`  
**Fachliche Basis:** Root-`AGENTS.md`, führender Begriffsleitfaden v1.5, aktuelle WÖk-Begriffs- und Quellenlogik.

## 1. Warum diese Änderung nötig ist

Die aktuelle Website ordnet IOOI grundsätzlich schon korrekt als externe, optionale Results Chain ein. An mehreren Stellen wird der Unterschied zur Wirkungsökonomie aber noch als **längere zeitliche Kette** erzählt:

- WÖk beginne "vor" IOOI bzw. "vor der Wirkung",
- danach komme IOOI,
- danach Evidenz,
- danach Bewertung,
- danach Transformationswirkung,
- danach Rückkopplung.

Diese Darstellung ist didaktisch eingängig, aber methodisch zu linear. Sie vermischt drei unterschiedliche Ebenen:

1. **den realen oder modellierten Wirkpfad**: Was kann bzw. was geschieht in der Welt?
2. **Prüf- und Erkenntnisebenen**: Was ist belegt, wie sicher und wem zurechenbar?
3. **Bewertungs-, Schutz- und Steuerungsebenen**: Wie wird die Veränderung eingeordnet und was folgt daraus?

Wirkungspotenzial und Wirkungsrisiko sind keine Stationen, durch die eine reale Wirkung "hindurchläuft". Sie sind ex-ante Einordnungen eines möglichen Pfads. Evidenz und Zurechnung sind ebenfalls keine späteren Wirkungsstufen, sondern Prüfungen von Beobachtungen und Verknüpfungen entlang des Pfads. Wirkungsbewertung ist eine normative Einordnung, keine reale Folgestation. Transformationswirkung darf nicht einfach "hinter Impact" gesetzt werden: Je nach externer Definition kann Impact bereits systemische oder strukturelle Veränderungen umfassen. Die WÖk macht Transformationswirkung jedoch **als eigene Prüf- und Bewertungskategorie explizit**.

### Leitformel für die gesamte Überarbeitung

> **IOOI strukturiert eine Ergebniskette innerhalb eines Wirkungspfads. Die Wirkungsökonomie baut um Wirkpfade eine vollständige Analyse-, Evidenz-, Bewertungs-, Schutz- und Steuerungsarchitektur.**

Noch einfacher:

> **IOOI ist eine Results-Chain-Linse auf einen Wirkpfad. Die WÖk ist die Architektur rundherum.**

Nicht als Überlegenheitsleiter formulieren. IOOI kann für seine konkrete Frage sehr gut geeignet sein.

---

## 2. Fachliche Leitplanken

### Niemals schreiben oder visuell nahelegen

- "Die WÖk beginnt vor der Wirkung, IOOI nicht."
- "Die WÖk beginnt früher als IOOI." als Hauptabgrenzung.
- "Die WÖk erweitert IOOI."
- "IOOI ist der Wirkpfad der WÖk."
- "Nach Impact kommt Transformationswirkung."
- "Wirkungspotenzial → Wirkungsrisiko → Wirkmechanismus → IOOI → Evidenz → Bewertung ..." als reale Chronologie.
- "Input, Aktivität, Output, Outcome, Impact" als ausgeschriebenes IOOI-Akronym.

### Stattdessen

- IOOI = **Input, Output, Outcome, Impact**. Aktivität kann zwischen Input und Output ergänzt werden, ist aber kein Buchstabe des Akronyms.
- IOOI ist eine externe, optionale Results-Chain-Methode.
- Ein WÖk-Wirkungspfad kann einen IOOI-kompatiblen Abschnitt enthalten.
- Ein Wirkungspfad ist breiter als eine Results Chain: Auslöser, Mechanismen, Bedingungen, Betroffene, Zeit, mögliche/ beobachtete Zustandsveränderungen, Nebenfolgen und Rückkopplungen können dazugehören.
- Potenzial/Risiko = ex ante Wissens- und Modellierungsebene, nicht "Station".
- Evidenz/Zurechnung = Prüfebene über Beobachtungen und Pfadverknüpfungen.
- Bewertung = Einordnung am offengelegten Referenzrahmen, nicht Messung.
- Transformationswirkung = strukturelle Veränderung von Regeln, Anreizen, Standards, Infrastrukturen, Märkten, Machtverhältnissen oder künftigen Entscheidungspfaden; Richtung gesondert bewerten.
- Je nach externem Begriffsrahmen kann "Impact" bereits systemisch/strukturell verstanden werden. WÖk behauptet nicht, IOOI könne Transformation grundsätzlich nicht erfassen. WÖk macht sie nur explizit und separat prüfbar.
- Rückkopplung macht Wirkung entscheidungsrelevant; Reporting allein tut das nicht.

---

## 3. Neues visuelles Grundmodell

Bitte die bisherige serielle 10-Stufen-Grafik
`assets/visuals/model/woek_wirkungskreislauf_iooi.svg`
und die Mobile-Fassung nicht einfach kosmetisch ändern, sondern durch ein **mehrschichtiges Modell** ersetzen.

Empfohlene neue Assets:

- `assets/visuals/model/woek_wirkpfad_iooi_architektur.svg`
- `assets/visuals/model/woek_wirkpfad_iooi_architektur_mobile.svg`

Die bisherigen Dateien können nach Referenzprüfung entfernt oder als nicht mehr verwendete Legacy-Assets belassen werden. Keine gebrochenen Verweise.

### Desktop-Aufbau

**Außenrahmen:**  
`WÖk-Wirkungsarchitektur`

**Mitte – realer / modellierter Wirkpfad**  
eine horizontale, klar erkennbare Pfadlinie, z. B.:

`Ausgangslage & Kontext → Auslöser / Handlung / Unterlassen → Wirkmechanismus + Bedingungen → Aktivität / Intervention → unmittelbare Leistung → Zustandsveränderung → Folge- / Systemwirkungen → neuer Systemzustand`

Hinweis direkt an der Pfadlinie:
`Plausibler oder beobachteter Wirkpfad – kein Kausalbeweis.`

**IOOI als blaue Überlagerung/Bracket innerhalb dieser Mitte:**  
`Input → [Aktivität] → Output → Outcome → Impact`

Darunter:
`IOOI / Results Chain – eine Linse auf einen Abschnitt des Pfads`

Zusatz:
`Impact kann je nach verwendetem Rahmen auch breitere, langfristige oder systemische Wirkung umfassen.`

Die IOOI-Linie soll sichtbar **innerhalb** des WÖk-Rahmens liegen, aber nicht so, als sei sie exakt identisch mit dem gesamten realen Pfad.

**Obere Prüfschicht – Ex ante / Hypothesen**  
`Was könnte passieren – und warum?`
- Wirkungspotenzial
- Wirkungsrisiko
- Wirkungshypothese
- Mechanismen
- Bedingungen / Annahmen
- Szenarien

Mit gestrichelten Bezügen zu mehreren Punkten/Verbindungen des Wirkpfads. Keine serielle Pfeilkette.

**Untere Prüfschicht – Evidenz & Zurechnung**  
`Was ist tatsächlich passiert – und was können wir zurechnen?`
- Baseline
- Gegenfaktum
- Datenqualität
- Zusätzlichkeit
- Attribution / Contribution
- Unsicherheit
- Evidenzstatus

Auch als querliegende Prüfschicht, nicht als "Schritt nach Impact".

**Darunter – Bewertung & Schutz**  
`Wie ist das einzuordnen – und was darf nicht schöngerechnet werden?`
- Mensch – Planet – Demokratie
- Referenzrahmen
- Recht / Grundrechte / Kontextnormen
- Verteilung und Zeit
- Netto-Wirkung
- Wirkungsgrenzen
- Nichtkompensation
- Reverse Merit Order

**Rechts / über Systemfolgen – System- und Transformationslinse**
- 1. Ordnung: direkte Zustandsveränderung
- 2. Ordnung: indirekte Folgen, Rebound, Spillover, Leakage
- 3. Ordnung: Regeln, Anreize, Routinen, Standards, Märkte, Institutionen, künftige Entscheidungen
- hervorgehoben:
  `Transformationswirkung = strukturelle Veränderung; ihre Richtung wird gesondert bewertet.`

Nicht als Stufe "nach Impact" zeichnen, sondern als vertikale/überlagernde Linse auf weiterreichende Systemveränderungen.

**Außen / unten – Rückkopplung und Lernen**
aus bewerteter und abgesicherter Wirkung:
`Preise • Steuern • Kapital • Versicherung • Beschaffung • Management • Recht / Politik • Produktdesign`

großer Rückpfeil:
`neue Entscheidung → neuer Systemzustand → neuer Wirkpfad / neues Monitoring`

**Meta-Rahmen am Rand**
`Governance • Versionierung • Audit / Assurance • Transparenz • Rechtsschutz • Lernen`

### Bottom takeaway im Bild

> **IOOI beschreibt eine Ergebniskette. Die WÖk organisiert, wie Wirkpfade geprüft, bewertet, geschützt und in neue Entscheidungen zurückgeführt werden.**

### Stil

Bestehende WÖk-Visualsprache verwenden:
- Hintergrund etwa `#F7F4EC`
- Navy `#0B1B36`
- Grün `#2D7F5F`
- Gold `#C9932E`
- Koralle `#C95749`
- SVG, kein AI-Rasterbild.
- große, lesbare Schrift.
- Desktop und Mobile eigenständig layouten; Mobile vertikal, aber weiter **Schichten statt Chronologiekette**.
- `<title>` und `<desc>`, sinnvoller Alt-Text, keine Information nur über Farbe.

---

## 4. Hauptseite IOOI neu erzählen

**Generator ist die Quelle:**  
`scripts/site/build-iooi-wirkungsarchitektur.mjs`  
Nicht nur generiertes HTML editieren.

Route:
`/verstehen/iooi-und-wirkungsoekonomie/`

### Neuer SEO-/Seitentitel

`IOOI, Wirkungspfad und Wirkungsökonomie – was gehört wohin?`

Meta-Kernaussage:

`IOOI ordnet Input, Output, Outcome und Impact als Results Chain. Ein WÖk-Wirkungspfad kann diese Struktur nutzen. Die Wirkungsökonomie ergänzt keine längere Kette, sondern legt Evidenz, Bewertung, Schutz, Systemprüfung und Rückkopplung um den Wirkpfad.`

Bitte Title, Description, search metadata, OpenGraph, Twitter und JSON-LD synchron halten.

### Neuer Hero

Kicker:
`IOOI, Wirkpfad und WÖk`

H1:
`Eine Kette ist noch keine Wirkungsarchitektur.`

Subtitle:

> **IOOI ordnet eine Results Chain: Input, Output, Outcome, Impact. Ein WÖk-Wirkungspfad kann diese Kette nutzen. Die Wirkungsökonomie ist aber nicht einfach eine längere Kette. Sie prüft zusätzlich Mechanismen, Evidenz und Zurechnung, bewertet Wirkungen, schützt rote Linien und führt Erkenntnisse in die nächste Entscheidung zurück.**

### Neuer Armin-Maiwald-Einstieg: Buslinie

Direkt nach Hero, vor Definitionen:

**H2: Stell dir eine neue Buslinie vor.**

Copy sinngemäß:

> Die Stadt stellt Geld, Busse und Fahrer bereit. Das ist Input. Die Busse fahren. Es entstehen Fahrten und Haltestellenangebote – Output. Mehr Menschen kommen ohne Auto zur Arbeit oder zur Schule – Outcome. Wenn dadurch langfristig Verkehr, Emissionen oder Teilhabe verändert werden, sprechen viele Results-Chain-Modelle von Impact.
>
> Damit ist aber noch nicht alles geklärt. Hat wirklich die neue Linie die Veränderung ausgelöst? Wer profitiert, wer nicht? Wurden dafür andere Linien gekürzt? Wie sicher sind die Daten? Welche Folgen entstehen später? Und was soll die Stadt nun bei Takt, Preis oder Budget ändern?
>
> **Genau hier liegt der Unterschied: IOOI ordnet die Ergebniskette. Die Wirkungsökonomie legt die Prüf-, Bewertungs- und Steuerungsschichten darum.**

Das Beispiel als **Beispiel** kennzeichnen, keine empirischen Behauptungen.

### Danach: "Ein Pfad, mehrere Ebenen"

Neue Grafik einbinden.

Darunter maximal fünf kurze Erklärkarten:

1. **Wirkpfad – Was geschieht oder könnte geschehen?**
2. **IOOI – Wie ordnen wir Ressourcen, Leistungen und Veränderungen?**
3. **Evidenz – Was ist wirklich beobachtet und zurechenbar?**
4. **Bewertung & Schutz – Wie ordnen wir die Veränderung ein und wo sind Grenzen?**
5. **Rückkopplung – Was ändern wir aufgrund dieses Wissens?**

Keine Nummerierung, die eine zeitliche Zwangsfolge suggeriert; Karten als "Blickwinkel / Aufgaben" beschriften.

### "Was IOOI gut kann"

Fair und wertschätzend:
- Projekte und Programme verständlich strukturieren.
- Input, Output, Outcome, Impact auseinanderhalten.
- Indikatoren und Annahmen entlang einer Results Chain ordnen.
- Planung, Monitoring und Evaluation unterstützen.

### "Was IOOI allein nicht festlegt"

Nicht schreiben "kann IOOI nicht". Besser "ist im Akronym / Kernmodell nicht festgelegt":
- welcher Wirkmechanismus gilt,
- wie Kausalität / Beitrag geprüft wird,
- welcher normative Referenzrahmen gilt,
- welche Wirkungsgrenzen nicht kompensierbar sind,
- wie Netto-Wirkung gebildet wird,
- wie systemische und Transformationswirkung gesondert geprüft wird,
- wie bewertete Wirkung in Preis, Steuer, Kapital, Beschaffung, Management oder Politik zurückfließt.

### Eigener Abschnitt "Impact ist nicht Transformationswirkung – aber kann sie berühren"

Copy:

> **Impact ist ein externer, quellenabhängiger Begriff.** Je nach Methode kann er breitere, langfristige oder systemische Veränderungen umfassen. Deshalb wäre es falsch zu sagen, IOOI ende grundsätzlich vor System- oder Transformationswirkung.
>
> Die WÖk setzt an einer anderen Stelle an: Sie macht **Transformationswirkung ausdrücklich zu einer eigenen Prüffrage**. Verändern sich Regeln, Standards, Anreize, Infrastrukturen, Märkte, Machtverhältnisse oder künftige Entscheidungspfade? Und falls ja: in welche Richtung, für wen und mit welcher Evidenz?
>
> Transformation ist damit keine automatische "Stufe nach Impact", sondern eine gesonderte Systemlinse.

### Vergleichstabelle überarbeiten

Spalten:
`Frage | IOOI / Results Chain | WÖk-Wirkungsarchitektur`

Zeilen:
- Hauptzweck
- Darstellungslogik
- Mechanismen / Annahmen
- Evidenz / Zurechnung
- Referenzrahmen / Bewertung
- Nebenfolgen / Grenzen
- System- / Transformationswirkung
- Rückkopplung / Steuerung
- Governance / Versionierung

Bei IOOI fair:
- "kann ergänzt werden / hängt vom Evaluationsdesign ab"
statt pauschal "fehlt".
Bei WÖk:
- "expliziter Bestandteil der Architektur".

---

## 5. Weitere Seiten

### `modell.html`

Aktuell ist der "Grundablauf" zu stark als eine reale Chronologie formuliert.

Ändern:
- "Grundkreislauf" in **"Drei Dinge auseinanderhalten: Pfad, Prüfung, Rückkopplung"** oder vergleichbar.
- Den langen Satz
  `Auslöser → Wirkstoff → Potenzial/Risiko → Wirkmechanismus → Wirkpfad ... → Evidenz ... → Bewertung ...`
  entfernen.
- Inline-SVG `Handlung → Potenzial/Risiko → Zustandsveränderung → Bewertung → Netto-Wirkung → Lenkung → Lernen` nicht mehr als realen Wirkungspfad zeigen.
- Neue Layer-Grafik hier prominent einbinden.
- Die sechs Module der v1.5 als **sechs Aufgaben/Fragen** erklären, nicht als Uhr:
  1. Was könnte passieren und warum?
  2. Was wurde umgesetzt und was hat sich verändert?
  3. Wie belastbar ist das und was ist zurechenbar?
  4. Wie ordnen wir die Veränderung ein?
  5. Welche Neben-, Grenz-, Resilienz- und Systemfragen entstehen?
  6. Was folgt für die nächste Entscheidung und das Lernen?
- Den bestehenden Abschnitt `Vom Maßstab zur Entscheidung` als **operativen Bewertungs-/Implementierungsworkflow** klar beschriften. Er ist nicht der kausale Wirkpfad.
- Vollständige Gesamtmodellgrafik kann bleiben, aber Alt-/Begleittext auf die neue Unterscheidung abstimmen.

### `scripts/site/build-so-wirkt-wirkungsoekonomie.mjs`

Beibehalten: die sechs einfachen Fragen sind didaktisch gut.

Aber explizit davor schreiben:

> **Das sind sechs Prüf-Fragen, keine sechs Stationen, die eine Wirkung der Reihe nach durchläuft.**

Drei Karten umformulieren:
- **Möglicher Pfad:** Auslöser, Mechanismen, Potenziale und Risiken.
- **Results Chain:** IOOI kann Ressourcen, Leistungen und Veränderungen innerhalb des Pfads ordnen.
- **WÖk drumherum:** Evidenz, Bewertung, Schutz, Systemprüfung und Rückkopplung.

Neue Layer-Grafik nach diesen drei Karten einbinden, verkleinert.

### `verstehen/index.html`

Teaser-Karte vereinfachen:

Titel:
`IOOI ist eine Linse auf den Wirkpfad – nicht die WÖk selbst.`

Text:
`IOOI ordnet Input, Output, Outcome und Impact. Die WÖk legt um solche Wirkungspfade zusätzliche Prüfschichten: Mechanismen, Evidenz und Zurechnung, Bewertung, Schutz, Systemwirkung und Rückkopplung.`

Keine Formulierung "WÖk beginnt früher" als Hauptunterschied.

---

## 6. Glossar und Single Source of Truth

Wichtig: Glossarseiten werden generiert. Nicht nur `begriffe/.../index.html` handeditieren.

Relevante Quellen:
- `assets/data/term-registry.json`
- `content/glossary/imports/iooi-wirkungsarchitektur.json`
- `content/glossary/imports/begriffsleitfaden-v1.5.json`
- `scripts/glossary/build-glossary-registry.mjs`
- `scripts/glossary/build-glossary-pages.mjs`

Die spätere v1.5-Ergänzung überschreibt ältere IOOI-Texte. Daher Quelle(n) konsistent ändern und anschließend Glossar neu bauen.

### IOOI

Kategorie/Typ:
- Status: Anschlussbegriff
- Typ: Results-Chain-Methode
- keine Darstellung als WÖk-Grundbegriff.

Neue `woekRelation` sinngemäß:

> **Der Unterschied ist nicht, dass IOOI "erst nach" der WÖk beginnt. IOOI und WÖk beantworten unterschiedliche Fragen. IOOI ordnet eine Results Chain von Ressourcen über Leistungen zu Veränderungen. Ein WÖk-Wirkungspfad kann diese Struktur enthalten. Die WÖk legt zusätzlich Hypothesen und Wirkmechanismen, Evidenz und Zurechnung, Bewertung und Schutz, System- und Transformationsprüfung sowie Rückkopplung und Governance um den Pfad.**

Deep section ersetzen:
- nicht mehr "Vor IOOI / IOOI-Kern / Danach".
- Titel: `IOOI als Linse innerhalb eines Wirkungspfads`
- Items:
  - Results Chain: Input → [Aktivität] → Output → Outcome → Impact.
  - Ex ante darüber: Potenziale, Risiken, Annahmen, Mechanismen.
  - Evidenz darunter: Baseline, Gegenfaktum, Datenqualität, Zurechnung, Unsicherheit.
  - WÖk außen herum: Bewertung, Schutz, System/Transformation, Rückkopplung, Governance.

### Wirkungspfad

Kurzdefinition beibehalten, aber verständlicher erklären:
> **Ein Wirkungspfad zeigt, wie aus einem Auslöser unter bestimmten Bedingungen Veränderungen entstehen könnten oder beobachtet wurden. Er kann IOOI enthalten, ist aber größer als eine Results Chain und kein Kausalbeweis.**

Wichtig:
> **Wirkungspotenzial und Wirkungsrisiko beschreiben, was auf dem Pfad möglich ist. Sie sind keine Stationen des Pfads.**

### Wirkungskette

An v1.5 schärfen:
> **Eine Wirkungskette ist eine bewusst lineare Vereinfachung von Auslösern, Leistungen und Veränderungen. Sobald mehrere Ursachen, Bedingungen, Nebenfolgen oder Rückkopplungen wichtig werden, ist Wirkungspfad oder Wirkungsnetz die passendere Darstellung.**

IOOI als mögliche Results-Chain-Form erwähnen; nicht jede Wirkungskette = IOOI und Wirkungskette != WÖk-Architektur.

### Wirkmechanismus

Ergänzen:
> **Ein Wirkmechanismus ist keine zeitliche Station zwischen Potenzial und Wirkung. Er ist die begründete Erklärung dafür, warum eine Verbindung im Wirkpfad funktionieren könnte.**

### Wirkungspotenzial / Wirkungsrisiko

Ergänzen:
> **Potenzial und Risiko sind ex-ante Aussagen über mögliche Pfade, keine Stationen einer Kausalkette.**

### Input / Aktivität / Output / Outcome / Impact

Als Anschlussbegriffe / Results-Chain-Begriffe einordnen.

Besonders:
- Aktivität ist optional zwischen Input und Output, kein Buchstabe in IOOI.
- Output = Leistung, noch keine WÖk-Wirkung.
- Outcome = kann eine WÖk-Wirkungsebene sein, wenn eine tatsächliche Zustandsveränderung vorliegt; Zurechnung bleibt eigene Frage.
- Impact = quellenabhängig; kann längerfristig, breiter oder systemisch sein; nicht automatisch positiv.

### Transformationswirkung

Bestehende Definition ist im Kern gut.

Ergänzen:

> **Je nach verwendetem Impact-Rahmen kann eine strukturelle Veränderung dort als Impact bezeichnet werden. Die WÖk behauptet deshalb nicht, IOOI könne Transformationswirkung grundsätzlich nicht erfassen. Sie macht Transformationswirkung jedoch als eigene, evidenzpflichtige Systemfrage sichtbar und bewertet ihre Richtung gesondert.**

### Wirkungsbewertung

Führende Formulierung:
> **Transparente Einordnung einer eingetretenen oder ausdrücklich modellierten Zustandsveränderung am offengelegten Referenzrahmen.**

Ex ante immer "modellierte Wirkungsbewertung".

Nicht als zeitlich "nach dem Impact" darstellen.

### Wirkungsarchitektur

Armin-Maiwald-Satz prominent:
> **Der Wirkpfad beschreibt, was in der Welt passieren kann oder passiert. Die Wirkungsarchitektur beschreibt, wie wir diesen Pfad prüfen, bewerten, absichern und in bessere Entscheidungen zurückführen.**

### Wirkungsrückkopplung

Bestehende Definition weitgehend lassen. Querverweise zur neuen IOOI/Wirkpfad-Seite ergänzen.

---

## 7. Visual auf relevanten Seiten verwenden

Neue Grafik mindestens:
1. `/verstehen/iooi-und-wirkungsoekonomie/` – zentral, direkt nach Bus-Beispiel.
2. `/modell.html` – ersetzt die missverständliche serielle IOOI/WÖk-Grafik.
3. `/so-wirkt-wirkungsoekonomie/` – kompakt nach "Wirkpfad/Results Chain/WÖk drumherum".
4. `/begriffe/iooi/` – kleinere Einbindung oder verlinkte Abbildung.
5. `/begriffe/wirkpfad/` – gleiche Grafik oder fokussierte Variante.

Optional:
- `/begriffe/wirkungsarchitektur/`
- `/begriffe/transformationswirkung/` mit fokussiertem Ausschnitt.

Nicht auf jede Glossarseite kopieren; dort lieber Querverweis, wenn keine zusätzliche Erkenntnis entsteht.

---

## 8. Such-/Metadaten-/Terminologie-Audit

Nach Umsetzung repo-weit suchen nach:
- `WÖk erweitert IOOI`
- `Die WÖk beginnt früher`
- `IOOI erklärt den Wirkpfad`
- `Vor IOOI`
- `Danach:.*Transformationswirkung`
- `Input, Aktivität, Output, Outcome und Impact`
- `IOOI-Wirkpfad`
- alten Referenzen auf `woek_wirkungskreislauf_iooi.svg`
- Glossar-Kategorie `IOOI.*Grundbegriff`
- Formulierungen, die Impact pauschal von System-/Transformationswirkung ausschließen.

Historische Publikationen nicht still umschreiben. Nur aktuelle Website-, Glossar-, Such-, KI-/Metadata-Quellen anfassen.

---

## 9. Qualität und Tests

Mindestens:
- `npm run build:iooi`
- `npm run build:so-wirkt`
- Glossar-Registry + Glossar-Seiten neu bauen
- `npm run check:glossary-publication` bzw. vorhandene Glossar-QA
- `npm run check:search`
- Linkcheck / Artifact-Check soweit im Repo vorgesehen
- relevante Unit-/Snapshot-Tests ergänzen.

Neue Tests sollen verhindern:
1. IOOI-Definition mit Aktivität im Akronym.
2. Satz "WÖk erweitert IOOI".
3. serielle Darstellung "Impact → Transformationswirkung" als Pflichtfolge.
4. IOOI-Kategorie als WÖk-Grundbegriff.
5. fehlenden Hinweis, dass die sechs WÖk-Module Aufgaben/Prüffragen und keine zwingende reale Chronologie sind.
6. alte Grafikreferenzen nach Migration.

---

## 10. Abnahmekriterien

Die Umsetzung ist erst fertig, wenn eine Person ohne Vorwissen nach 60–90 Sekunden verstehen kann:

- IOOI ist eine Results Chain.
- IOOI und WÖk starten beide vor eingetretener Wirkung; das ist **nicht** der entscheidende Unterschied.
- Ein Wirkungspfad beschreibt mögliche oder beobachtete Veränderungswege.
- IOOI kann einen Teil dieses Pfads strukturieren.
- WÖk ist keine längere IOOI-Kette, sondern die Architektur um den Pfad.
- Potenzial/Risiko sind ex-ante Einordnungen, keine Pfadstationen.
- Evidenz/Zurechnung sind Prüfschichten, keine späteren Wirkungsstufen.
- Bewertung ist getrennt von Feststellung.
- Transformationswirkung ist keine automatische "Stufe nach Impact".
- WÖk führt geprüfte und bewertete Wirkung zurück in Entscheidungen und lernt aus dem Ergebnis.
- Weder IOOI noch WÖk wird als pauschal "besser" gerankt; der Gegenstand und Funktionsumfang werden sauber getrennt.

## 11. Umsetzungshinweis an Codex

Vor Änderungen:
1. Root-`AGENTS.md` lesen.
2. aktuelle Generatoren und Source-of-Truth-Dateien ermitteln.
3. keine generierten Dateien als alleinige Quelle editieren.
4. historische Dokumente nicht rückwirkend umschreiben.
5. vorhandene externe Quellen (OECD DAC, PHINEO, Bertelsmann, Impact Frontiers) beibehalten und deren Begriffe nicht in WÖk-Terminologie uminterpretieren.
6. Änderungen klein, nachvollziehbar und testbar halten.

Am Ende liefern:
- Liste geänderter Source-Dateien,
- neue/ersetzte Visual-Assets,
- kurze Vorher/Nachher-Erklärung,
- durchgeführte Tests mit Ergebnis,
- alle noch offenen fachlichen Punkte.
