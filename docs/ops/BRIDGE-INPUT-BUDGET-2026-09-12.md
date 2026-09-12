# Recherchepakete: API- und Dropbox-Limit trennen

Stand: 12.09.2026

Der Importlauf 34672049855 dokumentierte für eine aktuelle Meldung eine
technische Eingabesperre: Der verlustfrei komprimierte Quellenkatalog brauchte
20.897 Zeichen, während nach den verpflichtenden Regeln und Schemata nur
18.412 Zeichen im früheren API-Promptbudget verblieben. Der Artikel erhielt
deshalb keinen neuen Rechercheauftrag, obwohl die Verarbeitung über die
private Dropbox-Dateibrücke lief. Das war keine redaktionelle Ablehnung.

Sowohl die Kandidatenvorprüfung als auch die eigentliche Bridge-Paketerzeugung
verwenden jetzt ausdrücklich den Transport `dropbox_chatgpt_bridge`.
Dieser hat ein begrenztes Promptbudget von 64.000 Zeichen. Die API behält
ihre bisherigen Grenzen von 39.000 Zeichen mit optionalen Visuals bzw.
44.000 Zeichen ohne sie. Kein Anbieteraufruf und keine Kostenfreigabe wird
dadurch aktiviert. Die bestehenden Bridge-Schema- und Dateigrößenlimits gelten
zusätzlich unverändert.

Quellen, Herkunft, Widersprüche, verpflichtende Redaktionsregeln und
Publikationsgates bleiben erhalten. Passt ein Paket auch in die neue Grenze
nicht, bleibt es zur Bearbeitung gespeichert. Bestehende fachliche
Entscheidungen werden nicht ersetzt. Technische Größenstopps werden bereits
durch die vorhandene Retry-Logik erneut geprüft.

Zusätzlich werden explizite Crawl-Wartezeiten nicht länger durch vorherige
Fehlversuche exponentiell verlängert. Ein zweiminütiges Publisher-Fenster
wird im nächsten regulären Fünfminutenzyklus erneut geprüft; längere
vorgegebene Wartezeiten bleiben vollständig erhalten. Tatsächliche Ausfälle
behalten ihren Backoff. Bereits gespeicherte Fristen werden nicht nachträglich
verkürzt, wenn deren ursprüngliche Vorgabe nicht mehr nachweisbar ist.

Prüfung: 1.086 Nachrichten- und Betriebsprüfungen erfolgreich; Typecheck,
Lint und Nachrichten-Build erfolgreich. Neue Tests prüfen den vollständigen
Quellenkatalog in der Bridge, die unveränderte API-Grenze, die endliche
Bridge-Grenze, die erneute Kandidatenzulassung ohne API-Aufruf sowie die
fortbestehenden Sperren für geheime URLs und manuelle Inhalte. Ein erfolgreich
übermitteltes Recherchepaket ist noch keine veröffentlichte Nachricht.
# Shared Oracle queue access

The 04:40 UTC import (34673617077) and 04:35 UTC discovery (34673419897)
failed together at 04:42:36 UTC. The import queue response was truncated at
3,934,587 bytes; subsequent queue/release requests returned HTTP 502. This
proves concurrent failures, not an out-of-memory diagnosis without server logs.

Import, discovery and the health monitor now share a job-level GitHub resource
guard. Existing distinct workflow-level groups still coalesce redundant clock
triggers per lane. The shared guard uses `queue: max` and never cancels an active
job, so one lane does not evict another waiting lane. This serializes server
access while retaining the independent database lane/claim identities, source
discovery and publication gates. Content ordering remains unchanged.

This is a containment measure. It does not replace the prepared server-side
pagination release, restore a blocked management connection, or prove article
throughput. A monitor can wait behind an import; GitHub run failures remain
visible independently. Verify subsequent complete import/discovery runs and
actual publications before claiming recovery.

GitHub documents the shared job-level queue behavior at
https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency.

Hosting checks were executed before workflow edits. The repository cost guard
passed. The existing Vercel account audit reports Pro/Observability as an open
cost-policy issue; this change uses existing GitHub/Oracle only, does not build
on or alter Vercel and creates no paid infrastructure.
