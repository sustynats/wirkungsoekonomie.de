# Technical Architecture

## Zielbild

`parlament.wirkungsoekonomie.de` ist ein eigenes Next.js-Deployment. Öffentliche Seiten lesen ausschließlich veröffentlichte Inhalte über eine Read-API; personenbezogene Daten und Redaktion liegen in Supabase mit serverseitigem RBAC und MFA.

```text
DIP → private Import-Worker → Supabase (IMPORTING/DRAFT/Review) → veröffentlichte Read-API → Portal
WÖk-Register (Read-only) ────────────────────────────────────────────────┘
```

- **BUILD_NEW:** DIP-Ingestion, Dokumentversionierung, Materialitäts- und Recommendation-Engine, Workbench, territoriale Zuordnung.
- **REUSE:** SDG-/SDG+-Rahmen, Master Items v1.3, WÖMS 2.0, Glossar, Quellenarchiv-Muster, Nichtkompensations- und RMO-Logik.
- **WRAP:** WÖk-KI erst nach Shared-Service-Entscheidung; kein Schreibzugriff auf Voten.

Die App setzt CSP, HSTS, `frame-ancestors 'none'`, `nosniff` und eine restriktive Permissions-Policy. HSTS wird erst nach funktionierendem TLS auf der Subdomain wirksam.
