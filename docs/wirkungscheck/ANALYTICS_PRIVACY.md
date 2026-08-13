# Analytics Privacy by Design

Status: verbindlicher Entwurf vor Implementierung

## Zweckbindung

Analytics dient ausschließlich dazu, Fragebogenprobleme, technische Stabilität, Quellen- und
Methodenqualität sowie die Verständlichkeit des Instruments zu verbessern. Es dient nicht der
politischen Ansprache, der Personenbewertung, dem Targeting, der Fraktionsanalyse, der
Kampagnenoptimierung oder einem Social-Credit-System.

## Technische Garantien

- Kein Marketing-, Open- oder Click-Tracking und keine Drittanbieter-Analytics.
- Kein Cookie und keine langfristige Besucher-, Geräte- oder Session-ID.
- Produkt-Nonce nur in Browser-`sessionStorage`, keine Verknüpfung mit Befragungs- oder
  Einladungskennungen.
- Keine IP-Adresse, kein IP-Hash, kein roher oder gehashter User-Agent in Analytics-Tabellen.
- Keine Antwortwerte, Antwortcodes, Themenwahl oder Freitexte in Product Analytics.
- Keine Namen, E-Mail-Adressen, Parteien, Fraktionen, exakten Wahlkreise, Zugangspässe,
  Invitation Tokens, Survey-Response-IDs, Report-IDs oder Recommendation-IDs.
- Keine gemeinsame personenbezogene Event-Tabelle und keine universelle Join-API.

## Datenflüsse

| Datentyp | Zulässiger Speicher | Nicht zulässiger Speicher |
| --- | --- | --- |
| Kontakt und Dialog | CiviCRM, Einladungsdienst | LimeSurvey, Analytics |
| Einladungsstatus | Einladungsdienst | Survey-Antworten, Product Analytics |
| Neutrale Zugangspässe | LimeSurvey | CiviCRM, Analytics |
| Antworten | Survey-/Research-Store gemäß Freigabe | CiviCRM, Product Analytics |
| Produktnutzung | kurzlebiges Raw Store und tägliche Aggregate | CRM, Einladungsdienst, Research Store |
| Security-Ereignis | getrennter Security-Kontext | Product-Analytics-Tabellen |

## Guard-Verhalten

Der Collector führt eine strikte Schema-Prüfung vor jeder Speicherung aus. Anschließend erkennt
der Sensitive-Data-Guard verbotene Feldnamen, unbekannte verschachtelte Objekte und sensitive
Wertmuster. Ein fehlerhaftes Event wird vollständig verworfen. Der Security-Alert enthält weder
den Originalpayload noch abgeleitete sensible Werte.

## Datenschutzprüfung

Vor Produktivstart werden Datenflüsse, Retention, Rollen, Rechtsgrundlage und gegebenenfalls
Datenschutz-Folgenabschätzung fachlich geprüft. Dieses Dokument ersetzt keine Rechtsberatung.
