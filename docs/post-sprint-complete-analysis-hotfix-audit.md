# Post-Sprint Complete Analysis Hotfix Audit

Stand: 22. Mai 2026

## Ziel

Gezielter Korrekturlauf nach vollständiger Website-Analyse. Keine neuen Bereiche, keine Löschung von Inhalten, keine Entfernung von Audio, Downloads, Anwendungen, Natalie-Weber-Inhalten oder der Seite zur Wirkung politischer Sprache.

## Startseite

- Der obere Bereich wurde geprüft: Direkt unter dem Hero stehen keine mehreren großen Modellgrafiken mehr.
- Die Startseite folgt jetzt der ruhigeren Dramaturgie: Hero, neuer Kompass, In 5 Minuten verstehen, Für wen, Modell kurz, Anwendungen, Natalie/Buch/Akademie/Blog.
- "Kapital misst Bewegung. Wirkung zeigt Richtung." ist nicht mehr Startseiten-Hauptlogik. Es erscheint nur noch als erklärender Merksatz in Vertiefungskontexten.
- In diesem Hotfix wurden keine weiteren Startseiten-Grafiken entfernt; der bereits entzerrte Zustand wurde bestätigt. Verbleibende Medien auf der Startseite sind spätere Inhaltsmedien wie Natalie-Porträt, Buchcover und Blogbilder, nicht Modellposter im Einstiegsbereich.

## /verstehen.html

- Der Einstieg wurde neu geführt: nicht mehr über "Kapital misst Bewegung", sondern über die Grundfrage, was sich wirklich verändert - für Menschen, Planet und Demokratie.
- Wirkung wird neutral erklärt: positiv, negativ oder neutral.
- Wirkungspotenzial wird von eingetretener Wirkung getrennt.
- Positive Netto-Wirkung wird als Zielgröße benannt.
- Rückkopplung wird als Mechanik sichtbar gemacht.
- Einfache Beispiele wurden ergänzt: T-Shirt, politische Sprache, Unternehmen.
- Der alte Merksatz bleibt nur als nachgelagerte Formelbox erhalten.

## Begriffskorrekturen

Korrigiert wurden Zielgrößenformulierungen, bei denen "positive Wirkung" gemeint war, aber "positive Netto-Wirkung" die korrekte WÖk-Logik ist:

- `wirkungsoekonomie.html`
- `vergleich.html`
- `buch.html`
- `methodik/datenbasis.html`
- `methodik/daten-standards-regularien.html`
- `fuer/mieter.html`

Prüfung:

- Keine Treffer mehr für `Positive Wirkung zahlt`, `positive Wirkung belohnt`, `positive Wirkung erzeugen`, `Positive Wirkung wird`, `positive Wirkung soll` in den gezielt geprüften Kernseiten.

## Öffentliche Statuslabels

Rohe interne Statuswerte wurden aus öffentlichen Zielgruppenseiten entfernt oder ersetzt:

- `Status: needs_review` erscheint auf den geprüften öffentlichen Kernseiten nicht mehr sichtbar.
- Sensible Seiten nutzen professionelle Hinweise wie `Konzeptstand`, `Fachliche Prüfung läuft`, `keine Anlageberatung` oder `keine Leistungszusage`.

Betroffene Seiten:

- `fuer/investoren.html`
- `fuer/gesundheit.html`
- `fuer/rente.html`
- `fuer/wirkungseinkommen.html`
- `fuer/wissenschaft-forschung.html`

## /fuer/-Blocks

Der mechanische Standardblock "Warum ESG, Reporting, Nachhaltigkeit oder Reparaturpolitik nicht ausreichen" wurde zielgruppenspezifisch ersetzt:

- Unternehmen: Warum ESG und Reporting nicht reichen
- Politik: Warum Reparaturpolitik und Ressortlogik nicht reichen
- Bürger:innen: Warum moralische Appelle nicht reichen
- Mieter:innen: Warum Mietrecht, Förderung und Sanierungspflichten allein nicht reichen
- Investor:innen: Warum ESG-Ratings und Renditelogik nicht reichen
- Kommunen: Warum Ressortsilos und Projektförderung nicht reichen
- Journalismus: Warum Faktencheck allein nicht reicht
- Akademie: Warum Wissen allein nicht reicht
- Wissenschaft: Warum Publikationen und Drittmittel nicht reichen
- Gesundheit: Warum Reparaturmedizin allein nicht reicht
- Rente: Warum Beitragssätze, Lebensarbeitszeit und klassische Kapitaldeckung nicht reichen
- Wirkungseinkommen: Warum Erwerbsarbeit als alleinige Einkommensbasis nicht reicht

Zusätzlich wurden die zugehörigen Erklärungstexte zielgruppenspezifisch geschärft, damit die Seiten weniger mechanisch und weniger ESG-lastig wirken.

Die Generatorvorlage `tools/generate_fuer_pages.py` wurde ebenfalls angepasst, damit spätere Regenerierung die alte Standardüberschrift, interne `needs_review`-Statuswerte und generische ESG-Absätze nicht wieder in die Seiten schreibt.

