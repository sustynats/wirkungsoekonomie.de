# AGENTS.md

Diese Datei ist die dauerhafte Arbeitsanweisung fuer Codex-Aufgaben in diesem Repository.

## Grundsaetze fuer Website-Aufgaben

- Lies zuerst die vorhandene Projektstruktur und verwende das bestehende Content-System.
- Wenn Inhalte aus Markdown, MDX, JSON, YAML, einem Headless CMS oder Content Collections generiert werden, lege neue Inhalte dort an.
- Wenn die Website statisch aus HTML, Templates und Build-Skripten besteht, nutze diese Templates und Generatoren statt hart codierter Sonderseiten.
- Verwende vorhandene Frontmatter-Strukturen, Navigation, Sidebar-Logik, SEO-Metadaten, Komponenten, CSS-Tokens und Build-Skripte.
- Ergaenze Navigation, Footer, interne Links, Suchmetadaten und Suchindex, wenn eine neue oeffentliche Seite entsteht.
- Halte neue Komponenten klein, wiederverwendbar und generisch genug fuer spaetere Seiten.
- Fuehre vor Abschluss Build- und Qualitaetspruefungen aus und stelle beauftragte Website-Aenderungen live.
- Pruefe nach dem Deployment die Live-URL und relevante Such-/Navigationspfade.

## Gate 11 – Publikationsintegritaet

- Build-Integritaet ist nicht Live-Integritaet. Eine Veroeffentlichung ist erst abgeschlossen, wenn der Produktionsstand von aussen gegen die autoritative Fachquelle geprueft wurde.
- Verlangt ein Release eine vollstaendige Fachquelle oder 1:1-Publikation, muss jeder nicht-leere, zur Veroeffentlichung bestimmte Source-Pfad oeffentlich zugaenglich sein. Eine Kurzansicht darf ergaenzen, aber die Vollquelle nicht ersetzen.
- Fallback-Texte duerfen nur bei tatsaechlich fehlenden oder null gesetzten Feldern greifen. Ein vorhandener Source-Wert darf weder ueberschrieben noch semantisch verallgemeinert werden.
- Unbekannte Schemaformen muessen Build oder Test fehlschlagen lassen, statt still auf generischen Text zurueckzufallen.
- Jede veroeffentlichte Fachakte erhaelt ein Production-Integrity-Manifest mit Source-Hash, Pflichtpfaden, gerenderten Pfaden, fehlenden Pfaden, Fallback-Ueberschreibungen und kanonischer Vollquellen-URL.
- Freigabebedingung: `missing_paths = 0`, `fallback_overwrites = 0` und bestandener externer Produktions-Crawl.

## Inhaltliche Leitlinie Wirkungsökonomie

- Wirkung ist neutral und relational.
- Wirkung bedeutet tatsächliche Veränderung von Zuständen.
- Wirkung, Wirkungspotenzial und Wirkungsrisiko werden klar unterschieden.
- Positive Wirkung wird am Referenzrahmen SDGs, Agenda 2030 und SDG+ bewertet.
- Wenn eine Zielgroesse gemeint ist, verwende positive Netto-Wirkung.
- Wirkung, Wirkungspotenzial, Wirkungsrisiko, Netto-Wirkung, Transformationswirkung, Wirkungslenkung und Wirkungsarchitektur duerfen nicht vermischt werden.
- Wirkstoff darf nur als Analogie verwendet werden.
- Bei Sprache und Medien vorsichtig von Wirkungspotenzial, Resonanzraum und Wirkpfad sprechen.
- Reichweite ist nicht Wirkung.
- Reporting ist von Rueckkopplung zu unterscheiden.
- Nichtkompensation und Reverse Merit Order sind zu nennen, wenn Steuerungslogik, Bewertung oder Priorisierung beschrieben werden.
- Die WÖk ist keine Planwirtschaft, keine Sprachpolizei und kein Social-Credit-System.
- Keine Personenbewertung, keine moralische Rangliste von Menschen, kein Social Credit.
- Modellhafte Inhalte bleiben als Modell, Demo, Entwurf oder Arbeitspapier gekennzeichnet.
- Seiten sollen auch fuer Menschen verstaendlich sein, die die Wirkungsökonomie noch nie gehoert haben.

## Umsetzung neuer Erklaerseiten

Wenn keine geeigneten Komponenten vorhanden sind, koennen kleine wiederverwendbare Bausteine angelegt werden:

- ImpactProcess
- ExampleCards
- MythRealityGrid
- DefinitionCard
- FeedbackLoop

Diese Bausteine sollen generisch bleiben und nur die Inhalte der jeweiligen Seite als Daten erhalten.

## Publikationsvertrag fuer Parlamentsakten

- Jede Parlamentsentscheidung besitzt zwei Ebenen: eine verstaendliche Detailansicht und eine kanonische vollstaendige Fachakte.
- Die Vollakte wird direkt aus der freigegebenen vollstaendigen Fachquelle erzeugt und von der Detailansicht sichtbar verlinkt.
- Nichtkompensierbare Grenzen werden vollstaendig und bedeutungsgleich gerendert. Bei vorhandenem Wert ist ein generischer Ersatz verboten.
- `impact_domains` werden sowohl als `string[]` als auch als `object[]` semantisch korrekt ausgegeben; unbekannte Formen sind ein Fehler.
- Bei bestaetigten Entscheidungen wird der gepruefte Vote-Layer als Sachverhalt veroeffentlicht. Fraktionsangaben werden niemals zu Individualstimmen umgedeutet.
- Direction und Evidenz bleiben technisch getrennt. `AMBIVALENT` darf nicht als Fallback fuer `OPEN` oder geringe Evidenz verwendet werden.
