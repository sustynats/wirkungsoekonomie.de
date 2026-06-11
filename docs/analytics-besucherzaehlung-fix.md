# Analytics: Besucherzaehlung heute

Datum: 2026-05-22

## Befund

Die Anzeige `Besucher:innen heute` konnte im Tagesverlauf sinken, obwohl ein Tageswert eigentlich monoton steigen oder gleich bleiben sollte.

Die Ursache liegt nicht primaer in der Zeitzone. Die Datumslogik verwendet `Europe/Berlin` und setzt den heutigen Tagesbeginn korrekt auf 00:00 deutscher Zeit.

## Technische Ursache

Die bisherige Auswertung zaehlte eindeutige Besucher:innen aus `site_events` ohne Filter auf `page_view` und ohne Pagination. Die Website sendet neben `page_view` auch alle 60 Sekunden `heartbeat`-Events. Supabase liefert bei normalen Selects standardmaessig nur eine begrenzte Ergebnismenge zurueck. Spaeter am Tag koennen Heartbeats diese Ergebnismenge fuellen und fruehere Besucher:innen aus der abgefragten Stichprobe verdraengen.

Dadurch war folgendes moeglich:

- Vormittag: wenige Events, alle Besucher:innen liegen in der Rueckgabe, Anzeige z. B. 11.
- Nachmittag: viele Heartbeats, begrenzte Rueckgabe enthaelt nicht mehr alle eindeutigen Visitor-/Session-Keys, Anzeige z. B. 8.

## Korrektur

1. Die Besucherzaehlung im Akademie-Analytics-Dashboard holt Identitaetszeilen fuer `page_view` jetzt paginiert aus `site_events`.
2. Heartbeats fliessen dadurch nicht mehr in die Besucher:innen-Kennzahl ein.
3. Die Public Site sendet zusaetzlich eine stabile anonymisierte `visitorId` aus `localStorage`.
4. Der Server hasht diese `visitorId` wie vorgesehen und nutzt sie bevorzugt fuer eindeutige Besucher:innen.

## Ergebnis

Die Kennzahl `Besucher:innen heute` sollte nach Deployment der Akademie-App nicht mehr durch spaetere Heartbeat-Events sinken. Neue Besucher:innen werden stabiler erkannt; bestehende alte Events ohne `visitor_id_hash` bleiben weiterhin ueber `session_id_hash` zaehlbar.

## Hinweise

- Die Live-Analytics-API ist auth-geschuetzt und konnte lokal ohne Login nicht direkt ausgelesen werden.
- Der CORS-Preflight fuer `https://wirkungsoekonomie.de` auf `/api/site-event` funktioniert.
- Lokaler Typecheck konnte nicht ausgefuehrt werden, weil `npm` in dieser Shell nicht verfuegbar ist.
