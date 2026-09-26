# WÖk-Institut — Entscheidungen & Worklog

Stand: 2026-07-03
Zweck: Ein Ort für **getroffene Entscheidungen** (damit sie nicht wieder aufgerollt werden) und
für den **Worklog** der Claude/Codex-Übergaben. Schlank halten, chronologisch, entscheidbar.

Verwandte Docs: `institut-gesamtkonzept.md` · `institut-datenmodell.md` ·
`institut-arbeitsteilung-claude-codex.md` · `claude-institut-architecture-handoff.md`

---

## 1. Getroffene Entscheidungen (ADR-kurz)

| # | Datum | Entscheidung | Begründung / Konsequenz |
|---|---|---|---|
| E1 | 2026-07-03 | **Domain = `institut.wirkungsoekonomie.de`** | Vercel-Projekt `woek-institut-app` + A-Record laut Handoff bereits eingerichtet. „impact/wirkungsoeconomie" war ein Verschreiber. |
| E2 | 2026-07-03 | **Reihenfolge: erst Fundament-Doku, dann bauen** | Zwei Agenten brauchen eindeutige Spezifikation, bevor Code entsteht. Phase 0 = nur Markdown. |
| E3 | 2026-07-03 | **Supabase: gemeinsames Projekt + Mandantenmodell** | Institut nutzt dieselbe Supabase-Instanz wie die Akademie, getrennt über `institut_*`-Tabellen + RLS. Keine Akademie-Tabelle wird verändert; Auth geteilt. |
| E4 | 2026-07-03 | **Eigenes GitHub-Repo `woek-institut-app`** | Spiegelt Akademie-Muster; eigenes Vercel-Deploy; klare Grenze. Handoff über `docs/`, keine privaten Pfade/Secrets im Repo. |
| E5 | 2026-07-03 | **Transparenzmodell 3-stufig** (`public`/`members`/`internal`) + öffentliche Statuslogik | „Öffentlich ist der Weg, geschützt das Rohdenken, final das Ergebnis." Öffentliche „Aktuelle Arbeiten"-Seite speist sich aus `visibility='public'`. |
| E6 | 2026-07-03 | **Reconciled Rollenmodell** (`member`/`researcher`/`reviewer`/`editor`/`governance`/`admin`) | Vereint ChatGPT-Arbeitsrollen und Handoff-Rollen zu einem eindeutigen Set. Supabase führend, Discord kann spiegeln. |

---

## 2. Offene Entscheidungen (nach Phase 0 zu klären)

| # | Frage | Optionen | Status |
|---|---|---|---|
| O1 | Discord beim Institut Pflicht, optional oder nur Community-Spiegel? | Pflicht / Optional (Multi-Provider E-Mail+Google+Microsoft+Discord) / nur Spiegel | offen |
| O2 | Oracle/OCI: führende Quelle für Feedback/Feature-Requests/Analytics oder nur Ingest/Fallback? | führend / Ingest+Fallback (Supabase führend) | offen |
| O3 | Eigene Publikations-Verifikationsseiten fürs Institut (getrennt von Akademie-Zertifikaten)? | ja / nein / später | offen |
| O4 | Subdomain langfristig A-Record oder Vercel-CNAME? (CNAME schließt gleichnamige MX/TXT aus → Mail unter `institut.*` ginge verloren) | A-Record behalten / auf CNAME wenn keine Mail nötig | offen |
| O5 | Welche Institutsrollen werden auf Discord gespiegelt? | — | offen |
| O6 | `institut_*`-Präfix dauerhaft oder späterer Umzug in eigenes Schema `institut`? | Präfix / Schema-Umzug bei Skalierung | offen (Default: Präfix) |

---

## 3. Worklog (Claude ↔ Codex Übergaben)

Format: `Datum · Agent · Branch · was gemacht · was offen`

- **2026-07-03 · Claude · (plan/docs) ·** Phase 0 Fundament-Doku angelegt:
  `institut-gesamtkonzept.md`, `institut-datenmodell.md`,
  `institut-arbeitsteilung-claude-codex.md`, `institut-entscheidungen.md`; Handoff-Doc
  `claude-institut-architecture-handoff.md` auf E1–E6 aktualisiert. **Offen:** Abnahme durch
  Natalie; danach Phase 1 (Scaffold `woek-institut-app`).
