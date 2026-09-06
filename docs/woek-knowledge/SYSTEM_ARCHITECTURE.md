# System Architecture - Ist-Architektur des WÖk-Ökosystems

Stand: 2026-08-14. Grundprinzip (WÖk-Kern/E10, in `api/v1/capabilities/` selbst dokumentiert): **ein Kern (Daten+Logik), dünne Frontends** - mit klaren Datenklassen: `public-read` = GitHub/Pages, `personal-write` = Supabase, `dynamic-logic` = WÖk-Kern-API (Oracle).

```
                        ┌──────────────────────────────────────────────┐
                        │  GitHub Repo sustynats/wirkungsoekonomie.de  │
                        │  (statisch; >150 Build-Skripte, 0 npm-Deps)  │
                        └───────┬───────────────────────────┬──────────┘
              deploy.yml (Pages │ Workflow, _site nur in CI) │ Releases woek-public-assets-v2
                                ▼                           ▼
   ┌────────────────────  wirkungsoekonomie.de  ─────────────────────┐   große Medien/PDF/XLSX
   │ Portale (Rang 0-24) · Wirkungsradar · Werkzeuge · Erleben ·     │   (CDN via GitHub Releases)
   │ Bibliothek/Referenz/Quellenarchiv-Spiegel · begriffe (2281) ·   │
   │ statische API /api/v1/ · PWA /app/ · /en/ (7 Seiten)            │
   └───┬──────────────┬───────────────┬───────────────┬──────────────┘
       │ fetch        │ fetch         │ build-time     │ Analytics (Consent)
       ▼              ▼               ▼                ▼
 ┌───────────┐  ┌───────────────┐  ┌────────────────┐  ┌──────────────────────┐
 │ Oracle-VM │  │ Akademie-App  │  │ Institut       │  │ Supabase fganranx…   │
 │ WÖk-Kern- │  │ Next.js/Vercel│  │ institut.woek… │  │ Edge-Fn site-event + │
 │ API: KI,  │  │ akademie.woek…│  │ /api/quellen   │  │ Akademie-DB (19 Migr.│
 │ Faktenchk,│  │ Curriculum,   │  │ (Quellen-SoR,  │  │ PII/Progress/Exams/  │
 │ Produkt-  │  │ Prüfungen,    │  │ Kuratierung)   │  │ Analytics/Submissions│
 │ check,    │  │ /api/me, KWI, │  │ Repo lokal     │  │ )                    │
 │ Feedback, │  │ ki-beta (RAG+ │  │ UNBEKANNT      │  └──────────────────────┘
 │ Share,    │  │ Together AI), │  └────────────────┘
 │ Discord-  │  │ Moderation    │        ▲ wöchentl. Sync-PR (Cron)
 │ Token     │  │ (Discord-Auth)│
 └───────────┘  └───────────────┘
      ▲                ▲
      └── Discord-Bot „Oracle" pusht Server-Analytics; OAuth-Login für Community/Akademie
```

## Bausteine & Verantwortungen

| Baustein | Technik | Verantwortung | Anmerkungen |
|---|---|---|---|
| Website | statisches HTML + Build-Pipeline (Node 22/Python 3.12) | öffentliches Wissen, Portale, Tools (client-only), statische API | SITE-INVENTORY.md (Mai) ist überholt - Realität: große Pipeline |
| Oracle-VM | WÖk-Kern-API | dynamische Logik/KI | Server-Repo nicht lokal; Codex-Lane |
| Akademie-App | Next.js App Router, Vercel | Lernplattform, Konto („Mein Wirkungsraum"-Backend), Moderation, 2. KI, 2. Analytics-Ingest, KWI-Live | Seed-vs-DB-Drift! (`ACADEMY_CAPABILITIES.md`) |
| Institut | eigenes Deployment | Quellen-Kuratierung (SoR), Herausgeberrolle | Repo unbekannt → Gap |
| Supabase | Projekt `fganranxrdyewbjpvubx` | PII/System of Record + site-event-Edge-Fn | von Institut+Akademie geteilt |
| GitHub Releases | Tag `woek-public-assets-v2` | Medien-CDN | Policy-Gate im Build |
| Identity | Discord-OAuth (Community + Akademie-Rollen) | | LinkedIn nur Konzept |
| Suche | `assets/search/search-index.json` (28 957 Einträge) | sitewide + KI-Retrieval-Basis (Akademie spiegelt ihn) | zwei Index-Builder (Node aktiv, Python legacy) |
| Statusregister Wissen | `assets/data/library-version-registry.json` | Versions-/Führend-Status aller Dokumente | Kern der `SOURCE_HIERARCHY.md` |

## Datenflüsse (Auswahl)

1. **Quellen**: Institut kuratiert → `/api/quellen` → wöchentlicher Sync-PR → statischer Spiegel `/quellenarchiv/` (+RSS). Eine Richtung, ein SoR.
2. **Wissen→KI**: Website-Suchindex → (Build-Sync) → Akademie-RAG; Oracle-KI hat eigene Wissensanbindung (Details unbekannt → Codex).
3. **Community-Einreichungen**: Website (`narrativ-einreichen`-Links) → Akademie-Formulare (Supabase-Tabellen) → Moderations-UI `/dozentin/*` → zurück in Website-Content (Wirkungsradar).
4. **Medien**: Repo-Build blockt große Dateien in `_site` → Releases-URLs.
5. **Analytics**: Website→Supabase-Edge-Fn; Akademie→eigene API-Routen→Supabase-Tabellen; Discord-Bot→Ingest-Token-Route. (Konsolidierung offen.)

## Architektur-Regeln für neue Produkte (aus Ist-Stand + Plattform-Policy)

1. Pages bleibt statisch; personenbezogene Daten nur Supabase; dynamische Logik in den WÖk-Kern (Oracle) oder die zuständige App - nie in die statische Site.
2. Große öffentliche Medien immer über GitHub Releases (nie Vercel/Supabase-Storage).
3. Neue Seiten über `navigation.json` + Normalisierungs-/Suchindex-Skripte anbinden (`tools/sync_layout.py` bzw. npm-Build), sonst reißen Suche/Nav/PR-Gate.
4. Redaktions-/Login-Funktionen gehören in eine App (Akademie-Muster), nicht als „noindex-Admin" auf die statische Site.
5. Subdomain-Muster für neue Produkte (parlament.wirkungsoekonomie.de): eigenes Deployment, das Website-Wissen über die statische API/Registries konsumiert und PII strikt in Supabase hält.
