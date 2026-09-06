# DIP and Open Data

**Entscheidung: BUILD_NEW.** DIP ist die amtliche Quelle für Vorgänge und Dokumente. Die API ist read-only, benötigt bei jeder Anfrage einen gültigen Schlüssel und wird über aktuelle OpenAPI/Swagger-Beschreibungen geführt. Der am 2026-08-14 auf der offiziellen Hilfeseite veröffentlichte Schlüssel gilt dort bis Ende Mai 2027 und hat laut DIP denselben Funktionsumfang wie ein eigener Schlüssel. Der technische Lese-Test gegen `GET /api/v1/vorgang` ergab HTTP 200.

Bis zum veröffentlichten Ablauf darf dieser Schlüssel als serverseitiges Übergangssecret für den Import-Worker verwendet werden. Er gehört weder in Git noch in `NEXT_PUBLIC_*` noch in URLs oder Logs. Der Worker überwacht 401-Antworten als Rotationssignal; ein personalisierter Schlüssel ist langfristige Betriebsabsicherung, kein funktionales Launch-Gate.

## Zwei Importfenster

1. **Bootstrap:** 1. Januar des laufenden Jahres bis heute; alle importierten Datensätze starten als `IMPORTED_UNREVIEWED`.
2. **Radar:** täglich bestätigte Termine im Fenster heute + 10 Tage; erlaubt sind 7 bis 14 Tage Vorlauf.

Der Adapter in `lib/dip.ts` hardcodiert keine Vorgangslebenszyklen und keine ungeprüften OpenAPI-Filter. Die Produktionskonfiguration muss die aktuell verifizierten Endpoint-/Filterfelder mit Abrufdatum dokumentieren.

Bei jedem Import: Rohantwort separat speichern, Originaldokument nicht verändern, URL/Hash/Abrufzeit erfassen, Quelle als „Deutscher Bundestag/Bundesrat - DIP“ attribuieren. DIP-PDFs bleiben unverändert; eigene Einordnungen werden klar getrennt und als solche markiert.

Die produktive Adapterlogik fragt `vorgangsposition` ab: Für den Jahresbestand werden nur Positionen mit dokumentierter Beschlussfassung in den retrospektiven Prüfbestand übernommen. Für den Radar werden ausschließlich `gang: true`-Schritte mit amtlich datiertem Zukunftstermin gespeichert. Es entsteht ein `SOURCE_REQUIRED`-Screening mit Quellen- und Methodiklücken, keine automatische Wirkungsaussage oder Empfehlung.
