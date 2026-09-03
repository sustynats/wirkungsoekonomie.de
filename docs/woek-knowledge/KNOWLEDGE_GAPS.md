# Knowledge Gaps — Offene Wissens- und Datenlücken

Stand: 2026-08-14. Regel: nicht raten — Lücke benennen, Owner zuweisen.

## REFERENCE_METADATA_CONFLICT (Website-Metadaten widersprüchlich)

1. **Begriffsleitfaden-Archivseite**: v1.0-Eintrag in `assets/data/library-version-registry.json` (id `download-or-document-public-downloads-originals-woek-begriffsleitfaden-fuehrend-v1-0-pdf`) sagt „für den aktuellen Begriffsstand gilt Version 1.2" — führend ist v1.3. Fix = Ein-Feld-Korrektur (`shortDescription`) + Registry-Rebuild. **Owner: Codex** (Registry-Generator-Lane).
2. **`llms.txt`** verlinkt „WÖk Master Items Version 1.2" statt v1.3. **Owner: Codex** (kleine Textkorrektur, gleicher Fix-PR).
3. **`docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md`** (Stand 13.08.) führt Begriffsleitfaden v1.0 als „führende Terminologie" — durch Statusregister überholt; Datei sollte auf `docs/woek-knowledge/SOURCE_HIERARCHY.md` verweisen. **Owner: Codex.**
4. **Master Items `final_v1.2.pdf`** steht auf „aktuell" statt „ersetzt". **Owner: Codex.**
5. Snapshot-Drifts: `api/v1/glossary.json` (2092≠2121), `docs/stage-9-library-versioning.md` (führend 10≠11) — Rebuild-Reihenfolge/Automatisierung klären. **Owner: Codex.**

## Fehlende/unklare Systeme

6. **Institut-Repo/Deployment unbekannt** (lokal nicht vorhanden; nicht in Akademie-App). Capabilities nur teilverifiziert. **Owner: Codex** → `INSTITUTE_CAPABILITIES.md` vervollständigen.
7. **Oracle-Server-Code** (WÖk-Kern-API): Repo, Systemprompt, Wissensquellen, Rate-Limits, Logging unbekannt. **Owner: Codex** → `WOEK_AI_CAPABILITIES.md` ergänzen.
8. **`api/kwi.py`-Deployment** ungeklärt (Serverless-Signatur, aber Frontend nutzt nur statische Snapshots).
9. **Kontextdossier für Drittsysteme** (`Wirkungsoekonomie_Kontextdossier_fuer_Drittsysteme_v1.0.md`): existiert nur im ungemergten Codex-Arbeitsbaum (`New project`, Branch `codex/live-clean-20260628`, ahead 31/behind 333) — auf main bringen oder verwerfen. **Owner: Codex.**
10. **Codex-Arbeitsbaum-Rückstand** generell: Branch 333 Commits hinter main mit großflächig geändertem Tree — Klärung, was davon noch relevant ist.

## Daten-Lücken (DATA_GAP)

11. **KWI-Quelle abgeschaltet** (SDG-Portal, 30.06.2026): Snapshots eingefroren (09.06.), Live-Scraper (Akademie `/api/kwi`, `tools/kwi_collect.py`) vermutlich broken. Migration auf „Portal Nachhaltige Kommunen" erforderlich; Lizenz der Snapshots ungeklärt.
12. **Keine Kreis-/Gemeinde-Ebene** außer 45 Städten; **kein AGS** irgendwo; **kein Mapping** Kommune↔Wahlkreis (nur PLZ-Suchhilfe). Für Parlament-Regionalrückkopplung fehlt eine territoriale Zuordnungsschicht.
13. **DIP/Bundestag**: keinerlei Implementierung — nur vorbereiteter Registry-Eintrag (`content/data/external-data-sources.json#bundestag-bundesrat`). API-Doku vor Implementierung prüfen.
14. Wahlkreisdaten Stand BTW 2025 (statisch) — Aktualisierungsprozess undefiniert.

## Fachlich-redaktionelle Lücken (aus Volltext-Reads + Inventur)

15. Skalenverbindung −3…+3 ↔ −100…+100/GWV: als offene Entscheidung in `docs/migration/WOeK_Migrationsmatrix_v1.1.md` geführt; WStG-2.0-Entwurf positioniert, aber Migrationsmatrix nicht abgeschlossen. **Owner: Natalie/Redaktion.**
16. 4 Wohlstandsformen im Glossar nur Stubs; NWI-Platzhalterseite; Haushaltsneutralität vs. Grunddividende-Finanzierung ungeklärt (frühere Volltext-Befunde — gegen aktuellen Stand re-validieren).
17. Akademie: nur 8/108 WÖk-G-Vorlesungen mit echtem Skript published; Zertifikats-Ausstellung fehlt; „Multiplikatoren/Demokratie-Kurse/Unternehmenslehrgänge/Impact-Controlling-Kurs" existieren nur als Konzept außerhalb des App-Repos; `isOpenSelfStudy`-Policy nicht implementiert. **Owner: gemeinsame Planung.**
18. „Demokratie schützen" ohne Hub (verstreute Serie) — IA-Entscheidung offen. **Owner: Claude (UX) + Natalie.**
19. Glossar-Zählungen 2281/2121/2092 nicht überein — Klärung, was „ein Begriff" ist (Seiten vs. Lookup vs. API-Snapshot). **Owner: Codex.**
20. Admin-/Intern-Bereiche ohne Auth (nur noindex) — Härtungsentscheidung. **Owner: Codex + Natalie.**

## UNKNOWN-Status (bewusst nicht geraten)

- `impact-investment-calculators.js`-Interaktivität (UNKNOWN) · Bertelsmann↔SDG-Portal-Zusammenhang (UNKNOWN aus Repo-Sicht) · Admin-Zugriffsschutz auf Hosting-Ebene (UNKNOWN) · tatsächlicher Läufer-Status aller Oracle-Endpoints (nicht durchgetestet).
