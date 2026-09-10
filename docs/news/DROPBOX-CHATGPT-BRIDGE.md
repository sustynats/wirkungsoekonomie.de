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

GitHub Actions recherchiert um **:45** und importiert um **:30**. ChatGPT verarbeitet
zur vollen Stunde (Europe/Berlin). Die volle Stunde und die Minutenlage bleiben
bei der Zeitumstellung passend; Sperrschlüssel verwenden absolute UTC-Stunden.
GitHub-Zeitpläne können sich verzögern. Die Oracle-Ausfallreserve weckt denselben
Workflow; sie ist kein zweiter Publisher. Der ChatGPT-Stundenlauf ist eine eigene
cloudseitige Aufgabe und muss separat eingerichtet und funktional geprüft sein.
Der Serverzeitplan allein startet keine ChatGPT-Bearbeitung.

Die Oracle-Reserve läuft im Bridge-Betrieb nur um **:35 und :50**. Dazu wird
`scripts/ops/woek-wirkungsticker-clock-bridge.conf` als systemd-Timer-Drop-in
`/etc/systemd/system/woek-wirkungsticker-clock.timer.d/bridge.conf` installiert.
So kann kein alter :05-Lauf den :30-Import derselben Stunde vorwegnehmen.
GitHub installiert ImageMagick und Tesseract für vollständiges PNG-Decoding und OCR.

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

Die GitHub-Concurrency-Gruppe `wirkungsticker-main` umfasst den gesamten
Veröffentlichungslauf. Zusätzlich hält Oracle eine SQLite-Schreibsperre und einen
dauerhaften Eigentümernachweis mit GitHub-Run-ID. Keine zeitlich ablaufende Lease
erlaubt blind einen zweiten Schreiber. Ein verwaister Eigentümer wird erst
freigegeben, wenn GitHub den Run als abgeschlossen bestätigt. Bei GitHub-Ausfall
bleibt die Sperre geschlossen. Erfolgreiche Phasen-Stunden werden nicht wiederholt.

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
Auftrag und mittlere Laufzeit. Ab zwei Stunden Rückstand wird gewarnt. Dropbox-
Fehler brechen ohne API-Fallback ab und erscheinen im privaten Journal sowie im
GitHub-Laufergebnis. Bestehende Quellenüberwachung bleibt aktiv.

## Rückwechsel

Erst nach ausdrücklicher Aufhebung des Kostenstopps: laufende Bridge-Aufträge
abschließen/halten und Betriebsvariablen auf `api` und `higgsfield` setzen.
Die explizite Caddy-Sperre für `/api/news-analysis*` und `/api/news-title-image`
entfernen, Konfiguration validieren und Caddy neu laden. Vorherige Konfiguration:
`/etc/caddy/Caddyfile.before-news-bridge-20260910`. Keine Kostenjournale zurücksetzen;
bestehende Budgets und reservierte Anfragen bleiben maßgeblich. Dropbox und SQLite
bleiben als Historie erhalten. Kein Code-Rückbau erforderlich.
Zusätzlich den systemd-Timer-Drop-in `bridge.conf` entfernen und mit
`systemctl daemon-reload` sowie Timer-Neustart den bisherigen Takt wiederherstellen.
