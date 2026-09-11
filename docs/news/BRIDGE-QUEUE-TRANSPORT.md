# Begrenzter Transport der privaten Warteschlange

Am 11. September 2026 brach Lauf `34629925181` beim Bestätigen bereits
übernommener Aufträge mit `BRIDGE_RESPONSE_TOO_LARGE` ab. `store.all` lieferte
mehr als die bisher erlaubten 24 MiB. Dadurch fehlten Abschlussbestätigungen,
obwohl vorherige Verarbeitungsschritte bereits erfolgreich sein konnten.

Der neue Oracle-Store unterstützt Cursor-Seiten mit höchstens 20 Aufträgen.
Archivierte Datensätze werden ausgeschlossen; private Staging-Texte bleiben in
der Datenbank und sind weiterhin gezielt über `get` erreichbar. Die Pagination
löscht oder verändert keine Aufträge und verwendet den vorhandenen Import-Lock.
Der GitHub-Client liest sämtliche Seiten. Eine fehlgeschlagene Seite wird niemals
als erfolgreiche Teilmenge zurückgegeben; fehlerhafte Cursor stoppen den Lauf.

Für die getrennte Aktualisierung von GitHub und Oracle bleibt der Client mit dem
vorhandenen Oracle-Dienst kompatibel: Ignoriert dieser die Seitenparameter und
liefert noch ein Array, akzeptiert ausschließlich `store.all` bis zu 64 MiB.
Alle anderen Operationen behalten ihre Grenze von 24 MiB. Beide Grenzen werden
während des Lesens geprüft. Es gibt keinen unbegrenzten Puffer und keine
Fallback-Leerantwort. Das behebt die aktuelle Importblockade bereits vor dem
Oracle-Update; die kleineren Seiten werden nach dessen Aktualisierung genutzt.

Korrigierte Outputs dürfen außerdem an den neuesten übernommenen `repair-N`-
Auftrag gebunden werden. Job-ID, Input-Hash, Originalinput und Korrekturstufe
müssen übereinstimmen. Eine neuere noch unbeanspruchte Reparatur verhindert den
Rückgriff auf einen alten Claim. Bestehende Outputs und ACKs bleiben geschützt.

Prüfungen: echte SQLite-Pagination über mehrere Seiten, vollständiger Bestand,
Staging-Erhalt, alter Server mit mehr als 24 MiB, beide Größenobergrenzen,
abgebrochene Folgeseite, fehlerhafter Cursor und vorhandene Bridge-/ACK-Tests.
