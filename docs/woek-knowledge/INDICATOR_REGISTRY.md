# Indicator Registry - WÖk-IDs, Master Items, Benchmarks

Stand: 2026-08-14 · Führend: **WÖk Master Items v1.3 (geprüft)**, `assets/downloads/woek-register/WOeK_Master_Items_v1.3_geprueft.xlsx` (Gültig_ab 2026-08-13). v1.2 ist ersetzt; die Zahl „622 Items" ist nicht mehr kanonisch.

## Kernzahlen v1.3 (aus der XLSX verifiziert)

- **621 WÖk-IDs** (Sheet `01_Item_Register`, 625 Zeilen inkl. Kopf) · **28 Scoring-Regeln** (`03_Scoring_Rules`) · 9 Sheets gesamt (Übersicht, Item-Register, Benchmarks, Scoring-Regeln, Tarifmodell, Changelog, Scorecards, Quellenkatalog mit 50 Quellen, Prüfprotokoll).
- **Benchmarks getrennt aktiv/historisch**: Prüfprotokoll-Finding A-004 - Legacy-Benchmarks archiviert, aktive BM-Felder leer und gesperrt bis Validierung.
- **Prüfstatus** über Spalten `Schwellenstatus`, `Fachlogik_Status`, `Prüfpriorität`, `Prüfhinweis` + eigenes Prüfprotokoll (4 Findings, alle behoben).
- Spaltensatz (33): u.a. `WOK_ID`, `SDG_or_SDGplus`, `Target/Unterziel`, `Indikatorfamilie`, `Item`, `Definition/Messgröße`, `Einheit`, `Polarity`, `Rule_ID`, `Schwellen (WÖk-Klassen)` (Übersetzung Messwert → -3…+3), `Quelle_*`, `Source_IDs`, `NACE_Rev2.1_Beispiele`, `Systemgrenze`, `Berechnungslogik`, `Datenqualitätsanforderung`, `Assurance_Anforderung`, `Version`, `Gültig_ab/bis`.

## Maschinenlesbare Bestände im Repo (statt Neu-Duplikation nutzen!)

| Bestand | Pfad | Inhalt |
|---|---|---|
| WÖk-ID-Register (JSON) | `assets/data/woek-id-register.json` (1,87 MB) | `{version, source_hash_sha256, generated_at, items, sources, methods, audit, changelog}` - Register mit Integritäts-Hash und Audit-Trail; Frontend-Explorer `/woek-id-register/` (Suche, MPD-/Regel-/Prüfstatus-Filter) |
| Scoring-Regeln | `content/methodik/scoring-rules.json` | u.a. Regel `score-scale-minus3-plus3` (Primärskala) |
| SDG-Referenz | `assets/data/sdg-reference.json` | 24 Einträge: 17 offizielle SDGs (`isOfficialUNGoal:true`) + 7 SDG+ (`false`); API `/api/v1/sdg-plus/` |
| Forschungsvariante | `assets/downloads/woek-register/WOeK_Master_Items_Public_Research_Register_v2.1.xlsx` | 621 Items, erweiterte Spalten (`MPD_Dimension`, `Core_Field`, `Archetype`, `Scoring_Mode`, `BM/BM_150pct/BM_250pct`, `NonCompensation_RedLine`, `Publication_Readiness`) - Status „aktuell", **nicht führend** |
| SDG-Detaildaten | `data/sdg_detail_matrix_v0_3.json`, `data/sdg_unterziele_global_europa_deutschland_matrix_v1_0.json`, `data/sdg_finanzmarkt_risikomatrix_go4_v1_0.json` | Portal-Datengrundlagen |

Offene Klärung (Codex): Entspricht `assets/data/woek-id-register.json` inhaltlich exakt der Master-Items-v1.3-XLSX (Erzeugungsskript? Hash-Abgleich?), und warum zeigt der Register-Explorer „621", während `woek-id-register/`-Verzeichnis 624 Einzelseiten enthält (vermutl. inkl. Methodik-/Quellen-Seiten)? → `CROSSCHECK.md`.

## Verwendungsregeln

1. Neue Auswertungen/Regeln/Produkte **nur** auf v1.3-Basis (bzw. deren JSON-Ableitung nach Verifikation); v1.2-Dateien sind `SUPERSEDED`.
2. Schwellen→Klassen-Übersetzung (-3…+3) aus dem Register übernehmen, nicht neu erfinden; `Rule_ID` referenzieren.
3. Benchmark-Werte: nur „aktive" Benchmarks verwenden; archivierte Legacy-Werte ausschließlich für Historie.
4. Indikator-Zitate immer mit `WOK_ID` + Registerversion (`v1.3`, Gültig_ab) angeben - versionssicher.
5. NACE-Bezüge: Spalten `NACE_Rev2.1_*` verwenden (Legacy-Spalte nur Historie).
