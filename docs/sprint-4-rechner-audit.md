# Sprint 4 Rechner Audit

Stand: 2026-05-22.

## Wirkungseinkommen

Seite: `/fuer/wirkungseinkommen.html`

Umgesetzt:

- Bruttovolumen-Rechner: Bevölkerung x Grunddividende x 12.
- Jahresbetrag pro Person.
- Finanzierungsstack mit:
  - bestehende ersetzbare Transfers
  - Wirkungssteuer-Einnahmen
  - Automatisierungsdividende
  - Kapitalwirkungsbeiträge
  - Abbau destruktiver Subventionen
  - internalisierte externe Kosten
  - vermiedene Reparaturausgaben
  - sonstige freigegebene Modellbausteine
- Summe Finanzierungsbausteine.
- verbleibender Netto-Finanzierungsbedarf.
- Statusauswahl je Finanzierungslogik: offizielle Quelle, Modellwert, Annahme, noch zu prüfen.

Hinweis gesetzt:

- 2.000 Euro sind Zielmodell / Modellwert.
- Keine gesetzliche Leistungszusage.
- Keine fiskalische Gesamtprüfung.

## Wirkungsrente

Seite: `/fuer/rente.html`

Umgesetzt:

- Formel: Wirkungsrente = Basisrente + Wirkungsdividende + Fondsanteil.
- Einkommenspunkte = individuelles Einkommen / Durchschnittseinkommen.
- Wirkungspunkte = Einkommenspunkte x Wirkungsfaktor x Wirkungsjahre x Gewichtung x Lernfaktor.
- Wirkungsdividende = Basisrente x Wirkungspunkte / 100.
- Default-Werte als Arbeitspapierstand markiert.
- Wirkungsfaktor mit Bereich -3 bis +3.

Hinweis gesetzt:

- Arbeitspapier-Modellrechnung.
- Keine Leistungszusage.
- Keine finale Rechtsgrundlage.
- Keine Personenbewertung.
- Keine Social-Credit-Logik.
- Faktoren müssen demokratisch, rechtlich und methodisch validiert werden.
