# Parliament-Wirkungsbilder über die bestehende Oracle-/Higgsfield-Strecke

Stand: 5. September 2026.

## Zweck

Die Parliament-Bildstrecke ist kein zweiter Bilddienst. Sie erweitert den bereits
laufenden Oracle-Prozess `faktencheck-bot` und dessen gepinnte offizielle
Higgsfield-CLI um eine streng begrenzte Referenzbild-Funktion. Der erste
freigegebene Vertrag erzeugt genau eine neutrale fiktive Sachsen-Anhalt-Stadt als
Referenz und anschließend sechs Bild-zu-Bild-Varianten für CDU, SPD, Grüne,
Linke, BSW und AfD. Kameraposition, Geometrie, Tageszeit und Wetter bleiben
gleich; nur die im freigegebenen Visual Brief genannten Motive dürfen sich
ändern.

Die Erweiterung legt keine neue OCI-Instanz, Datenbank, Object-Storage-Fläche,
Load-Balancer- oder Netzwerkressource an. Sie läuft in dem vorhandenen
Always-Free-Bestand und verwendet dessen vorhandene lokale Persistenz. Der
Rollout muss deshalb zusätzlich bestätigen, dass weder Shape noch Boot-Volume,
kostenpflichtige Optionen oder Serviceanzahl verändert wurden.

Der Bildoutput bleibt eine modellhafte Ex-ante-Illustration. Er ist keine
Prognose und keine Evidenz. OPEN/NOT_ASSESSABLE wird nicht als eingetretener
Zustand bebildert. Kein Bildwert darf in Fachdata, Richtung, Evidenz, DNS,
Recommendation oder Score zurückgeschrieben werden.

## Verbindlicher Eingabevertrag

Der maschinenlesbare Vertrag liegt unter
`woek-parlament-app/data/impact-visuals/sachsen-anhalt-2026-reference-scene-v1.json`.
Er ist an den bestehenden freigegebenen 12-of-12-Descriptor und die sechs
Programm-Records gebunden. Die Oracle-Route akzeptiert weder Freitext-Prompts
noch Programmtext. Ein Auftrag enthält ausschließlich:

- den exakten Git-Commit,
- den erlaubten Vertragspfad,
- den Vertragshash,
- die ID des Base- oder Variantenobjekts.

Oracle lädt Vertrag und Quell-Descriptor aus genau diesem unveränderlichen
Commit, prüft beide Hash-/Record-Bindungen und baut den Prompt serverseitig aus
dem freigegebenen Vertrag. Drift, zusätzliche Request-Felder oder eine nicht
freigegebene Quelle sperren vor dem kostenpflichtigen Create.

## Laufzeit und Kosten

- bestehender Prozess: `/opt/faktencheck-bot`, Dienst `faktencheck-bot`;
- bestehende CLI und OAuth-Konfiguration bleiben unverändert;
- der vorhandene Lock `data/news-title-images/generation.lock` serialisiert
  Wirkungsticker und Parliament serverweit;
- das vorhandene private Journal `data/news-title-images/credits.json` erfasst die
  Reservierungen beider Workloads;
- Preisprüfung vor jedem Create, höchstens zwei Credits je Bild, kein Nachkauf;
- persistentes Auftragsjournal vor dem Submit; kein blinder Retry;
- ein bestätigter Providerfehler darf nach der vorhandenen Betriebsregel genau
  einen Ersatzversuch erhalten; unklarer Submit, Abbruch oder OCR-Ablehnung nie;
- Base muss gespeichert, hashgleich und durch das Textfreiheitsgate gegangen
  sein, bevor eine Variante erzeugt werden kann.

Die sieben Candidate-Bilder gehen zunächst ausschließlich in ein GitHub-Actions-
Artefakt. Sie verändern weder Parliament-Fachdata noch den öffentlichen
Descriptor und lösen keinen Vercel-Build aus. Erst ein separater Source-Fidelity-
und Visual-QA-Commit darf die sechs bisherigen Programm-v2-Assets durch
Referenzbild-v3 ersetzen. Die sechs eigenständigen Case-Bilder bleiben
unverändert.

