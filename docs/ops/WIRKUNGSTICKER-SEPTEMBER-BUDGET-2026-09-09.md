# Befristete Septemberfreigabe und gemeinsames Kostengate

Die ausdrueckliche Freigabe vom 9. September setzt fuer September 2026
eine gemeinsame Obergrenze von 75 EUR brutto fuer den API-Dienst.
Alle bereits erfassten Septemberkosten bleiben enthalten. Es handelt sich
weder um zusaetzliches Guthaben noch um zwei additive Budgettoepfe.

Der Nachrichtenworker beruecksichtigt die datierte Freigabe ab
2026-09-09 04:57 UTC. Fruehere Freigabezeitraeume bleiben reproduzierbar.
Die unveraenderte Steuer- und Wechselkursreserve ergibt hoechstens
56,72 USD fuer das Nachrichten-Teilbudget. Oracle prueft unabhaengig
davon die gemeinsame Grenze ueber alle erfassten API-Funktionen.

## Serverseitige Monatsbindung

Der inkrementelle Patch `patches/oracle-shared-budget-month-20260909.patch`
ergaenzt validierte `API_MONTHLY_BUDGET_OVERRIDES_CENTS`. Der bereits
bestehende datierte Nachrichtenmechanismus wird weiterverwendet.
Das vorhandene September-Drop-in fuehrt:

```ini
[Service]
Environment='API_MONTHLY_BUDGET_OVERRIDES_CENTS={"2026-09":7500}'
Environment='NEWS_MONTHLY_BUDGET_OVERRIDES_USD_CENTS={"2026-09":5672}'
```

Die Basiskonfiguration bleibt unveraendert: gemeinsamer Dienst 5000 EUR-Cent,
Nachrichten 1890 USD-Cent. Beide Aufnahmepfade - synchron und Batch -
bestimmen die Grenze je UTC-Abrechnungsmonat erneut. Daher endet die
Ausnahme am 1. Oktober ohne Neustart. Abrechnungen bereits angenommener
Jobs bleiben erlaubt und ihrem urspruenglichen Monat zugeordnet.

Quellen-, Evidenz-, Materialitaets-, Publikations- und Batch-Reservegates
bleiben unveraendert. Keine Aenderung an Hosting, Tarifen, Bildern oder TTS.

## Pruefung und Rueckfall

- Inkrementell auf dem aktuellen Oracle-Code, nicht aus einer veralteten
  lokalen Dienstkopie. Code, Konfiguration und private Journale vorab gesichert.
- 91 Backendtests sowie TypeScript-Pruefung und Build erfolgreich.
- Tests pruefen gemeinsame Nutzung durch alle synchronen Features,
  Batch-Nachrichtenreserve, Nullgrenze, fehlerhafte Konfiguration, unveraenderte
  Altreserven, September-/Oktoberwechsel und spaete Batch-Abrechnung.
- Laufzeitpruefung bestaetigt September 7500/5672 und Oktober 5000/1890.
- Healthcheck nach kontrolliertem Neustart erfolgreich. Alle drei privaten
  Kosten-/Batchjournale vor und nach Neustart per SHA-256 unveraendert.
- Rueckfall nur fuer die geaenderten Code- und Konfigurationsdateien.
  Niemals nach neuen Anfragen ein altes Kostenjournal zurueckkopieren.

Ein aufgehobener Budgetstopp ist noch kein Nachweis eines abgearbeiteten
Rueckstands. Regulare Workflow-Ergebnisse und tatsaechliche Live-Auslieferung
sind separat zu pruefen. Der Tageszielkorridor ist ein Optimierungsziel,
keine Behauptung bereits erreichter Kosten und kein Grund fuer eine
stillschweigende neue Veroeffentlichungssperre.
