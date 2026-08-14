# DIP and Open Data

**Entscheidung: BUILD_NEW.** DIP ist die amtliche Quelle für Vorgänge und Dokumente. Die API ist read-only, benötigt bei jeder Anfrage einen gültigen Schlüssel und wird über aktuelle OpenAPI/Swagger-Beschreibungen geführt. Für einen dauerhaften Dienst wird ein personalisierter Schlüssel verwendet, kein flüchtiger Beispiel-/Öffentlichkeitsschlüssel.

## Zwei Importfenster

1. **Bootstrap:** 1. Januar des laufenden Jahres bis heute; alle importierten Datensätze starten als `IMPORTED_UNREVIEWED`.
2. **Radar:** täglich bestätigte Termine im Fenster heute + 10 Tage; erlaubt sind 7 bis 14 Tage Vorlauf.

Der Adapter in `lib/dip.ts` hardcodiert keine Vorgangslebenszyklen und keine ungeprüften OpenAPI-Filter. Die Produktionskonfiguration muss die aktuell verifizierten Endpoint-/Filterfelder mit Abrufdatum dokumentieren.

Bei jedem Import: Rohantwort separat speichern, Originaldokument nicht verändern, URL/Hash/Abrufzeit erfassen, Quelle als „Deutscher Bundestag/Bundesrat – DIP“ attribuieren. DIP-PDFs bleiben unverändert; eigene Einordnungen werden klar getrennt und als solche markiert.
