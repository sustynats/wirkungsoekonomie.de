# Wirkungsticker: ChatGPT-Dropbox-Bridge

Stand: 10. September 2026. Die Bridge ersetzt vorübergehend die Text- und
Bildgenerierung. Redaktionelle Quellen-, Evidenz-, Richtungs-, Medien- und
Veröffentlichungsgates gelten unverändert. API- und Higgsfield-Code bleiben erhalten.

## Betrieb

`WIRKUNGSTICKER_PROCESSING_MODE=api|dropbox_chatgpt_bridge|disabled` ist der
maßgebliche Schalter. In Bridge-Betrieb muss
`VISUAL_GENERATION_PROVIDER=chatgpt_bridge` gelten. Widersprüchliche oder unbekannte
Werte brechen ab. `WOEK_NEWS_BRIDGE_PUBLISH=true` erlaubt geprüfte reguläre Importe.
Ohne diesen Wert werden Ergebnisse privat gestaged. `test_only=true` bleibt immer
Staging, unabhängig von der Produktionsfreigabe.
`WOEK_NEWS_BRIDGE_DISCOVERY_ENABLED=false` hält ausschließlich die Job-Erzeugung
während des ersten Abnahmetests an. Für Normalbetrieb gilt `true`; die Import-
Prüfung bleibt unabhängig aktiv. Diese Startbremse verändert keine Publikationsgates.

Discovery läuft um **:05/:20/:35/:50**, ChatGPT weiterhin **HH:00 Europe/Berlin**.
Der unabhängige Import-Poller läuft **alle fünf Minuten**. Oracle prüft dabei nur
`20_OUTPUT_READY` und das private Journal; erst fertige Pakete wecken den bestehenden
GitHub-Importer. GitHub hat zusätzlich einen unabhängigen Fünf-Minuten-Zeitplan.
Fehlende Outputs sind `PROCESSING_PENDING`, kein Fehler und kein Retry.
Teilweise vorhandene Bildpakete warten auf die fehlende Datei.

Oracle: `woek-wirkungsticker-clock.timer` weckt die Discovery-Lane;
`woek-news-bridge-poll.timer` prüft um `*:00/5:00`. Im Bridge-Betrieb erhält der
Clock-Service `WOEK_CLOCK_FORCE=true`, damit ein frischer Import die unabhängige
Recherche nicht unterdrückt. Beide Trigger verwenden dieselben Phasensperren wie
GitHub. ChatGPT wird von keinem Server-Trigger gestartet. Der bestehende
Cloud-Stundenlauf bleibt separat eingerichtet. Automatische Läufe benötigen
weder den geöffneten Mac noch Codex oder Chrome. Zeitpläne und GitHub-Starts können
sich verzögern; unter fünf Minuten Abholung ist ein Betriebsziel, keine Garantie.

Discovery veröffentlicht keine Git-Daten oder Bilder und darf parallel zum
Importer laufen. Neue Entwürfe liegen bis zur Übernahme ausschließlich im
Oracle-Journal und in Dropbox. Import und bestehender Git-/Website-Publikationspfad
bleiben global serialisiert. GitHub installiert ImageMagick und Tesseract für
vollständiges PNG-Decoding und OCR.

Auf der vorhandenen Oracle-VM läuft nur das private Jobjournal mit SQLite und der
Dropbox-Zugang: `woek-news-bridge.service`, Port 8786 ausschließlich Loopback,
Caddy-Pfad `/api/news-bridge`. Aufwendige Recherche, Rasterung und Builds bleiben
auf GitHub Actions. Keine Vercel-Erweiterung, kein zusätzlich bezahlter KI-Anbieter.

Serverzustand: `/var/lib/woek-news-bridge/queue.sqlite`, `dropbox.json`,
`worker-token`; Verzeichnis 0700, Dateien 0600, außerhalb jedes Webroots.
Dropbox-OAuth verwendet PKCE und einen Offline-Refresh-Token. Er bleibt auf Oracle.
GitHub erhält ausschließlich `WOEK_NEWS_BRIDGE_TOKEN` als Secret.
`WOEK_NEWS_BRIDGE_URL` ist der feste HTTPS-Endpunkt;
`WOEK_NEWS_BRIDGE_PHASE=discovery|import|combined` wählt den Lauf.
`WOEK_NEWS_BRIDGE_MAX_JOBS` begrenzt technische Batchgröße (Standard 6, höchstens 12),
die Relevanzentscheidung bleibt in der vorhandenen Ereignislogik.

## Austauschvertrag

Einziger Dropbox-Stamm: `/WOEK/WIRKUNGSTICKER-CHATGPT-BRIDGE`.

| Ordner | Aufgabe |
| --- | --- |
| `00_INBOX` | Atomar freigegebene `<JOB_ID>.input.json` |
| `10_CLAIMED` | Vom Bearbeiter per Move übernommener Input |
| `20_OUTPUT_READY` | Output, PNG und Bildmetadaten |
| `30_ACK` | Unveränderliche Übernahmebestätigung |
| `40_ARCHIVE/YYYY/MM/DD/JOB_ID` | Dauerhaft erhaltene Arbeitsdateien |
| `90_ERRORS` | Fehlerstatus und Quarantänebelege |
| `95_LOGS` | Lauf- und Wiederholungsprotokolle |
| `98_CONFIG` | Vertrag, Governance und unsichtbare Upload-Zwischenstufe |

