# Sparbetrieb ohne Nachrichtensperre

Stand: 9. September 2026. Keine Budgeterhöhung, kein neuer Anbieter und keine
Änderung des Veröffentlichungsmaßstabs. Der normale Nachrichtenworker läuft
unverändert vor den unabhängigen Hintergrundschritten.

## Drei getrennte Wege

1. Neue Nachrichten und materielle Updates: bestehender direkter Nachrichtenweg.
2. Automatische zeitunkritische Autorenanalysen: vorhandener Batch-Adapter.
   Die bisherige Eignungsprüfung bleibt bestehen: veröffentlichter geprüfter
   Ausgangspunkt, kein wartendes Nachrichtenupdate, mindestens 24 Stunden seit
   neuestem Quellen-/Artikelstand, keine Dringlichkeit oder nahe Ereignisfrist.
   Bis dahin bleibt die Vertiefung vorgemerkt; die Nachricht ist bereits live.
   Hinzu kann das bestehende Batch-Verarbeitungsfenster von bis zu 24 Stunden
   kommen. Bei laufend neuem Material ist dies keine feste Lieferfrist.
3. Ausdrückliche Aufträge: gespeicherte priorisierte Anfrage zur gewählten Akte.
   Ohne bereits bezahlten passenden Batch-Auftrag kann sie synchron bearbeitet
   werden. Vorhandene laufende Aufträge werden nicht doppelt bezahlt. Budget,
   Quellenintegrität, Evidenz, Analysegewinn und Publikationsgates gelten weiter.

Die Repository-Variable `WOEK_NEWS_BATCH_ENABLED` bleibt aktiv. Wird sie
deaktiviert, warten nur automatische zeitunkritische Vertiefungen; das schaltet
weder Nachrichten noch ausdrückliche Aufträge ab. Eine belegte nahe Frist oder
explizite Dringlichkeit erlaubt weiterhin die synchrone Vertiefung.

## Eigene Nachrichten und Themen bleiben möglich

Ein Link oder Thema der Inhaberin wird weiterhin recherchiert und über den
bestehenden geprüften redaktionellen Eingang `scripts/news/publish-reviewed.mjs`
veröffentlicht. Fertige beauftragte Kommentare/Sonderanalysen verwenden weiterhin
`scripts/news/publish-editorial-review.mjs`. Sie werden vom automatischen
Standardanalyseworker nicht umgeschrieben. Keine neue UI und kein automatisches
Übernehmen unbelegter Behauptungen aus einem eingesandten Link.

Für eine automatische Vertiefung einer bereits veröffentlichten Akte:

```sh
npm run news:editorial-analyses -- --execute --background-only --request=wt-EXAKTE-STORY-ID
```

Alternativ das neue Workflow-Eingabefeld `editorial_requested_story_ids` nutzen
(kommagetrennte echte IDs, höchstens 20). Keine Zugangswerte in Kommandozeilen
oder Dateien eintragen. Die bestehende authentifizierte Workflow-Umgebung
übernimmt den Aufruf; normale Folgeläufe benötigen keinen Rechner der Inhaberin.

Der Auftrag bleibt in `editorial_requests` der bestehenden Analyseverwaltung:
`queued`, `research_pending`, `quality_hold`, `commissioned_review_required`
oder `published`. Er geht durch einen Neustart, eine Budgetablehnung oder die
technische Auswahlgrenze nicht verloren. Eine unveränderte bereits fertige
Analyse wird auch bei erneuter Anfrage nicht kostenpflichtig dupliziert.
Geschützte Sonderanalysen bleiben im ausdrücklich beauftragten Review-Verfahren.

## Weniger Neugenerierung

- `research_fingerprint` bindet die tatsächlich gelieferte Recherche,
  Quelleninhalte, Claims und inhaltliche Ausgangsanalyse. Bloße Zeitstempel der
  Verarbeitung und Darstellungs-Versionen erzwingen keine neue Langtextanalyse.
  Neue Quellen, korrigierte Claims und geänderte Einordnungen bleiben Auslöser.
  Alte Publikationen bleiben unverändert; für sie gilt zunächst der bisherige
  Fingerprint, bis eine echte Aktualisierung den neuen Nachweis speichert.
