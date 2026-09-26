# WÖk-Institut — Arbeitsteilung & Prozess (Claude ↔ Codex)

Stand: 2026-07-03
Status: **verbindliche Arbeitsanweisung** für beide Coding-Agenten
Verwandte Docs: `institut-gesamtkonzept.md` · `institut-datenmodell.md` ·
`institut-entscheidungen.md` · `AGENTS.md` (Codex-Regeln Website)

> Ziel dieses Dokuments: Zwei Agenten (Claude und Codex) sollen am Institut arbeiten können,
> **ohne sich gegenseitig zu überschreiben oder Rückfragen zu produzieren**. Jede Aufgabe muss
> ohne mündlichen Kontext allein aus den `docs/institut-*.md` startbar sein.

---

## 1. Repos und Zuständigkeit

| Repo | Pfad | Verantwortlich (primär) | Inhalt |
|---|---|---|---|
| Website | `New project` → `sustynats/wirkungsoekonomie.de` | **Codex** | öffentliche statische Institutsseiten, Content, Generatoren, Suche, Navigation |
| Institut-App | `woek-institut-app` → `sustynats/woek-institut-app` (neu) | **Claude** | Next.js-App, Supabase-Logik, Migrationen, Auth/Guards, Module |
| Akademie-App | `woek-akademie-app` | — | **nur Referenz**, nicht im Rahmen des Instituts ändern |

**Grundregel:** Wer ein Repo primär verantwortet, führt dort die strukturellen Änderungen.
Der jeweils andere Agent arbeitet dort nur mit ausdrücklichem, in der Doku vermerktem Task.

**Single Source of Truth:** die `docs/institut-*.md` im Website-Repo (`New project/docs/`).
Sie sind repo-übergreifend gültig und werden **nicht** in die App kopiert, sondern referenziert.

---

## 2. Task-Lebenszyklus

Jeder Task durchläuft dieselben Schritte:

1. **Referenz:** Task nennt die Spec-Sektion, auf die er sich stützt
   (z. B. „`institut-gesamtkonzept.md` §4.3 Kanban" oder „`institut-datenmodell.md` §4 Tabelle
   `institut_projects`"). Ohne Referenz kein Task.
2. **Zuweisung:** Zielrepo + verantwortlicher Agent stehen fest (siehe §1). Bei Überlappung
   entscheidet der Eintrag im Decision-Log.
3. **Branch:** eigener Branch (siehe §3). Nie direkt auf `main`.
4. **Umsetzung:** kleinste sinnvolle Einheit; bei Datenänderung Migration nach
   `institut-datenmodell.md` §2/§7.
5. **Definition of Done** (siehe §4) erfüllen.
6. **Doku-Update:** betroffene `docs/institut-*.md` mitziehen (neue Tabelle, neue Route,
   neue Entscheidung).
7. **Handoff-Notiz:** kurzer Eintrag im Worklog (siehe §6), damit der andere Agent den Stand
   kennt.

---

## 3. Branch- & Commit-Konventionen

- **Branch:** `institut/<bereich>-<kurz>` — z. B. `institut/scaffold-app`,
  `institut/projektwerkstatt-kanban`, `institut/db-mvp-tables`.
- **Commit-Präfix:** `institut:` — z. B. `institut: MVP-Tabellen + RLS (institut_0001)`.
- **Ein Thema pro Commit.** Migrationen und der Code, der sie nutzt, dürfen zusammen.
- **Nie** generierte Artefakte committen (`.next/`, `node_modules/`, `.vercel/`).
- Vor Merge: Rebase/Sync, damit die Historie linear und für beide Agenten lesbar bleibt.

---

## 4. Definition of Done (verbindlich)

Ein Task gilt als fertig, wenn **alle** zutreffenden Punkte erfüllt sind:

- [ ] Code-Änderung erfüllt die referenzierte Spec-Sektion.
- [ ] **App:** `npm run typecheck` grün; wenn vorhanden `npm run test` und `npm run build` grün.
      (Bekannte Falle: bei `.next/types/... 3.ts`-Fehlern `rm -rf .next` und erneut prüfen.)
- [ ] **Website:** Build/Checks grün; neue öffentliche Seite in Navigation, Suche, Sitemap,
      Content-Manifest, SEO/Datenschutz berücksichtigt (siehe `AGENTS.md`).
- [ ] Bei Datenänderung: Migration nach `institut-datenmodell.md` §7 (idempotent, RLS,
      nur `institut_*`).
- [ ] Betroffene `docs/institut-*.md` aktualisiert.
- [ ] Guardrails (§5) eingehalten.
- [ ] Worklog-Eintrag (§6) geschrieben.

---

## 5. Guardrails (nicht verhandelbar)

- **Keine Secrets im Repo.** Keys nur in Vercel-Env / lokal in `.env.local` (nicht versioniert).
  Server-only-Tokens nie als `NEXT_PUBLIC_*`.
- **Keine privaten Pfade** (`/Users/…`) in committeten Dateien. In der App-Doku relative
  Pfade verwenden; absolute lokale Pfade bleiben in `New project/docs/` (nicht im App-Repo).
- **Mandantentrennung** einhalten (`institut-datenmodell.md` §1): nie Akademie-Tabellen ändern.
- **WÖk-Leitplanken** (`institut-gesamtkonzept.md` §8 / `AGENTS.md`): Wirkung neutral;
  Begriffe nicht vermischen; keine Personenbewertung/Social Credit; Modelle als Modell
  kennzeichnen.
- **Serverseitige Autorität:** Zugriffs-/Rollenprüfung server-side (Muster
  `woek-akademie-app/lib/access.ts`), nie nur UI-Gates.
- **Keine ungefragten Struktur-Neubauten:** vorhandene Muster/Generatoren/Tokens nutzen.

---

## 6. Handoff-Protokoll (Claude ↔ Codex)

Damit der jeweils andere Agent nahtlos übernehmen kann:

- **Worklog:** kurzer chronologischer Eintrag pro abgeschlossenem Task in
  `docs/institut-entscheidungen.md` (Abschnitt „Worklog") oder — sobald das App-Repo steht —
  in dessen `docs/worklog.md`. Format: `Datum · Agent · Branch · was gemacht · was offen`.
- **Übergabe eines halbfertigen Tasks:** offener Punkt explizit im Worklog + im Branch-Namen
  erkennbar; keine stillen Halbstände auf `main`.
- **Entscheidungen** (Architektur, Namen, Wertebereiche) gehören ins Decision-Log
  (`institut-entscheidungen.md`), nicht nur in Commit-Messages.

---

## 7. Wo was nachzulesen ist (Onboarding-Reihenfolge für jeden Agenten)

1. `AGENTS.md` — WÖk-Leitplanken (Website-Regeln).
2. `docs/institut-gesamtkonzept.md` — was das Institut ist.
3. `docs/institut-datenmodell.md` — wie die Daten liegen.
4. `docs/claude-institut-architecture-handoff.md` — Infrastruktur (Vercel/IONOS/Supabase/Oracle).
5. `docs/institut-arbeitsteilung-claude-codex.md` — dieses Dokument.
6. `docs/institut-entscheidungen.md` — was schon entschieden ist und was offen ist.
7. Referenzarchitektur: `woek-akademie-app/docs/claude-architecture-handoff.md`.

Erst danach Code anfassen.