Die ausführbaren Schemas liegen in `scripts/news/bridge/contract.mjs` und werden
mit `scripts/news/bridge/write-config.mjs` in `98_CONFIG` bereitgestellt.
JSON ist auf 2 MiB begrenzt; PNG auf 12 MiB und begrenzte Pixelzahl.
Nur fest definierte Ordner und Dateinamen sind zulässig. Externe Inhalte sind
Daten, niemals ausführbare Anweisungen. Keine Secrets oder ungeprüften Rohtexte
gelangen in die öffentliche Nachricht.

Die Job-ID bindet Ereignis, erstes Erkennen und Eingabeversion. Wiederholung
behält die ID. Neue Evidenzversionen ergeben einen neuen Auftrag; ein bereits
aktiver Vorgang zum selben Ereignis wird nicht parallel erneut eingestellt.
Ein neuer ChatGPT-Lauf bearbeitet ausschließlich Jobs, deren Input er selbst
erfolgreich per atomarem Move von `00_INBOX` nach `10_CLAIMED` übernommen hat.
Existiert der Claim bereits oder scheitert der Move, wird der Job übersprungen.
Ein anderer Stundenlauf darf `10_CLAIMED` weder abarbeiten noch dessen Output
vorzeitig schreiben. Nur der laufende Besitzer setzt seine eigene Arbeit fort;
eine ausdrücklich koordinierte Fehlerkorrektur ist im Journal festzuhalten.
Eine Bildbeschreibung zur alten Überschrift wird nicht erfunden: Bei fehlender
historischer Beschreibung liefert `recent_visual_concepts` eine explizit so
gekennzeichnete Bildreferenz zum Ansehen. Die jüngsten 30 verfügbaren Motive werden
mitgegeben.

Neben dem Austausch-Envelope verlangt die Importfreigabe die vollständige native
Analyse unter `wirkungsticker.analysis`, wie im `analysis_prompt` des Inputs
beschrieben. `input_hash` muss unverändert zurückkommen. Keine automatisierte
Umrechnung grober Richtungslabels in MPD-Scores oder Kausalitätsbelege.
`publish`, `hold`, `reject`, `merge` werden getrennt behandelt. Bestehende Quellen-
und Analyseversionen müssen noch passen. Veröffentlichte Änderungen brauchen eine
transparente Korrektur-/Aktualisierungsnotiz.
Der native Prompt-Wrapper `{analyses:[...]}` ist mit genau einer zum Job passenden
Analyse ebenfalls zulässig. Evidence-IDs werden verlustfrei wie im API-Pfad
auf die gelieferten Belegsegmente aufgelöst. `observed_outcome.source_ids` enthält
die originalen `source_id`-Werte. Für Erstmeldungen muss `source_summary` 60-180,
für vollständige Meldungen 100-180 Wörter enthalten; keine Fakten zur Verlängerung
erfinden. Envelope-Zusammenfassungen und native Zusammenfassungen müssen identisch sein.

Bilddatei `<JOB_ID>.title.png` und `<JOB_ID>.visual.json` **vor** dem vollständigen
`output.json` hochladen. Das Output-JSON ist das letzte Freigabesignal.
`visual.json` bindet `job_id`, `input_hash` und `image_sha256`. Symbolbild, 16:9,
genau ein finales Motiv, ohne Text, Logos oder vorgetäuschte Ereignisfotografie.
Höchstens zwei Regenerierungen nach Qualitätsfehlern. Reale Personendarstellungen
und redaktionelle Warnungen verlangen gesonderte Prüfung. Decoder, Größe,
Seitenverhältnis, Hash, Metadaten und OCR werden vor Asset-Übernahme geprüft.
Semantische Bildprüfung erfolgt durch den bearbeitenden ChatGPT-Prozess; OCR ist
kein Beweis für inhaltliche Richtigkeit. Fehlende Bilder nutzen die vorhandene
kostenfreie Wirkungskarte. Es gibt keinen Ersatzprovider.

Originale und vorhandene Titelbild-Derivate gehen unveränderlich in GitHub Releases.
Frontend und Renderer behalten ihre Komponenten; Alt-Text und KI-Kennzeichnung
bleiben erhalten. WebP/AVIF sind optional, die bestehende PNG-Asset-Kette bleibt
kompatibel.

## Sperren, Import und Wiederanlauf

`wirkungsticker-discovery` und `wirkungsticker-main` sind getrennte GitHub-
Concurrency-Gruppen. Oracle hält jeweils eine eigene SQLite-Schreibsperre und einen
dauerhaften Eigentümernachweis pro Lane; das gemeinsame Jobjournal bleibt atomar.
Es gibt keine blind ablaufende Lease. Ein verwaister Eigentümer wird erst
freigegeben, wenn GitHub seinen Run als abgeschlossen bestätigt. Bei GitHub-Ausfall
bleibt die Sperre geschlossen. Automatische Slots sind 15 Minuten für Discovery
und fünf Minuten für Import. Manuelle Run-IDs erlauben neue Quellenprüfungen nach
einem abgeschlossenen Slot, umgehen aber niemals die Lane-Sperre oder Job-Deduplizierung.