- Bei isolierten Metadaten-/Self-Frame-Fehlern korrigiert der direkte Weg nur
  die ausdrücklich freigegebenen Felder. Der volle Quellenkontext bleibt im
  Auftrag; Manuskript, Ledger und Autorenperspektive werden nicht neu ausgegeben.
  Zusätzliche oder fehlende Patch-Felder werden abgelehnt. Anschließend läuft
  wieder das vollständige Publikationsgate. Bei umfassenden inhaltlichen Mängeln
  ist weiterhin eine volle Korrektur erforderlich.
- Ein Provider-Aufruf hat nur einen Transportversuch. Technische Wiederaufnahme
  erfolgt nachvollziehbar über die bestehende Warteschlange, nicht als versteckte
  Mehrfachanfrage innerhalb desselben Aufrufs. Unklare Kosten bleiben reserviert.
- Nach zwei erfolglosen Qualitätszyklen desselben recherchierten Stands bleibt
  die Vertiefung sichtbar im Qualitäts-Hold. Das ist keine Löschung und keine
  Sperre der Ursprungsgeschichte. Neue Recherche oder ein neuer ausdrücklicher
  Auftrag ermöglichen eine erneute Prüfung. Budgetablehnungen zählen nicht als
  Qualitätsfehler; bereits bezahlte Batch-Ergebnisse bleiben abrufbar.
- Nicht freigegebene Langtextentwürfe werden für diese Optimierung nicht im
  öffentlichen Repository gespeichert. Die gezielte Korrektur nutzt denselben
  Worker-Lauf. Batch behält seine vorhandenen privaten, idempotenten Jobjournale.

## Messung statt Sparversprechen

Laufberichte zählen `full_generations`, `targeted_repairs`,
`unchanged_research_skipped`, `background_waiting` und `quality_held`.
Kosten sämtlicher bezahlter Versuche bleiben in der Abrechnung, auch bei
Ablehnung. Batch-Reservierung ist keine abgeglichene Ausgabe und ein angelegter
Auftrag keine Veröffentlichung. Der Hintergrund-Batch-Tarif halbiert nicht
automatisch die Gesamtkosten je Nachricht. Vier Cent bzw. 0,50-1 EUR täglich
bleiben zu prüfende Routineziele, keine nachgewiesenen Ergebnisse.

## Veröffentlichung und Rückfall

Bestehendes GitHub-Pages-/Oracle-System, keine Vercel-Erweiterung. Lokaler
Hosting-Guard bestanden. Der separat gelesene Vercel-Kontostatus erfüllt das
0-EUR-Ziel noch nicht; diese Änderung erzeugt dort keinen Build oder Verbrauch.
Für den Vollrelease wird zusätzlich die fehlende Vergleichsreferenz des
Historien-Gates begrenzt nachgeladen, ohne den exakten Release-Commit zu ändern
oder das Gate zu überspringen. Keine unbeschränkte Historien-/Binärdateiladung.

Regressionen prüfen gezielte Korrektur und Scope-Injection, vollständige
Nachvalidierung, unveränderte/neue Evidenz, dauerhafte Aufträge, Priorität,
Quellen- und Budget-Holds, begrenzte Qualitätswiederholung, bezahlte
Batch-Wiederaufnahme, unveränderten Nachrichtenschritt sowie einen echten
flachen Git-Checkout mit späterem Main-Stand. Hinzu kommen der vollständige
News-/Monitor-Testlauf, Syntax-/Typecheck, News-Build und Bestandsvalidierung.

Ein Rückfall betrifft nur diese Code-/Workflowänderung, niemals eine ältere
Kopie der inzwischen fortgeschriebenen Quellen-, Artikel-, Auftrags- oder
Kostenjournale. Bereits bezahlte Hintergrundjobs werden weiter abgeholt.
