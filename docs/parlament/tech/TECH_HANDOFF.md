# Tech Handoff

## Implementiert im MVP

- Next.js-Portal, UX-Handoff Stand 2 umgesetzt: Start, Karten, Entscheidungsseite, Monitor, Historie, Dialog, Trust- und Fassungszustände.
- Klare DEMONSTRATOR/CONTENT_REQUIRED/DATA_GAP-Zustände; keine erfundenen politischen Fakten.
- Öffentliche Read-API, DIP-Konfigurationsstatus und 7–14-Tage-Importfenster (Standard 10 Tage).
- Datenmigration mit `ParliamentaryCase ≠ DecisionUnit`, Dokumenthash/Fassung und serverseitiger Rückschaugrenze.
- Security-Header, Opt-in-KI-UI ohne Votumsänderung, reduzierte Bewegung und mobile A11y-Struktur.

## Noch vor öffentlichem Launch nötig

1. Dauerhaften DIP-Schlüssel anfordern und die aktuelle OpenAPI-Filterkonfiguration versioniert hinterlegen.
2. Private Import-Worker + Supabase-Workbench/RBAC/MFA installieren; Bootstrap-Import des laufenden Jahres durchführen.
3. Redaktionelle Materialitätsregeln, Quellenarchiv-Anbindung, Freigabeteam und Korrekturprozess formell freigeben.
4. Hosting auswählen, DNS/TLS setzen, Preview und Live-Gates ausführen.
