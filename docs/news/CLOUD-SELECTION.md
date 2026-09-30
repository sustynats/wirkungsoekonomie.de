# Cloud-Vorauswahl vor der Artikel-API

Stand 30.09.2026. Implementierung und Produktion sind getrennt.
Die Produktionsvariable bleibt ungesetzt; kein Zeitplan wurde aktiviert.

## Befund

Die Sammlung verwendet die bestehende Source Registry plus Media Registry.
Frei zugängliche und rechtlich zugelassene Zugänge, Robots/RSL, Zeitstempel,
Feedgrößen und bounded excerpts bleiben Voraussetzung. Es gibt bereits Heise-
und Manager-Magazin-Zugänge. WirtschaftsWoche ist trotz Eintrag in der
Media Registry über source_overrides deaktiviert (RSS 404). Handelsblatt ist
nicht automatisch zugelassen; STARTUP-DISCOVERY.md dokumentiert die Grenze.
Semantische Auswahl kann fehlende oder gesperrte Zugänge nicht ersetzen.

Die enge Vorauswahl liegt bislang bei preAnalyzeStory, Discovery Admission,
Schwelle 30, queuePriority, balanceEventQueue und partitionAiQueue.
scoreEvent enthält +8 für acute safety und .05-Gewichte für Quellendiversität
und Verbreitungstempo. partitionAiQueue reserviert einen Sicherheitsplatz.
Diese Regeln können lokale Gewaltereignisse begünstigen. Ihr Bestehen ist
Codebefund, kein gemessener Nachweis der tatsächlichen Themenverteilung.
Sie bleiben im bisherigen Betrieb erhalten; der Cloud-Pfad verwendet die
semantische Rangfolge ohne diese Boni/Reservierungen.

Clustering, Ereignisidentität und Fortschreibungen existieren bereits.
Andere Überschriften und gleicher Ort allein sind keine sichere Identität.
Veröffentlichte Texte, IDs, Historien und Artikel-API-Konfiguration bleiben
erhalten. Unsichere Cloud-Umleitungen werden abgewiesen; kein automatischer
Merge veröffentlichter Artikel.

## Kleiner Adapter im vorhandenen Lauf

cloud-selection.mjs definiert den fehlenden Auswahlvertrag; vorhandene
Nachrichtenkandidaten, Source-IDs, story_id/event_id, State und Versionspfade
bleiben maßgeblich. Keine zweite Queue, Dropbox-Aktivierung oder Contentstruktur.

Snapshot: neue/veränderte Kandidaten sowie bestehende Wiederaufnahmefälle,
vor enger Schlagwortauswahl und lokaler Dublettenabweisung. Jede Quellenzeile
enthält ID, Titel, Datum, URL, verfügbaren begrenzten Auszug und Hash.
Clustering bleibt vorläufig: erkennbare Fehlcluster müssen zurückgestellt
werden, der Adapter spaltet keine veröffentlichten Akten.
Der kompakte Vergleich enthält veröffentlichte reguläre Ereignisse,
Versionsstand, Inhaltsbindung und Quellenlinks. Auszüge werden als gekürzt
gekennzeichnet. Bekannte unveränderte Meldungen werden über seen_items nicht
erneut entdeckt; aktuelle Backfills und wartende Fälle sind ausdrücklich
sichtbar. manual_only und Buch/Autorenaufträge sind ausgeschlossen.

Der Hash bindet Lauf, Snapshot, Quellen und Vergleichsstand. Vollständige
Entscheidungen für alle Kandidaten und vollständige reviewed_candidate_ids
sind erforderlich. Teilresultate, doppelte IDs, erfundene Quellen/Ereignisse,
Artikelrückgaben, neue Bestandsversionen und veränderte Kandidaten werden
abgewiesen. Gültigkeit höchstens zwei Stunden ab Snapshot, ohne Warteketten.
Ein Snapshot kann eine unvollständige Quellenbeobachtung enthalten; Coverage
benennt Abrufausfälle, nicht fällige oder nicht neu geladene Feeds.
complete=true im Ergebnis bedeutet vollständige Sicht auf das gelieferte
Paket, nicht Vollständigkeit aller Medien.

