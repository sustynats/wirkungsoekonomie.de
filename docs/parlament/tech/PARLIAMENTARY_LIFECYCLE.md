# Parliamentary Lifecycle

Vorgangsphasen werden datengetrieben aus DIP-Ereignissen abgeleitet; die Oberfläche codiert keinen starren legislativen Ablauf. Anzeigezustände sind „Aktueller Stand“, „Als Nächstes“ und „Noch nicht verifiziert“.

Interne Freigabezustände: `IMPORTING → DRAFT → FACT_CHECK → METHOD_REVIEW → RED_TEAM → APPROVED → PUBLISHED → ARCHIVED`.

Ein Termin im Radar ist niemals ohne amtliche Quelle und `STATUS_UNVERIFIED`-Markierung sichtbar. Fällt ein Termin aus dem bestätigten Vorlauf, wird er archiviert, nicht still gelöscht.