## Rechner-UI

### Wirkungsrente

- Eingaben wurden in Feldgruppen gegliedert.
- Eine Formelbox wurde ergänzt.
- Ergebnisbox und Modellhinweis wurden professioneller gesetzt.
- Default-Werte bleiben als Arbeitspapierstand markiert.
- Stichprobe: Rechner gibt Einkommenspunkte `0,7` und Modellrente `2.309 €` aus.

### Wirkungseinkommen

- Bruttovolumen und Finanzierungsstack wurden in Feldgruppen gegliedert.
- Eine Formelbox wurde ergänzt.
- Inputfelder für Finanzierungsbausteine behalten Datenstatus-Auswahl.
- Ergebnisbox und Modellhinweis wurden professioneller gesetzt.
- Stichprobe: Bruttovolumen bei 83 Mio. Menschen und 2.000 Euro monatlich = `1.992.000.000.000 €`.

## Kompass-UI

- Oben wurden drei echte Antwortkarten sichtbar ergänzt:
  - Was bedeutet Wirkung?
  - Was ist positive Netto-Wirkung?
  - Warum ist die WÖk keine Planwirtschaft?
- Jede Karte enthält Kurzantwort, Ein-Satz-Formel, Wirkungspfad, zentrale Begriffe, Quellenbasis und Links.
- Prominente unfertige Transkripthinweise wurden durch dezente Statushinweise ersetzt.

## Scanner-UI

- Scanner-Modi werden als Karten dargestellt, nicht mehr als zusammengezogene Textzeile.
- Eingabe und Demo-Ausgabe bleiben sichtbar.
- Datenqualität A-F, Quellenpanel und WÖk-Gegenfrage bleiben Bestandteil der Ausgabe.
- Status bleibt MVP / wirkungsökonomische Ersteinschätzung.
- Stichprobe: Klick auf `Produkt` aktiviert den Produktmodus und zeigt die Apfel-Demo mit Datenqualität und WÖk-Gegenfrage.

## Politische Sprache

- Die Seite bleibt öffentlich erhalten und wurde nicht entfernt oder versteckt.
- Overclaiming wurde reduziert: Wo kein Wirkungsnachweis vorliegt, werden `Wirkungspotenzial` und `Resonanzrisiko` verwendet.
- `negative Wirkung entfalten` wurde in den geprüften Passagen ersetzt.
- Der JavaScript-Fallback `Narrativdaten werden geladen` wurde durch eine statische Übersicht ersetzt.
- Begriffskarten im statischen Fallback enthalten Materialstand und Wirkungsstatus als Pilotanalyse / Wirkungspotenzial.
- Diagramme wurden in diesem Hotfix nicht gelöscht.

## Evidenz

- Der Evidenz-Hub wurde konkreter.
- Unter den Denkräumen wurde `Konkrete Quellen ansehen` ergänzt.
- Quellenkarten enthalten Autor/Institution, Werk/Rechtsakt/Studie, Jahr, Rolle für WÖk, gestützte Aussage und Grenzen.

## Suche

- Suchfilter sind standardmäßig eingeklappt.
- `Filter anzeigen` öffnet die Vollfilter.
- `Top-Treffer` ist als reduzierte Standardansicht sichtbar.
- Suchindex wurde neu gebaut: 217 Suchentries aus 197 HTML-Seiten plus 47 kuratierte Einträge.

## Audio-Transkripte

- Prominente unfertige Hinweise wurden abgeschwächt.
- Fehlende Transkripte bleiben als dezenter Transkriptstatus markiert.
- Audio-Dateien und Player wurden nicht entfernt.

## Technische Stichprobe

Geprüfte Seiten lokal unter `http://127.0.0.1:8765/`:

- `index.html`
- `verstehen.html`
- `kompass.html`
- `anwendungen/scanner.html`
- `fuer/rente.html`
- `fuer/wirkungseinkommen.html`
- `sdg-plus/medien-demokratie/wirkung-politischer-sprache.html`
- `suche.html`

Ergebnis:

- H1 vorhanden.
- Kein sichtbares `needs_review`.
- Kein alter politischer-Sprache-Fallback.
- Kein prominenter alter Transkripthinweis.
- Kein horizontaler Overflow in der Stichprobe.
- Scanner-Karten, Rechner und reduzierte Suche funktionieren in der Stichprobe.

## Offene Punkte

- Vollständige visuelle QA aller Seiten bleibt ein eigener Abnahmeschritt.
- Einzelne ältere Blog- und Archivtexte enthalten weiterhin historische Formulierungen zu positiver Wirkung; dieser Hotfix hat die aktuellen Kernseiten und gezielt betroffenen Seiten korrigiert.
- Die politische Sprachseite sollte in einem späteren Feinschliff weiterhin auf Diagrammlegenden und vollständige Quellenangaben je Begriff geprüft werden.
- Audio-Transkripte sind erhalten, aber nicht überall vollständig ausgearbeitet.
