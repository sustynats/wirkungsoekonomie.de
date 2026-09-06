# Wirkungsticker: eigenständige WÖK-Analysen

## Format und Abgrenzung

Eine Wirkungsakte beantwortet, was passiert ist, was belegt ist und welche Folgen plausibel sind. Eine eigenständige **WÖK-Analyse** erscheint nur, wenn sie einen wesentlichen zusätzlichen systemischen Erkenntnisgewinn erzeugt. Sie besitzt eine eigene URL unter `/wirkungsticker/analyse/<slug>/`, eine eigene Recherchebasis und ein versioniertes Claim Ledger. Eine längere Zusammenfassung reicht nicht.

Öffentliche Kennzeichnung:

> WÖK-ANALYSE · Natalie Weber  
> Nach der von Natalie Weber entwickelten Methodik der Wirkungsökonomie

Das freigegebene Portrait liegt als `assets/img/people/natalie-weber-woek-analyse.jpg` vor. Übersicht und Detailseite verwenden dasselbe Bild mit dem Alt-Text „Natalie Weber“.

## Lokaler Trigger und Analysegewinn

`editorialAnalysisAssessment()` prüft alle veröffentlichten Einzel- und Lageakten ohne KI-Aufruf. Der interne `editorial_analysis_score` ist ein Redaktionssignal, keine öffentlich behauptete wissenschaftliche Kennzahl. Er bündelt getrennt:

- Systemrelevanz, Wirkungspotenzial und Wirkungsrisiko;
- beobachtete Wirkung, soweit tatsächlich belegt;
- zweite/dritte Ordnung;
- Transformation, Resilienz und Makroökonomie;
- MPD-Wechselwirkung und Verteilung;
- Diskursrelevanz, Lageaktentiefe und Evidenzqualität.

Zusätzlich muss `analysis_gain` tragen. Hohe Aufmerksamkeit allein genügt nicht. Hoher möglicher Schaden bei geringer Evidenz wird als `research_pending` erhalten, nicht verworfen oder als Wirkung ausgegeben.

Es gibt keine redaktionelle Stückquote. `--limit` ist ausschließlich die technische Batchgröße eines Worker-Laufs. Alle weiteren freigegebenen Kandidaten bleiben in der Queue und werden in nachfolgenden Läufen verarbeitet.

## Recherche- und Evidenzgate

Vor dem KI-Aufruf verlangt `editorialEvidenceGate()` Quellenintegrität, mindestens zwei unterscheidbare Ursprünge, quellengebundene Claims und bei erkennbar primärquellenpflichtigen Gegenständen eine Primärquelle. Ohne ausreichende Basis bleibt die Analyse auf `research_pending`.

Das Recherchepaket nutzt die bereits kontrolliert erschlossenen Quellen und Claims der Story beziehungsweise Lageakte. Zusätzlich prüft der Analyselauf offene Kandidaten gegen den stündlich aktualisierten, registrierten Recherchepool. Nur zeitlich und semantisch passende Dokumente, deren Publisher-, URL- und Story-Zuordnung das Source-Integrity-Gate besteht, dürfen die Recherchebasis erweitern. So kann `research_pending` nach dem Eintreffen einer Primär- oder unabhängigen Fachquelle automatisch in `ready_for_research` wechseln. Es fordert ausdrücklich Gegenbefunde. Externe Texte bleiben untrusted input. Fakten, Beobachtungen, Definitionen, Inferenzen, Potenziale, Risiken, beobachtete Wirkung, Zurechnung und normative Bewertung werden getrennt gespeichert.

Nahezu identische Berichte zum selben Analysegegenstand erzeugen keinen zweiten Deep Dive. Eine konservative, nicht transitive Vorgruppierung bündelt sie nur für die Analyse; die zugrunde liegenden Wirkungsakten und ihre Belege werden dadurch weder überschrieben noch vermischt.

## Daten und lebende Analysen

### Fallbezogen geprüfte Hintergrundrecherche

Zusätzlich zur Ereignisrecherche können explizit redaktionell geprüfte Hintergrunddokumente im vorhandenen `source_snapshot` erhalten bleiben. Die EU-Haushaltsanalyse ist der erste Anwendungsfall. `source_function` trennt Kontext, Gegenquelle, Forschung und Zielreferenz. `editorial_review` bindet die Prüfung an Story-ID, exakte URL, Publisher-Domain, Titel, Datum und den Hash der eigenen Quellenkurzfassung sowie Relevanzbegründung und Grenzen.

