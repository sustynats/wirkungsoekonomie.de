# Institute Capabilities — Institut für Wirkungsökonomie

Stand: 2026-08-14 · Live: `https://institut.wirkungsoekonomie.de` (HTTP 200 verifiziert). **Quellcode-Repo lokal NICHT vorhanden** — weder im Website-Repo noch in `woek-akademie-app` (aktiv per Volltextsuche ausgeschlossen: kein Host-Routing, keine Institut-Routen/Rollen/Tabellen dort). → Codex muss Repo/Deployment benennen und diese Datei vervollständigen (`CROSSCHECK.md`).

## Gesichert belegte Capabilities (aus Website-Integration + Live-Betrieb)

1. **Quellenarchiv-API** `GET institut.wirkungsoekonomie.de/api/quellen` — **die** kuratierte Quellendatenbank des Ökosystems (Single Source; Website ist read-only-Spiegel). Snapshot im Website-Repo: `content/quellenarchiv/sources.json` (1024 Quellen, IDs `wok-e-*`/`wok-g-*`; öffentliche Spiegel-Seiten `/quellenarchiv/` mit 1426 Dateien, RSS-Feed, wöchentlicher Auto-Sync-PR via `.github/workflows/quellenarchiv-sync.yml`). Kuratierung erfolgt ausschließlich im Institut; die Website hat bewusst keinen Schreibpfad.
2. **Rolle als Herausgeber/Redaktion** (It-Wissen aus Projektkontext, im Website-Repo gestützt durch die Spiegel-Architektur): Institut = Quelle/Redaktion, wirkungsoekonomie.de = Spiegel.
3. **Brückenseite** `wirkungsoekonomie.de/institut/` (eigener Hauptnav-Punkt „Institut"): positioniert das Institut als ThinkTank/Forschungsraum (Wirkungsforschung, Wirkungswissen, Rückkopplung).
4. Fachlicher Rahmen auf der Website: `wirkungswissenschaften/` (Definition, Begriffssystem, Methodik, Wirkungsforschung, Publikationen, FAQ) — inhaltliche Grundlage der Institutsarbeit.

## Aus Projektgedächtnis überliefert, hier NICHT verifizierbar (Codex bestätigen/korrigieren)

- Kernmodule, Rollen-/Bewerbungssystem, Mitglieder-Portal, KI-Funktionen „gebaut"; Veröffentlichungsworkflow offen.
- Vermutete Infrastruktur: eigenes (Vercel-)Deployment; teilt Supabase-Projekt `fganranxrdyewbjpvubx` mit der Akademie.
- Login-Konzept „Akademie-Login = Institut-LinkedIn": in der Akademie-App ist LinkedIn **nicht** implementiert (nur Discord) — Konzeptstand vs. Realität klären.

## Verbindungen im Ökosystem (Ist-Zustand)

- Institut → Website: Quellenarchiv-Spiegel (build-seitig, `QUELLENARCHIV_FETCH=1`).
- Website-Admin → Akademie: Wirkungsradar-Narrativ-Moderation läuft in der **Akademie-App** (`/dozentin/narrative`), nicht im Institut.
- Institut ↔ Parlament-Portal (Soll laut Master-Prompt): Institut ist **Herausgeber** des Wirkungsportals Parlament („Herausgegeben vom Institut für Wirkungsökonomie", fachliche Leitung Natalie Weber); Publikations-/Freigabe-Workflow, Korrekturkultur und Trust-Center müssen institutionell hier verankert werden.

## Offene Fragen (→ `KNOWLEDGE_GAPS.md` / Codex)

- Repo-Pfad/Deployment des Institut-Codes? Datenmodell des Quellenarchivs (Felder, Statuslogik, Kuratierungsworkflow)? Auth (LinkedIn? Supabase?)? Welche der konzipierten Module (Forschung, Journal, Kanban, Forum, Rollen) sind implementiert vs. nur Konzept? Gibt es weitere APIs neben `/api/quellen`?
