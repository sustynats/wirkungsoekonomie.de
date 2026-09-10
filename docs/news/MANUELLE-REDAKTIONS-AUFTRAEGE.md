# Manuelle Redaktionsaufträge

Ein manueller Auftrag ist eine konkrete Einreichung der Nutzerin: eine Nachricht,
ein Quellenhinweis, eine Fragestellung, ein Manuskript oder eine eigene Beitragsidee.
`DISCOVERY_NOW`, `IMPORT_NOW` und `SERVER_CYCLE_NOW` sind lediglich technische
Laufaktionen. Sie ersetzen diese inhaltliche Einreichung nicht.

## Eingabe im Gespräch

Die Nutzerin kann den Auftrag direkt in Codex oder ChatGPT formulieren. Kein
JSON, keine Kommandozeile und kein zusätzliches Formular sind erforderlich.
Für einen bearbeitbaren Auftrag werden aus dem Gespräch übernommen:

- Beitragsart: Nachricht, Buch & Wirkung, Meinung & Analyse oder zunächst Recherche.
- Material: Links, Quellen, Text, Manuskript oder Buchangaben; Unbekanntes offen lassen.
- Arbeitsauftrag: Was soll geprüft, beantwortet oder ausgearbeitet werden?
- Dringlichkeit und gegebenenfalls Bezug zu einem vorhandenen Beitrag.
- Gewünschtes Ergebnis: Entwurf, redaktionelle Übernahme eines fertigen Textes
  oder ausdrücklich beauftragte Veröffentlichung nach den bestehenden Prüfungen.

Eine Idee allein ist kein Veröffentlichungsauftrag. Die im Gespräch erteilte
Freigabe gilt weiter; sie wird nicht durch einen zusätzlichen Bestätigungsschritt
ersetzt. Eigene Ansichten der Autorin werden nur aus ihren Angaben übernommen.

Beispiele:

> Dringende Nachricht: [Link und Hinweis]. Bitte prüfen und als Ticker-Meldung
> verarbeiten. Falls schon ein Beitrag existiert, diesen aktualisieren.

> Buch & Wirkung: [Buch und Material]. Bitte [einen Entwurf erarbeiten / meinen
> beigefügten fertigen Text unverändert übernehmen]. Schwerpunkt: [Fragestellung].

> Meinung & Analyse: Mich beschäftigt [Thema]. Meine Position ist [eigene
> Gewichtung]. Bitte die Fakten prüfen und daraus zunächst einen Entwurf erstellen.

## Bestehende Wege verwenden

**Nachrichten:** Quellen prüfen, existierende Story, Event-Fingerprint und aktive
Bridge-Jobs abgleichen. Ein fertiges Nachrichtenpaket verwendet denselben
`bridgeInput`-/`enqueue`-Weg und dieselbe Discovery-Sperre wie reguläre Funde.
Es gibt keine manuelle Zweitqueue. Ein beliebiger Link wird nicht allein durch
die Einreichung zur verifizierten oder dauerhaft freigeschalteten Quelle.
ChatGPT verarbeitet einen fertigen Auftrag im vorhandenen Bridge-Vertrag;
`IMPORT_NOW` übernimmt das vollständige Paket nach den normalen Gates.

**Meinung & Analyse:** Beauftragte Beiträge verwenden das vorhandene
Review-Format in `content/news/reviews/` und `publish-editorial-review.mjs`.
Der derzeitige Adapter verlangt eine verifizierte veröffentlichte Ursprungsstory.
Fehlt dieser Bezug, bleibt die Idee zunächst ein Recherche-/Redaktionsentwurf;
es wird keine erfundene Ursprungsnachricht angelegt, um das Gate zu umgehen.

**Buch & Wirkung:** Das bestehende manuelle Content-System in
`content/news/manual/` und der Formatstandard `BUCH-UND-WIRKUNG.md` gelten.
Neue Entwürfe können auf ausdrücklichen Auftrag im Gespräch erarbeitet werden.
Bereits freigegebene Originalmanuskripte bleiben unverändert; Bücher werden
nicht als automatische News-Kandidaten oder als künstliche MPD-Bewertung importiert.
Offizielles Verlagscover und vorhandenes Autorinnenportrait bleiben die Bildregel.

Die allgemeinen News-Bridge-Schemata werden nicht als bereits implementierter
Universalimport für Rezensionen oder Meinungsbeiträge ausgegeben. Diese Formate
haben bereits eigene Content-Adapter und fachliche Prüfungen, verwenden aber
den gemeinsamen Website-Build und die bestehende serialisierte Veröffentlichung.

## Zeitplan und Kosten

Die manuelle Einreichung ändert keinen Zeitplan: Discovery :05/:20/:35/:50,
ChatGPT HH:00 Europe/Berlin, Importprüfung alle fünf Minuten. Für Eilfälle stößt
die Nutzerin ChatGPT direkt an. Der Server startet weder einen zusätzlichen
ChatGPT-Lauf noch einen kostenpflichtigen KI-Anbieter.
