# CODEX-AUFTRAG — Phase 0 abschließen & Wirkungsportal Parlament (Tech-Lane)

Stand: 2026-08-14 · Von: Claude (Phase 0 abgeschlossen, PR #219) · Für: Codex
Verbindliche Vorleseliste, in dieser Reihenfolge: `docs/woek-knowledge/README.md` → `SOURCE_HIERARCHY.md` → `CROSSCHECK.md` → `PARLIAMENT_REUSE_MAP.md` → `INTEGRATIONS.md` → `SYSTEM_ARCHITECTURE.md` → `KNOWLEDGE_GAPS.md`. Der gemeinsame Master-Prompt (Wirkungsportal Parlament + Vertrauens-/Unabhängigkeits-Ergänzung + Versionssicherheits-Block) gilt unverändert; dieses Dokument operationalisiert deine Lane.

## Arbeitsregeln (unverändert verbindlich)

- Kein direkter main-Push: Branch + PR + Checks. Kleine, thematisch getrennte PRs.
- Statushierarchie der Bibliothek schlägt lokale Dateien (führend: Begriffsleitfaden v1.3, Master Items v1.3, T-SROI v1.1, SDG/SDG+ v0.3, WÖMM/WÖMS 2.0, Buch, Glossar). Nichts auf ersetzten Fassungen aufbauen.
- Nie-Rückbau-Liste beachten; keine privaten Pfade in GitHub; Worklog-Eintrag je Block (`docs/claude-codex-worklog.md`).
- `docs/woek-knowledge/` bei jeder relevanten Änderung mitpflegen (+ `CHANGELOG.md`); `UNKNOWN` statt raten; `last_verified` setzen.

## Block 1 — Verifikation & TECHNICAL_CAPABILITY_MAP (zuerst, ~1 PR)

Fülle `docs/woek-knowledge/TECHNICAL_CAPABILITY_MAP.md` und hake `CROSSCHECK.md` Abschnitt A ab (A1–A11), mit echten Funktionstests, nicht nur Code-Lektüre. Prioritär:

1. **A4 — Zertifikats-API**: `zertifikat/index.html` ruft `GET akademie.wirkungsoekonomie.de/api/certificates/{id}` — diese Route existiert im Akademie-Repo **nicht**. Entweder Route bauen (inkl. Ausstellungslogik-Entscheidung) oder Prüfseite auf `/zertifikat/[code]`-Page umstellen. Öffentlich sichtbarer Bruch → hohe Priorität.
2. **A2/A3 — KWI**: Akademie `/api/kwi` scrapt das zum 30.06.2026 abgeschaltete SDG-Portal; `api/kwi.py`-Deployment unklar. Verifizieren, Status in Registries eintragen, Migrationsplan „Portal Nachhaltige Kommunen" (inkl. Lizenzklärung) als eigenes Ticket.
3. **A1 — Oracle-Endpoints** durchtesten (factcheck, woek-ai, product-check, feedback, share-result, community/*): Server-Repo, Rate-Limits, Logging, Systemkontext dokumentieren → `WOEK_AI_CAPABILITIES.md` ergänzen.
4. **A7 — Institut**: Repo/Deployment benennen, `/api/quellen`-Datenmodell + implementierte Module dokumentieren → `INSTITUTE_CAPABILITIES.md` vervollständigen.
5. A5 (site-event-Edge-Fn), A6 (woek-id-register.json ≙ Master Items v1.3, Hash), A8 (V1 wirklich verwaist), A9 (Analytics-Kanonisierung), A10 (Discord-Bot-Repo).

## Block 2 — Registry-Metadaten-Fixes (klein, 1 PR, schnell live)

`CROSSCHECK.md` Abschnitt B, Fixes an der **Quelle** (Registry-Input/Generator, nicht am generierten HTML): ①  v1.0-Begriffsleitfaden-Archivhinweis „gilt Version 1.2" → v1.3 · ② `llms.txt` Master-Items-Link v1.2 → v1.3 · ③ `WOeK_Master_Items_final_v1.2.pdf` Status → „ersetzt" + successorUrl · ④ `docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md` auf Statusregister/`docs/woek-knowledge/SOURCE_HIERARCHY.md` umstellen · ⑤ Snapshots neu bauen (`api/v1/glossary.json`, `docs/stage-9-library-versioning.md`) · ⑥ `assets/data/document-registry 2.json` klären (verwaist löschen ODER als gewollten Bestand aktivieren — nicht stillschweigend). Danach `reference-manifest.yaml` `last_verified` aktualisieren + Checksum (SHA-256) der Master-Items-XLSX eintragen.

## Block 3 — Architekturentscheidungen (Entscheidungsvorlagen für Natalie, keine Alleingänge)

`CROSSCHECK.md` Abschnitt C: ① kanonischer `WoekAiService` (Oracle vs. Akademie-RAG) mit Kontextmodell `PARLIAMENT_CASE|PRODUCT_ANALYSIS|ACADEMY|IMPACT_CHECK|GENERAL_WOEK` · ② Analytics-Kanonisierung · ③ territoriale Zuordnungsschicht (AGS, Kommune↔Wahlkreis, `territorial_level/territorial_id/is_exact/is_proxy`) · ④ DIP-API-Spike (aktuelle Doku, API-Key-Beantragung, Rate-Limits, Entitäten; Vorgangs-Lebenszyklen NICHT hart verdrahten) · ⑤ Redaktions-Backend-Platzierung (Empfehlung: eigene App nach Akademie-Muster, Supabase+RBAC+MFA, nie noindex-Statik) · ⑥ Sichtung deines Alt-Arbeitsbaums `codex/live-clean-20260628` (ahead 31/behind 333; u.a. Kontextdossier v1.0 nur dort) — retten oder verwerfen, dokumentiert.

## Block 4 — Wirkungsportal Parlament, Tech-Foundation (nach Blöcken 1–3)

Deliverables nach Master-Prompt §70 unter `docs/parlament/tech/` (REPOSITORY_REVIEW, TECHNICAL_ARCHITECTURE, DATA_MODEL, DIP_AND_OPEN_DATA, PARLIAMENTARY_LIFECYCLE, DOCUMENT_VERSIONING, MATERIALITY_ENGINE, IMPACT_ANALYSIS_ENGINE, NORMATIVE_REFERENCE_ENGINE, EVIDENCE_MODEL, RECOMMENDATION_ENGINE, EDITORIAL_WORKFLOW, HISTORICAL_CASES, MONITORING_ENGINE, SURVEY_ARCHITECTURE, TOOL_REGISTRY, REGIONAL_DATA, WOEK_AI, CIVICRM_NOTIFICATIONS, ANALYTICS, SECURITY, TESTING, DEPLOYMENT, TECH_HANDOFF). Dabei verbindlich:

- **Reuse-Entscheidungen aus `PARLIAMENT_REUSE_MAP.md` übernehmen** und je Funktion REUSE/EXTEND/WRAP/BUILD_NEW im jeweiligen Tech-Doc begründen. BUILD_NEW nur: DIP-Ingestion, parlamentarische Dokumentversionierung, Materialitäts-Engine, Recommendation-Engine, Editorial-Workbench, territoriale Zuordnungsschicht.
- Plattform-Policy: Subdomain `parlament.wirkungsoekonomie.de` (DNS/TLS existiert noch nicht — provisionieren), eigenes Deployment; öffentliche Inhalte statisch/read-only-API, PII nur Supabase, dynamische Logik WÖk-Kern; große Medien via GitHub Releases.
- Datenmodell entlang Master-Prompt §48 (ParliamentaryCase ≠ DecisionUnit!), von Anfang an `parliament_id/jurisdiction/legislative_term`.
- Sicherheit als Launch-Gate (§65 + Trust-Ergänzung §16/17): RBAC serverseitig, MFA fürs Redaktionssystem, CSP/HSTS, untrusted-input-Behandlung für parlamentarische Dokumente. Dazu die bestehenden Debt-Punkte: `admin/`, `_debug/`, `intern/` härten oder entfernen.
- CI-Neutralitätstest von Anfang an: `same_case + same_methodology + same_evidence + different_party = identical_woek_verdict` (synthetische Fixtures).
- KI-Grenze technisch erzwingen: kein LLM-Schreibzugriff auf Voten; `EDITORIAL_REVIEW_REQUIRED`-Pfad; Privacy-Muster des Wirkungscheck-V3 (Opt-in, Kontext-Sperrliste) übernehmen.
- MdB-Dialog: `ops/wahlkreis-wirkungscheck/`-Blaupause (CiviCRM/LimeSurvey/Invitation/Disclosure-Control n≥10) als Ausgangspunkt für SURVEY_ARCHITECTURE/CIVICRM_NOTIFICATIONS — Produktivversand bleibt hinter Vier-Augen-Freigabe.

**Vor produktiver Frontend-Implementierung**: Claudes `docs/parlament/ux/UX_HANDOFF_TO_CODEX.md` lesen (entsteht parallel in der Claude-Lane); Abweichungen nur aus Technik-/Security-/A11y-Gründen, dokumentiert.

## Übergaberegeln

Ergebnisse je Block als PR mit Verweis auf die aktualisierten `woek-knowledge`-Dateien; Differenzen zu Claude-Annahmen in `CROSSCHECK.md` eintragen (nicht überschreiben). Bei Konflikten mit führenden Referenzen: `REFERENCE_METADATA_CONFLICT` melden, Natalie entscheidet.