new und update gelangen ausschließlich durch die vorhandenen Quellenintegritäts-,
Eingangs-, Kosten-, Wiederholungs- und Veröffentlichungsgates. Der Cloud-Pfad
überschreibt weder Modell noch Budget noch Artikelinhalt.
Update verwendet vorhandene story_id, event_id und slug; Quellen und
Versionshistorie bleiben erhalten. Neue Informationen und Auswahlgründe
liegen im Runreport und Entscheidungsjournal.
Verarbeitete Resultate erhalten einen State-Beleg; identische Wiederholung
liefert keine Auswahl, widersprüchliche Wiederholung scheitert.
Die vorhandenen bezahlten Eingabe-Fingerprints bleiben zusätzlicher Schutz.

Wenn WOEK_NEWS_CLOUD_SELECTION_ENABLED=true gesetzt ist, fehlt ohne ein
gültiges Resultat die Freigabe für den Lauf. Kein stiller bezahlter Fallback.
Solange die Variable ungesetzt bleibt, arbeitet der bestehende Betrieb
unverändert. Importfehler sind sichtbar und benötigen einen frischen Export
oder Quellenaufbereitung. Keine ungeprüfte Verwendung alter Resultate.

## Kostenfreier Test und Vergleich

```sh
node scripts/news/cloud-selection-cli.mjs export /tmp/cloud-selection/snapshot.json
node scripts/news/cloud-selection-cli.mjs check /tmp/cloud-selection/snapshot.json /tmp/cloud-selection/result.json
node --test tests/news/cloud-selection.test.mjs
npm run news:test
npm run news:validate
git diff --check
```

Export stoppt vor Budget-FX, Artikelabruf, Modell und Repositoryschreiben.
check setzt AI_ENABLED=false und dryRun; zusätzlich verbietet der Runner
bezahlte Aufrufe im Cloud-Dryrun. Keine Artikel oder Veröffentlichung.

Neben dem Export entsteht snapshot.json.baseline.json, an denselben Inputhash
gebunden: bisherige lokale Reihenfolge, Themen/Quellenanzahl und erste vier
mit bestehenden Reservierungen. Dies ist ein Vergleich der redaktionellen
Auswahl vor Kosten-/Integritätsgates, keine Behauptung tatsächlicher bezahlter
Produktionsauswahl. Die Regression prüft eine unter der lokalen Schwelle
liegende Einzelquellenmeldung, die den Cloud-Rückweg erreicht.
Weitere Fixtures prüfen Wiederholung, syndizierte Kopien, substantielles
Update, zwei Ereignisse am gleichen Ort, veraltete/unvollständige Rückgabe
und wiederholten Import. Fixtures sind vorgegebene Referenzentscheidungen,
kein Test einer tatsächlich ausgeführten Luna-Vorauswahl.

PR quality enthält einen eigenen kostenfreien Node-22-Job für Syntax,
git diff --check, Adapter/Runner-Roundtrip und vorhandenen Datenvalidator.
Die vollständige bestehende Nachrichtensuite bleibt im vorhandenen PR-Gate.
package.json bietet für dieses JavaScript-System keinen allgemeinen
Typecheck- oder Lint-Befehl; Syntaxprüfung ist kein Ersatz für einen vorhandenen
Typecheck. Website- und News-Builds sind für den Adapter selbst nicht nötig;
das vorhandene breite PR-Gate kann sie unabhängig ausführen.

## Wiederkehrender Betrieb: Voraussetzungen und Einrichtung

Die tatsächlichen Lagen stehen in lage.mjs: 06:00/12:00/18:00 Europe/Berlin;
Morgenfenster ab 18:00 Vortag, Mittag ab 06:00, Abend ab 12:00.
schedule.mjs/Workflow sammeln daneben häufiger und haben andere technische
Slots. Keine Frequenz- oder Budgetänderung in diesem Patch.
Ein UTC-Cron allein bildet die Berliner Sommerzeit nicht ab.

1. Zuerst Node-/Runner-Roundtrip und Nachrichtensuite grün prüfen.
2. Einen begrenzten echten Kandidatensnapshot über den bestehenden GitHub-
   Runner oder vorhandenen OCI-Worker exportieren. Snapshot und Baseline
   in vorhandener privater OCI-Ablage oder zugriffsgeschütztem GitHub-Artefakt
   dauerhaft bereitstellen, nicht im öffentlichen Content oder Volltextarchiv.
   Dateiwrites verwenden exklusiven Modus; unveränderliche Exporte wiederverwenden.
