# Analytics-Architektur

Status: Architektur und Collector-Grundgerüst implementiert; produktive Admin-/Research-Funktionen gesperrt

Die vollständige Bestandsaufnahme, Zielarchitektur und die verbindlichen Launch-Gates stehen in
[`ANALYTICS_IMPLEMENTATION_PROPOSAL.md`](ANALYTICS_IMPLEMENTATION_PROPOSAL.md).

Kurzfassung: Der Wahlkreis-Wirkungscheck verwendet einen eigenen, selbst gehosteten
Analytics-Dienst mit separater PostgreSQL-Datenbank. CiviCRM (Kontakt/Dialog), LimeSurvey
(neutrale Befragung) und Product Analytics teilen weder Datenbanken, IDs noch Join-Endpunkte.
Der Collector nimmt nur einen kleinen, versionierten Ereigniskatalog an und löscht seine
kurzlebigen Rohereignisse mitsamt Analytics-Nonce nach höchstens 72 Stunden.

Weiterführende verbindliche Teilkonzepte:

- [`ANALYTICS_EVENT_CATALOG.md`](ANALYTICS_EVENT_CATALOG.md)
- [`ANALYTICS_METRICS.md`](ANALYTICS_METRICS.md)
- [`ANALYTICS_PRIVACY.md`](ANALYTICS_PRIVACY.md)
- [`RESEARCH_ANALYTICS.md`](RESEARCH_ANALYTICS.md)
- [`DISCLOSURE_CONTROL.md`](DISCLOSURE_CONTROL.md)
- [`ANALYTICS_RBAC.md`](ANALYTICS_RBAC.md)
- [`ANALYTICS_RETENTION.md`](ANALYTICS_RETENTION.md)
- [`ANALYTICS_TESTING.md`](ANALYTICS_TESTING.md)