`withEditorialResearch()` übernimmt nur diesen geprüften Bestand. Neue Modellantworten dürfen ihn nicht anlegen. Fehlerhafte Bindungen halten eine erneute Analyse zurück. Hintergrunddokumente landen nicht in den Quellen der Ursprungsmeldung, nicht im Ereigniscluster und nicht in einer neuen Polling-Liste. Das ursprüngliche Source-Integrity-Gate bleibt zwingend. Mehrere Dokumente desselben Urhebers zählen nur als ein Ursprung der **Analysebasis**, nicht als unabhängige Bestätigungen des Ereignisses.

Der bestehende Analyseworker verwendet diese Quellen bei späteren Überarbeitungen wieder. Unveränderte Daten erzeugen keinen erneuten KI-Aufruf; neue geprüfte Kurzfassungen verändern den Fingerabdruck. Ältere Studien behalten ihren tatsächlichen Dokumentstand und ihre begrenzte Funktion. Abschnittsbezogene `source_ids` ergänzen die Quellenlinks im Lesetext; das Claim Ledger bleibt erhalten.

### Systemische Betrachtung als Pflichtkern

Die Root-AGENTS.md und `scripts/news/analysis-principles.mjs` verankern die gekoppelte Betrachtung dauerhaft. Die gemeinsame Regel fließt in Nachrichten-/Folgenanalyse, Mediencheck einschließlich Backfill und eigenständige WÖk-Analyse ein. Geprüft werden materielle Zusammenhänge, Rückkopplungen, Kaskaden, Verteilung, Resilienz, zeitliche Verzögerungen und Schadensverlagerung. Sie erzwingt keine erfundenen Wirkpfade, keine Vermischung von Ereignissen und keine zusätzliche kostenpflichtige Runde. Historische Texte werden bei erneuter Prüfung versioniert ergänzt, nicht still überschrieben.

`data/news/editorial-analyses.json` erweitert den bestehenden Nachrichtenbestand. Eine zweite Datenbank oder KI-Schnittstelle existiert nicht. Gespeichert werden Kandidaten, Recherche-/Evidenzstatus, Analyse, Quellen-Snapshot, Claim Ledger, Gegenbefunde, Methodenversion, Kosten- und Versionsdaten.

Beim unveränderten Quellenfingerabdruck ist der Prozess idempotent. Substanzielles neues Material aktualisiert dieselbe Analyse versioniert. Ein anderer Analysegegenstand kann später einen neuen Beitrag auslösen.

## Darstellung, Feed und Reihenfolge

WÖK-Analysen werden als breite, zurückhaltend hervorgehobene Karten gleichmäßig zwischen die Meldungen gestreut - auch wenn mehr als drei gleichzeitig relevant sind. Die Streuung verändert kein Veröffentlichungsdatum. Im Feed stehen Meldungen und Analysen nach ihrem tatsächlichen Veröffentlichungs- beziehungsweise Aktualisierungszeitpunkt. Ursprungsgeschichte und Deep Dive verlinken gegenseitig. Seiten sind indexierbar, canonicalisiert, als `Article` strukturiert und WebApp-/RSS-kompatibel.

## Automatik und Kosten

Der bestehende GitHub-/Oracle-Lauf startet nach dem normalen Nachrichten- und Mediencheck auch `news:editorial-analyses`. Der Monatsdeckel bleibt gemeinsam wirksam. Rechercheaufrufe, Ein-/Ausgabetokens, geschätzte Kosten, Kandidaten, Publikationen und Aktualisierungen werden in `data/news/usage.json` protokolliert. Ein Fehler dieser zusätzlichen Vertiefung blockiert keine bereits belastbare aktuelle Nachricht; der Kandidat bleibt in der Queue.

## Qualität

Vor Veröffentlichung gelten unter anderem: Quellen- und Gegenevidenz, 800 bis 2.100 Wörter, Pflichtabschnitte, quellengebundene Tatsachen, Trennung von Potenzial und Wirkung, keine erfundenen Zahlen, keine Absichtszuschreibung, Self-Frame-Check, keine technischen Interna im Lesertext und konkrete Beobachtungspunkte. Tests prüfen Trigger, Gate, Symmetriegrundsätze, Injection-Grenze, Claim Ledger, Kosten, Idempotenz, Mehrfachverarbeitung bis zur technischen Batchgrenze, Portrait, Rückverlinkung, SEO und Feeds.
