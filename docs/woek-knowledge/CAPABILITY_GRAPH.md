# Capability Graph

Stand: 2026-08-14 · Technisch nutzbar: [`capability-graph.json`](capability-graph.json)

```
WÖk-Kernmethodik (Buch · WÖMM 2.0 · WÖMS 2.0 · Begriffsleitfaden v1.5)
│
├── Normative Ebene
│   ├── SDGs/Agenda 2030 ──┐
│   └── SDG+ (WÖk) ────────┴─► sdg-reference.json · Rang-0-Portal · /api/v1/sdg-plus/
│                               └─ Wirkungsraum Mensch-Planet-Demokratie
│
├── Daten
│   ├── Master Items v1.3 (621 IDs, 28 Regeln) ─► woek-id-register.json ─► Explorer
│   ├── Scoring-Regeln (-3…+3) ─► impact-calculations.js (NWI · T-SROI · FinalScore=min)
│   ├── Regionaldaten: 299 Wahlkreise · 45 KWI-Städte (Quelle†) · Länder/EU/Welt-Kompasse
│   ├── Quellenarchiv (1024, SoR Institut) ─► /quellenarchiv/-Spiegel
│   └── Statusregister library-version-registry.json (führend/ersetzt …)
│
├── Werkzeuge
│   ├── deterministische Checks: Wirkungscheck V3 (Regeln+Sofortreaktionen+Instrumente)
│   ├── Rechner: T-SROI · Impact-Controlling · Produkt/Scorecard · Wohnen · Automatisierung
│   ├── Profile/Kompasse: UWP · KWI · Welt/EU/Länder
│   └── Debatte: Wirkungsradar (139 Mythen · 127 Debattenkarten · Studio · Embeds)
│
├── WÖK-KI  ⚠ zwei Backends (Oracle /api/woek-ai · Akademie /api/ki-beta) - Shared Service offen
│
├── Institut (Herausgeber; Quellen-SoR; Repo unbekannt → Gap)
│
├── Akademie (Curriculum WÖk-G 9/36/108 · Prüfungs-Engine · Moderations-Pipeline · Auth/Rollen)
│
├── Themenportale (Rang 0-24: 13+1 Wirkungsfelder · 9 Dossierportale · Querschnitt Wirkungssteuerung)
│
└── Neue Anwendungen
    └── Wirkungsportal Parlament (geplant)
        ├── REUSE: Normativ · Glossar · Quellenarchiv · Master Items · Scoring/RMO ·
        │          Wirkungsradar-Muster · Onlinefassung/Cite-Anker · Statusregister-Muster ·
        │          Moderations-Pipeline · Releases-CDN · statische Read-API-Muster
        ├── EXTEND: Wirkungscheck-V3-Engine (Themenmodule→DecisionUnits) · ExplainDrawer ·
        │           Instrumentenbibliothek · Wahlkreis-Kontext
        ├── WRAP: WÖk-KI (votum-frei, opt-in) · Analytics-Muster
        └── BUILD_NEW: DIP-Ingestion · Dokumentversionierung parlamentarischer Vorgänge ·
                       Materialitäts-Engine · Editorial-Workbench (Muster: dozentin/aufgaben) ·
                       territoriale Zuordnungsschicht (AGS/Wahlkreis-Mapping)
```

Lesehilfe: † = Datenquelle abgeschaltet (SDG-Portal, 30.06.2026). Vollständige Kanten mit Pfaden im JSON.
