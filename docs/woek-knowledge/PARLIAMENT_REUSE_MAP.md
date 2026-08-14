# Parliament Reuse Map — Was das Wirkungsportal Parlament wiederverwendet

Stand: 2026-08-14. Verbindliche Vorprüfung nach Bootstrap §45/§46: Für jede Parlament-Funktion gilt REUSE_EXISTING > EXTEND_EXISTING > WRAP_EXISTING > BUILD_NEW — mit Begründung.

| Parlament-Funktion | Entscheidung | Vorhandene WÖk-Fähigkeit | Begründung/Auflagen |
|---|---|---|---|
| Normative Einordnung (SDG/SDG+/MPD) | **REUSE** | `sdg-reference.json` + Rang-0-Portal + `/api/v1/sdg-plus/` (führend: Referenzrahmen v0.3) | Mapping-Werte STRENGTHENS/WEAKENS/…; SDG+-Disclosure Pflicht |
| Begriffe/Erklärungen | **REUSE** | Begriffsleitfaden v1.3 + Glossar-Lookup (2121) + Hover-Definitionen | nie neu texten; Progressive Disclosure verlinkt `begriffe/<slug>` |
| Evidenz/Quellenbelege auf Claim-Ebene | **REUSE + EXTEND** | Quellenarchiv (Institut-SoR, 1024) + ExplainDrawer-Spec (`docs/wirkungscheck/RESULT_EXPLAINABILITY.md`) | Claim-IDs neu (BUILD im Datenmodell), Belege aus Quellenarchiv; Drawer-Spec voll umsetzen statt V3-Schlankversion |
| Wirkungsrisiken/rote Linien | **REUSE** | Nichtkompensations-Implementierungen (V3-Regeln, `calculateFinalScore`, UWP-RedLines) + Methodikseiten | BOUNDARY_REVIEW_REQUIRED-Marker ergänzen |
| Engpass-/Priorisierungslogik | **REUSE** | Reverse Merit Order (Formel + Erklärseiten) | als Analysebaustein, nicht als Parteibewertung |
| Deterministische Sofort-Wirkungsreaktionen | **EXTEND** | Wirkungscheck-V3-Engine (`rules-v3.js`, Sofortreaktions-Registry, Evidenzklassen, Themenmodule Wohnen/Gesundheit) | Themenmodule → DecisionUnit-Module generalisieren; Registry-Prinzip („keine freie Textlogik im Frontend") beibehalten |
| Instrumenten-Vorschläge („Für diesen Fall nützlich") | **REUSE** | `instruments-2026.js` (6 Instrumente mit Baseline/Mechanismus/Risiken/Methodik-Links) + kontextueller Werkzeugkasten V3 | um Fall-Typen (Vollzug/Daten/Produkt/Sozial) erweitern |
| Monitoring/Indikatoren | **REUSE** | Master Items v1.3 (WÖk-IDs, Schwellen, Prüfstatus) + Wirkungscontrolling-Methodik | Indikatorwahl je Case aus Register, mit WOK_ID zitieren |
| T-SROI-Vertiefung | **REUSE** | Rechenstandard v1.1 + Rechner | nur wo soziale Langzeitwirkung modellierbar; Schutz-Gate |
| Claim-/Gegenargument-/Framing-Prüfung | **REUSE** | Wirkungsradar-Systematik (Faktenlage→Narrativ→Folgen→Antwort; 127 Debattenkarten; Truth-Sandwich/Folgen-vor-Fakten) | Wirkungsgegenprobe (§27) auf dieser Methodik aufbauen |
| Regionale Rückkopplung (Wahlkreis) | **REUSE + BUILD_NEW** | 299-Wahlkreis-Datensatz (Bundeswahlleiterin, Lizenz DL-DE 2.0) | vorhanden: Kontext-Indikatoren; NEU nötig: territoriale Zuordnungsschicht (AGS, Kommune↔Wahlkreis, `is_exact/is_proxy`) — KWI-Quelle erst migrieren |
| Vertiefung WÖk-KI | **WRAP** | Oracle `/api/woek-ai` + Privacy-Muster V3 (Opt-in, Kontext-Sperrliste: keine Partei/Fraktion/E-Mail/IDs) | KI nie votumsfähig; EDITORIAL_REVIEW_REQUIRED-Pfad; vorher Shared-Service-Entscheidung (2 Backends) |
| Lernen/Vertiefung | **REUSE** | Akademie-Kurse (WÖk-G), Studienskripte, Methodenraum | Verlinken statt Erklärwelten nachbauen |
| Wissenschaftliche Veröffentlichung | **REUSE** | Institut (Herausgeberrolle, Quellen-SoR) + Onlinefassungs-System (zitierfähige Kapitel) | Trust-Architektur: „Herausgegeben vom Institut für Wirkungsökonomie" |
| Fassungs-/Versionsstatus von Dokumenten | **REUSE (Muster)** | `library-version-registry.json` + Stage-9-Generator | gleiche Statuslogik für Drucksachen-Fassungen (analysierte Fassung, MATERIAL_IMPACT_CHANGE …) |
| Publikations-/PDF-Exporte, Medien | **REUSE** | Releases-CDN + PDF-Build-Pipeline (`WOEK_PDF_BUILD_MODE`) | |
| Read-API des Portals | **REUSE (Muster)** | statische `/api/v1/`-Bauweise + Akademie-`/api/curriculum`-Muster | `GET /api/parliament/...` nur freigegebene Inhalte |
| Wirkungsdialog (Umfragen Parlament/Öffentlichkeit) | **REUSE + EXTEND** | Einreichungs-/Moderations-Pipeline der Akademie (Formulare, Rate-Limit, Queues) + ops/-Blaupause (CiviCRM+LimeSurvey+Disclosure-Control n≥10, nicht produktiv) | strikte Trennung Umfrage ≠ Fachvotum; Versand nur nach Vier-Augen-Freigabe |
| Editorial Workbench | **REUSE (Muster) + BUILD_NEW** | Akademie-Task-Inbox (`/dozentin/aufgaben`, review_tasks, Audit-Logs, Rollen-Guards) | Parlament braucht eigene App (DRAFT→FACT_CHECK→METHOD_REVIEW→RED_TEAM→APPROVED→PUBLISHED); nie als noindex-Statikseite |
| Auth/Rollen Redaktion | **REUSE** | Supabase+Discord-Rollen-Muster der Akademie (Guards, Overrides, Audit) | RBAC serverseitig; MFA-Frage an Codex |
| Analytics | **REUSE (Muster)** | anonymisierte Ingest-Muster (SHA-256, CORS-Whitelist, ohne politische Profile) | vorher Kanonisierung der zwei Ingests |
| **Parlamentarischer Radar (DIP-Ingestion)** | **BUILD_NEW** | nur vorbereiteter Registry-Eintrag (`external-data-sources.json#bundestag-bundesrat`) | keine vergleichbare Fähigkeit; DIP-API-Doku aktuell prüfen; Vorgangs-Lebenszyklen nicht hart verdrahten |
| Dokumentversionierung parlamentarischer Vorgänge | **BUILD_NEW** (Muster reuse) | — | DocumentVersion/Diff + Wirkungsänderungs-Status (NO/MINOR/MATERIAL/VERDICT_REVIEW) |
| Materialitäts-/Wirkungsrelevanz-Engine | **BUILD_NEW** | Kriterienrohstoff: Wirkungsrelevanz-Logik aus V3-Doku + Bootstrap §11 | veröffentlichter Standard „Warum prüfen wir das?" |
| Recommendation-Engine (regelbasiert, votumsfähig) | **BUILD_NEW** | Muster: deterministische V3-Regeln | nie LLM-generiert; Neutralitätstest same_case+different_party=identical_verdict in CI |

## Nicht verhandelbare Übernahmen aus dem Bestand

1. **Privacy-Trennung** lokale Auswertung vs. Opt-in-KI (V3-Referenz, inkl. Verbotsliste politischer Identifikatoren).
2. **Determinismus-Regel**: „Dieselben Angaben führen immer zum selben Ergebnis"; sichtbare Texte aus Registries, nicht aus freier Frontend-Logik.
3. **Datenlücken ausweisen, nicht überbrücken** (Site-weite Grundregel).
4. **Keine Personen-/Parteibewertung** (api/v1/capabilities-Grenzen + AGENTS.md).
5. **Institutionelle Herausgeberschaft** (Institut) mit Korrekturkultur — Trust-Anforderungen aus dem Master-Prompt-Ergänzungsblock.