## Oracle-Rollout

Vor dem Rollout aktuellen Serverstand sichern und fremde Änderungen erhalten.
Die Backend-Erweiterung wird drift-erkennend und im Standardmodus schreibgeschützt
mit `scripts/parliament/impact-visuals/install-oracle-route.mjs` vorbereitet. Das
Skript akzeptiert nur den bereits dokumentierten Titelbild-Serverstand; bei
abweichendem oder mehrdeutigem Quelltext bricht es ab. Vor `--apply` ist ein
neues, explizites `--backup`-Verzeichnis verpflichtend. Zusätzlich müssen diese
Repository-Dateien in die vorhandene `news-media`-Kopie übertragen werden:

- `scripts/parliament/impact-visuals/reference-scene-contract.mjs`
- `scripts/parliament/impact-visuals/oracle-higgsfield.mjs`
- die aktualisierte Datei `scripts/news/title-image/higgsfield.mjs`

Der Server-Transform wird zuerst ohne `--apply` ausgeführt. Erst nach Backup und
erfolgreicher Driftprüfung folgt derselbe Aufruf mit `--apply --backup=<pfad>`.

Danach auf Oracle: Typecheck, bestehende API-Tests, Build und Neustart des einen
vorhandenen Dienstes. Abnahme ohne Bildbestellung:

1. `/healthz` liefert 200;
2. `/api/news-title-image` ohne Token liefert weiterhin 403;
3. `/api/parliament-impact-visual` ohne Token liefert 403;
4. authentifiziertes GET der Parliament-Route bestätigt gepinnte CLI und Modell,
   erzeugt aber kein Bild;
5. Wirkungsticker-Nachrichtenlauf und Fallback bleiben grün;
6. gemeinsamer Lock und gemeinsames Reservierungsjournal sind beschreibbar und
   nicht öffentlich.

## GitHub-Ausführung

Workflow `.github/workflows/parliament-impact-visuals.yml` ist nur manuell oder
als explizit aufgerufener `workflow_call` startbar. Standard `execute=false`
validiert lediglich den exakten sauberen Commit und den Vertrag. `execute=true`
ruft die geschützte Oracle-Route seriell in der festen Reihenfolge Base → sechs
Varianten auf. Das Ergebnisartefakt enthält die sieben Bytes und
`reference-scene-results.json` mit Commit-, Vertrags-, Prompt-, Job-,
Referenz- und Asset-Hashes; interne Prompts, OAuth-Daten und Serverpfade bleiben
privat.

## Künftige Wahlprogramme

Neue Programme dürfen diese Strecke erst erreichen, wenn vorgelagert alle
folgenden Zustände maschinenlesbar erfüllt sind:

1. finales kanonisches Quellenartefakt mit Hash und Locator;
2. vollständige source-bound Fachklassifikation;
3. explizit ausgewählte, freigegebene Wirkpfade;
4. freigegebener Visual Brief mit nichtvisuellen Grenzen und Alt-Text-Basis;
5. eigener versionierter Referenzbildvertrag auf einem exakten Git-Commit.

Source Discovery oder neue Programmtexte dürfen Bildkandidaten vorbereiten, aber
niemals selbst Fachrichtung, Evidenz, Materialität, DNS, Recommendation, Score
oder sichtbare Zustandsänderung erzeugen. Fehlt eines der fünf Gates, bleibt der
Datensatz ohne Bildauftrag offen. Ein Kandidat wird nicht allein durch erfolgreiche
Generierung öffentlich.

Die tägliche offizielle Quellenbeobachtung darf neue Wahlprogramme autonom
entdecken und als unveränderte, hashgebundene Quellenartefakte vormerken. Eine
Generierung wird jedoch erst nach dem vollständigen delegated WÖk review und
einem daraus versionierten Visual-Vertrag automatisch ausführbar. Damit bleibt
der Hintergrundprozess dauerhaft handlungsfähig, ohne Quelle, Bildmodell und
Fachurteil zu vermischen oder bei bloßer Discovery Credits auszugeben.
