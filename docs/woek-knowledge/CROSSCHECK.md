# Crosscheck Claude ↔ Codex

Stand: 2026-08-14 · Claude-Seite ausgefüllt (Phase-0-Inventur); **Codex-Spalte offen**. Regel (§41): Claude prüft fehlende fachliche/UX-Fähigkeiten, Codex prüft, ob von Claude angenommene Fähigkeiten tatsächlich implementiert sind. Abweichungen hier dokumentieren, nicht still ändern.

## A. Von Claude behauptet — Codex bitte technisch verifizieren

| # | Claude-Befund | Verifikationsweg | Codex-Ergebnis |
|---|---|---|---|
| A1 | Oracle-Endpoints (`/api/factcheck`, `/api/woek-ai`, `/api/product-check`, `/api/feedback`, `/api/share-result`, `/api/community/*`) live & funktional | echter Request-Test + Server-Repo benennen | ☐ |
| A2 | Akademie `/api/kwi` **broken** (SDG-Portal abgeschaltet 30.06.) | Request-Test; Scraper-Ziel prüfen | ☐ |
| A3 | `api/kwi.py` (Website) deployt? Wo? | Deployment-Ziel | ☐ |
| A4 | Zertifikats-API `akademie…/api/certificates/{id}` existiert? (Website-Prüfseite ruft sie; im Akademie-Repo **keine** solche Route gefunden — nur `/zertifikat/[code]`-Page + `/api/me/certificate-status`) → möglicher toter Endpoint! | Route-Existenz + Test | ☐ |
| A5 | Supabase-Edge-Fn `site-event` aktiv (im Akademie-Repo keine functions/ — wo liegt ihr Code?) | Supabase-Projekt inspizieren | ☐ |
| A6 | `assets/data/woek-id-register.json` ≙ Master Items v1.3 (Erzeugung? Hash?) | Generator-Skript + Abgleich | ☐ |
| A7 | Institut: Repo, Deployment, Datenmodell `/api/quellen`, Auth, implementierte Module | Institut-Codebase | ☐ |
| A8 | Wirkungscheck-V1 wirklich nirgends mehr eingebunden (nur Doku/Validator-Referenzen) | Live-URL + grep | ☐ |
| A9 | Zwei Analytics-Ingests parallel aktiv — welcher ist kanonisch? | Traffic/Code | ☐ |
| A10 | Discord-Bot „Oracle" (Analytics-Push): Repo/Betrieb | Bot-Code | ☐ |
| A11 | `last_verified`-Felder in `integration-registry.yaml`/`tool-registry.yaml` nach echten Tests aktualisieren + `TECHNICAL_CAPABILITY_MAP.md` füllen | — | ☐ |

## B. Von Claude gefundene Metadaten-Fehler — Codex bitte fixen (kleiner Fix-PR, Registry-Rebuild)

1. `library-version-registry.json`: v1.0-Begriffsleitfaden-Eintrag „gilt Version 1.2" → v1.3 (REFERENCE_METADATA_CONFLICT).
2. `llms.txt`: Master Items v1.2-Link → v1.3.
3. `WOeK_Master_Items_final_v1.2.pdf`: Status „aktuell" → „ersetzt" (+ successorUrl).
4. `docs/LIVE_REFERENCE_SOURCE_HIERARCHY.md`: auf Statusregister/`docs/woek-knowledge/SOURCE_HIERARCHY.md` umstellen.
5. Snapshot-Rebuilds: `api/v1/glossary.json`, `docs/stage-9-library-versioning.md`.
6. Optional: `assets/data/document-registry 2.json` klären (verwaist? eigentlich gewollter 223-Einträge-Bestand?).

## C. Von Codex zu beantwortende Architekturfragen (vor Parlament-Implementierung)

1. Kanonischer `WoekAiService`: Oracle vs. Akademie-RAG — Entscheidung + Kontext-Modell (`PARLIAMENT_CASE` …).
2. KWI-Datenquellen-Migration („Portal Nachhaltige Kommunen") + Lizenzklärung.
3. Territoriale Zuordnungsschicht (AGS, Kommune↔Wahlkreis) — Datenmodell-Vorschlag.
4. DIP-API: aktuelle Doku, Auth/Key, Rate-Limits, Entitäten-Abdeckung.
5. Redaktions-Backend-Platzierung (eigene App à la Akademie? MFA?).
6. Codex-Arbeitsbaum (`codex/live-clean-20260628`, ahead 31/behind 333): was ist davon noch relevant (u.a. Kontextdossier v1.0)?

## D. Claude-Prüfung der Codex-Annahmen (offen bis Codex-Karte vorliegt)

Nach Vorlage von `TECHNICAL_CAPABILITY_MAP.md` prüft Claude: fehlt eine fachliche/UX-Fähigkeit, stimmen Nutzerwege, sind Statusangaben mit der Bibliotheks-Statuslogik konsistent. Ergebnisse hier ergänzen.
