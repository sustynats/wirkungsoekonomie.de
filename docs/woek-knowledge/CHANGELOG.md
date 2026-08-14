# Knowledge Changelog

Chronik aller wesentlichen Änderungen an der WÖk-Wissensbasis (`docs/woek-knowledge/`).
Regel: Jede größere Änderung am Ökosystem (neues Tool, geänderte API, neue Methodik, neuer führender Begriff, neues Portal, neue Datenquelle, neue Akademiefunktion) wird hier mit Datum eingetragen.

## 2026-08-14

- Phase 0 „WÖk Knowledge Bootstrap": Wissensbasis `docs/woek-knowledge/` initial angelegt (Claude).
- Vollinventur durchgeführt über: Website-Repo (`sustynats/wirkungsoekonomie.de`, Stand `origin/main` a88d2941), Akademie-App-Repo (`woek-akademie-app`, Branch main), Wirkungscheck-Branch (`claude/wahlkreis-wirkungscheck-ux`).
- Live-Verifikation der Domains (2026-08-14): `wirkungsoekonomie.de` = 200, `institut.wirkungsoekonomie.de` = 200, `akademie.wirkungsoekonomie.de` = 200, `parlament.wirkungsoekonomie.de` = existiert noch nicht (kein DNS/TLS).
- Wirkungsportal Parlament als geplante neue Capability aufgenommen; `PARLIAMENT_REUSE_MAP.md` erstellt.
- `TECHNICAL_CAPABILITY_MAP.md` und Codex-Spalte in `CROSSCHECK.md` als offener Codex-Auftrag markiert (Verifikation „dokumentiert vs. tatsächlich implementiert").
- Versionssicherheits-Korrektur eingearbeitet (Natalie, 2026-08-14): Bibliotheks-Status schlägt lokale Dateien; führend sind Begriffsleitfaden v1.3, Master Items v1.3 (621 IDs/28 Regeln), T-SROI-Rechenstandard v1.1, SDG-/SDG+-Referenzrahmen v0.3, WÖMM 2.0, WÖMS 2.0; `reference-manifest.yaml` neu.
- 5 REFERENCE_METADATA_CONFLICTs/Drifts dokumentiert (v1.0-Archivhinweis, llms.txt v1.2, LIVE_REFERENCE_SOURCE_HIERARCHY, final_v1.2-Status, Snapshot-Drifts) → Codex-Fixliste in `CROSSCHECK.md` B.
- Kernbefunde: DIP/Bundestag-Integration fehlt (BUILD_NEW); KWI-Quelle SDG-Portal zum 30.06.2026 abgeschaltet (DATA_GAP); Wirkungscheck-V3-Pilot live (V1 verwaist, V2 Holding); Akademie-Zertifikatsausstellung fehlt; zwei KI-Backends/zwei Analytics-Ingests (Shared-Service-Entscheidung offen).