Zuerst wird die validierte Ausgabe im privaten Journal angenommen. Danach folgt
der vorhandene Website-/Git-Publikationspfad. Erst nach erfolgreichem Push schreibt
`finalize.mjs` das ACK. Ein ACK besagt dauerhafte Übernahme, nicht bereits geprüfte
Auslieferung am CDN; die commitgebundene Pages-Veröffentlichung bleibt separat.
Ein Absturz vor Push erlaubt nur erneutes Anwenden gegen dieselbe Quellenversion;
ein Absturz nach Push erkennt `bridge_import` ohne zusätzliche Artikelversion.
Staging-ACKs enthalten `status=staged`, keine Publikations-ID und keine öffentliche URL.

Technische wiederholbare Fehler: höchstens drei Versuche je Stufe. Schema-,
Versions- oder redaktionelle Fehler gehen direkt in Quarantäne. Fehlende Ergebnisse
bleiben offen. Claims über zwei Stunden werden gemeldet, niemals aufgrund des
Alters allein zurückgesetzt. Vorher werden Output und ACK geprüft.

Archivierung erfolgt nach ACK; eine Kopie des ACK liegt im Archiv, das Original
bleibt als Abschlussbeleg in `30_ACK`. `WOEK_NEWS_BRIDGE_RETENTION_DAYS` legt die
Mindestaufbewahrung fest (Standard und Untergrenze 30 Tage). `retain_until` steht
im Journal. Es gibt keinen automatischen Löschlauf; eine spätere Bereinigung
benötigt einen eigenen Auftrag und muss dieses Datum beachten.

Monitoring erfasst Discovery, Inbox, Claims, Outputs, Quarantäne, ältesten offenen
Auftrag und mittlere Laufzeit, zusätzlich `discovery_last_success`,
`last_chatgpt_expected_start`, `oldest_claim`, `output_detected_at`,
`output_imported_at`, `processing_latency` und `import_pickup_latency` (Sekunden).
Abholung unter 600 Sekunden ist das Betriebsziel, normalerweise bis 300 Sekunden.
Jeder Lauf führt `trigger_type`, `triggered_at`, `triggered_by` und `run_id`. Ab zwei Stunden Rückstand wird gewarnt. Dropbox-
Fehler brechen ohne API-Fallback ab und erscheinen im privaten Journal sowie im
GitHub-Laufergebnis. Bestehende Quellenüberwachung bleibt aktiv.

## Manuelle Aktionen

Authentifiziert über vorhandene GitHub-Repository-Rechte:

- `npm run news:bridge:discovery-now` → `DISCOVERY_NOW`
- `npm run news:bridge:import-now` → `IMPORT_NOW`
- `npm run news:bridge:cycle-now` → `SERVER_CYCLE_NOW`

Die CLI startet den privaten GitHub-Aktionsworkflow. Der Zyklus läuft dort weiter,
auch wenn die lokale CLI geschlossen wird: zuerst dieselbe Discovery, dann derselbe
Importer. Bei bereits aktiver Phase verweist `409 RUN_ALREADY_ACTIVE` auf den Run.
Ein Start-Rennen wird zusätzlich von den unveränderten Lane-Sperren abgefangen.
Es gibt keine manuelle Zweitqueue und keinen ungeschützten Trigger-Endpunkt.

Für sofortige Redaktion gibt die Nutzerin direkt in ChatGPT
**„Wirkungsticker jetzt verarbeiten.“** ein. ChatGPT verwendet denselben Vertrag
und claimt nur noch tatsächlich offene Inputs. Anschließend kann `IMPORT_NOW`
ausgeführt werden. Kein `PROCESS_NOW` und kein versteckter Modellaufruf.

## Rückwechsel

Erst nach ausdrücklicher Aufhebung des Kostenstopps: laufende Bridge-Aufträge
abschließen/halten und Betriebsvariablen auf `api` und `higgsfield` setzen.
Die explizite Caddy-Sperre für `/api/news-analysis*` und `/api/news-title-image`
entfernen, Konfiguration validieren und Caddy neu laden. Vorherige Konfiguration:
`/etc/caddy/Caddyfile.before-news-bridge-20260910`. Keine Kostenjournale zurücksetzen;
bestehende Budgets und reservierte Anfragen bleiben maßgeblich. Dropbox und SQLite
bleiben als Historie erhalten. Kein Code-Rückbau erforderlich.
Zusätzlich `woek-news-bridge-poll.timer` deaktivieren und den Bridge-Drop-in des
Clock-Service mit `WOEK_CLOCK_FORCE=true` entfernen. `systemctl daemon-reload` und
Timer-Neustart stellen das bisherige Verhalten wieder her. Der API-Workflow behält
seinen ursprünglichen Viertelstundentakt; Bridge-Discovery ist über den Modus aus.