3. Die tatsächlich verfügbare Codex-Cloud-Zeitplanfunktion prüfen. Routine:
   GPT-6 Luna, hoher Denkaufwand, Standardgeschwindigkeit, drei Berliner Termine.
   Die in dieser Sitzung verfügbare ChatGPT-Automations-Schnittstelle hat
   KEINE Modell-/Denkaufwand-/Geschwindigkeitsparameter. Sie belegt keine
   steuerbare Codex-Cloud-Implementierung. Promptmodellnamen sind kein Nachweis.
   Ohne nachweisbare Einstellung bleibt Aktivierung blockiert; kein Sol/Astra-
   Wechsel und kein API-Ersatz. Die einmalige Einrichtung ist ein anderer Auftrag.
4. Routineprompt aus CLOUD-SELECTION-PROMPT.md einmal als feste Arbeitsanweisung
   hinterlegen. Nur Nachrichtenpaket und bekannte Ereignisse bereitstellen;
   keine wiederholte Repo-Erkundung, Builds oder Codeänderungen.
5. Repräsentative echte Pakete mit Luna gegen menschliche Referenzentscheidungen
   prüfen: Themenverteilung, relevante Einzelquellen, new/update/repeat/defer,
   Fehlzusammenführungen und Gründe. Tatsächliche Modellkonfiguration,
   Dauer, Kontingentverbrauch und verfügbare Usage-Metadaten dokumentieren.
   Der technische Fixturetest belegt weder Luna-Qualität noch Luna-Verbrauch.
   Stärkere Einstellung nur bei belegtem Qualitätsproblem vorschlagen.
6. Dauerhaften Rückgabeweg auf dem vorhandenen GitHub-/OCI-System einrichten
   und mit tatsächlichem Speichern/Readback/Import testen. Kein Mac und kein
   neuer Vercel-Dienst. Snapshot und Resultat sind Datenartefakte des bestehenden
   Laufs, keine Artikelqueue. Dieser Patch implementiert den Datei-Adapter,
   aber keinen nachgewiesenen gehosteten Codex-Scheduler oder OCI-Uploaddienst.
7. Nach grünem echten Ende-zu-Ende-Lauf UND ausdrücklicher Nutzerbestätigung
   im bestehenden API-Lauf WOEK_NEWS_CLOUD_SNAPSHOT_FILE und
   WOEK_NEWS_CLOUD_RESULT_FILE auf exakt die überprüften Dateien setzen.
   Erst dann WOEK_NEWS_CLOUD_SELECTION_ENABLED=true setzen. Beide Dateien
   sind zwingend gemeinsam erforderlich; laufender Hash/Bestandsvergleich
   erfolgt auch im Import. Vor Serienbetrieb Importlatenz unter zwei Stunden
   und Snapshot-Stabilität über reale Sammlungszyklen nachweisen.
8. Unveränderte Eingaben nicht neu bewerten: Paket samt result.json aufbewahren,
   gleiche Eingangs-/Vergleichsbindung wiederverwenden. Der Einrichtungsworker
   darf keinen neuen Modellauftrag nur wegen eines neuen Zeitplantermins erzeugen.
   Die Routine bekommt keine Implementierungswerkzeuge. Bereits im State
   verbuchte Resultate werden nicht erneut an die Artikel-API übergeben.

Aktivierung benötigt weiter einen tatsächlich funktionierenden dauerhaften
Dateitransport und einen nachweisbar passend konfigurierten Scheduler.
Der Adapter allein ist keine Automation. Ein strenger frischer
Kandidaten-/Bestandsvergleich kann nach zwischenzeitlichen Sammeländerungen
einen erneuten Snapshot nötig machen; dafür gibt es keinen bezahlten Fallback.

## Kontingent und Kosten

Cloud-Vorauswahl verbraucht das tatsächliche Codex-/ChatGPT-Kontingent des
gewählten, belegbar konfigurierten Produkts. Keine neu angebundene LLM-API.
Die vorhandene Luna-Artikel-API bleibt kostenpflichtig und nutzt weiterhin
ihre unveränderten Modell-, Budget-, Stunden- und Freigaberegeln.
Keine Behauptung kostenloser Artikelproduktion. Der Fixture-/Dryrun ruft
weder diese API noch einen weiteren LLM-, Embedding- oder Suchdienst auf.
