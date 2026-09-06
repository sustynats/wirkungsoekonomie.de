# Technical Capability Map

> **Status: OFFEN - Codex-Auftrag.**
> Diese Datei gehört laut Bootstrap-Prompt (Abschnitt 40) in die Codex-Lane.
> Claude hat die Wissensbasis (Registries, Capabilities, Quellen) aus Repo-Inventur erstellt;
> Codex verifiziert hier, was **tatsächlich implementiert** ist - im Unterschied zu **nur dokumentiert**.

## Auftrag an Codex

Für jede Capability aus `TOOLS.md`, `INTEGRATIONS.md`, `WOEK_AI_CAPABILITIES.md`, `ACADEMY_CAPABILITIES.md`, `INSTITUTE_CAPABILITIES.md` und `REGIONAL_DATA_CAPABILITIES.md`:

1. Implementierungszustand präzise einordnen:
   `CONTENT_ONLY` | `FRONTEND_ONLY` | `BACKEND_AVAILABLE` | `API_AVAILABLE` | `FULLY_REUSABLE`
2. Repository-Pfade, Services, Deployment-Ziel und Auth-Mechanik bestätigen oder korrigieren.
3. `last_verified` mit Datum setzen (echter Funktionstest, nicht nur Code-Lektüre - insbesondere Oracle-Endpoints, Supabase-Funktionen, Zertifikats-API).
4. Abweichungen von Claudes Einordnung in `CROSSCHECK.md` dokumentieren, nicht stillschweigend überschreiben.

## Erwartete Struktur (von Codex zu füllen)

```yaml
- capability_id: <aus den Registries>
  implemented: true | false | partial
  implementation_paths: []
  runtime: pages-static | oracle | vercel | supabase | github-releases
  api_tested: true | false
  test_method: <wie verifiziert>
  last_verified: <YYYY-MM-DD>
  abweichung_zu_claude: <nur falls vorhanden, mit Verweis auf CROSSCHECK.md>
```

## Vorbefunde von Claude (zu verifizieren, nicht als bestätigt übernehmen)

Siehe `CAPABILITY_MATRIX.md` (Spalte „Status") und die Einzelregistries. Alle dortigen Statusangaben beruhen auf Code-/Content-Inventur vom 2026-08-14 plus HTTP-Live-Check der drei Domains; **kein** Endpoint wurde von Claude funktional durchgetestet.
