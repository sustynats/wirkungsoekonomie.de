# Regional Data Capabilities - Kommunale/regionale Daten & Schnittstellen

Stand: 2026-08-14. Grundregel: territoriale Ebenen nie vermischen; jeder Regionalwert braucht Quelle, Beobachtungszeitpunkt, tatsächliche Ebene, Proxy-Kennzeichnung.

## Bestand 1: KWI - Kommunaler Wirkungsindex (Beta)

- **Daten**: `assets/data/kwi/` - 45 Kommunen-Snapshots + `municipalities.json` (Manifest). Territoriale Ebene: **ausschließlich Städte** (kreisfreie Städte/Landeshauptstädte); keine Landkreise, keine kleinen Gemeinden. **Kein AGS/Gemeindeschlüssel** (nur externe `sdgPortalId` + `slug`); Suche rein namensbasiert.
- **Schema** `kwi-beta-0.1`: je Kommune `summary.kwiScore`, Dimensionen Mensch/Planet/Demokratie (Gewichte **0,4/0,3/0,3**), `indicators[]` mit `sdg`, `value/year/unit`, `stateAverage`, `direction`, `score`, `quality` (hoch/mittel/niedrig), `source` (Ursprungsbehörde), `timeseries` (ab 2014). Beispiel Heidelberg: 56 Indikatoren (38 Mensch / 11 Planet / 4 Demokratie).
- **Frontend**: `/erleben/kommunaler-wirkungsindex/` (`assets/js/kwi-beta.js`, lädt statische Snapshots; Gesamt-KWI bewusst noch ausgeblendet, „Rohdatenprofile").
- **Collector**: `tools/kwi_collect.py` (Python; auch als Serverless-Handler `api/kwi.py`, Deployment ungeklärt) + Akademie-Live-API `GET akademie.wirkungsoekonomie.de/api/kwi?q=<Kommune>` (`lib/kwi/collector.ts`, Live-Scraping).
- ⚠️ **KRITISCH - Quellenlage**: Ursprungsquelle SDG-Portal (`sdg-portal.de`) wurde lt. `docs/kwi-live-api.md` **zum 30.06.2026 abgeschaltet**. Snapshots sind eingefroren (generiert 2026-06-09). Die Live-Scraper (Akademie `/api/kwi`, `tools/kwi_collect.py`) zeigen vermutlich ins Leere → Migration auf Nachfolgeportal „Portal Nachhaltige Kommunen" erforderlich. Status: `DATA_GAP` + Codex-Verifikation (`CROSSCHECK.md`).
- Lizenz: kein explizites Lizenzfeld in den Snapshots; Governance-Einstufung SDG-Portal = Tier C (`docs/externe-quellen-governance.md`). Vor Weiterverwendung klären.
- ⚠️ Namenskollision: „KWI" in `werkzeuge/kapitalwirkungscheck/` = **Kapitalwirkungsindex** (Finanzkonzept, keinerlei Verbindung zu `assets/data/kwi/`).

## Bestand 2: Wahlkreis-Strukturdaten (Bundestagswahl 2025)

- **Daten**: `assets/js/wahlkreis-wirkungscheck/data-2025.js` (`window.WC_DATA`) - **299 Wahlkreise**, je `nr, name, land, plz[]` (ausdrücklich nur Suchhilfe, nicht eindeutig), `context`, 5 Strukturindikatoren (Wohnungsfertigstellung, U3-Betreuungsquote, verfügbares Einkommen, Beschäftigung, Arbeitslosenquote).
- **Quelle/Lizenz**: Die Bundeswahlleiterin, 3 CSV-Datensätze (u.a. `btw25_wkr_gemeinden`, `btw2025_strukturdaten`), **Datenlizenz Deutschland - Namensnennung 2.0**. Import build-seitig: `scripts/wahlkreis-wirkungscheck/build-district-data.mjs`. Kein Laufzeit-Call, kein AGS im Output.
- **Nutzung**: Wahlkreis-Wirkungscheck (V1/V3) als regionaler Kontext - Wahlkreis ist Realitätscheck, nie Bewertungsobjekt.

## Bestand 3: Territoriale Wirkungskompasse (Bundesländer/EU/Welt)

- `data/wirkungskompass/` (snapshots + manual) mit gemeinsamer Engine `assets/js/wirkungskompass/territorial-compass.js`: **Länder-Wirkungskompass** (16 Bundesländer), **Europa-Wirkungskompass** (EU-27), **Welt-Wirkungskompass** (UN-Staaten) - je Mensch/Planet/Demokratie-Profil mit Datenqualität und Zeitverlauf, BETA.

## Ebenen-Matrix (was existiert wo)

| Ebene | Bestand | ID-System | Status |
|---|---|---|---|
| Staaten (Welt/EU) | wirkungskompass-Daten | eigene Slugs | BETA |
| Bundesländer | Länder-Wirkungskompass | Slugs | BETA |
| Kreise | **fehlt** | - | GAP |
| Kreisfreie Städte/Großstädte | KWI-Snapshots (45) | sdgPortalId/Slug, **kein AGS** | BETA, Quelle abgeschaltet |
| Gemeinden allgemein | **fehlt** (Coverage-Anspruch der Ex-Quelle war breiter) | - | GAP |
| Wahlkreise | data-2025.js (299) | Wahlkreis-Nr. | PRODUCTION (statisch, Stand 2025) |
| PLZ | nur als Suchhilfe im Wahlkreis-Datensatz | - | Proxy |

**Keine Verknüpfung** KWI-Kommunen ↔ Wahlkreise (kein Mapping, kein Geocoding, kein AGS irgendwo). Ein Kreis-/Kommunalwert darf nie stillschweigend als Wahlkreiswert ausgegeben werden - für Wahlkreis-Rückkopplung im Parlament-Portal fehlt eine Zuordnungsschicht (`territorial_level`, `territorial_id`, `is_exact/is_proxy`): **BUILD_NEW-Kandidat** (siehe `PARLIAMENT_REUSE_MAP.md`).

## Externe Quellen-Registry

`content/data/external-data-sources.json` (44 Einträge, mit `quality_level_default`): enthält u.a. `bundestag-bundesrat` (DIP, vorbereitet, nicht implementiert) und `kommunale-haushalte-sdg-portale` (Qualität „D", „uneinheitliche Datenqualität"). Governance/Tier-System: `docs/externe-quellen-audit.md`, `docs/externe-quellen-governance.md`.
