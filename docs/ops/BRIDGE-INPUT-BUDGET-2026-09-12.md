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

Prüfung: 1.085 Nachrichten- und Betriebsprüfungen erfolgreich; Typecheck,
Lint und Nachrichten-Build erfolgreich. Neue Tests prüfen den vollständigen
Quellenkatalog in der Bridge, die unveränderte API-Grenze, die endliche
Bridge-Grenze, die erneute Kandidatenzulassung ohne API-Aufruf sowie die
fortbestehenden Sperren für geheime URLs und manuelle Inhalte. Ein erfolgreich
übermitteltes Recherchepaket ist noch keine veröffentlichte Nachricht.
