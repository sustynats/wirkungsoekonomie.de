# Meinung & Analyse über die bestehende Dropbox-Bridge

Vertrag: `editorial-analysis-contract-1.json`, ergänzend zum unveränderten Nachrichtenvertrag Bridge-3.

Discovery prüft vorhandene veröffentlichte Nachrichten mit der bisherigen redaktionellen Recherche, Quellenprüfung und Auswahl. Maximal zwei geeignete Analyseaufträge pro Durchlauf gelangen in dieselbe Inbox; gemeinsame Kapazität, Discovery-Lock und Quellenfingerprints gelten weiterhin. Geschützte manuelle Manuskripte und bestehende beauftragte Beiträge bleiben ausgeschlossen.

ChatGPT erkennt `job_type=editorial_analysis`, prüft Output/ACK und verschiebt den Input von `00_INBOX` nach `10_CLAIMED`. Verbindlich ist der vollständige `analysis_prompt` im unveränderlichen Input. Die dortige native Analyse wird im unten definierten Transportfeld `editorial_analysis` zurückgegeben, ohne den nativen `analyses`-Umschlag. Weder eine Nachricht noch ein Bildauftrag wird daraus erzeugt. Keine KI-API und kein ChatGPT-Bild.

Das finale Paket ist `20_OUTPUT_READY/<JOB_ID>.output.json`, atomar zuletzt geschrieben. Es enthält `schema_version`, identische `job_id` und `input_hash`, `processed_at`, `decision` und bei publish die vollständige `editorial_analysis`. Hold/reject benötigen eine konkrete Begründung. Keine Quellen erfinden; alle source_ids müssen dem Quellenpaket entsprechen. Gegenbefunde, Unsicherheiten, Self-Frame-Check und alle nativen Evidenz- und Qualitätsregeln gelten. Die in der ursprünglichen Analysevorlage geforderte persönliche Perspektive darf keine erfundenen persönlichen Erlebnisse oder Positionen enthalten.

Der Importer prüft zusätzlich den aktuellen Quellen-, Recherche- und Vorgängerstand. Veröffentlichung nutzt den bestehenden Speicher `data/news/editorial-analyses.json` und den vorhandenen Renderer unter `/wirkungsticker/analyse/`. Bereits erfolgreich geschriebene Ergebnisse werden anhand ihrer Job-/Output-Bindung wiedererkannt. ACK folgt erst auf den dauerhaften Git-Publikationsschritt. Testjobs bleiben ausschließlich im privaten Staging, mit ACK `staged` und ohne öffentliche URL.

Schema- und redaktionelle Qualitätsfehler gehen über die vorhandene begrenzte Korrekturschleife zurück. Veraltete Quellen oder ungültige Bindungen werden nicht durch Modellkorrekturen übergangen. Die Stundenautomatik und die getrennten Discovery-/Importer-Zeitpläne bleiben unverändert.
