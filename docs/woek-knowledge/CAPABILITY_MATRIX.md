# Capability Matrix

Stand: 2026-08-14 · Legende: ● vorhanden/implementiert · ◐ teilweise/Beta/Konzept · ○ fehlt · ? unverifiziert (Codex). „Parlament" = nutzbar fürs geplante Wirkungsportal Parlament (siehe `PARLIAMENT_REUSE_MAP.md`).

| Capability | Website | Akademie | Institut | WÖk-Kern-API (Oracle) | Parlament-Reuse | Status |
|---|---|---|---|---|---|---|
| Normativer Rahmen SDG/SDG+/MPD (Daten+Portal) | ● (`sdg-reference.json`, Rang 0, API) | ◐ (Lehrinhalte) | ? | ◐ (Produktcheck nutzt SDG-Bezug) | REUSE | PRODUCTION |
| Begriffe/Glossar (2121+) inkl. Lookup-API | ● | ● (gespiegelt) | ? | ◐ | REUSE | PRODUCTION |
| Quellenarchiv (1024, kuratiert) | ● Spiegel | ○ | ● SoR (`/api/quellen`) | ○ | REUSE | PRODUCTION |
| WÖk-ID-/Indikatoren-Register (621, v1.3) | ● (XLSX+JSON+Explorer) | ○ | ? | ○ | REUSE | PRODUCTION |
| Scoring-Regeln (-3…+3, 28 Regeln, RMO) | ● (`scoring-rules.json`, `impact-calculations.js`) | ◐ (Lehre) | ? | ◐ (Produktcheck) | REUSE | PRODUCTION |
| T-SROI (Rechenstandard v1.1 + Rechner) | ● | ○ | ? | ○ | REUSE (Vertiefung) | PRODUCTION |
| Faktencheck/Folgencheck | ● Frontends | ○ | ○ | ● `/api/factcheck` | REUSE | PRODUCTION |
| WÖk-KI-Chat | ● 2 Frontends | ● `/api/ki-beta` (RAG) | ? | ● `/api/woek-ai` | WRAP (Shared Service klären) | PRODUCTION/BETA |
| Deterministische Regel-Engine + Sofortreaktionen | ● Wirkungscheck V3 | ○ | ○ | ○ | **EXTEND → Kern des Parlament-Checks** | BETA (Pilot) |
| Instrumentenbibliothek (6 Policy-Instrumente) | ● `instruments-2026.js` | ○ | ○ | ○ | REUSE | BETA |
| Explainability/Quellen-Drawer | ◐ (Spec voll, V3 schlank) | ○ | ? | ○ | EXTEND | SPEC+TEIL |
| Nichtkompensation/rote Linien in Tools | ● (V3, T-SROI-Gate, UWP) | ◐ (Lehre) | ? | ◐ | REUSE | PRODUCTION |
| Wirkungsradar (Mythen/Narrative/Debattenkarten/Studio/Embeds) | ● | ◐ (Moderation) | ? | ○ | REUSE (Claim-Prüfmuster, Embeds) | PRODUCTION |
| Regionaldaten Wahlkreise (299, BTW25) | ● statisch | ○ | ○ | ○ | REUSE (Kontext) | PRODUCTION |
| Regionaldaten Kommunen (KWI 45 Städte) | ◐ (Quelle tot) | ◐ Live-API (broken?) | ○ | ○ | ◐ nach Quellen-Migration | DATA_GAP |
| Territoriale Kompasse (Länder/EU/Welt) | ● | ○ | ○ | ○ | REUSE (Muster) | BETA |
| DIP-/Bundestag-Ingestion | ○ (nur Registry-Eintrag) | ○ | ○ | ○ | **BUILD_NEW** | PLANNED |
| Versionierung parlamentar. Dokumente | ○ | ○ | ○ | ○ | **BUILD_NEW** (Muster: library-version-registry!) | - |
| Dokument-Statusregister (führend/ersetzt…) | ● `library-version-registry.json` | ○ | ? | ○ | REUSE (Muster für Fassungs-Status) | PRODUCTION |
| Onlinefassungs-/Cite-Anker-System | ● | ○ | ○ | ○ | REUSE | PRODUCTION |
| Suche (Index 28 957) | ● | ● (Spiegel) | ? | ○ | REUSE | PRODUCTION |
| Auth/Rollen (Discord) | ◐ (Community) | ● (4 Rollen, Guards) | ? (LinkedIn?) | ● (Token-Tausch) | REUSE (Redaktions-Backend) | PRODUCTION |
| Prüfungs-/Quiz-Engine (9 Fragetypen, State Machine) | ○ | ● | ○ | ○ | REUSE (falls Lern-Elemente) | PRODUCTION |
| Zertifikate (Verifikation/Ausstellung) | ● Prüfseite | ◐ (Verify-Route, KEINE Ausstellung) | ? | ○ | - | GAP |
| Einreichung→Moderation→Veröffentlichung | ◐ (Links) | ● (Fragen/Narrative + Queues) | ? | ○ | **REUSE → Wirkungsdialog** | PRODUCTION |
| Task-Inbox/Redaktionscockpit | ○ | ● (`/dozentin/aufgaben`, review_tasks) | ? | ◐ (Feedback-Quelle) | REUSE (Editorial Workbench-Muster) | PRODUCTION |
| Analytics (privacy-preserving) | ● Edge-Fn | ● eigene Ingests | ? | ○ | REUSE (Muster konsolidieren) | PRODUCTION |
| Notifications/E-Mail/CiviCRM | ○ | ◐ In-App | ? | ○ | ◐ (ops/-Blaupause, nicht live) | PROTOTYPE |
| Medien-CDN (Releases) + PDF-Pipeline | ● | ○ | ○ | ○ | REUSE | PRODUCTION |
| Statische Read-API-Muster (`/api/v1/`) | ● | ● (`/api/curriculum`) | ● (`/api/quellen`) | - | REUSE (Parlament-Read-API) | PRODUCTION |
| Mehrsprachigkeit | ◐ (7 EN-Seiten) | ○ | ○ | ○ | später | BETA |

Doppelt vorhandene Capabilities (Konsolidierungsbedarf): KI-Chat (2 Backends/3 Frontends), Analytics-Ingest (2), KWI (2 Rechner + Snapshots), Faktencheck-Frontend (2), Suchindex-Builder (2) → `DUPLICATION_AND_TECH_DEBT.md`.
